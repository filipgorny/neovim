local M = {}

local llm = require("utils.llm")

-- State
local state = {
  namespace = nil,
  current_function = nil,
  loading_win = nil,
  loading_buf = nil,
  timer = nil,
}

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

-- Detect if function is inside a class
local function detect_class_context(lines, current_line, filetype)
  if filetype == "lua" then
    -- Lua doesn't have traditional classes, but check for module/table patterns
    for i = current_line - 1, math.max(1, current_line - 30), -1 do
      local line = lines[i]
      if line then
        -- Look for local M = {} or ClassName = {}
        local class_name = line:match("^%s*local%s+([%w_]+)%s*=%s*{") or
                          line:match("^%s*([%w_]+)%s*=%s*{")
        if class_name then
          return {name = class_name, line = i}
        end
      end
    end
  else
    -- JavaScript/TypeScript class detection
    for i = current_line - 1, math.max(1, current_line - 50), -1 do
      local line = lines[i]
      if line then
        -- Look for class declaration
        local class_name = line:match("^%s*class%s+([%w_]+)") or
                          line:match("^%s*export%s+class%s+([%w_]+)") or
                          line:match("^%s*export%s+default%s+class%s+([%w_]+)")
        if class_name then
          return {name = class_name, line = i}
        end
      end
    end
  end

  return nil
end

-- Detect if cursor is in an empty function definition
local function detect_empty_function()
  local bufnr = vim.api.nvim_get_current_buf()
  local filetype = vim.api.nvim_buf_get_option(bufnr, "filetype")

  -- Only work with supported languages
  local supported = {
    javascript = true,
    typescript = true,
    javascriptreact = true,
    typescriptreact = true,
    lua = true,
  }

  if not supported[filetype] then
    return nil
  end

  local cursor = vim.api.nvim_win_get_cursor(0)
  local current_line = cursor[1]
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)

  -- Look for function patterns based on filetype
  local patterns = {}

  if filetype == "lua" then
    patterns = {
      "^%s*function%s+([%w_.]+)%s*%((.*)%)%s*$",  -- function name()
      "^%s*local%s+function%s+([%w_]+)%s*%((.-)%)%s*$",  -- local function name()
      "^%s*([%w_.]+)%s*=%s*function%s*%((.-)%)%s*$",  -- name = function()
    }
  else -- JavaScript/TypeScript
    patterns = {
      "^%s*function%s+([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- function name()
      "^%s*const%s+([%w_]+)%s*=%s*%((.-)%)%s*=>%s*{?%s*$",  -- const name = () =>
      "^%s*const%s+([%w_]+)%s*=%s*function%s*%((.-)%)%s*{?%s*$",  -- const name = function()
      "^%s*async%s+function%s+([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- async function name()
      "^%s*([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- method() { (class method)
      "^%s*async%s+([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- async method() {
      "^%s*static%s+([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- static method() {
      "^%s*static%s+async%s+([%w_]+)%s*%((.-)%)%s*{?%s*$",  -- static async method() {
      "^%s*public%s+([%w_]+)%s*%((.-)%)%s*:?.*{?%s*$",  -- public method() (TypeScript)
      "^%s*private%s+([%w_]+)%s*%((.-)%)%s*:?.*{?%s*$",  -- private method() (TypeScript)
      "^%s*protected%s+([%w_]+)%s*%((.-)%)%s*:?.*{?%s*$",  -- protected method() (TypeScript)
      "^%s*public%s+async%s+([%w_]+)%s*%((.-)%)%s*:?.*{?%s*$",  -- public async method()
      "^%s*private%s+async%s+([%w_]+)%s*%((.-)%)%s*:?.*{?%s*$",  -- private async method()
    }
  end

  -- Check current line
  local line_text = lines[current_line]
  if not line_text then return nil end

  for _, pattern in ipairs(patterns) do
    local func_name, params = line_text:match(pattern)
    if func_name then
      -- Check if function body is empty (next line should be end/} or empty)
      local next_line = lines[current_line + 1]
      local is_empty = false

      if filetype == "lua" then
        -- Check if next line is 'end' or empty, followed by 'end'
        if next_line and (next_line:match("^%s*end%s*$") or next_line:match("^%s*$")) then
          is_empty = true
        end
      else
        -- Check if next line is '}' or empty
        if next_line and (next_line:match("^%s*}%s*$") or next_line:match("^%s*$")) then
          is_empty = true
        end
      end

      if is_empty then
        -- Try to detect if we're inside a class
        local class_info = detect_class_context(lines, current_line, filetype)

        return {
          name = func_name,
          params = params,
          line = current_line,
          filetype = filetype,
          class_name = class_info and class_info.name or nil,
          class_line = class_info and class_info.line or nil,
        }
      end
    end
  end

  -- Also check if we just finished typing function signature (no end/} yet)
  -- This allows hint to show immediately after closing parameter list
  local line_text = lines[current_line]
  if line_text then
    for _, pattern in ipairs(patterns) do
      local func_name, params = line_text:match(pattern)
      if func_name then
        -- For Lua: just need the function line with no end yet
        -- For JS/TS: just need the function line, opening brace optional
        local class_info = detect_class_context(lines, current_line, filetype)

        return {
          name = func_name,
          params = params,
          line = current_line,
          filetype = filetype,
          class_name = class_info and class_info.name or nil,
          class_line = class_info and class_info.line or nil,
          just_declared = true, -- Flag to know we need to add end/}
        }
      end
    end
  end

  return nil
