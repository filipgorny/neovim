# Neovim Configuration - Features Documentation

## 1. LSP (Language Server Protocol)

**Opis:** Pełna obsługa LSP dla TypeScript/JavaScript, Lua i Go z automatyczną instalacją serwerów.

**Funkcje:**
- Automatyczna instalacja serwerów LSP: `ts_ls`, `eslint`, `lua_ls`, `gopls`
- Autocomplete z cmp-nvim-lsp
- Diagnostyka błędów i ostrzeżeń
- Go to definition (gd), references (gr), implementation (gi)
- Hover documentation (K)
- Code actions (<leader>ca)
- Rename symbol (<leader>rn)
- Signature help (Ctrl+h w insert mode)
- Diagnostics navigation ([d, ]d)

**Skróty klawiszowe:**
- `gd` - Go to definition
- `gi` - Go to implementation
- `gr` - Find references
- `K` - Hover documentation
- `<leader>rn` - Rename symbol
- `<leader>ca` - Code actions
- `<leader>r` - Open diagnostics float
- `[d` - Previous diagnostic
- `]d` - Next diagnostic
- `Ctrl+h` - Signature help (insert mode)

**Pliki:**
- `lua/plugins/lsp-config.lua` - Konfiguracja LSP
- `lua/plugins/autocomplete.lua` - Autocomplete z nvim-cmp

---

## 2. AI Assistant (LLM Integration)

**Opis:** Integracja z Claude AI do code review, analizy kodu i interaktywnego czatu.

**Funkcje:**
- Code review wszystkich zmian git diff
- Progressive review (plik po pliku z cache)
- Analiza pojedynczego pliku
- Interaktywny czat z kontekstem projektu
- Streaming responses
- Automatic fallback z Claude Code plan na API
- Cache review'ów dla niemodyfikowanych plików
- Aplikowanie sugestii kodu bezpośrednio z czatu

**Skróty klawiszowe:**
- `<leader>ar` - Review all git changes (progressive)
- `<leader>af` - Review current file changes
- `<leader>ac` - Analyze current file (bugs, quality, security)
- `<leader>aa` - Ask about selected code (visual mode)
- `<leader>ai` - Open interactive chat
- `<leader>ap` - Apply code changes from chat
- `<leader>ax` - Clear chat history

**Pliki:**
- `lua/utils/llm.lua` - Core LLM logic
- `lua/utils/llm/providers/claude.lua` - Claude API provider
- `lua/utils/llm/providers/claude_plan.lua` - Claude Code plan provider
- `lua/utils/ui.lua` - UI dla review i czatu

---

## 3. Debugger (DAP)

**Opis:** Pełna integracja z Debug Adapter Protocol dla JavaScript/TypeScript/Node.js.

**Funkcje:**
- Launch NestJS app w trybie debug
- Attach do działającej aplikacji
- Debug current file
- Debug Jest tests
- Breakpoints (normalne, conditional, log points)
- Variables inspection
- Call stack
- Debug console i REPL
- Persistent breakpoints (zapisywane do DB per branch)
- Virtual text (wartości zmiennych inline)

**Skróty klawiszowe:**
- `F5` - Start/Continue debugging
- `F6` - Terminate debug session
- `F7` - Step into
- `F8` - Step over
- `F9` - Toggle breakpoint
- `F10` - Step out
- `<leader>db` - Toggle breakpoint
- `<leader>dB` - Set conditional breakpoint
- `<leader>dr` - Toggle REPL
- `<leader>dl` - Run last debug configuration
- `<leader>du` - Toggle debug UI
- `<leader>dh` - Hover variable value
- `<leader>dp` - Preview variable

**Pliki:**
- `lua/plugins/debugger.lua` - DAP configuration
- `lua/system/debugging.lua` - Breakpoints persistence

---

## 4. Git Integration

**Opis:** Zaawansowana integracja z Git - nawigacja, branch switching, conflict resolution.

**Funkcje:**
- Nawigacja po zmianach git (hunks)
- Branch switching z auto-save i session management
- Stash management per branch
- Merge conflict resolver z 3-way view
- Git status integration w statusline i gutter
- Blame line (pokazuje autora i commit)

**Skróty klawiszowe:**
- `Shift+]` - Next git hunk
- `Shift+[` - Previous git hunk
- `<leader>gb` - Switch git branch (z session management)
- `<leader>gm` - Resolve merge conflicts

