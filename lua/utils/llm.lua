local M = {}

-- Configuration
local config = {
  model = nil,
  api_key = nil,
}

-- Setup LLM with model and configuration
function M.setup(options)
  options = options or {}

  -- Set model
  if options.model then
    config.model = options.model
  else
    -- Default to Claude
    config.model = require("utils.llm.models.claude")
  end

  -- Get API key
  if options.api_key then
    config.api_key = options.api_key
  else
    -- Try to read from .env file
    local env = require("utils.env")
    config.api_key = env.get("ANTHROPIC_API_KEY")

    -- Fall back to environment variable
    if not config.api_key then
      config.api_key = os.getenv("ANTHROPIC_API_KEY")
    end
  end

  -- Configure the model with API key
  if config.model and config.api_key then
    config.model:set_api_key(config.api_key)
  end

  return config.model:is_configured()
end

-- Get current model
local function get_model()
  if not config.model then
    -- Auto-setup with defaults if not configured
    M.setup()
  end

  return config.model
end

-- Read environment variables from .env file
local function load_env()
  local env_file = vim.fn.getcwd() .. "/.env"
  local env = {}

  if vim.fn.filereadable(env_file) == 1 then
    for line in io.lines(env_file) do
      -- Skip comments and empty lines
      if line:match("^%s*#") or line:match("^%s*$") then
        goto continue
      end

      -- Parse KEY=VALUE
      local key, value = line:match("^%s*([%w_]+)%s*=%s*(.+)%s*$")
      if key and value then
        -- Remove quotes if present
        value = value:gsub('^["\']', ""):gsub('["\']$', "")
        env[key] = value
      end

      ::continue::
    end
  end

  return env
end

-- Get API key from environment
local function get_api_key()
  local env = load_env()
  return env.ANTHROPIC_API_KEY or vim.env.ANTHROPIC_API_KEY
end

-- Send prompt to Claude API
M.prompt = function(msg, callback, options)
  local model = get_model()

  if not model:is_configured() then
    vim.notify("LLM model not configured. Please run require('utils.llm').setup()", vim.log.levels.ERROR)
    return
  end

  -- Use the model's prompt method
  model:prompt(msg, function(response, error)
    if error then
      vim.notify("LLM Error: " .. error, vim.log.levels.ERROR)
      if callback then
        callback(nil)
      end
      return
    end

    if callback then
      callback(response)
    end
  end, options)
end

-- Extract code blocks from markdown response
local function extract_code_blocks(content)
  local blocks = {}
  local in_block = false
  local current_block = {}
  local lang = nil

  for line in content:gmatch("[^\n]+") do
    if line:match("^```") then
      if in_block then
        -- End of code block
        table.insert(blocks, {
          language = lang,
          code = table.concat(current_block, "\n")
        })
        current_block = {}
        lang = nil
        in_block = false
      else
        -- Start of code block
        lang = line:match("^```(%w*)")
        in_block = true
      end
    elseif in_block then
      table.insert(current_block, line)
    end
  end

  return blocks
end

-- Show text in a floating modal window with optional apply functionality
local function show_modal(title, content, opts)
  opts = opts or {}

  -- Split content into lines
  local lines = {}
  for line in content:gmatch("[^\n]+") do
    table.insert(lines, line)
  end

  -- Add empty line if we have apply functionality
  if opts.on_apply then
    table.insert(lines, "")
    table.insert(lines, "---")
    table.insert(lines, "Press 'a' to apply suggested changes | 'q'/'Esc' to close")
  end

  -- Calculate window size
  local width = math.min(100, vim.o.columns - 4)
  local height = math.min(30, vim.o.lines - 4)

  -- Create buffer
  local buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
  vim.api.nvim_buf_set_option(buf, "modifiable", false)
  vim.api.nvim_buf_set_option(buf, "filetype", "markdown")

  -- Calculate window position (centered)
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  -- Window options
  local win_opts = {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " " .. title .. " ",
    title_pos = "center",
  }

  -- Create window
  local win = vim.api.nvim_open_win(buf, true, win_opts)

  -- Set window options
  vim.api.nvim_win_set_option(win, "wrap", true)
  vim.api.nvim_win_set_option(win, "linebreak", true)

  -- Key mappings to close the window
  local close_keys = { "q", "<Esc>", "<CR>" }
  for _, key in ipairs(close_keys) do
    vim.api.nvim_buf_set_keymap(buf, "n", key, ":close<CR>", { noremap = true, silent = true })
  end

  -- Add apply functionality if provided
  if opts.on_apply then
    vim.api.nvim_buf_set_keymap(buf, "n", "a", "", {
      noremap = true,
      silent = true,
      callback = function()
        vim.cmd("close")
        opts.on_apply()
      end
    })
  end
