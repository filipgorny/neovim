local M = {}

local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local sorters = require("telescope.sorters")
local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")
local ui = require("utils.ui")

local SCRIPTS_DIR = vim.fn.stdpath("config") .. "/scripts"

-- Parse `# desc:` and `# args:` lines from the script header.
-- args format: `name[*|?]:Prompt text;name2:Prompt text 2`
--   `*` suffix on name → required (abort if empty)
local function parse_metadata(path)
  local meta = { desc = "", args = {} }
  local f = io.open(path, "r")
  if not f then return meta end

  local lines_read = 0
  for line in f:lines() do
    lines_read = lines_read + 1
    if lines_read == 1 and line:match("^#!") then
      -- shebang, skip
    elseif line:match("^#") then
      local key, value = line:match("^#%s*([%w_-]+)%s*:%s*(.*)$")
      if key then
        key = key:lower()
        if key == "desc" then
          meta.desc = value
        elseif key == "args" then
          for spec in value:gmatch("[^;]+") do
            local raw_name, prompt = spec:match("^%s*([%w_%-%*%?]+)%s*:%s*(.+)%s*$")
            if raw_name then
              local required = raw_name:sub(-1) == "*"
              local clean = raw_name:gsub("[%*%?]$", "")
              table.insert(meta.args, {
                name = clean,
                prompt = prompt,
                required = required,
              })
            end
          end
        end
      end
    elseif line:match("^%s*$") then
      -- blank line within header, keep scanning
    else
      break
    end
    if lines_read > 30 then break end
  end
  f:close()
  return meta
end

local function discover_scripts()
  local scripts = {}
  if vim.fn.isdirectory(SCRIPTS_DIR) == 0 then return scripts end

  for _, name in ipairs(vim.fn.readdir(SCRIPTS_DIR)) do
    local path = SCRIPTS_DIR .. "/" .. name
    if vim.fn.filereadable(path) == 1 and vim.fn.executable(path) == 1 then
      local meta = parse_metadata(path)
      table.insert(scripts, {
        name = name,
        path = path,
        desc = meta.desc,
        args = meta.args,
      })
    end
  end
  table.sort(scripts, function(a, b) return a.name < b.name end)
  return scripts
end

local function collect_args(script, idx, values, done)
  if idx > #script.args then
    done(values)
    return
  end
  local arg = script.args[idx]
  local req = arg.required and " *" or ""
  local title = string.format(
    " %s — %d/%d: %s%s ",
    script.name, idx, #script.args, arg.name, req
  )
  ui.input_window(
    title,
    arg.prompt,
    function(input)
      input = input or ""
      if arg.required and input:match("^%s*$") then
        vim.notify(
          string.format("Aborted: '%s' is required", arg.name),
          vim.log.levels.WARN
        )
        return
      end
      table.insert(values, input)
      collect_args(script, idx + 1, values, done)
    end
  )
end

-- Show script output in a scratch split buffer
local function show_output(script, code, out)
  local lines = {
    string.format("$ %s   (exit %d)", script.name, code),
    string.rep("─", 60),
  }
  for _, l in ipairs(out) do
    table.insert(lines, l)
  end

  vim.cmd("botright 12split")
  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_win_set_buf(0, buf)
  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
  vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(buf, "modifiable", false)
  vim.api.nvim_buf_set_name(buf, "scripts://" .. script.name)
  vim.keymap.set("n", "q", "<cmd>close<cr>", { buffer = buf, silent = true })
end

local function run_script(script, arg_values)
  local cmd = { script.path }
  for _, v in ipairs(arg_values) do
    table.insert(cmd, v)
  end

  local preview = script.name
  for _, v in ipairs(arg_values) do
    preview = preview .. " " .. (v == "" and "''" or v)
  end
  vim.notify("▶ " .. preview, vim.log.levels.INFO)

  local out = {}
  local function collect(_, data)
    if not data then return end
    for _, line in ipairs(data) do
      if line ~= "" then table.insert(out, line) end
    end
  end

  vim.fn.jobstart(cmd, {
    cwd = vim.fn.getcwd(),
    stdout_buffered = true,
    stderr_buffered = true,
    on_stdout = collect,
    on_stderr = collect,
    on_exit = function(_, code)
      vim.schedule(function()
        local level = code == 0 and vim.log.levels.INFO or vim.log.levels.ERROR
        local prefix = code == 0 and "✔" or "✘"
        vim.notify(string.format("%s %s (exit %d)", prefix, script.name, code), level)
        if #out > 0 then
          show_output(script, code, out)
        end
      end)
    end,
  })
end

M.pick = function()
  local scripts = discover_scripts()
  if #scripts == 0 then
    vim.notify("No scripts found in " .. SCRIPTS_DIR, vim.log.levels.WARN)
    return
  end

  pickers.new({}, {
    prompt_title = "Scripts",
    finder = finders.new_table({
      results = scripts,
      entry_maker = function(entry)
        return {
          value = entry,
          display = string.format("%-25s %s", entry.name, entry.desc),
          ordinal = entry.name .. " " .. entry.desc,
        }
      end,
    }),
    sorter = sorters.get_generic_fuzzy_sorter({}),
    attach_mappings = function(prompt_bufnr, _)
      actions.select_default:replace(function()
        local selection = action_state.get_selected_entry()
        actions.close(prompt_bufnr)
        if not selection then return end
        local script = selection.value
        vim.schedule(function()
          collect_args(script, 1, {}, function(values)
            run_script(script, values)
          end)
        end)
      end)
      return true
    end,
  }):find()
end

return M
