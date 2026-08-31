#!/usr/bin/env node
'use strict';

// Serwer MCP (stdio) łączący headless `claude` z ŻYWĄ instancją Neovima usera.
//
// Zastępuje dawne "skille", które wstrzykiwano jako kruchy tekst w system-prompt
// każący modelowi ręcznie sklejać komendy `nvim --server ... --remote-expr '...'`.
// Tu każda zdolność jest PRAWDZIWYM narzędziem MCP z nazwą i schematem — model
// widzi je na liście toolów i wywołuje wprost, bez zgadywania cytowania.
//
// Proces jest odpalany przez `claude` (którego agent nvim uruchamia co turę),
// więc dziedziczy zmienne środowiskowe ustawiane przez skill `editor`:
//   NVIM_AGENT_SERVER     adres RPC żywej instancji nvim
//   AGENT_HISTORY_DB      ścieżka bazy SQLite z historią rozmowy
//   AGENT_HISTORY_PROJECT klucz projektu (filtr wierszy)
//
// Transport: JSON-RPC 2.0 rozdzielany znakami nowej linii po stdin/stdout.
// Diagnostyka leci na stderr, żeby nie zaśmiecać kanału protokołu.

const { execFileSync } = require('child_process');

const SERVER = process.env.NVIM_AGENT_SERVER || '';
const HIST_DB = process.env.AGENT_HISTORY_DB || '';
const HIST_PROJECT = process.env.AGENT_HISTORY_PROJECT || '';

function log() {
  try {
    process.stderr.write('[agent-mcp] ' + Array.prototype.join.call(arguments, ' ') + '\n');
  } catch (_) {}
}

function b64(s) {
  return Buffer.from(String(s == null ? '' : s), 'utf8').toString('base64');
}

// Zawołaj globalny helper Lua w żywym nvim, podając jeden argument (base64) przez
// `_A`. Base64 omija cały koszmar cytowania: --remote-expr dostaje czyste ASCII.
function nvimCall(helper, arg) {
  if (!SERVER) {
    throw new Error('NVIM_AGENT_SERVER nie jest ustawione — brak żywego edytora do rozmowy');
  }

  const expr = 'luaeval("' + helper + '(_A)", "' + b64(arg) + '")';
  const out = execFileSync('nvim', ['--server', SERVER, '--remote-expr', expr], {
    encoding: 'utf8',
    timeout: 15000,
    maxBuffer: 8 * 1024 * 1024,
  });

  return out.replace(/\n$/, '');
}

