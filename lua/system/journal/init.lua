local M = {}
local state = nil

local function esc(s)
  return (tostring(s or ""):gsub("'", "''"))
end

local function db_path()
  local dir = vim.fn.stdpath("data") .. "/journal"

  vim.fn.mkdir(dir, "p")

  return dir .. "/journal.sqlite"
end

local function run_sql(sql)
  local out = vim.fn.system({ "sqlite3", db_path() }, sql)

  if vim.v.shell_error ~= 0 then
    return nil
  end

  return out
end

local function ensure_db()
  run_sql(
    "CREATE TABLE IF NOT EXISTS entries("
    .. "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    .. "date TEXT NOT NULL,"
    .. "content TEXT NOT NULL,"
    .. "created_at TEXT NOT NULL DEFAULT (datetime('now')));"
    .. "CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);"
  )
end

local function get_entries(date)
  local sql = ("SELECT id, content FROM entries WHERE date='%s' ORDER BY id ASC"):format(esc(date))
  local out = run_sql(sql)

  if not out or out == "" then
    return {}
  end

  local raw = vim.split(vim.trim(out), "\n", { plain = true })
  local entries = {}

  for _, line in ipairs(raw) do
    local id, content = line:match("^(.-)|(.+)$")

    if id then
      table.insert(entries, { id = tonumber(id), content = content })
    end
  end

  return entries
end

local function add_entry(date, content)
  local sql = ("INSERT INTO entries(date, content) VALUES('%s', '%s')"):format(esc(date), esc(content))

  return run_sql(sql)
end

local function get_all_dates()
  local out = run_sql("SELECT DISTINCT date FROM entries ORDER BY date DESC")

  if not out or out == "" then
    return {}
  end

  return vim.split(vim.trim(out), "\n", { plain = true })
end

local function render_entries(bufnr, date, win_width)
  local entries = get_entries(date)
  local cw = math.max(18, win_width - 6)
  local bw = cw + 2
  local lines = {}

  table.insert(lines, string.rep(" ", math.floor((win_width - #date - 10) / 2)) .. "Journal ─ " .. date)
  table.insert(lines, "")

  table.insert(lines, "  ┌" .. string.rep("─", bw) .. "┐")

  for i, entry in ipairs(entries) do
    if i > 1 then
      table.insert(lines, "  │" .. string.rep(" ", bw + 2) .. "│")
    end

    for _, wline in ipairs(vim.split(entry.content, "\n", { plain = true })) do
      local remaining = wline

      while #remaining > 0 do
        local chunk = remaining:sub(1, cw)

        table.insert(lines, "  │ " .. chunk .. string.rep(" ", cw - #chunk) .. " │")
        remaining = remaining:sub(cw + 1)
      end
    end
  end

  if #entries > 0 then
    table.insert(lines, "  └" .. string.rep("─", bw) .. "┘")
  end

  table.insert(lines, "  > ")

  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
end

function M.open_for_date(date)
  if state then
    M.close()
  end

  local total_w = vim.o.columns
  local total_h = vim.o.lines
  local width = math.floor(total_w * 0.78)
  local height = math.floor(total_h * 0.78)
  local row = math.floor((total_h - height) / 2)
  local col = math.floor((total_w - width) / 2)

  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(bufnr, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(bufnr, "swapfile", false)

  local win = vim.api.nvim_open_win(bufnr, true, {
    relative = "editor",
    width = width,
    height = height - 1,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Journal ",
    title_pos = "center",
  })

  vim.api.nvim_win_set_option(win, "wrap", false)
  vim.api.nvim_win_set_option(win, "cursorline", false)

  render_entries(bufnr, date, width)

  state = {
    date = date,
    bufnr = bufnr,
    win = win,
    width = width,
  }

  vim.keymap.set("n", "q", M.close, { buffer = bufnr, silent = true })
  vim.keymap.set("n", "<Esc>", M.close, { buffer = bufnr, silent = true })

  vim.keymap.set("i", "<CR>", function()
    local line_count = vim.api.nvim_buf_line_count(bufnr)
    local last_line = vim.api.nvim_buf_get_lines(bufnr, line_count - 1, line_count, false)[1] or ""
    local text = last_line:match("^%s*>%s(.+)$") or ""

    if text ~= "" then
      add_entry(date, text)
    end

    render_entries(bufnr, date, width)

    local new_count = vim.api.nvim_buf_line_count(bufnr)
    local prompt_col = 4

    pcall(vim.api.nvim_win_set_cursor, win, { new_count, prompt_col })
  end, { buffer = bufnr, silent = true })

  vim.api.nvim_create_autocmd("WinClosed", {
    pattern = tostring(win),
    once = true,
    callback = function()
      state = nil
    end,
  })

  vim.schedule(function()
    vim.api.nvim_set_current_win(win)

    local line_count = vim.api.nvim_buf_line_count(bufnr)
    local prompt_col = 4

    pcall(vim.api.nvim_win_set_cursor, win, { line_count, prompt_col })
    vim.cmd("startinsert!")
  end)
end

function M.close()
  if not state then
    return
  end

  if state.win and vim.api.nvim_win_is_valid(state.win) then
    vim.api.nvim_win_close(state.win, true)
  end

  state = nil
end

function M.open_today()
  M.open_for_date(os.date("%Y-%m-%d"))
end

function M.pick_date()
  local pickers = require("telescope.pickers")
  local finders = require("telescope.finders")
  local actions = require("telescope.actions")
  local action_state = require("telescope.actions.state")
  local conf = require("telescope.config").values

  local dates = get_all_dates()
  local today = os.date("%Y-%m-%d")
  local items = {}
  local has_today = false

  for _, d in ipairs(dates) do
    if d == today then
      has_today = true
    end

    table.insert(items, d)
  end

  if not has_today then
    table.insert(items, 1, "+ " .. today .. " (new)")
  end

  pickers.new({}, {
    prompt_title = " Journal Days ",
    finder = finders.new_table { results = items },
    sorter = conf.generic_sorter({}),
    attach_mappings = function(prompt_bufnr)
      actions.select_default:replace(function()
        local selection = action_state.get_selected_entry()

        actions.close(prompt_bufnr)

        if selection then
          local selected = selection[1]
          local date = selected:match("^%+ (.+) %(new%)$") or selected

          M.open_for_date(date)
        end
      end)

      return true
    end,
  }):find()
end

function M.open()
  if state then
    M.pick_date()
  else
    M.open_today()
  end
end

function M.setup()
  ensure_db()

  vim.keymap.set("n", "<leader>H", M.open, { desc = "Journal: open today / browse days" })
end

return M
