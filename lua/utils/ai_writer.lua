-- AI Writer: prompt-driven editing backed by a local LLM (Ollama by default).
-- <leader>a opens a floating prompt. On a file with content the model replies
-- with SEARCH/REPLACE blocks that are applied hunk by hunk (see
-- utils.ai_writer_patch); on an empty buffer it streams the whole file in.
-- Either way it can call tools first — reading dependencies, locating symbols,
-- searching the web — and a floating panel reports each one as it runs.
local M = {}

M.config = {
  provider = "ollama",
  -- Measured head-to-head against qwen2.5-coder:14b on this pipeline:
  --   plain edit, 157-line file .... tie, 3/3 correct each, ~5.2s each
  --   edit needing a dependency .... qwen3 2/2, qwen2.5-coder 0/2
  --   tools enabled ................ qwen2.5-coder loops through all 6 turns
  --                                  and produces nothing; its template never
  --                                  emits structured tool_calls, only bare
  --                                  JSON (recovered by parse_inline_tool_call)
  -- `think = false` matters too: reasoning cost ~9x the tokens and produced a
  -- WORSE (non-unique) edit block.
  -- To go back: model = "qwen2.5-coder:14b" AND tools = false — with tools left
  -- on it is unusable.
  model = "qwen3:14b",
  api_url = nil,          -- nil = use provider default ("http://localhost:11434")
  temperature = 0.2,
  max_tokens = 4096,
  num_ctx = 16384,         -- Ollama defaults to 4096, which truncates real files
  keep_alive = "30m",      -- keep weights resident between requests
  think = false,           -- disable reasoning on qwen3 / deepseek-r1
  max_tool_iterations = 6, -- safety cap on tool-call loop
  -- Set false to send no tool definitions at all. Worth it for a model that
  -- compulsively emits tool calls instead of doing the work (qwen2.5-coder).
  tools = true,
  -- Used when the buffer already has content: the model returns edit blocks, so
  -- the cost of a change is proportional to the change, not to the file.
  edit_system_prompt = [[You are a precise code editing assistant integrated into a text editor.
The user gives you an instruction and the current contents of the file they have open.

You have access to TOOLS — use them when helpful:
- read_file(path, start_line, end_line): read another file in the project — an import, a dependency, a type definition, a config. Use this BEFORE writing code that calls into or implements something defined elsewhere, so your signatures actually match.
- list_files(pattern): locate a file when you do not know its exact path.
- find_symbol(name): locate a class/function/type in the project.
- web_search(query): look up library/API docs, error messages, syntax. Use sparingly.
- ask_user(question): ask a clarifying question. Use ONLY when the instruction is genuinely ambiguous.

Workflow:
1. If you need info, call tools first. You may call multiple tools across turns.
2. Once you have enough context, reply with EDIT BLOCKS — never the whole file.

EDIT BLOCK format. Your final message must contain NOTHING ELSE:

<<<<<<< SEARCH
lines copied exactly from the current file
=======
lines to put there instead
>>>>>>> REPLACE

Rules for edit blocks:
- The SEARCH section must match the current file character for character, including indentation. Copy it from the file; do not retype it from memory.
- The SEARCH section MUST be unique in the file. A lone `}` or `  return x` appears many times — include enough surrounding lines (the enclosing function signature, a neighbouring statement) that it can only match one place. An ambiguous block is rejected, not guessed at.
- Beyond that, keep SEARCH as short as you can.
- Emit one block per distinct change. Several blocks in one message are fine.
- To DELETE code, leave the REPLACE section empty.
- To APPEND new code at the end of the file, leave the SEARCH section empty.
- No prose, no explanations, no Markdown code fences around the blocks.]],

  -- Used when the buffer is empty: there is nothing to diff against, so ask for
  -- the whole file and stream it straight in.
  system_prompt = [[You are a precise code/content writing assistant integrated into a text editor.
The user gives you an instruction and the current contents of the file they have open.
Your job is to produce the COMPLETE new file contents that fulfill the instruction.

You have access to TOOLS — use them when helpful:
- read_file(path, start_line, end_line): read another file in the project — an import, a dependency, a type definition, a config. Use this BEFORE writing code that calls into or implements something defined elsewhere.
- list_files(pattern): locate a file when you do not know its exact path.
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
  if M.config.num_ctx and provider.set_num_ctx then provider:set_num_ctx(M.config.num_ctx) end
  if M.config.keep_alive and provider.set_keep_alive then provider:set_keep_alive(M.config.keep_alive) end
  if M.config.think ~= nil and provider.set_think then provider:set_think(M.config.think) end
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

-- Some Ollama chat templates (notably qwen2.5-coder) advertise tool support but
-- have no tool-call parser: the model emits the call as a bare JSON object in
-- `content` and Ollama passes it through untouched. Without this, such a turn
-- would be written into the user's file verbatim. Recover it into a real call.
local function parse_inline_tool_call(content, definitions)
  if not content then return nil end
  local text = vim.trim(content)
  -- tolerate a ```json fence around it
  text = vim.trim((text:gsub("^```%a*\n", ""):gsub("\n```$", "")))
  if not text:match("^{") or not text:match("}$") then return nil end

  local ok, obj = pcall(vim.fn.json_decode, text)
  if not ok or type(obj) ~= "table" then return nil end

  local name = obj.name or (type(obj["function"]) == "table" and obj["function"].name)
  local args = obj.arguments or obj.parameters
      or (type(obj["function"]) == "table" and obj["function"].arguments)
  if type(name) ~= "string" then return nil end

  local known = false
  for _, def in ipairs(definitions or {}) do
    local fn = def["function"] or {}
    if fn.name == name then
      known = true
      break
    end
  end
  if not known then return nil end

  return { {
    id = "inline_" .. name,
    ["function"] = { name = name, arguments = args or {} },
  } }
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

-- Floating activity panel. Shows the current phase on the top line and one
-- line per tool call underneath, so the user can see what the agent is actually
-- doing (reading which file, searching for what) instead of a bare spinner.
-- Returns { phase, step, note, close }.
--
-- Defensive cleanup: registers VimLeavePre + WinClosed to stop the spinner
-- timer even if the caller forgets to call close() (e.g. uncaught error).
local function open_status_window()
  local ui = vim.api.nvim_list_uis()[1]
  local width = math.min(72, math.max(40, math.floor(ui.width * 0.45)))
  local max_steps = 6

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
  local i = 1
  local phase = "thinking..."
  local steps = {}
  local closed = false
  local timer = vim.loop.new_timer()

  local function fit(text)
    local budget = width - 2
    if vim.fn.strdisplaywidth(text) <= budget then return text end
    return vim.fn.strcharpart(text, 0, budget - 1) .. "…"
  end

  local function render()
    if closed or not vim.api.nvim_buf_is_valid(buf) then return end

    local spinner = frames[i]
    local lines = { fit(" " .. spinner .. " AI Writer · " .. phase) }

    local first = math.max(1, #steps - max_steps + 1)
    for n = first, #steps do
      local step = steps[n]
      local icon = step.state == "ok" and "✓" or (step.state == "fail" and "✗" or spinner)
      local text = "   " .. icon .. " " .. step.text
      if step.note and step.note ~= "" then
        text = text .. " — " .. step.note
      end
      table.insert(lines, fit(text))
    end

    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
    if vim.api.nvim_win_is_valid(win) then
      pcall(vim.api.nvim_win_set_config, win, {
        relative = "editor",
        width = width,
        height = #lines,
        row = ui.height - 3 - #lines,
        col = ui.width - width - 4,
      })
    end
  end

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
      i = (i % #frames) + 1
      render()
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
    -- Top line: what the agent is doing overall.
    phase = function(text)
      phase = text or phase
      render()
    end,
    -- Add an activity line that spins until its handle is resolved.
    step = function(text)
      local entry = { text = text, state = "running" }
      table.insert(steps, entry)
      render()
      return {
        done = function(ok, note)
          entry.state = ok == false and "fail" or "ok"
          entry.note = note
          render()
        end,
        note = function(note)
          entry.note = note
          render()
        end,
      }
    end,
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

    local patch = require("utils.ai_writer_patch")
    local tools = require("utils.ai_writer_tools")

    -- Nothing to diff against in an empty buffer, so fall back to whole-file
    -- generation there; otherwise ask for edit blocks.
    local edit_mode = vim.trim(current) ~= ""

    local user_message = string.format(
      "Instruction:\n%s\n\nFile: %s\nFiletype: %s\n\nCurrent file contents:\n%s",
      prompt,
      filename,
      filetype ~= "" and filetype or "(none)",
      current
    )

    local status = open_status_window()
    local accumulated = ""

    local target_win = nil
    for _, w in ipairs(vim.api.nvim_list_wins()) do
      if vim.api.nvim_win_get_buf(w) == target_bufnr then
        target_win = w
        break
      end
    end

    -- Streaming is append-only, so only the tail of the buffer actually changes.
    -- Rewriting all lines 30x/s on a large file is what makes the "live" render
    -- feel heavier than the generation itself.
    local rendered = 0
    local function render_partial(text)
      if not vim.api.nvim_buf_is_valid(target_bufnr) then return end
      local view = text
      local first_line = view:match("^[^\n]*")
      if first_line and first_line:match("^%s*```") then
        local nl = view:find("\n")
        if nl then view = view:sub(nl + 1) end
      end
      local lines = vim.split(view, "\n", { plain = true })
      local start = rendered > 0 and rendered - 1 or 0
      if start > #lines then start = 0 end
      local tail = vim.list_slice(lines, start + 1, #lines)
      vim.api.nvim_buf_set_lines(target_bufnr, start, -1, false, tail)
      rendered = #lines
      if target_win and vim.api.nvim_win_is_valid(target_win) then
        local col = #(lines[#lines] or "")
        pcall(vim.api.nvim_win_set_cursor, target_win, { #lines, col })
      end
    end

    -- Put the buffer back the way we found it (used when a streamed turn turns
    -- out to be a tool call rather than the final file).
    local function reset_buffer()
      if rendered == 0 then return end
      set_buffer_text(target_bufnr, current)
      rendered = 0
    end

    -- Edit blocks are applied the moment they finish streaming, so the user
    -- watches hunks land one by one. `applied` is the high-water mark into the
    -- block list, since the text is re-parsed from scratch after every chunk.
    local applied, ok_count, failures = 0, 0, {}
    local touched = false

    local function apply_new_blocks(text)
      -- patch.parse only ever returns blocks that are already closed, so a
      -- half-streamed block simply is not in the list yet.
      local blocks = patch.parse(text)
      while applied < #blocks do
        applied = applied + 1
        local block = blocks[applied]
        local label = vim.trim((vim.split(block.search or "", "\n", { plain = true })[1]) or "")
        if label == "" then label = "append at end of file" end
        if #label > 44 then label = label:sub(1, 44) .. "…" end
        local step = status.step("edit: " .. label)

        local ok, err
        vim.api.nvim_buf_call(target_bufnr, function()
          if touched then pcall(vim.cmd, "undojoin") end
          ok, err = patch.apply(target_bufnr, block)
        end)

        if ok then
          touched = true
          ok_count = ok_count + 1
          step.done(true)
        else
          table.insert(failures, err)
          step.done(false, err)
        end
      end
    end

    local finished = false
    local pending_render = false
    local function schedule_render()
      if pending_render then return end
      pending_render = true
      vim.defer_fn(function()
        pending_render = false
        if finished then return end
        if edit_mode then
          apply_new_blocks(accumulated)
        else
          render_partial(accumulated)
        end
      end, 33)
    end

    local function finish_with_text(text, err)
      if finished then return end
      finished = true

      if err then
        status.close()
        reset_buffer()
        vim.notify("AI Writer: " .. tostring(err), vim.log.levels.ERROR)
        return
      end

      text = text or ""

      if edit_mode and patch.looks_like_edits(text) then
        -- Apply BEFORE closing the panel: a short response can finish streaming
        -- before the deferred render ever fires, and these are the lines the
        -- user most wants to see (which hunk landed, which one missed).
        status.phase("applying edits...")
        apply_new_blocks(text)
        status.close()
        local msg = string.format("AI Writer: applied %d edit%s", ok_count, ok_count == 1 and "" or "s")
        if #failures > 0 then
          msg = msg .. string.format(", %d failed to match:\n  %s", #failures, table.concat(failures, "\n  "))
          vim.notify(msg, vim.log.levels.WARN)
        else
          vim.notify(msg, vim.log.levels.INFO)
        end
        return
      end

      if edit_mode then
        -- No parseable edit blocks. Do NOT fall back to overwriting the file
        -- with whatever came back: a model that ignores the format tends to
        -- reply with prose, and pasting that in destroys the user's work.
        status.close()
        vim.g.ai_writer_last_response = text
        local first = vim.trim((vim.split(text, "\n", { plain = true })[1]) or "")
        if #first > 80 then first = first:sub(1, 80) .. "…" end
        vim.notify(
          "AI Writer: model returned no edit blocks — file left unchanged.\n" ..
          "Response starts: " .. first .. "\n" ..
          "Full reply in :lua =vim.g.ai_writer_last_response",
          vim.log.levels.WARN)
        return
      end

      -- Write mode: the reply is the file.
      status.close()
      local final = strip_code_fences(text)
      set_buffer_text(target_bufnr, final)
      vim.notify("AI Writer: done (" .. #final .. " chars)", vim.log.levels.INFO)
    end

    -- Build the conversation. Each iteration appends assistant + tool messages.
    local messages = {
      { role = "system", content = edit_mode and M.config.edit_system_prompt or M.config.system_prompt },
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

        local step = status.step(tools.describe(name, args))
        tools.execute(name, args, function(result)
          local text = tostring(result or "")
          local failed = text:match("^error:") ~= nil
          local first = vim.split(text, "\n", { plain = true })[1] or ""
          step.done(not failed, failed and first or (#text .. " chars"))
          table.insert(results, {
            role = "tool",
            content = text,
            -- some Ollama models expect tool_call_id; harmless if ignored
            tool_call_id = call.id,
          })
          next_call()
        end)
      end
      next_call()
    end

    -- The agent loop: ONE streaming chat call per turn, with tools attached.
    -- If the model answers with tool_calls we run them and recurse; otherwise
    -- what already streamed in IS the answer. The previous version made a blind
    -- non-streaming call and then replayed the identical conversation through
    -- the streaming endpoint, generating every file twice.
    local function step(iteration)
      if iteration > M.config.max_tool_iterations then
        finish_with_text(nil, "Max tool iterations reached (" .. M.config.max_tool_iterations .. ")")
        return
      end

      status.phase(iteration == 1
        and (edit_mode and "planning edits..." or "writing...")
        or ("thinking (turn " .. iteration .. ")..."))
      accumulated = ""

      local opts = {
        tools = M.config.tools ~= false and tools.definitions or nil,
        temperature = M.config.temperature,
        max_tokens = M.config.max_tokens,
      }

      local function on_reply(reply, err)
        if err then
          finish_with_text(nil, err)
          return
        end

        local calls = reply.tool_calls
        if not (calls and #calls > 0) then
          calls = parse_inline_tool_call(reply.content ~= "" and reply.content or accumulated,
            tools.definitions)
        end
        if calls and #calls > 0 then
          -- This turn was a tool call, not the answer. Undo anything the model
          -- happened to stream alongside it.
          reset_buffer()
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

        -- No tool calls — the streamed content is the answer. No second pass.
        local text = reply.content
        if not text or text == "" then text = accumulated end
        finish_with_text(text, nil)
      end

      if provider.chat_stream then
        provider:chat_stream(messages, opts, function(chunk)
          accumulated = accumulated .. chunk
          if iteration == 1 then status.phase(edit_mode and "applying edits..." or "writing...") end
          schedule_render()
        end, on_reply)
      else
        -- Provider without streaming tool support: single blocking call.
        provider:chat(messages, opts, on_reply)
      end
    end

    step(1)
  end)
end

return M
