-- Uzgadnianie otwartych buforów z plikami, które agent zmienił na dysku.
--
-- Bufor bez Twoich zmian: zwykłe przeładowanie (robi je Vim — zachowuje widok
-- i pozycję kursora).
--
-- Bufor z niezapisanymi zmianami: zamiast W12 ("plik zmieniony na dysku, bufor
-- też zmieniony") i wyboru "albo Twoje, albo jego" robimy scalenie 3-way:
--   base   — plik z dysku sprzed tury agenta (snapshot przy wysyłce wiadomości)
--   theirs — plik z dysku po zapisie agenta
--   ours   — zawartość bufora, czyli Twoje niezapisane zmiany
-- Zmiany rozłączne scalają się bez pytania: w buforze ląduje wersja agenta
-- z nałożonymi Twoimi zmianami. Bufor zostaje `modified`, bo Twoje zmiany
-- nadal nie są na dysku — zapis (:w) utrwala całość.
--
-- Kolizja (obaj ruszyliście te same linie) → bufor zostaje NIETKNIĘTY, a
-- informacja idzie do czatu i przez vim.notify. Nic nie ginie; wersja agenta
-- jest na dysku, więc :e! ją wczyta, a :w nadpisze ją Twoją.
--
-- Wpięcie: FileChangedShell. Poza turami agenta zachowanie edytora jest
-- niezmienione (v:fcs_choice = "ask" — dokładnie tak, jakby tego autocmd
-- w ogóle nie było).

local M = {}

local ICON = { merged = "", warn = "" }

local base = {}     -- bufnr -> linie pliku z dysku sprzed tury (baza scalania)
local touched = {}  -- realpath -> true (pliki tknięte przez agenta w tej turze)
local active = false -- trwa tura agenta (albo jej ogon) — wolno nam scalać
local log = nil     -- fun(lines, hl) — dopisanie linii do logu czatu
local root_fn = nil -- fun() -> korzeń projektu (do skracania ścieżek w logu)

local function abspath(p)
  return vim.fn.fnamemodify(p, ":p")
end

local function real(p)
  if not p or p == "" then return nil end

  local a = abspath(p)

  return vim.uv.fs_realpath(a) or a
end

-- Bufor pliku (nie panelu/scratcha) wskazującego na tę ścieżkę.
local function buf_for(path)
  local want = real(path)

  if not want then return nil end

  for _, b in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(b) and vim.bo[b].buftype == "" then
      local name = vim.api.nvim_buf_get_name(b)

      if name ~= "" and real(name) == want then
        return b
      end
    end
  end

  return nil
end

local function same(a, b)
  if #a ~= #b then return false end

  for i = 1, #a do
    if a[i] ~= b[i] then return false end
  end

  return true
end

local function report(lines, hl, level)
  if log then
    pcall(log, lines, hl)
  end

  if level then
    vim.notify(table.concat(lines, " "), level)
  end
end

local function rel(path)
  local root = (root_fn and root_fn()) or vim.fn.getcwd()

  return vim.fs.relpath(root, abspath(path)) or vim.fn.fnamemodify(path, ":t")
end

-- Scalenie 3-way przez `git merge-file` (to samo, czym scala się merge gita).
-- Zwraca: linie scalone albo nil + powód ("konflikt" / "błąd").
local function merge3(ours, ancestor, theirs)
  local dir = vim.fn.tempname()
  vim.fn.mkdir(dir, "p")

  local fo, fb, ft = dir .. "/ours", dir .. "/base", dir .. "/theirs"
  vim.fn.writefile(ours, fo)
  vim.fn.writefile(ancestor, fb)
  vim.fn.writefile(theirs, ft)

  local out = vim.fn.systemlist({ "git", "merge-file", "-p", "--quiet", fo, fb, ft })
  local code = vim.v.shell_error
  vim.fn.delete(dir, "rf")

  -- git merge-file: 0 = czysto, >0 = liczba konfliktów, 255/127 = błąd/brak gita.
  if code == 0 then
    return out
  end

  if code > 0 and code < 128 then
    return nil, "konflikt"
  end

  return nil, "błąd scalania"
end

-- Nałóż na bufor treść, zachowując widok każdego okna, które go pokazuje.
local function set_lines_keep_view(buf, lines)
  local views = {}

  for _, win in ipairs(vim.fn.win_findbuf(buf)) do
    views[win] = vim.api.nvim_win_call(win, vim.fn.winsaveview)
  end

  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)

  for win, view in pairs(views) do
    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_call(win, function()
        pcall(vim.fn.winrestview, view)
      end)
    end
  end
end

