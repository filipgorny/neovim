local M = {}

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
M.prompt = function(msg, callback)
  local api_key = get_api_key()

  if not api_key then
    vim.notify("ANTHROPIC_API_KEY not found in .env file or environment", vim.log.levels.ERROR)
    return
  end

  -- Prepare the request payload
  local payload = vim.fn.json_encode({
    model = "claude-sonnet-4-20250514",
    max_tokens = 4096,
    messages = {
      {
        role = "user",
        content = msg
      }
    }
  })

  -- Create temporary files for request and response
  local payload_file = vim.fn.tempname()
  local response_file = vim.fn.tempname()

  -- Write payload to temp file
  local f = io.open(payload_file, "w")
  if f then
    f:write(payload)
    f:close()
  else
    vim.notify("Failed to write request payload", vim.log.levels.ERROR)
    return
  end

  -- Make API request using curl
  local curl_cmd = string.format(
    'curl -s https://api.anthropic.com/v1/messages ' ..
    '-H "Content-Type: application/json" ' ..
    '-H "x-api-key: %s" ' ..
    '-H "anthropic-version: 2023-06-01" ' ..
    '-d @%s > %s',
    api_key,
    vim.fn.shellescape(payload_file),
    vim.fn.shellescape(response_file)
  )

  -- Execute curl asynchronously
  vim.fn.jobstart(curl_cmd, {
    on_exit = function(_, exit_code)
      -- Clean up payload file
      vim.fn.delete(payload_file)

      if exit_code ~= 0 then
        vim.notify("API request failed with exit code: " .. exit_code, vim.log.levels.ERROR)
        vim.fn.delete(response_file)
        return
      end

      -- Read response
      local response_content = vim.fn.readfile(response_file)
      vim.fn.delete(response_file)

      if #response_content == 0 then
        vim.notify("Empty response from API", vim.log.levels.ERROR)
        return
      end

      -- Parse JSON response
      local ok, response = pcall(vim.fn.json_decode, table.concat(response_content, "\n"))
      if not ok then
        vim.notify("Failed to parse API response: " .. tostring(response), vim.log.levels.ERROR)
        return
      end

      -- Check for API errors
      if response.error then
        vim.notify("API Error: " .. (response.error.message or "Unknown error"), vim.log.levels.ERROR)
        return
      end

      -- Extract text from response
      if response.content and response.content[1] and response.content[1].text then
        local text = response.content[1].text
        if callback then
          vim.schedule(function()
            callback(text)
          end)
        end
      else
        vim.notify("Unexpected response format", vim.log.levels.ERROR)
      end
    end
  })
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

  -- Show loading message
  vim.notify("Reviewing changes with Claude...", vim.log.levels.INFO)

  -- Prepare prompt for Claude
  local prompt = string.format([[
Please review the following git diff and provide:

1. **Summary**: Brief overview of the changes
2. **Code Quality**: Comments on code style, best practices, and maintainability
3. **Potential Bugs**: Any bugs, edge cases, or issues you notice
4. **Security Concerns**: Potential security vulnerabilities
5. **Suggestions**: Improvements or optimizations

Here's the diff:

```diff
%s
```

Please be concise but thorough. Format your response in markdown.
]], diff_text)

  -- Send to Claude and show response in modal
  M.prompt(prompt, function(response)
    show_modal("Claude Code Review", response)
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
  if not chat_state.bufnr or not vim.api.nvim_buf_is_valid(chat_state.bufnr) then
    return
  end

  -- Make buffer modifiable temporarily
  vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)

  local lines = {}

  -- Add role header
  if role == "user" then
    table.insert(lines, "")
    table.insert(lines, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    table.insert(lines, "You:")
  else
    table.insert(lines, "")
    table.insert(lines, "Claude:")
  end

  -- Add content
  for line in content:gmatch("[^\n]+") do
    table.insert(lines, line)
  end

  -- Append to buffer
  vim.api.nvim_buf_set_lines(chat_state.bufnr, -1, -1, false, lines)

  -- Scroll to bottom
  if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
    local line_count = vim.api.nvim_buf_line_count(chat_state.bufnr)
    vim.api.nvim_win_set_cursor(chat_state.win, {line_count, 0})
  end

  -- Make buffer read-only again
  vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
end

-- Send message to Claude with conversation context
local function send_chat_message(user_message)
  if chat_state.is_waiting then
    vim.notify("Please wait for the current response", vim.log.levels.WARN)
    return
  end

  chat_state.is_waiting = true

  -- Add user message to history and display
  add_message("user", user_message)
  display_message("user", user_message)

  -- Show loading indicator
  display_message("assistant", "● Thinking...")

  -- Get API key
  local api_key = get_api_key()
  if not api_key then
    vim.notify("ANTHROPIC_API_KEY not found in .env file or environment", vim.log.levels.ERROR)
    chat_state.is_waiting = false
    return
  end

  -- Prepare request with conversation history and system prompt
  local payload_data = {
    model = "claude-sonnet-4-20250514",
    max_tokens = 4096,
    messages = chat_state.messages
  }

  -- Add system prompt with context if available
  if chat_state.system_prompt then
    payload_data.system = chat_state.system_prompt
  end

  local payload = vim.fn.json_encode(payload_data)

  local payload_file = vim.fn.tempname()
  local response_file = vim.fn.tempname()

  local f = io.open(payload_file, "w")
  if f then
    f:write(payload)
    f:close()
  end

  local curl_cmd = string.format(
    'curl -s https://api.anthropic.com/v1/messages ' ..
    '-H "Content-Type: application/json" ' ..
    '-H "x-api-key: %s" ' ..
    '-H "anthropic-version: 2023-06-01" ' ..
    '-d @%s > %s',
    api_key,
    vim.fn.shellescape(payload_file),
    vim.fn.shellescape(response_file)
  )

  vim.fn.jobstart(curl_cmd, {
    on_exit = function(_, exit_code)
      vim.fn.delete(payload_file)

      if exit_code ~= 0 then
        vim.schedule(function()
          display_message("system", "Error: API request failed")
          chat_state.is_waiting = false
        end)
        vim.fn.delete(response_file)
        return
      end

      local response_content = vim.fn.readfile(response_file)
      vim.fn.delete(response_file)

      if #response_content == 0 then
        vim.schedule(function()
          display_message("system", "Error: Empty response")
          chat_state.is_waiting = false
        end)
        return
      end

      local ok, response = pcall(vim.fn.json_decode, table.concat(response_content, "\n"))
      if not ok or response.error then
        vim.schedule(function()
          display_message("system", "Error: " .. (response.error and response.error.message or "Failed to parse response"))
          chat_state.is_waiting = false
        end)
        return
      end

      if response.content and response.content[1] and response.content[1].text then
        local assistant_message = response.content[1].text

        vim.schedule(function()
          -- Remove loading indicator
          if chat_state.bufnr and vim.api.nvim_buf_is_valid(chat_state.bufnr) then
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
            local line_count = vim.api.nvim_buf_line_count(chat_state.bufnr)
            -- Remove last 2 lines (empty line + loading message)
            vim.api.nvim_buf_set_lines(chat_state.bufnr, line_count - 2, line_count, false, {})
            vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
          end

          -- Store response for potential code extraction
          chat_state.last_response = assistant_message

          -- Add to history and display
          add_message("assistant", assistant_message)
          display_message("assistant", assistant_message)

          -- Check if response contains code changes
          local code_blocks = extract_code_blocks(assistant_message)
          if #code_blocks > 0 then
            -- Add apply suggestion at the bottom of chat
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
        end)
      end
    end
  })
end

-- Handle input submission
local function submit_input()
  if not chat_state.input_bufnr or not vim.api.nvim_buf_is_valid(chat_state.input_bufnr) then
    return
  end

  -- Get input text
  local lines = vim.api.nvim_buf_get_lines(chat_state.input_bufnr, 0, -1, false)
  local input_text = table.concat(lines, "\n"):gsub("^%s*(.-)%s*$", "%1") -- trim

  if input_text == "" or input_text == "> " then
    return
  end

  -- Remove the "> " prompt if present
  input_text = input_text:gsub("^> ", "")

  -- Clear input buffer
  vim.api.nvim_buf_set_lines(chat_state.input_bufnr, 0, -1, false, {"> "})

  -- Move cursor to after prompt
  if chat_state.input_win and vim.api.nvim_win_is_valid(chat_state.input_win) then
    vim.api.nvim_win_set_cursor(chat_state.input_win, {1, 2})
  end

  -- Send message
  send_chat_message(input_text)
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

  -- Gather project context on first open
  if not chat_state.system_prompt then
    local context = gather_context()
    chat_state.system_prompt = string.format([[You are Claude, an AI assistant integrated into Neovim. You have access to the user's current project and file.

IMPORTANT INSTRUCTIONS:
- When the user asks you to modify code, ALWAYS provide the complete updated code in a code block
- Be concise but thorough
- If you suggest code changes, wrap them in markdown code blocks with the appropriate language tag
- You can see the current file and project structure below

%s

The user can apply your code suggestions directly from the chat using <leader>ap.]], context)
  end

  -- Calculate dimensions
  local width = math.min(120, math.floor(vim.o.columns * 0.8))
  local height = math.floor(vim.o.lines * 0.8)
  local chat_height = height - 3 -- Leave room for input box
  local input_height = 1

  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  -- Create chat display buffer
  if not chat_state.bufnr or not vim.api.nvim_buf_is_valid(chat_state.bufnr) then
    chat_state.bufnr = vim.api.nvim_create_buf(false, true)
    vim.api.nvim_buf_set_option(chat_state.bufnr, "buftype", "nofile")
    vim.api.nvim_buf_set_option(chat_state.bufnr, "bufhidden", "hide")
    vim.api.nvim_buf_set_option(chat_state.bufnr, "swapfile", false)
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
    vim.api.nvim_buf_set_option(chat_state.bufnr, "filetype", "markdown")

    -- Initial message
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
    vim.api.nvim_buf_set_lines(chat_state.bufnr, 0, -1, false, {
      "Chat with Claude",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Type your message below and press <C-s> to send",
      "Press 'q' or <Esc> to close this window",
      "",
    })
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
  end

  -- Create chat window
  chat_state.win = vim.api.nvim_open_win(chat_state.bufnr, false, {
    relative = "editor",
    width = width,
    height = chat_height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Claude Chat ",
    title_pos = "center",
  })

  vim.api.nvim_win_set_option(chat_state.win, "wrap", true)
  vim.api.nvim_win_set_option(chat_state.win, "linebreak", true)

  -- Create input buffer
  chat_state.input_bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(chat_state.input_bufnr, "buftype", "nofile")
  vim.api.nvim_buf_set_option(chat_state.input_bufnr, "bufhidden", "hide")
  vim.api.nvim_buf_set_option(chat_state.input_bufnr, "swapfile", false)
  vim.api.nvim_buf_set_lines(chat_state.input_bufnr, 0, -1, false, {"> "})

  -- Create input window (below chat window)
  chat_state.input_win = vim.api.nvim_open_win(chat_state.input_bufnr, true, {
    relative = "editor",
    width = width,
    height = input_height,
    row = row + chat_height + 1,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Your Message (Ctrl+S to send) ",
    title_pos = "center",
  })

  -- Set cursor to end of prompt
  vim.api.nvim_win_set_cursor(chat_state.input_win, {1, 2})
  vim.cmd("startinsert!")

  -- Keybindings for input buffer
  vim.keymap.set("i", "<C-s>", submit_input, { buffer = chat_state.input_bufnr, silent = true })
  vim.keymap.set("n", "<C-s>", submit_input, { buffer = chat_state.input_bufnr, silent = true })

  -- Keybindings for chat buffer
  vim.keymap.set("n", "q", function()
    if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
      vim.api.nvim_win_close(chat_state.win, true)
    end
    if chat_state.input_win and vim.api.nvim_win_is_valid(chat_state.input_win) then
      vim.api.nvim_win_close(chat_state.input_win, true)
    end
  end, { buffer = chat_state.bufnr, silent = true })

  vim.keymap.set("n", "<Esc>", function()
    if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
      vim.api.nvim_win_close(chat_state.win, true)
    end
    if chat_state.input_win and vim.api.nvim_win_is_valid(chat_state.input_win) then
      vim.api.nvim_win_close(chat_state.input_win, true)
    end
  end, { buffer = chat_state.bufnr, silent = true })

  -- Close both windows when input window is closed
  vim.api.nvim_create_autocmd("WinClosed", {
    buffer = chat_state.input_bufnr,
    callback = function()
      if chat_state.win and vim.api.nvim_win_is_valid(chat_state.win) then
        vim.api.nvim_win_close(chat_state.win, true)
      end
    end,
    once = true,
  })
end

-- Clear chat history
M.clear_chat = function()
  chat_state.messages = {}
  if chat_state.bufnr and vim.api.nvim_buf_is_valid(chat_state.bufnr) then
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", true)
    vim.api.nvim_buf_set_lines(chat_state.bufnr, 0, -1, false, {
      "Chat with Claude",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Type your message below and press <C-s> to send",
      "Press 'q' or <Esc> to close this window",
      "",
    })
    vim.api.nvim_buf_set_option(chat_state.bufnr, "modifiable", false)
  end
  vim.notify("Chat history cleared", vim.log.levels.INFO)
end

return M
