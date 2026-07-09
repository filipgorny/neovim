return {
  {
    "nvim-neo-tree/neo-tree.nvim",
    branch = "v3.x",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-tree/nvim-web-devicons", -- not strictly required, but recommended
      "MunifTanjim/nui.nvim",
      {
        "s1n7ax/nvim-window-picker", -- for open_with_window_picker keymaps
        version = "2.*",
        config = function()
          require("window-picker").setup({
            filter_rules = {
              include_current_win = false,
              autoselect_one = true,
              -- filter using buffer options
              bo = {
                -- if the file type is one of following, the window will be ignored
                filetype = { "neo-tree", "neo-tree-popup", "notify" },
                -- if the buffer type is one of following, the window will be ignored
                buftype = { "terminal", "quickfix" },
              },
            },
          })
        end,
      },
    },
    lazy = false,
    -----Instead of using `config`, you can use `opts` instead, if you'd like:
    -----@module "neo-tree"
    -----@type neotree.Config
    --opts = {},
    config = function()

      -- If you want icons for diagnostic errors, you'll need to define them somewhere.
      -- In Neovim v0.10+, you can configure them in vim.diagnostic.config(), like:
      --
      vim.diagnostic.config({
        float = {source = "always", border =border},
        virtualtext = false,

         signs = {
           text = {
             [vim.diagnostic.severity.ERROR] = '',
             [vim.diagnostic.severity.WARN] = '',
             [vim.diagnostic.severity.INFO] = '',
             [vim.diagnostic.severity.HINT] = '󰌵',
           },
         }
      })
      --
      -- In older versions, you can define the signs manually:
      -- vim.fn.sign_define("DiagnosticSignError", { text = " ", texthl = "DiagnosticSignError" })
      -- vim.fn.sign_define("DiagnosticSignWarn", { text = " ", texthl = "DiagnosticSignWarn" })
      -- vim.fn.sign_define("DiagnosticSignInfo", { text = " ", texthl = "DiagnosticSignInfo" })
      -- vim.fn.sign_define("DiagnosticSignHint", { text = "󰌵", texthl = "DiagnosticSignHint" })

      vim.api.nvim_set_hl(0, "NeoTreeFavorite", { fg = "#e2b714" })

      -- Wyróżnij niezakomitowane pliki w drzewku (nazwy kolorowane wg statusu gita).
      -- Motywy często nie definiują grup NeoTreeGit*, więc ustawiamy je jawnie
      -- i odświeżamy po każdej zmianie colorscheme.
      local function set_git_highlights()
        vim.api.nvim_set_hl(0, "NeoTreeGitModified", { fg = "#e0af68", bold = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitUntracked", { fg = "#9ece6a", bold = true, italic = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitAdded", { fg = "#9ece6a", bold = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitStaged", { fg = "#73daca", bold = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitRenamed", { fg = "#7aa2f7", bold = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitDeleted", { fg = "#f7768e", bold = true })
        vim.api.nvim_set_hl(0, "NeoTreeGitConflict", { fg = "#f7768e", bold = true, undercurl = true })
        -- Zakomitowane, ale różne od brancha bazowego — subtelniejsze niż zmiany w working tree
        vim.api.nvim_set_hl(0, "NeoTreeBranchDiff", { fg = "#b8975a" })
      end

      set_git_highlights()

      vim.api.nvim_create_autocmd("ColorScheme", {
        group = vim.api.nvim_create_augroup("NeoTreeGitHighlights", { clear = true }),
        callback = set_git_highlights,
      })

      require("neo-tree").setup({
        open_on_setup = false,
        close_if_last_window = false, -- Close Neo-tree if it is the last window left in the tab
        popup_border_style = "",      -- or "" to use 'winborder' on Neovim v0.11+
        enable_git_status = true,
        enable_diagnostics = true,
        open_files_do_not_replace_types = { "terminal", "trouble", "qf" }, -- when opening files, do not use windows containing these filetypes or buftypes
        open_files_using_relative_paths = false,
        sort_case_insensitive = false,                                     -- used when sorting files and directories in the tree
        sort_function = nil,
        event_handlers = {
          {
            event = "after_render",
            handler = function(state)
              if state.name ~= "filesystem" then return end
              local buf = state.bufnr
              if not buf or not vim.api.nvim_buf_is_valid(buf) then return end

              local ns = vim.api.nvim_create_namespace("neo_tree_favorites")
              vim.api.nvim_buf_clear_namespace(buf, ns, 0, -1)

              local favorites = require("utils.favorites")
              local all = favorites.get_all()
              if #all == 0 then return end

              local cwd = vim.fn.getcwd()
              local virt_lines = { { { "  ★ Favorites", "NeoTreeFavorite" } } }
              for _, path in ipairs(all) do
                local name = vim.fn.fnamemodify(path, ":t")
                local rel = vim.fn.fnamemodify(path, ":." )
                if rel == path then rel = path end
                table.insert(virt_lines, { { "    " .. name .. "  ", "NeoTreeFileName" }, { rel, "NeoTreeDimText" } })
              end
              table.insert(virt_lines, { { "  ─────────────────", "NeoTreeDimText" } })

              vim.api.nvim_buf_set_extmark(buf, ns, 0, 0, {
                virt_lines_above = true,
                virt_lines = virt_lines,
              })
            end,
          },
          {
            event = "after_render",
            handler = function(state)
              if state.name ~= "filesystem" then return end
              local buf = state.bufnr
              if not buf or not vim.api.nvim_buf_is_valid(buf) then return end
              if not state.tree then return end

              local ns = vim.api.nvim_create_namespace("neo_tree_branch_diff")
              vim.api.nvim_buf_clear_namespace(buf, ns, 0, -1)

              local diff = require("utils.branch_diff").get_files()
              if vim.tbl_isempty(diff) then return end

              for l = 1, vim.api.nvim_buf_line_count(buf) do
                local ok, node = pcall(state.tree.get_node, state.tree, l)

                if ok and node and node.path and diff[node.path] then
                  -- Pliki/katalogi z niezakomitowanymi zmianami mają już mocniejsze
                  -- kolory gita — im nie nadpisujemy.
                  local status = state.git_status_lookup and state.git_status_lookup[node.path]

                  if not status then
                    local text = vim.api.nvim_buf_get_lines(buf, l - 1, l, false)[1] or ""
                    local s = text:find(node.name, 1, true)

                    if s then
                      -- priorytet > 4096, bo neo-tree koloruje nazwy (NeoTreeDirectoryName
                      -- / NeoTreeFileName) z priorytetem 4096 i inaczej by nas przykrył
                      vim.api.nvim_buf_set_extmark(buf, ns, l - 1, s - 1, {
                        end_col = s - 1 + #node.name,
                        hl_group = "NeoTreeBranchDiff",
                        priority = 5000,
                      })
                    end
                  end
                end
              end
            end,
          },
        },
        default_component_configs = {
          container = {
            enable_character_fade = true,
          },
          indent = {
            indent_size = 2,
            padding = 1, -- extra padding on left hand side
            -- indent guides
            with_markers = true,
            indent_marker = "│",
            last_indent_marker = "└",
            highlight = "NeoTreeIndentMarker",
            -- expander config, needed for nesting files
            with_expanders = nil, -- if nil and file nesting is enabled, will enable expanders
            expander_collapsed = "",
            expander_expanded = "",
            expander_highlight = "NeoTreeExpander",
          },
          icon = {
            folder_closed = "",
            folder_open = "",
            folder_empty = "󰜌",
            provider = function(icon, node, state) -- default icon provider utilizes nvim-web-devicons if available
              if node.type == "file" or node.type == "terminal" then
                local success, web_devicons = pcall(require, "nvim-web-devicons")
                local name = node.type == "terminal" and "terminal" or node.name
                if success then
                  local devicon, hl = web_devicons.get_icon(name)
                  icon.text = devicon or icon.text
                  icon.highlight = hl or icon.highlight
                end
              end
            end,
            -- The next two settings are only a fallback, if you use nvim-web-devicons and configure default icons there
            -- then these will never be used.
            default = "*",
            highlight = "NeoTreeFileIcon",
          },
          modified = {
            symbol = "[+]",
            highlight = "NeoTreeModified",
          },
          name = {
            trailing_slash = false,
            use_git_status_colors = true,
            highlight = "NeoTreeFileName",
          },
          git_status = {
            symbols = {
              -- Change type
              added = "", -- or "✚", but this is redundant info if you use git_status_colors on the name
              modified = "", -- or "", but this is redundant info if you use git_status_colors on the name
              deleted = "✖", -- this can only be used in the git_status source
              renamed = "󰁕", -- this can only be used in the git_status source
              -- Status type
              untracked = "",
              ignored = "",
              unstaged = "󰄱",
              staged = "",
              conflict = "",
            },
          },
          -- If you don't want to use these columns, you can set `enabled = false` for each of them individually
          file_size = {
            enabled = true,
            width = 12,          -- width of the column
            required_width = 64, -- min width of window required to show this column
          },
          type = {
            enabled = true,
            width = 10,           -- width of the column
            required_width = 122, -- min width of window required to show this column
          },
          last_modified = {
            enabled = true,
            width = 20,          -- width of the column
            required_width = 88, -- min width of window required to show this column
          },
          created = {
            enabled = true,
            width = 20,           -- width of the column
            required_width = 110, -- min width of window required to show this column
          },
          symlink_target = {
            enabled = false,
          },
        },
        -- A list of functions, each representing a global custom command
        -- that will be available in all sources (if not overridden in `opts[source_name].commands`)
        -- see `:h neo-tree-custom-commands-global`
        commands = {},
        window = {
          position = "float",
          width = 120,
          mapping_options = {
            noremap = true,
            nowait = true,
          },
          mappings = {
            ["<space>"] = {
              "toggle_node", nowait = false, -- disable `nowait` if you have existing combos starting with this char that you want to use {
            },
            ["<2-LeftMouse>"] = "open",
            ["<cr>"] = "open",
            ["<esc>"] = "cancel", -- close preview or floating neo-tree window
            ["P"] = { "toggle_preview", config = { use_float = true, use_image_nvim = true } },
            -- Read `# Preview Mode` for more information
            ["l"] = "focus_preview",
            ["S"] = "open_split",
            ["s"] = "open_vsplit",
            -- ["S"] = "split_with_window_picker",
            -- ["s"] = "vsplit_with_window_picker",
            ["t"] = "open_tabnew",
            -- ["<cr>"] = "open_drop",
            -- ["t"] = "open_tab_drop",
            ["w"] = "open_with_window_picker",
            --["P"] = "toggle_preview", -- enter preview mode, which shows the current node without focusing
            ["C"] = "close_node",
            -- ['C'] = 'close_all_subnodes',
            ["z"] = "close_all_nodes",
            --["Z"] = "expand_all_nodes",
            --["Z"] = "expand_all_subnodes",
            ["a"] = {
              "add",
              -- this command supports BASH style brace expansion ("x{a,b,c}" -> xa,xb,xc). see `:h neo-tree-file-actions` for details
              -- some commands may take optional config options, see `:h neo-tree-mappings` for details
              config = {
                show_path = "none", -- "none", "relative", "absolute"
              },
            },
            ["A"] = "add_directory", -- also accepts the optional config.show_path option like "add". this also supports BASH style brace expansion.
            ["d"] = "delete",
            ["r"] = "rename",
            ["b"] = "rename_basename",
            ["y"] = "copy_to_clipboard",
            ["x"] = "cut_to_clipboard",
            ["p"] = "paste_from_clipboard",
            ["c"] = "copy", -- takes text input for destination, also accepts the optional config.show_path option like "add":
            -- ["c"] = {
            --  "copy",
            --  config = {
            --    show_path = "none" -- "none", "relative", "absolute"
            --  }
            --}
            ["m"] = "move", -- takes text input for destination, also accepts the optional config.show_path option like "add".
            ["q"] = "close_window",
            ["R"] = "refresh",
            ["?"] = "show_help",
            ["<"] = "prev_source",
            [">"] = "next_source",
            ["i"] = "show_file_details",
            -- ["i"] = {
            --   "show_file_details",
            --   -- format strings of the timestamps shown for date created and last modified (see `:h os.date()`)
            --   -- both options accept a string or a function that takes in the date in seconds and returns a string to display
            --   -- config = {
            --   --   created_format = "%Y-%m-%d %I:%M %p",
            --   --   modified_format = "relative", -- equivalent to the line below
            --   --   modified_format = function(seconds) return require('neo-tree.utils').relative_date(seconds) end
            --   -- }
            -- },
          },
        },
        use_float = true,
        nesting_rules = {},
        filesystem = {
          filtered_items = {
            visible = false, -- when true, they will just be displayed differently than normal items
            hide_dotfiles = false,
            hide_gitignored = false,
            hide_hidden = false, -- only works on Windows for hidden files/directories
            hide_by_name = {
              "node_modules"
            },
            hide_by_pattern = { -- uses glob style patterns
              --"*.meta",
              --"*/src/*/tsconfig.json",
            },
            always_show = { -- remains visible even if other settings would normally hide it
              --".gitignored",
            },
            always_show_by_pattern = { -- uses glob style patterns
              --".env*",
            },
            never_show = { -- remains hidden even if visible is toggled to true, this overrides always_show
              --".DS_Store",
              --"thumbs.db"
            },
            never_show_by_pattern = { -- uses glob style patterns
              --".null-ls_*",
            },
          },
          follow_current_file = {
            enabled = false,                      -- This will find and focus the file in the active buffer every time
            --               -- the current file is changed while the tree is open.
            leave_dirs_open = false,              -- `false` closes auto expanded dirs, such as with `:Neotree reveal`
          },
          group_empty_dirs = false,               -- when true, empty folders will be grouped together
          hijack_netrw_behavior = "disabled", -- netrw disabled, opening a directory opens neo-tree
          -- in whatever position is specified in window.position
          -- "open_current",  -- netrw disabled, opening a directory opens within the
          -- window like netrw would, regardless of window.position
          -- "disabled",    -- netrw left alone, neo-tree does not handle opening dirs
          use_libuv_file_watcher = false, -- This will use the OS level file watchers to detect changes
          -- instead of relying on nvim autocmd events.
          window = {
            mappings = {
              ["<bs>"] = "navigate_up",
              ["."] = "set_root",
              ["H"] = "toggle_hidden",
              ["/"] = "fuzzy_finder",
              ["D"] = "fuzzy_finder_directory",
              ["#"] = "fuzzy_sorter", -- fuzzy sorting using the fzy algorithm
              -- ["D"] = "fuzzy_sorter_directory",
              ["f"] = "filter_on_submit",
              ["ff"] = { "toggle_favorite", nowait = false },
              ["<c-x>"] = "clear_filter",
              ["[g"] = "prev_git_modified",
              ["]g"] = "next_git_modified",
              ["]"] = { "jump_in_nesting", nowait = false },
              ["["] = { "jump_out_nesting", nowait = false },
              ["o"] = {
                "show_help",
                nowait = false,
                config = { title = "Order by", prefix_key = "o" },
              },
              ["oc"] = { "order_by_created", nowait = false },
              ["od"] = { "order_by_diagnostics", nowait = false },
              ["og"] = { "order_by_git_status", nowait = false },
              ["om"] = { "order_by_modified", nowait = false },
              ["on"] = { "order_by_name", nowait = false },
              ["os"] = { "order_by_size", nowait = false },
              ["ot"] = { "order_by_type", nowait = false },
              -- ['<key>'] = function(state) ... end,
            },
            fuzzy_finder_mappings = { -- define keymaps for filter popup window in fuzzy_finder_mode
              ["<down>"] = "move_cursor_down",
              ["<C-n>"] = "move_cursor_down",
              ["<up>"] = "move_cursor_up",
              ["<C-p>"] = "move_cursor_up",
              ["<esc>"] = "close",
              -- ['<key>'] = function(state, scroll_padding) ... end,
            },
          },

          components = {
            favorite_icon = function(config, node, state)
              local fav = require("utils.favorites")
              if fav.is_favorite(node:get_id()) then
                return { text = "★ ", highlight = "NeoTreeFavorite" }
              end
              return {}
            end,
          },

          renderers = {
            directory = {
              { "indent" },
              { "icon" },
              { "current_filter" },
              { "favorite_icon" },
              { "container", content = {
                { "name", zindex = 10 },
                { "symlink_target", zindex = 10, highlight = "NeoTreeSymbolicLinkTarget" },
                { "clipboard", zindex = 10 },
                { "diagnostics", errors_only = true, zindex = 20, align = "right", hide_when_expanded = true },
                { "git_status", zindex = 20, align = "right", hide_when_expanded = true },
              }},
            },
            file = {
              { "indent" },
              { "icon" },
              { "favorite_icon" },
              { "container", content = {
                { "name", zindex = 10 },
                { "symlink_target", zindex = 10, highlight = "NeoTreeSymbolicLinkTarget" },
                { "clipboard", zindex = 10 },
                { "bufnr", zindex = 10 },
                { "modified", zindex = 20, align = "right" },
                { "diagnostics", zindex = 20, align = "right" },
                { "git_status", zindex = 20, align = "right" },
              }},
            },
          },

          commands = {
            jump_in_nesting = function(state)
              local node = state.tree:get_node()
              if not node then return end
              local current_depth = node:get_depth()
              local current_line = vim.api.nvim_win_get_cursor(0)[1]
              local total_lines = vim.api.nvim_buf_line_count(0)
              for lnum = current_line + 1, total_lines do
                local n = state.tree:get_node(lnum)
                if n then
                  local d = n:get_depth()
                  if d > current_depth then
                    require("neo-tree.ui.renderer").focus_node(state, n:get_id())
                    return
                  elseif d <= current_depth then
                    return
                  end
                end
              end
            end,

            jump_out_nesting = function(state)
              local node = state.tree:get_node()
              if not node then return end
              local parent_id = node:get_parent_id()
              if parent_id then
                require("neo-tree.ui.renderer").focus_node(state, parent_id)
              end
            end,

            toggle_favorite = function(state)
              local node = state.tree:get_node()
              local path = node:get_id()
              require("utils.favorites").toggle(path)
              require("neo-tree.sources.manager").refresh("filesystem")
            end,

            -- Custom command to create file with generator
            generate_file = function(state)
              local node = state.tree:get_node()
              local parent_dir

              if node.type == "directory" then
                parent_dir = node:get_id()
              else
                parent_dir = vim.fn.fnamemodify(node:get_id(), ":h")
              end

              -- Use NeoTree's built-in input function for consistent UI
              local inputs = require("neo-tree.ui.inputs")
              inputs.input("File name: ", "", function(filename)
                if not filename or filename == "" then
                  return
                end

                -- Create full path
                local filepath = parent_dir .. "/" .. filename

                -- Close NeoTree before opening Telescope
                vim.cmd("Neotree close")

                -- Small delay to ensure NeoTree is fully closed
                vim.defer_fn(function()
                  -- Show generator picker
                  local generator = require("utils.generator")
                  generator.pick(function(gen_name, gen_module)
                    -- Create the file
                    local file = io.open(filepath, "w")
                    if file then
                      file:close()
                    end

                    -- Open the file in a buffer
                    vim.cmd("edit " .. vim.fn.fnameescape(filepath))

                    -- Run the generator (it will insert into the now-open buffer)
                    gen_module.generate()
                  end)
                end, 100)
              end)
            end,
          }, -- Add a custom command or override a global one using the same function name
        },
        buffers = {
          follow_current_file = {
            enabled = true, -- This will find and focus the file in the active buffer every time
            --              -- the current file is changed while the tree is open.
            leave_dirs_open = false, -- `false` closes auto expanded dirs, such as with `:Neotree reveal`
          },
          group_empty_dirs = true, -- when true, empty folders will be grouped together
          show_unloaded = true,
          window = {
            mappings = {
              ["d"] = "buffer_delete",
              ["bd"] = "buffer_delete",
              ["<bs>"] = "navigate_up",
              ["."] = "set_root",
              ["o"] = {
                "show_help",
                nowait = false,
                config = { title = "Order by", prefix_key = "o" },
              },
              ["oc"] = { "order_by_created", nowait = false },
              ["od"] = { "order_by_diagnostics", nowait = false },
              ["om"] = { "order_by_modified", nowait = false },
              ["on"] = { "order_by_name", nowait = false },
              ["os"] = { "order_by_size", nowait = false },
              ["ot"] = { "order_by_type", nowait = false },
            },
          },
        },
        git_status = {
          window = {
            position = "float",
            mappings = {
              ["A"] = "git_add_all",
              ["gu"] = "git_unstage_file",
              ["ga"] = "git_add_file",
              ["gr"] = "git_revert_file",
              ["gc"] = "git_commit",
              ["gp"] = "git_push",
              ["gg"] = "git_commit_and_push",
              ["o"] = {
                "show_help",
                nowait = false,
                config = { title = "Order by", prefix_key = "o" },
              },
              ["oc"] = { "order_by_created", nowait = false },
              ["od"] = { "order_by_diagnostics", nowait = false },
              ["om"] = { "order_by_modified", nowait = false },
              ["on"] = { "order_by_name", nowait = false },
              ["os"] = { "order_by_size", nowait = false },
              ["ot"] = { "order_by_type", nowait = false },
            },
          },
        },
      })

      vim.keymap.set("n", "<leader>e", function()
        local ok, err = pcall(vim.cmd, "Neotree reveal")
        if not ok then
          -- Jeśli reveal nie działa (np. plik nie istnieje), otwórz Neotree bez reveal
          vim.cmd("Neotree show")
        end
      end)

      -- Znajdź okno neo-tree (po filetype) i ogranicz jego szerokość do 20% ekranu.
      -- Robimy to po otwarciu, bo window.width (120) jest współdzielone z konfiguracją
      -- float — nie chcemy zwężać pływającego panelu.
      local function clamp_side_width()
        for _, w in ipairs(vim.api.nvim_list_wins()) do
          local b = vim.api.nvim_win_get_buf(w)

          if vim.api.nvim_buf_is_valid(b) and vim.bo[b].filetype == "neo-tree" then
            vim.api.nvim_win_set_width(w, math.floor(vim.o.columns * 0.2))
            break
          end
        end
      end

      vim.keymap.set("n", "<leader>E", function()
        local ok, err = pcall(vim.cmd, "Neotree reveal position=left")
        if not ok then
          -- Jeśli reveal nie działa (np. plik nie istnieje), otwórz Neotree bez reveal
          vim.cmd("Neotree show position=left")
        end

        vim.schedule(clamp_side_width)
      end)

    end,
  },

}