function sqlEsc(s) {
  return String(s == null ? '' : s).replace(/'/g, "''");
}

function searchHistory(args) {
  if (!HIST_DB) {
    throw new Error('AGENT_HISTORY_DB nie jest ustawione — brak bazy historii');
  }

  let limit = parseInt(args.limit, 10);

  if (!Number.isFinite(limit)) {
    limit = 20;
  }

  limit = Math.min(Math.max(limit, 1), 200);

  let where = "project = '" + sqlEsc(HIST_PROJECT) + "'";

  if (args.keyword) {
    where += " AND content LIKE '%" + sqlEsc(args.keyword) + "%'";
  }

  const beforeId = parseInt(args.before_id, 10);

  if (Number.isFinite(beforeId)) {
    where += ' AND id < ' + beforeId;
  }

  const sql =
    "SELECT id, datetime(ts,'unixepoch','localtime'), role, content " +
    'FROM messages WHERE ' + where + ' ORDER BY id DESC LIMIT ' + limit + ';';

  const out = execFileSync('sqlite3', ['-separator', ' | ', HIST_DB, sql], {
    encoding: 'utf8',
    timeout: 10000,
    maxBuffer: 8 * 1024 * 1024,
  });

  return out.trim() || '(brak pasujących wierszy historii)';
}

// --- Zgody na narzędzia (--permission-prompt-tool) ------------------------
//
// CLI woła `permission_request`, gdy model sięga po tool spoza --allowedTools.
// Odbijamy pytanie do nvima i CZEKAMY na decyzję użytkownika — ale przez
// ODPYTYWANIE, nie jednym długim wywołaniem. Gdyby nvim blokował się na czas
// decyzji, jego pętla zdarzeń stałaby i user nie mógłby nacisnąć klawisza,
// żeby odpowiedzieć. Krótkie `poll` zostawiają edytor responsywnym.

const PERMISSION_TIMEOUT_MS = 5 * 60 * 1000;
// Tym samym kanałem idą pytania modelu do użytkownika (AskUserQuestion) — nad
// odpowiedzią można siedzieć dłużej niż nad zwykłą zgodą, więc dajemy pół godziny.
const QUESTION_TIMEOUT_MS = 30 * 60 * 1000;
const PERMISSION_POLL_MS = 400;

function sleepSync(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch (_) {
    // Brak SharedArrayBuffer — pollujemy ciaśniej, ale bez wywalania się.
  }
}

function deny(message) {
  return JSON.stringify({ behavior: 'deny', message: message });
}

function askPermission(args) {
  const id = nvimCall(
    '_G.__agent_permission_ask',
    JSON.stringify({ tool_name: args.tool_name || '', input: args.input || {} })
  ).trim();

  if (!id || id.indexOf('error:') === 0) {
    return deny('nie udało się zapytać użytkownika o zgodę (' + (id || 'brak odpowiedzi nvima') + ')');
  }

  const timeout = args.tool_name === 'AskUserQuestion' ? QUESTION_TIMEOUT_MS : PERMISSION_TIMEOUT_MS;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    sleepSync(PERMISSION_POLL_MS);

    let out;

    try {
      out = nvimCall('_G.__agent_permission_poll', id).trim();
    } catch (e) {
      // Edytor zniknął w trakcie (zamknięty panel, restart) — nie zgadujemy.
      return deny('utracono kontakt z edytorem podczas pytania o zgodę: ' + e.message);
    }

    if (out !== 'pending') {
      return out;
    }
  }

  try {
    nvimCall('_G.__agent_permission_cancel', id);
  } catch (_) {}

  return deny('użytkownik nie odpowiedział na prośbę o zgodę w wyznaczonym czasie');
}

const TOOLS = [
  {
    name: 'eval_lua',
    description:
      "Wykonaj kod Lua w URUCHOMIONEJ instancji Neovima użytkownika i zwróć wynik. " +
      "Używaj do stanu runtime, którego nie widać w plikach configu: opcje (vim.o/vim.bo/vim.wo), " +
      "keymapy (vim.fn.maparg(lhs, mode)), załadowane pluginy (require('lazy').plugins()), " +
      "bufory/okna (vim.api.nvim_list_bufs). Kod MUSI `return` wartość, którą chcesz odzyskać; " +
      "wynik jest zwracany jako vim.inspect(). Domyślnie TYLKO odczyt — nie zmieniaj stanu edytora, " +
      "chyba że user wprost o to prosi.",
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: "Źródło Lua. Zakończ `return <wartość>`, np. `return { ts = vim.o.tabstop }`.",
        },
      },
      required: ['code'],
    },
    run: function (args) {
      return nvimCall('_G.__agent_mcp_eval', args.code || '');
    },
  },
  {
    name: 'open_file',
    description:
      "Otwórz plik w GŁÓWNYM oknie edytora użytkownika (nie w kolumnie czatu). Gdy user mówi " +
      "'otwórz/pokaż/wejdź do <plik>' — to znaczy OTWÓRZ TU, w tym Neovimie. Wywołaj od razu, " +
      "bez proszenia usera o przypomnienie, że jesteś w edytorze. Ścieżka bezwzględna lub względna do cwd.",
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Ścieżka do pliku (bezwzględna lub względna do cwd).' },
      },
      required: ['path'],
    },
    run: function (args) {
      return nvimCall('_G.__agent_mcp_open', args.path || '');
    },
  },
  {
    name: 'read_clipboard_image',
    description:
      "Zrzuć OBRAZ ze schowka systemowego do pliku i zwróć jego ścieżkę, żebyś mógł go zobaczyć " +
      "narzędziem Read (Read renderuje obrazy). Gdy user mówi 'zobacz screena', 'spójrz na " +
      "screenshot', 'popatrz co skopiowałem' — obraz jest w schowku. Wywołaj to, a potem Read " +
      "zwróconą ścieżkę. Zwraca 'error: ...' gdy schowek nie zawiera obrazu.",
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Docelowa ścieżka pliku (domyślnie /tmp/agent-clip.png).' },
      },
    },
    run: function (args) {
      return nvimCall('_G.__agent_mcp_clip', args.path || '/tmp/agent-clip.png');
    },
  },
  {
    name: 'search_history',
    description:
      "Przeszukaj trwałą historię TEJ rozmowy (per projekt, w SQLite). Każda wiadomość user/agent " +
      "jest zapisywana. Użyj, gdy user odwołuje się do czegoś z wcześniej, czego nie masz już w " +
      "kontekście ('jak wcześniej', 'to co robiliśmy', 'wróć do…'). Zwraca wiersze " +
      "id | czas | rola | treść, od najnowszych.",
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: "Filtr LIKE '%słowo%' po treści (opcjonalny)." },
        limit: { type: 'number', description: 'Ile wierszy (domyślnie 20, max 200).' },
        before_id: { type: 'number', description: 'Stronicowanie: tylko wiersze o id mniejszym niż podane.' },
      },
    },
    run: function (args) {
      return searchHistory(args);
    },
  },
  {
    name: 'permission_request',
    description:
      'WEWNĘTRZNE — nie wywołuj tego narzędzia sam. Używa go CLI, gdy potrzebujesz zgody ' +
      'użytkownika na narzędzie spoza allowlisty; pokazuje pytanie w panelu czatu Neovima ' +
      'i zwraca decyzję ({"behavior":"allow"|"deny"}).',
    inputSchema: {
      type: 'object',
      properties: {
        tool_name: { type: 'string', description: 'Nazwa narzędzia, o które prosimy.' },
        input: { type: 'object', description: 'Wejście, z jakim narzędzie ma być wywołane.' },
      },
      required: ['tool_name', 'input'],
    },
    run: function (args) {
      return askPermission(args);
    },
  },
];