**Pliki:**
- `lua/utils/git.lua` - Git utilities i branch switching
- `lua/plugins/gitsigns.lua` - Git signs w gutter
- `lua/plugins/blameline.lua` - Git blame

---

## 5. Session Management

**Opis:** Automatyczne zapisywanie i ładowanie sesji per projekt i branch.

**Funkcje:**
- Auto-save/load bufferów per git branch
- Restore cursor positions
- Save/restore breakpoints
- Save/restore working directory
- Real-time tracking otwarcia/zamknięcia bufferów
- Integracja z branch switching

**Skróty klawiszowe:**
- `<leader>S` - Manually save session

**Komendy:**
- `:SessionInfo` - Pokaż informacje o sesji
- `:SessionLoad` - Załaduj sesję dla current branch
- `:SessionSave` - Zapisz sesję

**Pliki:**
- `lua/system/session.lua` - Session management
- `lua/utils/storage.lua` - SQLite storage backend

---

## 6. Navigation & Edit History

**Opis:** Inteligentna nawigacja po lokalizacjach edycji z trwałym storage.

**Funkcje:**
- Track edit locations across files
- Jump back/forward through edit history
- Persist history per project and git branch
- Auto-deduplication bliskich lokalizacji
- Animated jumps (blink line)
- Buffer position restoration

**Skróty klawiszowe:**
- `Ctrl+j` - Go to previous edit location
- `Ctrl+k` - Go to next edit location
- `<leader>nh` - Show edit history
- `<leader>nc` - Clear edit history

**Pliki:**
- `lua/utils/navigation.lua` - Navigation tracking
- `lua/utils/buffer_history.lua` - Buffer position tracking
- `lua/utils/animation.lua` - Line blink animation

---

## 7. File Explorer (Neo-tree)

**Opis:** Nowoczesny file explorer z integracją git i generatorami.

**Funkcje:**
- Float window mode
- Git status integration
- File operations (create, delete, rename, copy, move)
- Generator integration (tworzenie plików z templates)
- Window picker dla split operations
- Fuzzy finder
- File details (size, date, type)

**Skróty klawiszowe:**
- `<leader>e` - Toggle Neo-tree
- `a` - Add file
- `A` - Add directory
- `g` - Generate file with template
- `d` - Delete file
- `r` - Rename file
- `c` - Copy file
- `m` - Move file
- `y` - Copy to clipboard
- `p` - Paste from clipboard

**Pliki:**
- `lua/plugins/neotree.lua` - Neo-tree configuration

---

## 8. Fuzzy Finder (Telescope)

**Opis:** Fuzzy finder dla plików, text search, colorschemes, git history.

**Funkcje:**
- Find files
- Live grep (search in files)
- Git file history
- Git branch picker
- Colorscheme picker z preview
- Custom navigation (Ctrl+j/k)

**Skróty klawiszowe:**
- `<leader>f` - Find files
- `<leader>g` - Live grep
- `<leader>t` - Colorscheme picker
- `<leader>h` - Git file history

**Pliki:**
- `lua/plugins/telescope.lua` - Telescope configuration

---

## 9. Formatting

**Opis:** Automatyczne formatowanie kodu z conform.nvim.

**Funkcje:**
- Format modified lines on save (Ctrl+s)
- Manual format całego pliku
- Prettier dla JS/TS/CSS/JSON/HTML/YAML
- gofmt dla Go
- Skip formatting jeśli są błędy LSP

**Skróty klawiszowe:**
- `Ctrl+s` - Format modified lines + save
- `:Format` - Format whole file

**Pliki:**
- `lua/plugins/formatting.lua` - Conform.nvim config
- `lua/utils/editing.lua` - Format modifications logic

---

## 10. Code Generators

**Opis:** System generatorów kodu z templates.

**Funkcje:**
- React component generator (FC + props + styles)
- Telescope picker dla wyboru generatora
- Integracja z Neo-tree (klawisz 'g')
- Extensible system (łatwo dodać nowe)

**Skróty klawiszowe:**
- `<leader>gr` - Generate React component

**Pliki:**
- `lua/utils/generator.lua` - Generator system
- `lua/utils/generator/react-component.lua` - React generator