-- Bufor JEST zmodyfikowany, a plik na dysku zmienił się pod nim.
local function reconcile(buf)
  if not (vim.api.nvim_buf_is_valid(buf) and vim.api.nvim_buf_is_loaded(buf)) then
    return
  end

  local name = vim.api.nvim_buf_get_name(buf)
  local ok, disk = pcall(vim.fn.readfile, name)

  if not ok then return end

  local ours = vim.api.nvim_buf_get_lines(buf, 0, -1, false)

  -- Doszliście do tej samej treści — nie ma czego scalać, zdejmij tylko flagę
  -- (mtime bufora checktime już odświeżył).
  if same(ours, disk) then
    vim.bo[buf].modified = false

    return
  end

  local ancestor = base[buf]

  if not ancestor then
    report({ ("%s %s zmieniony na dysku, a masz w nim niezapisane zmiany — bufor nietknięty (brak bazy do scalenia)")
      :format(ICON.warn, rel(name)) }, "AgentError", vim.log.levels.WARN)

    return
  end

  -- Agent tego pliku nie ruszył (zmienił się z innego powodu albo to my go
  -- już scaliliśmy) — nie ma czego nakładać.
  if same(ancestor, disk) then
    return
  end

  -- CRLF/binarka: readfile/writefile nie odwzorowują ich 1:1, więc wolimy nie
  -- dotknąć bufora niż go po cichu przepisać.
  if vim.bo[buf].binary or vim.bo[buf].fileformat ~= "unix" then
    report({ ("%s %s zmieniony przez agenta, ale bufor ma niezapisane zmiany i nietypowy format — scalenie pominięte")
      :format(ICON.warn, rel(name)) }, "AgentError", vim.log.levels.WARN)

    return
  end

  local merged, why = merge3(ours, ancestor, disk)

  if not merged then
    report({ ("%s kolizja w %s — agent zapisał swoją wersję na dysk, Twoje niezapisane zmiany zostają w buforze (%s). :e! wczyta jego, :w nadpisze Twoją.")
      :format(ICON.warn, rel(name), why) }, "AgentError", vim.log.levels.WARN)

    return
  end

  set_lines_keep_view(buf, merged)
  base[buf] = disk

  report({ ("%s %s: wersja agenta + Twoje niezapisane zmiany (scalone)"):format(ICON.merged, rel(name)) }, "AgentDim")
end

-- Czy tym plikiem zajmujemy się my (a nie domyślny mechanizm Vima).
local function ours_to_handle(buf)
  if active then return true end

  local name = vim.api.nvim_buf_is_valid(buf) and vim.api.nvim_buf_get_name(buf) or ""

  return name ~= "" and touched[real(name)] == true
end

-- Snapshot bazy scalania: stan plików sprzed tury agenta. Dla buforów bez
-- zmian bazą jest sam bufor (jest równy dyskowi) — czytamy z dysku tylko te
-- zmodyfikowane, więc to tanie nawet przy wielu otwartych plikach.
function M.snapshot()
  base = {}
  touched = {}
  active = true

  for _, b in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_loaded(b) and vim.bo[b].buftype == "" then
      local name = vim.api.nvim_buf_get_name(b)

      if name ~= "" then
        if vim.bo[b].modified then
          local ok, lines = pcall(vim.fn.readfile, name)
          base[b] = ok and lines or nil
        else
          base[b] = vim.api.nvim_buf_get_lines(b, 0, -1, false)
        end
      end
    end
  end
end

-- Plik tknięty przez agenta (z eventu narzędzia). Ścieżki względne liczymy od
-- cwd procesu agenta, nie od cwd nvima.
function M.mark(path, root)
  if not path or path == "" then return end

  local p = path

  if not p:match("^/") then
    p = vim.fs.joinpath(root or vim.fn.getcwd(), p)
  end

  local r = real(p)

  if r then
    touched[r] = true
  end
end

-- Tura się skończyła. Ogon (opóźnione checktime z podglądu edycji, zapisy
-- osieroconych procesów) jeszcze przez chwilę należy do agenta.
function M.turn_end()
  vim.defer_fn(function()
    active = false
  end, 2000)
end

-- Uzgodnij konkretny plik teraz (checktime tylko dla jego bufora — resztę
-- załatwia handler poniżej).
function M.sync(path)
  local buf = buf_for(path)

  if not buf then return end

  pcall(vim.cmd, "checktime " .. buf)
end

function M.setup(opts)
  opts = opts or {}
  log = opts.log
  root_fn = opts.root

  local group = vim.api.nvim_create_augroup("AgentFileReload", { clear = true })

  vim.api.nvim_create_autocmd("FileChangedShell", {
    group = group,
    pattern = "*",
    callback = function(args)
      local buf = args.buf

      -- Nie nasza sprawa → zachowaj się tak, jakby tego autocmd nie było.
      if not ours_to_handle(buf) then
        vim.v.fcs_choice = "ask"

        return
      end

      if vim.v.fcs_reason == "deleted" then
        vim.v.fcs_choice = ""

        return
      end

      if not vim.bo[buf].modified then
        vim.v.fcs_choice = "reload"

        return
      end

      -- Zajmujemy się tym sami; scalanie poza autocmd (tam bufor jest pod
      -- textlockiem, a Vim i tak zdąży zapisać nowy mtime).
      vim.v.fcs_choice = ""
      vim.schedule(function()
        reconcile(buf)
      end)
    end,
  })

  vim.api.nvim_create_autocmd("BufUnload", {
    group = group,
    pattern = "*",
    callback = function(args)
      base[args.buf] = nil
    end,
  })
end

return M
