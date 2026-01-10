# Neovim Configuration - Code Review & Recommendations

## Podsumowanie

Konfiguracja Neovim jest bardzo zaawansowana i dobrze zorganizowana. Zawiera 20+ funkcjonalności od LSP, debuggera, AI assistant po session management i edit history tracking. Kod jest generalnie wysokiej jakości, ale znalazłem kilka obszarów do poprawy.

---

## 🐛 Błędy do naprawy

### 1. **CRITICAL: Błąd składni w `lua/utils/info.lua`**

**Lokalizacja:** `lua/utils/info.lua:16-17`

**Problem:**
```lua
vim.cmd([[hi:Qarrright VirtualWarn  guifg=#FF8800]])
 gv aim.cmd([[highlight VirtualInfo  guifg=#4FC1FF]])
```

Linie 16-17 zawierają błędy składni:
- `hi:Qarrright` zamiast `highlight`
- `gv aim.cmd` zamiast `vim.cmd`

**Poprawka:**
```lua
vim.cmd([[highlight VirtualWarn  guifg=#FF8800]])
vim.cmd([[highlight VirtualInfo  guifg=#4FC1FF]])
```

**Priorytet:** ⚠️ CRITICAL - Ten plik powoduje błędy przy ładowaniu

---

## 🗑️ Dead Code (do usunięcia)

### 1. **Katalog `deprecated/`**

**Lokalizacja:** 
- `lua/deprecated/copilot.lua` (663 linie)
- `lua/deprecated/diagnostics.lua`
- `lua/deprecated/system/autocomplete.lua`

**Analiza:**
- `copilot.lua` - Pełna implementacja LLM copilot (autocomplete), ale **nigdzie nie używana**
- `diagnostics.lua` - Nie używane (info.lua)
- Katalog `deprecated/system/` - pusty folder

**Rekomendacja:** 
- ✅ Usunąć cały katalog `deprecated/` - nie jest używany w konfiguracji
- Jeśli chcesz zachować copilot dla historii, przenieś do `/docs/archive/`

### 2. **Nieużywane pluginy**

#### a) `lua/plugins/plenery.lua`
**Analiza:** 
- Definiuje plugin `nvim-lua/plenary.nvim`
- Plugin ten jest już dependency w innych pluginach (telescope, neotree)
- Nie trzeba go osobno instalować

**Rekomendacja:** ✅ Usunąć - duplikat dependency

#### b) `lua/plugins/search-replace.lua`
**Analiza:**
- Plugin `roobert/search-replace.nvim` nigdzie nie jest importowany/używany
- Brak keybindingów do tego pluginu

**Rekomendacja:** ✅ Usunąć lub dodać keybindings jeśli chcesz używać

### 3. **Nieużywane funkcje**

#### a) `M.format_added()` w `lua/utils/editing.lua:9-12`
```lua
M.format_added = function()
  -- This function is deprecated - use format_modifications instead
  -- Keeping it for backwards compatibility but making it a no-op
end
```
**Rekomendacja:** ✅ Usunąć - deprecated i nie używana

#### b) `M.review_changes()` w `lua/utils/git.lua:38-120`
Funkcja parsująca git status i tworząca picker - **nigdzie nie jest wywoływana**.

**Rekomendacja:** ❓ Usunąć lub dodać keybinding jeśli chcesz używać

---

## 📊 Statystyki Dead Code

| Plik/Katalog | Linie kodu | Status | Rekomendacja |
|--------------|------------|--------|--------------|
| `deprecated/copilot.lua` | 663 | Nieużywany | Usunąć |
| `deprecated/diagnostics.lua` | 55 | Nieużywany | Usunąć |
| `deprecated/system/` | - | Pusty | Usunąć |
| `plugins/plenery.lua` | 3 | Duplikat | Usunąć |
| `plugins/search-replace.lua` | 12 | Nieużywany | Usunąć lub skonfigurować |
| `utils/editing.lua:format_added()` | 4 | Deprecated | Usunąć |
| `utils/git.lua:review_changes()` | 83 | Nieużywany | Usunąć lub użyć |
| `utils/info.lua` | 55 | **BŁĄD SKŁADNI** | **Naprawić** |
| **TOTAL** | **~875 linii** | - | - |

**Potencjalna redukcja:** ~875 linii kodu (ok. 10% całej konfiguracji)

---

## 🔧 Usprawnienia i rekomendacje

### 1. **Performance**

#### a) Lazy loading pluginów
**Obecny stan:** Większość pluginów jest lazy-loaded ✅

**Rekomendacja:** 
- Sprawdź czy `themes.lua` nie ładuje wszystkich 20+ motywów na starcie
- Rozważ lazy loading dla debuggera (DAP) - tylko gdy potrzebny

