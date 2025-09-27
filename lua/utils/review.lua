local Job = require("plenary.job")

local M = {}

local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")
local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local previewers = require("telescope.previewers")
local conf = require("telescope.config").values

-- Funkcja do popupów
local function show_popup(message)
  local lines = {}
  for line in message:gmatch("[^\n]+") do
    table.insert(lines, line)
  end

  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)

  local width = 0
  for _, line in ipairs(lines) do
    width = math.max(width, #line)
  end
  local height = #lines

  vim.api.nvim_open_win(buf, true, {
    relative = "editor",
    width = width + 2,
    height = height,
    row = (vim.o.lines - height) / 2,
    col = (vim.o.columns - width) / 2,
    style = "minimal",
    border = "single",
  })
end

-- Podgląd pliku z podświetleniem linii i wirtualnym tekstem
local function preview_file(entry)
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, vim.fn.readfile(entry.filename))

  local ns = vim.api.nvim_create_namespace("cli_highlight")
  vim.api.nvim_buf_add_highlight(bufnr, ns, "Visual", entry.line - 1, 0, -1)
  vim.api.nvim_buf_set_virtual_text(bufnr, ns, entry.line - 1, { { entry.message, "WarningMsg" } }, {})

  return bufnr
end

local function show_cli_results(results)
  local files = {}
  for _, r in ipairs(results) do
    files[r.filename] = true
  end
  local file_list = vim.tbl_keys(files)

  pickers.new({}, {
    prompt_title = "CLI Results",
    finder = finders.new_table({ results = file_list }),
    sorter = conf.generic_sorter({}),
    previewer = previewers.new_buffer_previewer({
      define_preview = function(self, entry, _)
        local selected_file = entry.value
        local entries = {}
        for _, r in ipairs(results) do
          if r.filename == selected_file then
            table.insert(entries, r)
          end
        end
        if #entries > 0 then
          local buf = preview_file(entries[1])
          vim.api.nvim_win_set_buf(self.state.winid, buf)
        end
      end,
    }),
    attach_mappings = function(_, map)
      actions.select_default:replace(function(prompt_bufnr)
        local selection = action_state.get_selected_entry()
        actions.close(prompt_bufnr)
        vim.cmd("edit " .. selection.value)
      end)
      return true
    end,
  }):find()
end

local function run_cli(cmd, callback)
  -- pokaż popup z "Please wait..."
  local wait_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_lines(wait_buf, 0, -1, false, { "Please wait..." })
  local wait_win = vim.api.nvim_open_win(wait_buf, true, {
    relative = "editor",
    width = 20,
    height = 1,
    row = (vim.o.lines - 1) / 2,
    col = (vim.o.columns - 20) / 2,
    style = "minimal",
    border = "single",
  })

  local Job = require("plenary.job")
  Job:new({
    command = "sh",
    args = { "-c", cmd },
    on_exit = function(j, _)
      local output = table.concat(j:result(), "\n")

        -- usuń wszystko przed pierwszym [ i po ostatnim ]
        local s, e = output:find("%[.*%]", 1)
        local json_str
        if s and e then
            json_str = output:sub(s, e)
        end

      vim.schedule(function()
        -- zamknij popup "Please wait..."
        if vim.api.nvim_win_is_valid(wait_win) then
          vim.api.nvim_win_close(wait_win, true)
        end
        
        local ok, data

        if json_str then
            ok, data = pcall(vim.fn.json_decode, json_str)
        end

        if ok and data then
          callback(data)
        else
          vim.notify("Błąd parsowania JSON:\n" .. json_str, vim.log.levels.ERROR)
        end
      end)
    end,
  }):start()
end

M.review_changes = function()
  local command = [[
    git diff | gemini -p "Please review my changes, and return them in the json object - an array of types: { filename: string, line: number, message: string }"
  ]]
  run_cli(command, show_cli_results)
end

return M
