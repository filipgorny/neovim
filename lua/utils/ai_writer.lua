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
  max_tool_iterations = 6, -- safety cap on tool-call loop
  system_prompt = [[You are a precise code/content writing assistant integrated into a text editor.
The user gives you an instruction and the current contents of the file they have open.
Your job is to produce the COMPLETE new file contents that fulfill the instruction.

You have access to TOOLS — use them when helpful:
- find_symbol(name): locate a class/function/type in the project. Use BEFORE writing code that depends on existing project symbols.
- web_search(query): look up library/API docs, error messages, syntax. Use sparingly.
- ask_user(question): ask a clarifying question. Use ONLY when the instruction is genuinely ambiguous and you cannot proceed.

Workflow:
1. If you need info, call tools first. You may call multiple tools across turns.
2. Once you have enough context, produce the FINAL file contents in a message with no tool calls.

Rules for the FINAL message:
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

-- Floating "AI Writer: <status>" indicator. Returns { set, close }.
-- Defensive cleanup: registers VimLeavePre + WinClosed to stop the spinner
-- timer even if the caller forgets to call close() (e.g. uncaught error).
local function open_status_window()
  local ui = vim.api.nvim_list_uis()[1]
  local width = 60
  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(buf, "buftype", "nofile")
  vim.api.nvim_buf_set_option(buf, "bufhidden", "wipe")

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
  local i, current_status = 1, "thinking..."
  local closed = false
  local timer = vim.loop.new_timer()

  local function do_close()
    if closed then return end
    closed = true
    if timer and not timer:is_closing() then
      timer:stop()
      timer:close()
    end
    if vim.api.nvim_win_is_valid(win) then
      pcall(vim.api.nvim_win_close, win, true)
    end
  end

  if timer then
    timer:start(0, 100, vim.schedule_wrap(function()
      if closed then return end
      if not vim.api.nvim_buf_is_valid(buf) then
        -- Buffer is gone — close ourselves rather than ticking forever.
        do_close()
        return
      end
      local text = " " .. frames[i] .. " AI Writer: " .. current_status .. " "
      if #text > width then text = text:sub(1, width - 1) .. "…" end
      vim.api.nvim_buf_set_lines(buf, 0, -1, false, { text })
      i = (i % #frames) + 1
    end))
  end

  -- Safety net: clean up on nvim exit (and on window close from any source).
  local cleanup_group = vim.api.nvim_create_augroup(
    "AiWriterStatusCleanup_" .. buf, { clear = true }
  )
  vim.api.nvim_create_autocmd("VimLeavePre", {
    group = cleanup_group,
    callback = do_close,
  })
  vim.api.nvim_create_autocmd("WinClosed", {
    group = cleanup_group,
    pattern = tostring(win),
    callback = do_close,
  })

  return {
    set = function(s) current_status = s or current_status end,
    close = do_close,
  }
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

    local tools = require("utils.ai_writer_tools")
    local status = open_status_window()
    local accumulated = ""

    local target_win = nil
    for _, w in ipairs(vim.api.nvim_list_wins()) do
      if vim.api.nvim_win_get_buf(w) == target_bufnr then
        target_win = w
        break
      end
    end

    local function render_partial(text)
      if not vim.api.nvim_buf_is_valid(target_bufnr) then return end
      local view = text
      local first_line = view:match("^[^\n]*")
      if first_line and first_line:match("^%s*```") then
        local nl = view:find("\n")
        if nl then view = view:sub(nl + 1) end
      end
      local lines = vim.split(view, "\n", { plain = true })
      vim.api.nvim_buf_set_lines(target_bufnr, 0, -1, false, lines)
      if target_win and vim.api.nvim_win_is_valid(target_win) then
        local last = #lines
        local col = #(lines[last] or "")
        pcall(vim.api.nvim_win_set_cursor, target_win, { last, col })
      end
    end

    local pending_render = false
    local function schedule_render()
      if pending_render then return end
      pending_render = true
      vim.defer_fn(function()
        pending_render = false
        render_partial(accumulated)
      end, 33)
    end

    local function finish_with_text(text, err)
      status.close()
      if err then
        vim.notify("AI Writer: " .. tostring(err), vim.log.levels.ERROR)
        return
      end
      local final = strip_code_fences(text or "")
      set_buffer_text(target_bufnr, final)
      vim.notify("AI Writer: done (" .. #final .. " chars)", vim.log.levels.INFO)
    end

    -- Build the conversation. Each iteration appends assistant + tool messages.
    local messages = {
      { role = "system", content = M.config.system_prompt },
      { role = "user",   content = user_message },
    }

    -- Execute a list of tool_calls sequentially (some, like ask_user, are
    -- interactive — running them in series keeps UX sane). Resolves via
    -- `done()` once every tool has returned a result.
    local function run_tool_calls(calls, done)
      local results = {}
      local idx = 0
      local function next_call()
        idx = idx + 1
        if idx > #calls then return done(results) end
        local call = calls[idx]
        local fn = call["function"] or {}
        local name = fn.name or "(unknown)"
        local args = fn.arguments or {}
        -- Ollama may send arguments as a JSON string OR a table. Normalize.
        if type(args) == "string" then
          local ok, parsed = pcall(vim.fn.json_decode, args)
          args = ok and parsed or {}
        end
        status.set("tool: " .. name .. "(" .. (vim.inspect(args):gsub("\n", " ")) .. ")")
        tools.execute(name, args, function(result)
          table.insert(results, {
            role = "tool",
            content = tostring(result or ""),
            -- some Ollama models expect tool_call_id; harmless if ignored
            tool_call_id = call.id,
          })
          next_call()
        end)
      end
      next_call()
    end

    -- The agent loop: non-streaming chat call with tools; if the assistant
    -- returns tool_calls, execute and recurse. Otherwise we have the final
    -- answer — re-fetch it as a streamed call so the user sees code arrive
    -- live in the buffer.
    local function step(iteration)
      if iteration > M.config.max_tool_iterations then
        finish_with_text(nil, "Max tool iterations reached (" .. M.config.max_tool_iterations .. ")")
        return
      end

      status.set("thinking (iter " .. iteration .. ")...")
      provider:chat(messages, {
        tools = tools.definitions,
        temperature = M.config.temperature,
        max_tokens = M.config.max_tokens,
      }, function(reply, err)
        if err then
          finish_with_text(nil, err)
          return
        end

        local calls = reply.tool_calls
        if calls and #calls > 0 then
          -- Persist the assistant's tool-call message into history
          table.insert(messages, {
            role = "assistant",
            content = reply.content or "",
            tool_calls = calls,
          })
          run_tool_calls(calls, function(tool_msgs)
            for _, m in ipairs(tool_msgs) do table.insert(messages, m) end
            step(iteration + 1)
          end)
          return
        end

        -- No tool calls — `reply.content` IS the final answer. We could just
        -- write it directly, but for the streaming UX we replay the same
        -- conversation through the streaming endpoint so the user sees text
        -- arriving live.
        if not provider.stream then
          finish_with_text(reply.content, nil)
          return
        end
        status.set("writing code...")
        accumulated = ""
        provider:stream(nil, function(chunk)
          accumulated = accumulated .. chunk
          schedule_render()
        end, function(full, e)
          finish_with_text(full or accumulated, e)
        end, {
          messages = messages, -- includes full tool-use history
          temperature = M.config.temperature,
          max_tokens = M.config.max_tokens,
        })
      end)
    end

    step(1)
  end)
end

return M