#### b) Session loading
**Lokalizacja:** `lua/system/session.lua:590-598`

**Problem:** Session ładuje się przy każdym starcie nawet jeśli otwierasz plik z argumentu

**Rekomendacja:**
```lua
-- Obecny kod:
if vim.fn.argc() == 0 then
  load_session()
end

-- Dodaj flag aby user mógł wyłączyć auto-load:
if vim.fn.argc() == 0 and vim.g.session_autoload ~= false then
  load_session()
end
```

### 2. **Code Quality**

#### a) Duplikacja kodu - `load_session()`
**Lokalizacja:** `lua/system/session.lua:302-384` i `388-460`

Funkcja `load_session()` jest zdefiniowana **dwa razy** - raz jako local, raz jako `M.load_session`.

**Rekomendacja:** Refaktor - jedna implementacja:
```lua
-- Remove local function, keep only M.load_session
M.load_session = function(force)
  if force or vim.fn.argc() == 0 then
    -- ... implementation ...
  end
end

-- Auto-load at startup:
vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    M.load_session(false)
  end,
})
```

#### b) Error handling
**Lokalizacja:** Cała konfiguracja

**Obecny stan:** Większość operacji używa `pcall()` ✅

**Rekomendacja:** Dodaj więcej error context:
```lua
-- Zamiast:
local ok, err = pcall(some_function)

-- Użyj:
local ok, err = pcall(some_function)
if not ok then
  vim.notify("Error in some_function: " .. tostring(err), vim.log.levels.ERROR)
end
```

### 3. **Security**

#### a) `.env` file loading
**Lokalizacja:** `lua/utils/llm.lua:211-235`

**Problem:** Funkcja `load_env()` nie jest używana - zamiast niej używasz `utils.env.get()`

**Rekomendacja:** ✅ Usunąć nieużywaną funkcję `load_env()`

#### b) API keys w errorach
**Obecny stan:** API key nie jest logowany w errorach ✅

### 4. **Database (SQLite)**

#### a) Brak migracji
**Problem:** Nie ma systemu migracji schematu bazy danych

**Rekomendacja:** Dodaj wersjonowanie:
```lua
-- lua/utils/storage.lua
M.DB_VERSION = 1

function M.init()
  -- ... create db ...
  
  -- Check version
  local version_rows = M.select("schema_version", {"version"}, {})
  if not version_rows or #version_rows == 0 then
    -- First time - create version table
    M.create_table("schema_version", {
      {name = "version", type = "INTEGER"}
    }, {}, {})
    M.insert("schema_version", {version = M.DB_VERSION})
  else
    local current_version = version_rows[1][1]
    if current_version < M.DB_VERSION then
      -- Run migrations
      M.migrate(current_version, M.DB_VERSION)
    end
  end
end
```

#### b) Database cleanup
**Problem:** Baza danych rośnie bez limitu

**Rekomendacja:** Dodaj auto-cleanup:
```lua
-- Cleanup navigation_history starszych niż 30 dni
local cutoff_time = os.time() - (30 * 24 * 60 * 60)
storage.execute(string.format(
  "DELETE FROM navigation_history WHERE timestamp < %d",
  cutoff_time
))
```

### 5. **Documentation**

#### a) Komentarze w kodzie
**Obecny stan:** Niektóre pliki mają dobre komentarze, inne nie

**Rekomendacja:** Dodaj JSDoc-style comments dla publicznych funkcji:
```lua
--- Save session for current project and branch
--- @param force boolean|nil Force save even if no changes
--- @return boolean success Whether save was successful
function M.save_session(force)
  -- ...
end
```

#### b) README
**Obecny stan:** Masz `README.md` i `docs/features.md` ✅

**Rekomendacja:** Dodaj do README:
- Screenshot konfiguracji
- Quick start guide
- Lista wszystkich keybindingów (jako cheatsheet)

### 6. **Git Integration**

#### a) Conflict resolver UI
**Lokalizacja:** `lua/utils/git.lua:408-578`

**Obecny stan:** Masz funkcje do conflict resolution, ale brakuje UI

**Rekomendacja:** Implementacja jest w `lua/utils/ui.lua`, sprawdź czy `ui.open_conflict_resolver()` istnieje

#### b) Branch switching - cleanup
**Lokalizacja:** `lua/utils/git.lua:277-407`

**Problem:** Przy branch switching, buforы są zamykane z `force=false` - może nie działać jeśli są unsaved changes

**Rekomendacja:**
```lua
-- Line 382: Change to force=true since we already saved/stashed
vim.api.nvim_buf_delete(bufnr, { force = true })
```