end

-- Parse structured review response from Claude
local function parse_review_response(response)
  local files = {}
  local current_file = nil
  local requested_files = {}

  for line in response:gmatch("[^\n]+") do
    -- Match FILE: <filename>
    local filename = line:match("^FILE:%s*(.+)$")
    if filename then
      current_file = {
        filename = filename,
        summary = "",
        issues = {}
      }
      table.insert(files, current_file)

    -- Match SUMMARY: <text>
    elseif line:match("^SUMMARY:") and current_file then
      current_file.summary = line:match("^SUMMARY:%s*(.+)$") or ""

    -- Match BUG: <number> | <description>
    elseif line:match("^BUG:") and current_file then
      local line_num, description = line:match("^BUG:%s*(%d+)%s*|%s*(.+)$")
      if line_num and description then
        table.insert(current_file.issues, {
          line = tonumber(line_num),
          description = description,
          severity = "bug"
        })
      end

    -- Match HINT: <number> | <description>
    elseif line:match("^HINT:") and current_file then
      local line_num, description = line:match("^HINT:%s*(%d+)%s*|%s*(.+)$")
      if line_num and description then
        table.insert(current_file.issues, {
          line = tonumber(line_num),
          description = description,
          severity = "hint"
        })
      end

    -- Match NEED_FILE: <filepath>
    elseif line:match("^NEED_FILE:") then
      local file_path = line:match("^NEED_FILE:%s*(.+)$")
      if file_path then
        table.insert(requested_files, file_path)
      end
    end
  end

  return files, requested_files
end

-- Extract file paths from diff
local function extract_files_from_diff(diff_text)
  local files = {}
  for line in diff_text:gmatch("[^\n]+") do
    -- Match diff --git a/path b/path
    local file_path = line:match("^diff %-%-git a/(.-) b/")
    if file_path then
      table.insert(files, file_path)
    end
  end
  return files
end

-- Get full file context for review
local function get_file_context(file_path)
  if vim.fn.filereadable(file_path) ~= 1 then
    return nil
  end

  local lines = vim.fn.readfile(file_path)
  local content = table.concat(lines, "\n")

  -- Get file type
  local filetype = vim.filetype.match({ filename = file_path }) or "unknown"

  return {
    path = file_path,
    content = content,
    filetype = filetype
  }
end

