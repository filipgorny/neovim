-- file: lua/virtual_notes.lua
local M = {}
local ns = vim.api.nvim_create_namespace("virtual_notes")
local info = require("utils.info")
local debug_buffer = require("utils.debug_buffer")

-- Highlight dla uwag (ciemna żółta)
vim.cmd([[highlight VirtualNote guifg=#dcdcaa]])

-- Pobranie diff pliku względem HEAD
M.get_diff = function(file_path)
  local handle = io.popen("git diff HEAD -- " .. file_path)
  local result = handle:read("*a")
  handle:close()
  return result
end

-- Wyślij diff do LLM (domyślnie Gemini)
M.send_to_llm = function(diff_text)
  local api_key = vim.fn.getenv("DEEPSEEK_API_KEY") -- wczytuje z .env
  local prompt = string.format([[
Please see the latest changes applied to the project,
review them, find potential bugs, risks or code smells.
Return a list of objects as valid JSON:

{ "file": "filename", "line": line_number, "text": "..." }

Here are the changes:

%s
  ]], diff_text)

  debug_buffer("Prompt: " .. prompt)
  local cmd = string.format([[
curl -s -X POST https://api.deepseek.com/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer %s" \
-d '{
  "messages": [
    { "role": "system", "content": "You are a coding expert" },
    { "role": "user", "content": "%s" }
  ],
  "model": "deepseek-chat"
}'
  ]], api_key, prompt:gsub('"', '\\"'))

  debug_buffer.print(cmd);

  local handle = io.popen(cmd)
  local response = handle:read("*a")

  debug_buffer.print("Response from the llm: " .. response)
  handle:close()

  local ok, decoded = pcall(vim.fn.json_decode, response)
  if not ok then
    vim.notify("Failed to parse LLM response", vim.log.levels.ERROR)
    return {}
  end
  return decoded or {}
end

-- Hook na BufWritePost: generowanie uwag LLM
M.attach_auto_notes = function()
  vim.api.nvim_create_autocmd("BufWritePost", {
    callback = function(args)
      local bufnr = args.buf
      local file_path = vim.api.nvim_buf_get_name(bufnr)
      local diff = M.get_diff(file_path)
      if diff == "" then return end

      local notes = M.send_to_llm(diff)

      debug_buffer("Answer from llm: " .. notes)

      --info.render_virtual_lines(bufnr, vim.diagnostic.get(bufnr), notes)
    end,
  })
end

-- Inicjalizacja
M.setup = function()
  M.attach_auto_notes()
end

return M
