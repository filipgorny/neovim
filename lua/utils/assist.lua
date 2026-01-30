-- AI-powered developer assistance
-- Uses utils/code.lua for LSP info and utils/llm.lua for AI responses
local M = {}

-- Debug logging (check :messages for output)
local function log(msg, level)
  level = level or vim.log.levels.INFO
  vim.api.nvim_echo({{string.format("[assist] %s", msg), level == vim.log.levels.ERROR and "ErrorMsg" or "None"}}, true, {})
end

-- Test function to check if everything works
-- Run with: :lua require("utils.assist").test()
function M.test()
  print("=== Assist Module Test ===")

  -- Test 1: Check env loading
  print("\n[1] Testing env loading...")
  local ok_env, env = pcall(require, "utils.env")
  if ok_env then
    local api_key = env.get("ANTHROPIC_API_KEY")
    if api_key then
      print("  API key found: " .. api_key:sub(1, 20) .. "...")
    else
      print("  ERROR: API key not found!")
    end
  else
    print("  ERROR loading env: " .. tostring(env))
  end

  -- Test 2: Check LLM setup
  print("\n[2] Testing LLM setup...")
  local ok_llm, llm = pcall(require, "utils.llm")
  if ok_llm then
    local configured = llm.setup()
    print("  LLM configured: " .. tostring(configured))
  else
    print("  ERROR loading llm: " .. tostring(llm))
  end

  -- Test 3: Check code module
  print("\n[3] Testing code module...")
  local ok_code, code = pcall(require, "utils.code")
  if ok_code then
    local symbol_info = code.get_symbol_info()
    if symbol_info then
      print("  Symbol: " .. (symbol_info.symbol or "nil"))
      print("  Library: " .. (symbol_info.library or "nil"))
      print("  Definition: " .. (symbol_info.definition_path or "nil"))
    else
      print("  No symbol under cursor")
    end
  else
    print("  ERROR loading code: " .. tostring(code))
  end

  -- Test 4: Check UI module
  print("\n[4] Testing UI module...")
  local ok_ui, ui = pcall(require, "utils.ui")
  if ok_ui then
    print("  UI module loaded OK")
    print("  create_tooltip exists: " .. tostring(type(ui.create_tooltip) == "function"))
    print("  create_loading_tooltip exists: " .. tostring(type(ui.create_loading_tooltip) == "function"))
  else
    print("  ERROR loading ui: " .. tostring(ui))
  end

  -- Test 5: Simple LLM call
  print("\n[5] Testing simple LLM call...")
  if ok_llm then
    print("  Sending test prompt (check :messages for result)...")
    llm.prompt("Say 'test ok' in exactly 2 words.", function(response)
      if response then
        print("[assist] LLM Response: " .. response)
      else
        print("[assist] LLM Error: No response received")
      end
    end, { max_tokens = 10 })
  end

  print("\n=== Test Complete (LLM response is async, check :messages) ===")
end

-- Get symbol information from vendor library using AI
-- Shows description in a tooltip above cursor
function M.show_symbol_info()
  log("show_symbol_info() called")

  local ok_code, code = pcall(require, "utils.code")
  if not ok_code then
    log("Failed to load utils.code: " .. tostring(code), vim.log.levels.ERROR)
    return
  end

  local ok_llm, llm = pcall(require, "utils.llm")
  if not ok_llm then
    log("Failed to load utils.llm: " .. tostring(llm), vim.log.levels.ERROR)
    return
  end

  local ok_ui, ui = pcall(require, "utils.ui")
  if not ok_ui then
    log("Failed to load utils.ui: " .. tostring(ui), vim.log.levels.ERROR)
    return
  end

  -- Get symbol info from LSP
  log("Getting symbol info from LSP...")
  local symbol_info = code.get_symbol_info()

  if not symbol_info then
    vim.notify("No symbol under cursor", vim.log.levels.WARN)
    return
  end

  log(string.format("Symbol: %s, Library: %s, Filetype: %s",
    symbol_info.symbol or "nil",
    symbol_info.library or "nil",
    symbol_info.filetype or "nil"
  ))

  -- Build context info for the prompt
  local context_parts = {}

  if symbol_info.library then
    table.insert(context_parts, string.format("Library/Package: %s", symbol_info.library))
  end

  if symbol_info.definition_path then
    table.insert(context_parts, string.format("Definition: %s", symbol_info.definition_path))
  end

  local context = table.concat(context_parts, "\n")

  -- Show loading tooltip
  log("Creating loading tooltip...")
  local loading = ui.create_loading_tooltip("Getting info: " .. symbol_info.symbol)

  -- Build prompt
  local prompt = string.format([[Describe what "%s" is and what it does.

%s
Language: %s
File: %s

Provide a concise description in 2-4 sentences maximum. Focus on:
- What this element is (function, class, type, hook, component, etc.)
- What it does / its purpose
- Common use cases

Do NOT include code examples. Do NOT use markdown formatting. Just plain text.]],
    symbol_info.symbol,
    context,
    symbol_info.filetype,
    vim.fn.fnamemodify(symbol_info.filename, ":t")
  )

  log("Sending prompt to LLM...")
  log("Prompt length: " .. #prompt .. " chars")

  -- Ensure LLM is set up
  local is_configured = llm.setup()
  log("LLM configured: " .. tostring(is_configured))

  if not is_configured then
    loading.close()
    log("LLM not configured!", vim.log.levels.ERROR)
    vim.notify("LLM not configured. Check ANTHROPIC_API_KEY in .env", vim.log.levels.ERROR)
    return
  end

  -- Send to LLM
  llm.prompt(prompt, function(response)
    log("LLM callback received")

    -- Close loading tooltip
    loading.close()
    log("Loading tooltip closed")

    if not response then
      log("No response from LLM (response is nil)", vim.log.levels.ERROR)
      vim.notify("Failed to get symbol info - no response", vim.log.levels.ERROR)
      return
    end

    if response == "" then
      log("Empty response from LLM", vim.log.levels.ERROR)
      vim.notify("Failed to get symbol info - empty response", vim.log.levels.ERROR)
      return
    end

    log("Response received, length: " .. #response .. " chars")
    log("Full response: " .. response)

    -- Clean up response
    response = response:gsub("^%s*```[%w]*%s*", ""):gsub("%s*```%s*$", "")
    response = response:gsub("^\n+", ""):gsub("\n+$", "")

    -- Build title
    local title = symbol_info.symbol
    if symbol_info.library then
      title = symbol_info.symbol .. " (" .. symbol_info.library .. ")"
    end

    -- Show result in tooltip (use vim.schedule to ensure we're in a safe state)
    vim.schedule(function()
      log("Creating result tooltip with title: " .. title)
      local tooltip_ok, tooltip_err = pcall(function()
        ui.create_tooltip(response, {
          title = title,
          max_width = 70,
          max_height = 8,
          sticky = true,  -- Don't auto-close on cursor move
        })
      end)

      if not tooltip_ok then
        log("Failed to create tooltip: " .. tostring(tooltip_err), vim.log.levels.ERROR)
        -- Fallback: show in notify
        vim.notify(title .. ":\n" .. response, vim.log.levels.INFO)
      else
        log("Tooltip created successfully")
      end
    end)
  end, {
    max_tokens = 200,
    temperature = 0.3,
  })

  log("LLM prompt sent (async)")
end

return M