### 7. **LLM/AI**

#### a) Cache overflow
**Lokalizacja:** `lua/utils/llm.lua:653-660`

**Problem:** Code review cache nie ma limitu - może rosnąć w nieskończoność

**Rekomendacja:** Dodaj LRU cache z limitem (np. 100 plików)

#### b) Streaming display
**Obecny stan:** Masz streaming dla chat ✅

**Rekomendacja:** Dodaj streaming dla code review - będzie szybsze UX

### 8. **Keybindings**

#### a) Konflikt `Ctrl+j` / `Ctrl+k`
**Lokalizacja:** 
- `lua/config/keymap.lua:63-64` - Navigation (edit history)
- `lua/plugins/telescope.lua:48-49` - Telescope movement

**Problem:** Telescope override navigation w insert mode

**Rekomendacja:** Użyj innych klawiszy dla Telescope:
```lua
-- Telescope
['<C-n>'] = actions.move_selection_next,
['<C-p>'] = actions.move_selection_previous,
```

#### b) Brakujące keybindings
**Rekomendacje:**
- `<leader>S` - Save session (✅ masz)
- `<leader>L` - Load session (❌ brak)
- `<leader>gs` - Git status (❌ brak)
- `<leader>gl` - Git log (❌ brak)

---

## 📝 Plan działania (priorytety)

### High Priority (do zrobienia teraz)
1. ⚠️ **Napraw błąd składni w `lua/utils/info.lua`**
2. 🗑️ **Usuń katalog `deprecated/`** (875 linii)
3. 🗑️ **Usuń `plugins/plenery.lua`** (duplikat)
4. 🔧 **Refactor duplikacji `load_session()`**

### Medium Priority (najbliższe dni)
5. 📚 **Dodaj LuaDoc comments do publicznych API**
6. 🔒 **Dodaj database migrations system**
7. ⚡ **Dodaj database cleanup (30-day retention)**
8. 🎨 **Fix keybinding konflikt Ctrl+j/k**

### Low Priority (jeśli masz czas)
9. 📊 **Dodaj metrics/telemetry (opcjonalne)**
10. 🎨 **Screenshot do README**
11. 📖 **Keybindings cheatsheet**
12. 🚀 **Streaming dla code review**

---

## 🎯 Podsumowanie rekomendacji

### Do usunięcia (875 linii)
- `lua/deprecated/` - cały katalog
- `lua/plugins/plenery.lua` - duplikat
- `lua/plugins/search-replace.lua` - nieużywany
- `lua/utils/editing.lua:format_added()` - deprecated
- `lua/utils/git.lua:review_changes()` - nieużywany
- `lua/utils/llm.lua:load_env()` - nieużywany

### Do naprawienia (CRITICAL)
- `lua/utils/info.lua:16-17` - błąd składni

### Do poprawy (opcjonalne)
- Database migrations
- Database cleanup
- LuaDoc comments
- Keybinding conflicts
- Session autoload flag
- Error context
- LRU cache dla review

---

## ✅ Co jest świetnie zrobione

1. **Architektura** - Czysta separacja: config / plugins / system / utils
2. **Lazy loading** - Większość pluginów lazy-loaded
3. **Session management** - Zaawansowane z SQLite persistence
4. **Edit history** - Unikalna funkcja, rzadko spotykana
5. **Git integration** - Branch switching z session/stash management
6. **AI integration** - Progressive review z cache, streaming chat
7. **Debugger** - Persistent breakpoints, full DAP setup
8. **Error handling** - Większość kodu używa pcall()
9. **Storage system** - Solidny SQLite wrapper
10. **Code generators** - Extensible system

---

## 📈 Metryki kodu

| Metryka | Wartość |
|---------|---------|
| Całkowita liczba linii | ~8,500 |
| Dead code | ~875 (10%) |
| Pliki Lua | 47 |
| Pluginy | 25+ |
| Funkcjonalności | 20+ |
| Keybindings | 60+ |
| Database tables | 6 |

---

## 🎓 Ocena ogólna

**Ocena:** 8.5/10

**Plusy:**
- Bardzo zaawansowana konfiguracja
- Dobrze zorganizowana struktura
- Unikalne funkcje (session per branch, edit history, AI review)
- Solidne error handling

**Minusy:**
- Błąd składni w info.lua (CRITICAL)
- 10% dead code do usunięcia
- Brak migracji DB
- Drobne duplikacje kodu
- Konflikt keybindingów

**Rekomendacja:** Po naprawieniu błędu składni i usunięciu dead code, będzie to configuration klasy production-ready 9/10.
