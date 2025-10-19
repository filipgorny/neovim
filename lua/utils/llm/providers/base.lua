-- Abstract base class for LLM models
local M = {}

-- Create a new model instance
function M:new(o)
  o = o or {}
  setmetatable(o, self)
  self.__index = self
  return o
end

-- Abstract method: must be implemented by subclasses
-- @param prompt string: The prompt to send to the model
-- @param callback function: Callback function(response_text, error)
-- @param options table: Optional parameters (temperature, max_tokens, etc.)
function M:prompt(prompt, callback, options)
  error("Abstract method 'prompt' must be implemented by subclass")
end

-- Abstract method: get model name
function M:get_name()
  error("Abstract method 'get_name' must be implemented by subclass")
end

-- Abstract method: check if API key is configured
function M:is_configured()
  error("Abstract method 'is_configured' must be implemented by subclass")
end

-- Helper method: validate that required methods are implemented
function M:validate()
  local required_methods = {"prompt", "get_name", "is_configured"}

  for _, method in ipairs(required_methods) do
    if type(self[method]) ~= "function" then
      error(string.format("Model must implement '%s' method", method))
    end
  end

  return true
end

return M