// ---------------------------------------------------------------------------
// Pętla JSON-RPC 2.0 (stdio, linia = jedna wiadomość)
// ---------------------------------------------------------------------------

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function handleLine(line) {
  let req;

  try {
    req = JSON.parse(line);
  } catch (e) {
    log('zły JSON:', e.message);
    return;
  }

  const id = req.id;
  const method = req.method;
  const params = req.params || {};

  if (method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id: id,
      result: {
        protocolVersion: params.protocolVersion || '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'nvim-agent', version: '1.0.0' },
      },
    });

    return;
  }

  // Notyfikacje (bez id) — nie odpowiadamy.
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
    return;
  }

  if (method === 'ping') {
    send({ jsonrpc: '2.0', id: id, result: {} });

    return;
  }

  if (method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id: id,
      result: {
        tools: TOOLS.map(function (t) {
          return { name: t.name, description: t.description, inputSchema: t.inputSchema };
        }),
      },
    });

    return;
  }

  if (method === 'tools/call') {
    const tool = TOOLS.find(function (t) {
      return t.name === params.name;
    });

    if (!tool) {
      send({ jsonrpc: '2.0', id: id, error: { code: -32602, message: 'nieznane narzędzie: ' + params.name } });

      return;
    }

    try {
      const text = tool.run(params.arguments || {});
      send({ jsonrpc: '2.0', id: id, result: { content: [{ type: 'text', text: String(text) }] } });
    } catch (e) {
      send({
        jsonrpc: '2.0',
        id: id,
        result: { isError: true, content: [{ type: 'text', text: 'error: ' + e.message }] },
      });
    }

    return;
  }

  // Nieznana metoda z id → błąd; notyfikacja bez id → cisza.
  if (id !== undefined && id !== null) {
    send({ jsonrpc: '2.0', id: id, error: { code: -32601, message: 'brak metody: ' + method } });
  }
}

let buf = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
  buf += chunk;

  let idx;

  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);

    if (line) {
      handleLine(line);
    }
  }
});

process.stdin.on('end', function () {
  process.exit(0);
});