end

-- Show virtual text hint
local function show_hint(line)
  if not state.namespace then
    state.namespace = vim.api.nvim_create_namespace("claude_autocomplete")
  end

  -- Clear any existing hints
  vim.api.nvim_buf_clear_namespace(0, state.namespace, 0, -1)

  -- Add virtual text
  vim.api.nvim_buf_set_extmark(0, state.namespace, line - 1, 0, {
    virt_text = {{"  💡 Press <C-g> to generate function body with Claude", "Comment"}},
    virt_text_pos = "eol",
  })
end

-- Hide virtual text hint
local function hide_hint()
  if state.namespace then
    vim.api.nvim_buf_clear_namespace(0, state.namespace, 0, -1)
  end
end

-- Show loading modal with animation
local function show_loading()
  local width = 50
  local height = 5
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  -- Create buffer
  state.loading_buf = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_option(state.loading_buf, "buftype", "nofile")

  -- Create window
  state.loading_win = vim.api.nvim_open_win(state.loading_buf, false, {
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Claude Code Generation ",
    title_pos = "center",
  })

  -- Animation frames
  local frames = {
    "⠋ Generating...",
    "⠙ Generating...",
    "⠹ Generating...",
    "⠸ Generating...",
    "⠼ Generating...",
    "⠴ Generating...",
    "⠦ Generating...",
    "⠧ Generating...",
    "⠇ Generating...",
    "⠏ Generating...",
  }

  local frame_idx = 1

  -- Update animation
  state.timer = vim.loop.new_timer()
  state.timer:start(0, 100, vim.schedule_wrap(function()
    if not state.loading_buf or not vim.api.nvim_buf_is_valid(state.loading_buf) then
      if state.timer then
        state.timer:stop()
        state.timer:close()
        state.timer = nil
      end
      return
    end

    local lines = {
      "",
      "  " .. frames[frame_idx],
      "",
      "  Please wait while Claude generates the code...",
      ""
    }

    vim.api.nvim_buf_set_lines(state.loading_buf, 0, -1, false, lines)
    frame_idx = (frame_idx % #frames) + 1
  end))
end

-- Hide loading modal
local function hide_loading()
  if state.timer then
    state.timer:stop()
    state.timer:close()
    state.timer = nil
  end

  if state.loading_win and vim.api.nvim_win_is_valid(state.loading_win) then
    vim.api.nvim_win_close(state.loading_win, true)
  end

  if state.loading_buf and vim.api.nvim_buf_is_valid(state.loading_buf) then
    vim.api.nvim_buf_delete(state.loading_buf, {force = true})
  end

  state.loading_win = nil
  state.loading_buf = nil
end

-- Generate function body
local function generate_function_body()
  if not state.current_function then
    vim.notify("No function detected", vim.log.levels.WARN)
    return
  end

  local func = state.current_function
  local bufnr = vim.api.nvim_get_current_buf()

  -- Get surrounding context (20 lines before and after)
  local total_lines = vim.api.nvim_buf_line_count(bufnr)
  local start_line = math.max(0, func.line - 20)
  local end_line = math.min(total_lines, func.line + 20)
  local context_lines = vim.api.nvim_buf_get_lines(bufnr, start_line, end_line, false)
  local context = table.concat(context_lines, "\n")

  -- Get full file content for better context
  local all_lines = vim.api.nvim_buf_get_lines(bufnr, 0, -1, false)
  local file_content = table.concat(all_lines, "\n")

  -- Show loading
  show_loading()
  hide_hint()

  -- Prepare prompt
  local class_context = ""
  if func.class_name then
    class_context = string.format("\nClass name: %s (this is a class method)", func.class_name)
  end

  local prompt = string.format([[I have an empty function that needs implementation. Generate ONLY the function body code (without the function signature).

Function name: %s
Parameters: %s
Language: %s%s

Surrounding context:
```%s
%s
```

Full file for reference:
```%s
%s
```

Generate the complete function body. Return ONLY the code that should go inside the function, without the function declaration itself. Do not include the function signature, just the implementation.%s]],
    func.name,
    func.params ~= "" and func.params or "none",
    func.filetype,
    class_context,
    func.filetype,
    context,
    func.filetype,
    file_content,
    func.class_name and "\n\nNote: This is a class method, so you can use 'this' to access class properties and other methods." or ""
  )

  -- Call Claude
  llm.prompt(prompt, function(response)
    hide_loading()

    -- Extract code from response
    local code_blocks = extract_code_blocks(response)
    local code

    if #code_blocks > 0 then
      code = code_blocks[1].code
    else
      -- No code block, use the response as-is but clean it up
      code = response:gsub("^%s*```%w*\n", ""):gsub("\n```%s*$", "")
    end

    -- Split into lines
    local body_lines = {}
    for line in code:gmatch("[^\n]+") do
      table.insert(body_lines, line)
    end

    -- Insert into function
    local cursor = vim.api.nvim_win_get_cursor(0)
    local insert_line = func.line  -- Insert after function declaration

    -- Add proper indentation
    local indent = "  " -- Default 2 spaces
    if func.filetype == "lua" then
      -- Detect existing indentation
      local func_line = all_lines[func.line]
      local leading_space = func_line:match("^(%s*)")
      indent = leading_space .. "  "
    end

    -- Indent all body lines
    for i, line in ipairs(body_lines) do
      if line:match("%S") then -- Only indent non-empty lines
        body_lines[i] = indent .. line
      end
    end

    -- Insert the code
    vim.api.nvim_buf_set_lines(bufnr, insert_line, insert_line, false, body_lines)

    -- If function was just declared (no end/} yet), add them after the body
    if func.just_declared then
      if func.filetype == "lua" then
        -- Get the indentation of the function declaration
        local func_line_text = all_lines[func.line]
        local func_indent = func_line_text:match("^(%s*)")
        vim.api.nvim_buf_set_lines(bufnr, insert_line + #body_lines, insert_line + #body_lines, false, {func_indent .. "end"})
      else
        -- Check if opening brace already exists on function line
        local func_line_text = all_lines[func.line]
        if not func_line_text:match("{%s*$") then
          -- Need to add opening brace to function declaration
          vim.api.nvim_buf_set_lines(bufnr, func.line - 1, func.line, false, {func_line_text .. " {"})
        end
        -- Add closing brace with same indentation as function
        local func_indent = func_line_text:match("^(%s*)")
        vim.api.nvim_buf_set_lines(bufnr, insert_line + #body_lines, insert_line + #body_lines, false, {func_indent .. "}"})
      end
    end

    -- Move cursor to the first line of generated code
    vim.api.nvim_win_set_cursor(0, {insert_line + 1, #indent})

    vim.notify("Function body generated!", vim.log.levels.INFO)
  end)
end

-- Check and update hint on cursor move
local function check_function()
  local func = detect_empty_function()

  if func then
    state.current_function = func
    show_hint(func.line)
  else
    state.current_function = nil
    hide_hint()
  end
end

-- Setup
M.setup = function()
  -- Create autocmd group
  local group = vim.api.nvim_create_augroup("ClaudeAutocomplete", {clear = true})

  -- Check on cursor move and text change
  vim.api.nvim_create_autocmd({"CursorMoved", "CursorMovedI", "TextChanged", "TextChangedI"}, {
    group = group,
    callback = function()
      vim.schedule(check_function)
    end,
  })

  -- Keybinding to trigger generation
  vim.keymap.set({"n", "i"}, "<C-g>", function()
    if state.current_function then
      generate_function_body()
    else
      vim.notify("No empty function detected at cursor", vim.log.levels.WARN)
    end
  end, {noremap = true, silent = true, desc = "Generate function body with Claude"})
end

return M