---

## 11. Tabs & Buffers

**Opis:** Zarządzanie tabami z bufferline.nvim.

**Funkcje:**
- Visual buffer line z diagnostic icons
- Pin buffers
- Close buffers (left/right/unpinned)
- Navigate with Alt+j/k
- File type icons
- LSP diagnostics w tab

**Skróty klawiszowe:**
- `Alt+j` - Previous tab
- `Alt+k` - Next tab
- `Shift+q` - Close current buffer
- `<leader>bp` - Pin buffer
- `<leader>bP` - Close unpinned buffers
- `<leader>br` - Close buffers to the right
- `<leader>bl` - Close buffers to the left

**Pliki:**
- `lua/plugins/tabs.lua` - Bufferline configuration

---

## 12. Themes

**Opis:** Kolekcja 20+ motywów kolorystycznych.

**Dostępne motywy:**
- Gruvbox, Catppuccin, Tokyo Night, Kanagawa
- Nord, Solarized, Dracula, Nightfox
- One Dark, GitHub, Rose Pine, Everforest
- Material, Sonokai, Oxocarbon
- i więcej...

**Skróty klawiszowe:**
- `<leader>t` - Colorscheme picker z preview

**Pliki:**
- `lua/plugins/themes.lua` - Theme plugins
- `lua/system/themes.lua` - Theme loader

---

## 13. Treesitter

**Opis:** Syntax highlighting i code parsing.

**Funkcje:**
- Automatic installation dla JS/TS/Lua/Go/HTML/CSS
- Syntax highlighting
- Code folding
- Incremental selection
- Indentation

**Pliki:**
- `lua/plugins/treesitter.lua` - Treesitter configuration

---

## 14. Statusline (Lualine)

**Opis:** Statusline z informacjami o pliku, git, LSP.

**Funkcje:**
- File info (name, encoding, filetype)
- Git branch i diff stats
- LSP status i diagnostics
- Cursor position

**Pliki:**
- `lua/plugins/lualine.lua` - Lualine configuration

---

## 15. Scroll Animations

**Opis:** Smooth scrolling z neoscroll.nvim.

**Pliki:**
- `lua/plugins/scroll.lua` - Scroll configuration

---

## 16. Gitsigns

**Opis:** Git decorations w gutter.

**Funkcje:**
- Added/changed/deleted line indicators
- Inline blame
- Hunk operations

**Pliki:**
- `lua/plugins/gitsigns.lua` - Gitsigns configuration

---

## 17. Storage System

**Opis:** SQLite database dla persistent storage.

**Wykorzystanie:**
- Sessions (buffers, working directory)
- Navigation history
- Breakpoints
- Code review cache
- Buffer positions

**Pliki:**
- `lua/utils/storage.lua` - SQLite wrapper

---

## 18. Configuration Reload

**Opis:** Przeładowanie konfiguracji bez restartu.

**Funkcje:**
- Clear Lua module cache
- Reload init.lua
- Restart Neovim (save all + reload)

**Skróty klawiszowe:**
- `<leader>c` - Reload config
- `<leader>rr` - Restart Neovim (save all + reload)

**Pliki:**
- `lua/system/configuration.lua` - Config reload

---

## 19. Clipboard Integration

**Opis:** System clipboard integration.

**Skróty klawiszowe:**
- `Ctrl+c` - Copy (visual mode)
- `Ctrl+a` - Select all

**Pliki:**
- `lua/config/clipboard.lua` - Clipboard config

---

## 20. Error Messages

**Opis:** Centralized error logging.

**Komendy:**
- `:Errors` - Show all errors and messages (including code review errors)

**Pliki:**
- `lua/system/config_errors.lua` - Error handling

---

## Ogólne skróty klawiszowe

### Podstawowe
- `Space` - Leader key
- `Ctrl+s` - Format modified lines + save
- `Shift+q` - Close buffer
- `Ctrl+a` - Select all

### LSP
- `gd` - Go to definition
- `gr` - Find references
- `gi` - Go to implementation
- `K` - Hover documentation
- `<leader>rn` - Rename
- `<leader>ca` - Code actions

### Git
- `Shift+]` - Next hunk
- `Shift+[` - Previous hunk
- `<leader>gb` - Switch branch
- `<leader>gm` - Resolve conflicts

