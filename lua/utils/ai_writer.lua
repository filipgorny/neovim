-- AI Writer: prompt-based file completion using a local LLM (Ollama by default).
-- <leader>a opens a floating prompt; the response replaces (or fills) the
-- currently open file's buffer.
local M = {}

M.config = {
  provider = "ollama",
  model = "qwen2.5-coder:14b",
  api_url = nil,          -- nil = use provider default ("http://localhost:11434")
  temperature = 0.2,
  max_tokens = 4096,
  system_prompt = [[You are a precise code/content writing assistant integrated into a text editor.
The user gives you an instruction and the current contents of the file they have open.
Produce the COMPLETE new file contents that fulfill the instruction.

Rules:
- Output ONLY the raw file contents. No prose, no explanations, no greetings.
- Do NOT wrap the output in Markdown code fences (no ``` blocks).
- Preserve the file's language/syntax. If the file is empty, generate from scratch.
- Keep existing content unless the instruction asks to change it.]],
}

function M.setup(opts)
  if opts then
    M.config = vim.tbl_deep_extend("force", M.config, opts)
  end
end

local function load_provider()
  local ok, provider = pcall(require, "utils.llm.providers." .. M.config.provider)
  if not ok then
    return nil, "Failed to load provider 'utils.llm.providers." .. M.config.provider .. "': " .. tostring(provider)
  end
  if M.config.model and provider.set_model then provider:set_model(M.config.model) end
  if M.config.api_url and provider.set_api_url then provider:set_api_url(M.config.api_url) end
  return provider
end

-- Strip ``` fences from a streamed response (defensive — the system prompt asks
-- the model not to use them, but small local models often add them anyway).
local function strip_code_fences(text)
  if not text or text == "" then return text end
  local lines = vim.split(text, "\n", { plain = true })
  -- drop leading blank lines
  while #lines > 0 and lines[1]:match("^%s*$") do table.remove(lines, 1) end
  if #lines > 0 and lines[1]:match("^%s*```") then
    table.remove(lines, 1)
    -- drop trailing blank lines, then trailing closing fence
    while #lines > 0 and lines[#lines]:match("^%s*$") do table.remove(lines) end
    if #lines > 0 and lines[#lines]:match("^%s*```%s*$") then
      table.remove(lines)
    end
  end
  return table.concat(lines, "\n")
end

local function get_buffer_text(bufnr)
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  return table.concat(lines, "\n")
end

local function set_buffer_text(bufnr, text)
  if not vim.api.nvim_buf_is_valid(bufnr) then return end
  local lines = vim.split(text or "", "\n", { plain = true })
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
end

local function open_prompt_window(on_submit, on_cancel)
  local ui = vim.api.nvim_list_uis()[1]
  local width = math.min(80, math.max(40, math.floor(ui.width * 0.6)))
  local height = 3
  local row = math.floor((ui.height - height) / 2)
  local col = math.floor((ui.width - width) / 2)

  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_option(buf, "filetype", "markdown")

  local provider_label = M.config.model or (M.config.provider .. " (default model)")
  local title = " AI Writer — " .. provider_label .. " "

  local win = vim.api.nvim_open_win(buf, true, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = title,
    title_pos = "center",
    footer = " <CR> submit · <Esc> cancel ",
    footer_pos = "center",
  })

  vim.api.nvim_win_set_option(win, "winhl", "Normal:Normal,FloatBorder:FloatBorder,FloatTitle:Title,FloatFooter:Comment")
  vim.api.nvim_win_set_option(win, "wrap", true)

  local closed = false
  local function close()
    if closed then return end
    closed = true
    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end
  end

  local function submit()
    local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
    local prompt = vim.trim(table.concat(lines, "\n"))
    close()
    if prompt == "" then
      vim.notify("AI Writer: empty prompt", vim.log.levels.WARN)
      if on_cancel then on_cancel() end
      return
    end
    on_submit(prompt)
  end

  local function cancel()
    close()
    if on_cancel then on_cancel() end
  end

  local map_opts = { buffer = buf, noremap = true, silent = true }
  vim.keymap.set("i", "<CR>", function() vim.cmd("stopinsert"); submit() end, map_opts)
  vim.keymap.set("n", "<CR>", submit, map_opts)
  vim.keymap.set({ "i", "n" }, "<C-CR>", function() vim.cmd("stopinsert"); submit() end, map_opts)
  vim.keymap.set({ "i", "n" }, "<Esc>", function() vim.cmd("stopinsert"); cancel() end, map_opts)

  vim.cmd("startinsert")
end

-- Show a tiny floating "generating..." indicator anchored to the editor corner.
local function open_status_window()
  local ui = vim.api.nvim_list_uis()[1]
  local width = 32
  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")
  vim.api.nvim_buf_set_lines(buf, 0, -1, false, { " AI Writer: generating... " })

  local win = vim.api.nvim_open_win(buf, false, {
    relative = "editor",
    width = width,
    height = 1,
    row = ui.height - 4,
    col = ui.width - width - 4,
    style = "minimal",
    border = "rounded",
    focusable = false,
    noautocmd = true,
  })
  vim.api.nvim_win_set_option(win, "winhl", "Normal:Comment,FloatBorder:Comment")

  local frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
  local i = 1
  local timer = vim.loop.new_timer()
  if timer then
    timer:start(0, 100, vim.schedule_wrap(function()
      if not vim.api.nvim_buf_is_valid(buf) then return end
      vim.api.nvim_buf_set_lines(buf, 0, -1, false, { " " .. frames[i] .. " AI Writer: generating... " })
      i = (i % #frames) + 1
    end))
  end

  return function()
    if timer then timer:stop(); timer:close() end
    if vim.api.nvim_win_is_valid(win) then vim.api.nvim_win_close(win, true) end
  end
end

function M.open(opts)
  opts = opts or {}
  local target_bufnr = opts.bufnr or vim.api.nvim_get_current_buf()
  if not vim.api.nvim_buf_is_valid(target_bufnr) then
    vim.notify("AI Writer: invalid buffer", vim.log.levels.ERROR)
    return
  end

  open_prompt_window(function(prompt)
    local provider, err = load_provider()
    if not provider then
      vim.notify("AI Writer: " .. err, vim.log.levels.ERROR)
      return
    end

    local current = get_buffer_text(target_bufnr)
    local filename = vim.api.nvim_buf_get_name(target_bufnr)
    local filetype = vim.api.nvim_buf_get_option(target_bufnr, "filetype")
    if filename == "" then filename = "(unnamed buffer)" end

    local user_message = string.format(
      "Instruction:\n%s\n\nFile: %s\nFiletype: %s\n\nCurrent file contents:\n%s",
      prompt,
      filename,
      filetype ~= "" and filetype or "(none)",
      current
    )

    local close_status = open_status_window()
    local accumulated = ""

    local function finish(text, stream_err)
      close_status()
      if stream_err then
        vim.notify("AI Writer error: " .. tostring(stream_err), vim.log.levels.ERROR)
        return
      end
      local final = strip_code_fences(text or accumulated)
      set_buffer_text(target_bufnr, final)
      vim.notify("AI Writer: done (" .. #final .. " chars)", vim.log.levels.INFO)
    end

    if type(provider.stream) == "function" then
      provider:stream(nil, function(chunk)
        accumulated = accumulated .. chunk
      end, function(full, e)
        finish(full or accumulated, e)
      end, {
        messages = { { role = "user", content = user_message } },
        system = M.config.system_prompt,
        temperature = M.config.temperature,
        max_tokens = M.config.max_tokens,
      })
    else
      provider:prompt(user_message, function(response, e)
        finish(response, e)
      end, {
        system = M.config.system_prompt,
        temperature = M.config.temperature,
        max_tokens = M.config.max_tokens,
      })
    end
  end)
end

return M