-- Review git diff using Claude
M.review_diff = function()
  -- Get git diff
  local diff_output = vim.fn.systemlist("git diff HEAD")

  if vim.v.shell_error ~= 0 then
    vim.notify("Failed to get git diff. Are you in a git repository?", vim.log.levels.ERROR)
    return
  end

  if #diff_output == 0 then
    vim.notify("No changes to review", vim.log.levels.INFO)
    return
  end

  local diff_text = table.concat(diff_output, "\n")

  -- Extract files and get their full context
  local changed_files = extract_files_from_diff(diff_text)
  local file_contexts = {}

  for _, file_path in ipairs(changed_files) do
    local context = get_file_context(file_path)
    if context then
      table.insert(file_contexts, context)
    end
  end

  -- Get UI and events modules
  local ui = require("utils.ui")
  local events = require("system.events")

  -- Event name for this review
  local review_event = "diff_review_complete"

  -- Show loading popup
  local loading = ui.create_loading_popup("Generating diff review...", review_event, {
    on_complete = function(data)
      -- Parse and show review in split-view window
      if data and data.response then
        local review_data, _ = parse_review_response(data.response)

        if #review_data > 0 then
          ui.create_review_window(review_data)
        else
          -- Fallback to simple window if parsing failed
          vim.notify("Could not parse review response, showing raw output", vim.log.levels.WARN)
          ui.create_floating_window(data.response, {
            width = 80,
            height = 30,
            title = "Claude Code Review",
          })
        end
      end
    end
  })

  -- Build context section
  local context_section = ""
  if #file_contexts > 0 then
    context_section = "\n\nFULL FILE CONTEXTS (use these to understand how functions work together):\n\n"
    for _, ctx in ipairs(file_contexts) do
      context_section = context_section .. string.format(
        "FILE: %s (type: %s)\n```%s\n%s\n```\n\n",
        ctx.path,
        ctx.filetype,
        ctx.filetype,
        ctx.content
      )
    end
  end

  -- Prepare prompt for Claude
  local prompt = string.format([[
Please review the following git diff as a senior developer doing a code review.

IMPORTANT: I've included the FULL CONTENT of each changed file below. Use this context to:
- Understand how functions interact with the rest of the code
- Spot compatibility issues between variables and functions
- Check if changes break existing functionality
- Verify that the logic fits with the overall application flow
- Look for missed edge cases based on how the code is used elsewhere

If you need to see the content of related files (imports, dependencies, modules used by the changed code), you can request them using:
NEED_FILE: <relative/path/to/file>

For each file, provide:
1. OPTIONAL summary - ONLY include if you have NEGATIVE feedback, concerns, or issues about code quality, design, or architecture. DO NOT include positive feedback or descriptions of what changed. If the changes are good/fine, omit the SUMMARY line entirely.
2. Specific line-level issues categorized by severity

Format your response EXACTLY as follows:

FILE: <filename>
SUMMARY: <ONLY include if you have NEGATIVE feedback/concerns - NEVER include positive feedback - OMIT entirely if changes are good>
BUG: <line_number> | <description of bug, error, or security risk>
HINT: <line_number> | <suggestion for improvement or code quality hint>
NEED_FILE: <path/to/related/file> (optional - include if you need to see this file to complete review)
---

Use BUG for: actual bugs, potential errors, security vulnerabilities, critical issues
Use HINT for: code quality improvements, style suggestions, best practices, optimizations

CRITICAL: Each BUG or HINT must reference EXACTLY ONE line number. If an issue affects multiple lines, create SEPARATE entries for each line with specific feedback for that line. DO NOT combine multiple lines into a single comment.

Example CORRECT format:
BUG: 42 | Variable x is undefined at this point
BUG: 45 | Using undefined variable x will cause runtime error

Example WRONG format:
BUG: 42,45 | Variables are used incorrectly on these lines

IMPORTANT: SUMMARY should ONLY contain negative feedback or concerns. Never say "looks good" or describe what changed. If everything is fine, skip the SUMMARY entirely.

Repeat for each file. Use "---" to separate files.
%s
Here's the diff:

```diff
%s
```

Be thorough and opinionated like a real code reviewer. Consider the full file context when reviewing.
]], context_section, diff_text)

  -- Send to Claude
  M.prompt(prompt, function(response)
    if not response then
      -- Close loading on error
      if loading then
        loading.close()
      end
      vim.notify("Failed to get response from Claude", vim.log.levels.ERROR)
      return
    end

    -- Parse response to check for requested files
    local _, requested_files = parse_review_response(response)

    if #requested_files > 0 then
      -- Claude needs more files, fetch them and make follow-up request
      vim.schedule(function()
        vim.notify(string.format("Fetching %d requested files...", #requested_files), vim.log.levels.INFO)

        local additional_context = "\n\nADDITIONAL REQUESTED FILES:\n\n"
        for _, file_path in ipairs(requested_files) do
          local ctx = get_file_context(file_path)
          if ctx then
            additional_context = additional_context .. string.format(
              "FILE: %s (type: %s)\n```%s\n%s\n```\n\n",
              ctx.path,
              ctx.filetype,
              ctx.filetype,
              ctx.content
            )
          else
            additional_context = additional_context .. string.format(
              "FILE: %s - NOT FOUND OR NOT READABLE\n\n",
              file_path
            )
          end
        end

        -- Make follow-up request with additional context
        local followup_prompt = string.format([[
Here are the additional files you requested:
%s

Now please provide your complete review in the same format:

FILE: <filename>
SUMMARY: <optional opinion>
BUG: <line_number> | <description>
HINT: <line_number> | <description>
---
]], additional_context)

        M.prompt(followup_prompt, function(final_response)
          if final_response then
            events.emit(review_event, { response = final_response })
          else
            loading.close()
            vim.notify("Failed to get follow-up response from Claude", vim.log.levels.ERROR)
          end
        end)
      end)
    else
      -- No additional files needed, emit the response
      events.emit(review_event, { response = response })
    end
  end)
end

-- Review current file changes (staged + unstaged)
M.review_file = function()
  local filename = vim.api.nvim_buf_get_name(0)

  if filename == "" then
    vim.notify("No file open", vim.log.levels.ERROR)
    return
  end

  -- Get diff for current file
  local diff_output = vim.fn.systemlist("git diff HEAD -- " .. vim.fn.shellescape(filename))

  if vim.v.shell_error ~= 0 then
    vim.notify("Failed to get git diff for current file", vim.log.levels.ERROR)
    return
  end

  if #diff_output == 0 then
    vim.notify("No changes in current file", vim.log.levels.INFO)
    return
  end

  local diff_text = table.concat(diff_output, "\n")

  vim.notify("Reviewing file changes with Claude...", vim.log.levels.INFO)

  local prompt = string.format([[
Please review the changes in this file and provide feedback on:

1. Code quality and best practices
2. Potential bugs or issues
3. Suggestions for improvement

Here's the diff:

```diff
%s
```
]], diff_text)

  M.prompt(prompt, function(response)
    show_modal("File Review", response)
  end)
end

-- Ask Claude a question about selected code
M.ask_about_selection = function()
  -- Get visual selection
  local start_pos = vim.fn.getpos("'<")
  local end_pos = vim.fn.getpos("'>")
  local start_line = start_pos[2]
  local end_line = end_pos[2]

  local lines = vim.api.nvim_buf_get_lines(0, start_line - 1, end_line, false)
  local code = table.concat(lines, "\n")

  -- Prompt user for question
  vim.ui.input({ prompt = "Ask Claude about this code: " }, function(question)
    if not question or question == "" then
      return
    end

    vim.notify("Asking Claude...", vim.log.levels.INFO)

    local prompt = string.format([[
Here's some code:

```
%s
```

Question: %s

Please provide a clear and helpful answer.
]], code, question)

    M.prompt(prompt, function(response)
      show_modal("Claude's Answer", response)
    end)
  end)
end

-- Analyze current file for bugs and code quality
M.analyze_file = function()
  local bufnr = vim.api.nvim_get_current_buf()
  local filename = vim.api.nvim_buf_get_name(bufnr)

  if filename == "" then
    vim.notify("No file open", vim.log.levels.ERROR)
    return
  end

  -- Get file content
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local content = table.concat(lines, "\n")

  -- Get file type
  local filetype = vim.api.nvim_buf_get_option(bufnr, "filetype")

  vim.notify("Analyzing file with Claude...", vim.log.levels.INFO)

  local prompt = string.format([[
Please analyze this %s file and provide:

1. **Overview**: Brief summary of what this file does
2. **Potential Bugs**: Any bugs, logic errors, or edge cases you notice
3. **Code Quality Issues**: Problems with structure, naming, or best practices
4. **Security Concerns**: Potential security vulnerabilities
5. **Performance Issues**: Inefficiencies or optimization opportunities
6. **Suggestions**: Specific improvements with code examples

If you suggest code changes, please provide the improved code in a code block.

File: %s

```%s
%s
```

Please be thorough and provide actionable feedback.
]], filetype, vim.fn.fnamemodify(filename, ":t"), filetype, content)

  M.prompt(prompt, function(response)
    -- Extract code blocks from response
    local code_blocks = extract_code_blocks(response)

    -- Show modal with apply functionality if there are code suggestions
    if #code_blocks > 0 then
      show_modal("File Analysis", response, {
        on_apply = function()
          -- Ask user which suggestion to apply
          if #code_blocks == 1 then
            -- Only one code block, apply it directly
            apply_code_suggestion(bufnr, code_blocks[1].code)
          else
            -- Multiple code blocks, let user choose
            vim.ui.select(
              vim.tbl_map(function(block)
                return string.format("[%s] %d lines", block.language or "code", select(2, block.code:gsub("\n", "\n")) + 1)
              end, code_blocks),
              {
                prompt = "Select code suggestion to apply:",
              },
              function(choice, idx)
                if idx then
                  apply_code_suggestion(bufnr, code_blocks[idx].code)
                end
              end
            )
          end
        end
      })
    else
      show_modal("File Analysis", response)
    end
  end)
end

-- Apply code suggestion to buffer
function apply_code_suggestion(bufnr, code)
  -- Confirm before applying
  vim.ui.select(
    { "Replace entire file", "Cancel" },
    {
      prompt = "How to apply the suggestion?",
    },
    function(choice)
      if choice == "Replace entire file" then
        local lines = {}
        for line in code:gmatch("[^\n]+") do
          table.insert(lines, line)
        end

        -- Replace buffer content
        vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
        vim.notify("Applied code suggestion", vim.log.levels.INFO)

        -- Format the file
        vim.cmd("silent! Format")
      end
    end
  )
end

-- Interactive chat window
local chat_state = {
  bufnr = nil,
  win = nil,
  input_bufnr = nil,
  input_win = nil,
  messages = {}, -- Conversation history
  is_waiting = false,
  system_prompt = nil, -- Context about project/file
  last_response = nil, -- Store last Claude response for code extraction
  user_name = "User",
  assistant_name = nil, -- Will be set from model name
}

-- Gather project context
local function gather_context()
  local context = {}

  -- Current file info
  local current_file = vim.api.nvim_buf_get_name(0)
  if current_file and current_file ~= "" then
    local filetype = vim.api.nvim_buf_get_option(0, "filetype")
    local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
    local content = table.concat(lines, "\n")

    table.insert(context, "## Current File")
    table.insert(context, string.format("File: %s", vim.fn.fnamemodify(current_file, ":.")))
    table.insert(context, string.format("Type: %s", filetype))
    table.insert(context, "\n```" .. filetype)
    table.insert(context, content)
    table.insert(context, "```\n")
  end

  -- Project structure (limited depth to avoid too much context)
  local git_root = vim.fn.systemlist("git rev-parse --show-toplevel 2>/dev/null")[1]
  if git_root and vim.v.shell_error == 0 then
    table.insert(context, "## Project Structure")
    table.insert(context, "Git root: " .. git_root)

    -- Get file tree (max 2 levels, exclude common dirs)
    local tree_cmd = "find " .. vim.fn.shellescape(git_root) ..
                     " -maxdepth 2 -type f " ..
                     " -not -path '*/node_modules/*' " ..
                     " -not -path '*/.git/*' " ..
                     " -not -path '*/dist/*' " ..
                     " -not -path '*/build/*' " ..
                     " 2>/dev/null | head -50"
    local files = vim.fn.systemlist(tree_cmd)

    if #files > 0 then
      table.insert(context, "\nKey files:")
      for _, file in ipairs(files) do
        local rel_path = file:gsub("^" .. git_root .. "/", "")
        table.insert(context, "  - " .. rel_path)
      end
    end
    table.insert(context, "")
  end

  return table.concat(context, "\n")
end

-- Add message to chat history
local function add_message(role, content)
  table.insert(chat_state.messages, {
    role = role,
    content = content
  })
end

-- Display message in chat buffer
local function display_message(role, content)
  local ui = require("utils.ui")
  local model = get_model()

  -- Determine sender name
  local sender_name
  local is_user = false
  if role == "user" then
    sender_name = chat_state.user_name or "User"
    is_user = true
  else
    sender_name = chat_state.assistant_name or (model and model:get_name() or "Assistant")
    is_user = false
  end

  -- Get window width for proper formatting
  local width = 120
  if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
    width = vim.api.nvim_win_get_width(chat_state.win)
  end

  -- Display the message using ui.lua
  ui.display_chat_message(chat_state.bufnr, content, sender_name, is_user, width)

  -- Scroll to bottom
  ui.scroll_to_bottom(chat_state.bufnr, chat_state.win)
end

-- Send message to Claude with conversation context (with streaming)
local function send_chat_message(user_message)
  if chat_state.is_waiting then
    vim.notify("Please wait for the current response", vim.log.levels.WARN)
    return
  end

  chat_state.is_waiting = true

  -- Add user message to history and display
  add_message("user", user_message)
  display_message("user", user_message)

  -- Get model
  local model = get_model()
  if not model or not model:is_configured() then
    vim.notify("LLM model not configured", vim.log.levels.ERROR)
    chat_state.is_waiting = false
    return
  end

  -- Check if model supports streaming
  if not model.stream then
    vim.notify("Model does not support streaming", vim.log.levels.ERROR)
    chat_state.is_waiting = false
    return
  end

  local ui = require("utils.ui")

  -- Get window width
  local width = 120
  if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
    width = vim.api.nvim_win_get_width(chat_state.win)
  end

  -- Create streaming display handler
  local sender_name = chat_state.assistant_name or model:get_name()
  local display = ui.create_streaming_display(chat_state.bufnr, sender_name, false, width)

  local streaming_text = ""

  -- Show initial loading message
  vim.notify("Sending message to " .. (chat_state.assistant_name or "Assistant") .. "...", vim.log.levels.INFO)

  -- Check if stream method exists
  if type(model.stream) ~= "function" then
    vim.notify("ERROR: model.stream is not a function! Type: " .. type(model.stream), vim.log.levels.ERROR)
    chat_state.is_waiting = false
    return
  end

  -- Stream the response
  local ok, err = pcall(function()
    model:stream(
      nil, -- prompt (will use messages from options)
      -- on_chunk callback
      function(chunk)
        -- Initialize display on first chunk
        if streaming_text == "" then
          display.init()
        end

        streaming_text = streaming_text .. chunk

        -- Update display with accumulated text
        display.update(streaming_text)

        -- Scroll to bottom
        ui.scroll_to_bottom(chat_state.bufnr, chat_state.win)
      end,
    -- on_done callback
    function(full_text, error)
      if error then
        vim.schedule(function()
          vim.notify("Stream Error: " .. tostring(error), vim.log.levels.ERROR)

          -- Display error in chat too
          if chat_state.bufnr and vim.api.nvim_buf_is_valid(chat_state.bufnr) then
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
            vim.api.nvim_buf_set_lines(chat_state.bufnr, -1, -1, false, {
              "",
              "❌ Error: " .. tostring(error),
              ""
            })
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
          end

          chat_state.is_waiting = false
        end)
        return
      end

      -- Finalize display (add bottom padding)
      display.finalize()

      -- Store response for potential code extraction
      chat_state.last_response = full_text

      -- Add to history
      add_message("assistant", full_text)

      -- Check if response contains code changes
      local code_blocks = extract_code_blocks(full_text)
      if #code_blocks > 0 then
        vim.schedule(function()
          if chat_state.bufnr and vim.api.nvim_buf_is_valid(chat_state.bufnr) then
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
            vim.api.nvim_buf_set_lines(chat_state.bufnr, -1, -1, false, {
              "",
              "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
              "💡 Code suggestions detected! Press <leader>ap to apply changes",
              ""
            })
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)

            -- Scroll to bottom
            if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
              local line_count = vim.api.nvim_buf_line_count(chat_state.bufnr)
              vim.api.nvim_win_set_cursor(chat_state.win, {line_count, 0})
            end
          end
        end)
      end

      chat_state.is_waiting = false
    end,
    {
      system = chat_state.system_prompt,
      max_tokens = 4096,
      messages = chat_state.messages
    }
    )
  end)

  if not ok then
    vim.notify("ERROR calling model:stream(): " .. tostring(err), vim.log.levels.ERROR)
    chat_state.is_waiting = false
  end
end

-- Apply code changes from chat
M.apply_chat_changes = function()
  if not chat_state.last_response then
    vim.notify("No code suggestions to apply", vim.log.levels.WARN)
    return
  end

  local code_blocks = extract_code_blocks(chat_state.last_response)
  if #code_blocks == 0 then
    vim.notify("No code blocks found in last response", vim.log.levels.WARN)
    return
  end

  -- If multiple code blocks, let user choose
  if #code_blocks > 1 then
    local options = {}
    for i, block in ipairs(code_blocks) do
      local lang = block.language or "code"
      local line_count = select(2, block.code:gsub("\n", "\n")) + 1
      table.insert(options, string.format("%d. [%s] %d lines", i, lang, line_count))
    end

    vim.ui.select(options, {
      prompt = "Select code block to apply:",
    }, function(_, idx)
      if idx then
        apply_code_to_file(code_blocks[idx].code)
      end
    end)
  else
    apply_code_to_file(code_blocks[1].code)
  end
end

-- Apply code to current file
function apply_code_to_file(code)
  local current_file = vim.api.nvim_buf_get_name(0)
  if not current_file or current_file == "" then
    vim.notify("No file currently open to apply changes to", vim.log.levels.ERROR)
    return
  end

  -- Ask for confirmation
  vim.ui.select({
    "Replace entire file",
    "Insert at cursor",
    "Cancel"
  }, {
    prompt = "How to apply the code?",
  }, function(choice)
    if choice == "Replace entire file" then
      local lines = {}
      for line in code:gmatch("[^\n]+") do
        table.insert(lines, line)
      end

      local bufnr = vim.api.nvim_get_current_buf()
      vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
      vim.notify("Applied code to " .. vim.fn.fnamemodify(current_file, ":."), vim.log.levels.INFO)

    elseif choice == "Insert at cursor" then
      local lines = {}
      for line in code:gmatch("[^\n]+") do
        table.insert(lines, line)
      end

      local cursor = vim.api.nvim_win_get_cursor(0)
      local row = cursor[1]
      vim.api.nvim_buf_set_lines(0, row, row, false, lines)
      vim.notify("Inserted code at cursor", vim.log.levels.INFO)
    end
  end)
end

-- Open interactive chat window
M.open_chat = function()
  -- If already open, just focus it
  if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
    vim.api.nvim_set_current_win(chat_state.win)
    return
  end

  -- Get model and set assistant name
  local model = get_model()
  if model and not chat_state.assistant_name then
    chat_state.assistant_name = model:get_name()
  end

  -- Gather project context on first open
  if not chat_state.system_prompt then
    local context = gather_context()
    local assistant_name = chat_state.assistant_name or "Assistant"
    chat_state.system_prompt = string.format([[You are %s, an AI assistant integrated into Neovim. You have access to the user's current project and file.

IMPORTANT INSTRUCTIONS:
- When the user asks you to modify code, ALWAYS provide the complete updated code in a code block
- Be concise but thorough
- If you suggest code changes, wrap them in markdown code blocks with the appropriate language tag
- You can see the current file and project structure below

%s

The user can apply your code suggestions directly from the chat using <leader>ap.]], assistant_name, context)
  end

  -- Create chat buffer if doesn't exist
  if not chat_state.bufnr or not vim.api.nvim_buf_is_valid(chat_state.bufnr) then
    local ui = require("utils.ui")
    local windows = ui.create_chat_window(
      " " .. (chat_state.assistant_name or "Assistant") .. " Chat ",
      nil, -- No initial message
      chat_state.user_name,
      chat_state.assistant_name,
      {
        on_send = function(text)
          send_chat_message(text)
        end
      }
    )

    chat_state.bufnr = windows.chat_bufnr
    chat_state.win = windows.chat_win
    chat_state.input_bufnr = windows.input_bufnr
    chat_state.input_win = windows.input_win
  else
    -- Reopen windows for existing buffer - manually create windows
    local width = math.min(120, math.floor(vim.o.columns * 0.8))
    local height = math.floor(vim.o.lines * 0.8)
    local chat_height = height - 3
    local input_height = 1

    local row = math.floor((vim.o.lines - height) / 2)
    local col = math.floor((vim.o.columns - width) / 2)

    -- Create chat window with existing buffer
    chat_state.win = vim.api.nvim_open_win(chat_state.bufnr, false, {
      relative = "editor",
      width = width,
      height = chat_height,
      row = row,
      col = col,
      style = "minimal",
      border = "rounded",
      title = " " .. (chat_state.assistant_name or "Assistant") .. " Chat ",
      title_pos = "center",
    })

    vim.api.nvim_win_set_option(chat_state.win, "wrap", true)
    vim.api.nvim_win_set_option(chat_state.win, "linebreak", true)

    -- Create input window with existing buffer
    chat_state.input_win = vim.api.nvim_open_win(chat_state.input_bufnr, true, {
      relative = "editor",
      width = width,
      height = input_height,
      row = row + chat_height + 1,
      col = col,
      style = "minimal",
      border = "rounded",
      title = " Your Message (Enter to send, Esc to close) ",
      title_pos = "center",
    })

    -- Bind Enter for reopened window
    vim.keymap.set({"i", "n"}, "<CR>", function()
      local lines = vim.api.nvim_buf_get_lines(chat_state.input_bufnr, 0, -1, false)
      local input_text = table.concat(lines, "\n"):gsub("^%s*(.-)%s*$", "%1")

      if input_text == "" then
        return
      end

      vim.api.nvim_buf_set_lines(chat_state.input_bufnr, 0, -1, false, {""})

      vim.schedule(function()
        if chat_state.input_win and vim.api.nvim_win_is_valid(chat_state.input_win) then
          vim.api.nvim_set_current_win(chat_state.input_win)
          vim.cmd("startinsert")
        end
      end)

      send_chat_message(input_text)
    end, { buffer = chat_state.input_bufnr, silent = true })
  end

  -- Setup close keybindings (Esc and q)
  local ui = require("utils.ui")
  ui.setup_chat_close_keys(
    chat_state.win,
    chat_state.input_win,
    chat_state.bufnr,
    chat_state.input_bufnr,
    {"q"} -- Additional key 'q' for closing
  )
end

-- Clear chat history
M.clear_chat = function()
  chat_state.messages = {}
  if chat_state.bufnr and vim.api.nvim_buf_is_valid(chat_state.bufnr) then
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
    vim.api.nvim_buf_set_lines(chat_state.bufnr, 0, -1, false, {})
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
  end
  vim.notify("Chat history cleared", vim.log.levels.INFO)
end

-- Autocomplete: Stream completion suggestions for the given context
M.suggest_completion = function(context, on_chunk, on_complete, on_error)
  local model = get_model()

  if not model or not model:is_configured() then
    if on_error then
      on_error("LLM model not configured")
    end
    return
  end

  -- Check if model supports streaming
  if not model.stream then
    if on_error then
      on_error("Model does not support streaming")
    end
    return
  end

  -- Build completion prompt
  local prompt = string.format([[Complete the following code. Provide ONLY the completion (the code that should come next), without any explanations, markdown formatting, or code blocks.

File type: %s
Code before cursor:
%s

Code after cursor:
%s

Provide only the completion text that should be inserted at the cursor position.]],
    context.filetype or "text",
    context.before_cursor or "",
    context.after_cursor or ""
  )

  -- Stream the completion
  local ok, err = pcall(function()
    model:stream(
      prompt,
      -- on_chunk
      function(chunk)
        if on_chunk then
          on_chunk(chunk)
        end
      end,
      -- on_done
      function(full_text, error)
        if error then
          if on_error then
            on_error(error)
          end
          return
        end

        if on_complete then
          on_complete(full_text)
        end
      end,
      {
        max_tokens = 500, -- Shorter for completions
        temperature = 0.3, -- Lower temperature for more deterministic completions
      }
    )
  end)

  if not ok and on_error then
    on_error(err)
  end
end

-- Autocomplete: Get completion with basic prompt interface (non-streaming)
M.get_completion = function(context, callback)
  local model = get_model()

  if not model or not model:is_configured() then
    if callback then
      callback(nil, "LLM model not configured")
    end
    return
  end

  -- Build completion prompt
  local prompt = string.format([[Complete the following code. Provide ONLY the completion (the code that should come next), without any explanations, markdown formatting, or code blocks.

File type: %s
Code before cursor:
%s

Code after cursor:
%s

Provide only the completion text that should be inserted at the cursor position.]],
    context.filetype or "text",
    context.before_cursor or "",
    context.after_cursor or ""
  )

  -- Use the model's prompt method
  model:prompt(prompt, function(response, error)
    if error then
      if callback then
        callback(nil, error)
      end
      return
    end

    if callback then
      callback(response, nil)
    end
  end, {
    max_tokens = 500,
    temperature = 0.3,
  })
end

return M