### AI/LLM
- `<leader>ar` - Review git diff
- `<leader>af` - Review file
- `<leader>ac` - Analyze file
- `<leader>ai` - Open chat
- `<leader>ap` - Apply chat changes

### Debug
- `F5` - Start/Continue
- `F6` - Terminate
- `F7` - Step into
- `F8` - Step over
- `F9` - Toggle breakpoint
- `F10` - Step out

### Navigation
- `Ctrl+j` - Previous edit
- `Ctrl+k` - Next edit
- `Alt+j` - Previous tab
- `Alt+k` - Next tab

### Files
- `<leader>e` - Toggle file explorer
- `<leader>f` - Find files
- `<leader>g` - Live grep
- `<leader>h` - Git history

### Generators
- `<leader>gr` - Generate React component

---

## Architektura projektu

```
~/.config/nvim/
├── init.lua                    # Entry point
├── lazy-lock.json              # Plugin versions
├── lua/
│   ├── config/                 # Core configuration
│   │   ├── clipboard.lua       # Clipboard settings
│   │   ├── editor.lua          # Editor settings
│   │   ├── keymap.lua          # Global keymaps
│   │   └── spaces.lua          # Tabs/spaces config
│   ├── plugins/                # Plugin configurations
│   │   ├── autocomplete.lua    # nvim-cmp
│   │   ├── blameline.lua       # Git blame
│   │   ├── debugger.lua        # DAP
│   │   ├── formatting.lua      # conform.nvim
│   │   ├── gitsigns.lua        # Git decorations
│   │   ├── lsp-config.lua      # LSP servers
│   │   ├── lualine.lua         # Statusline
│   │   ├── neotree.lua         # File explorer
│   │   ├── scroll.lua          # Smooth scroll
│   │   ├── search-replace.lua  # Search/replace
│   │   ├── tabs.lua            # Bufferline
│   │   ├── telescope.lua       # Fuzzy finder
│   │   ├── themes.lua          # Color themes
│   │   └── treesitter.lua      # Syntax highlighting
│   ├── system/                 # Core system modules
│   │   ├── configuration.lua   # Config reload
│   │   ├── debugging.lua       # Breakpoints storage
│   │   ├── events.lua          # Event system
│   │   ├── lazy.lua            # Plugin manager
│   │   ├── session.lua         # Session management
│   │   └── themes.lua          # Theme loader
│   ├── utils/                  # Utility modules
│   │   ├── animation.lua       # Line blink
│   │   ├── buffer_history.lua  # Buffer positions
│   │   ├── debug_buffer.lua    # Debug helpers
│   │   ├── editing.lua         # Edit helpers
│   │   ├── env.lua             # Environment vars
│   │   ├── file.lua            # File operations
│   │   ├── generator.lua       # Code generators
│   │   ├── git.lua             # Git operations
│   │   ├── info.lua            # Info display
│   │   ├── keymap.lua          # Keymap helpers
│   │   ├── llm.lua             # LLM integration
│   │   ├── navigation.lua      # Edit history
│   │   ├── storage.lua         # SQLite wrapper
│   │   ├── string.lua          # String utils
│   │   ├── ui.lua              # UI components
│   │   ├── generator/
│   │   │   └── react-component.lua  # React generator
│   │   └── llm/
│   │       └── providers/
│   │           ├── base.lua         # Base provider
│   │           ├── claude.lua       # Claude API
│   │           └── claude_plan.lua  # Claude Code plan
│   └── deprecated/             # Old/unused code
└── docs/
    └── features.md             # This file
```

---

## Database Schema

Konfiguracja używa SQLite database (`~/.local/share/nvim/nvim_storage.db`) do persistent storage:

### Tables:
1. **sessions** - Session metadata (project, branch, cwd)
2. **session_buffers** - Open buffers per session
3. **navigation_history** - Edit locations history
4. **buffer_positions** - Cursor positions per file
5. **breakpoints** - Debug breakpoints per project/branch
6. **code_reviews** - Cached code reviews (MD5 hash)

---

## Environment Variables

### Required (opcjonalne):
- `ANTHROPIC_API_KEY` - Claude API key (dla fallback z Claude Code plan)

Można też stworzyć plik `.env` w projekcie z:
```
ANTHROPIC_API_KEY=sk-ant-...
```
