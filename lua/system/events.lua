local M = {}

-- Event listeners storage
-- Format: { event_name = { listener_id = callback_function } }
local listeners = {}
local next_listener_id = 1

-- Register an event listener
-- @param event_name string: Name of the event to listen for
-- @param callback function: Function to call when event is emitted
-- @return number: listener_id that can be used to unsubscribe
function M.on(event_name, callback)
  if type(callback) ~= "function" then
    error("Callback must be a function")
  end

  if not listeners[event_name] then
    listeners[event_name] = {}
  end

  local listener_id = next_listener_id
  next_listener_id = next_listener_id + 1

  listeners[event_name][listener_id] = callback

  return listener_id
end

-- Unsubscribe from an event
-- @param event_name string: Name of the event
-- @param listener_id number: ID returned by M.on()
function M.off(event_name, listener_id)
  if listeners[event_name] and listeners[event_name][listener_id] then
    listeners[event_name][listener_id] = nil
  end
end

-- Emit an event to all registered listeners
-- @param event_name string: Name of the event to emit
-- @param data any: Data to pass to the listeners
function M.emit(event_name, data)
  if not listeners[event_name] then
    return
  end

  for _, callback in pairs(listeners[event_name]) do
    -- Use pcall to prevent one failing listener from breaking others
    local ok, err = pcall(callback, data)
    if not ok then
      vim.notify(
        string.format("Error in event listener for '%s': %s", event_name, tostring(err)),
        vim.log.levels.ERROR
      )
    end
  end
end

-- Register a one-time event listener (auto-unsubscribes after first trigger)
-- @param event_name string: Name of the event to listen for
-- @param callback function: Function to call when event is emitted
-- @return number: listener_id
function M.once(event_name, callback)
  if type(callback) ~= "function" then
    error("Callback must be a function")
  end

  local listener_id
  listener_id = M.on(event_name, function(data)
    M.off(event_name, listener_id)
    callback(data)
  end)

  return listener_id
end

-- Clear all listeners for a specific event (or all events if no name provided)
-- @param event_name string|nil: Name of the event to clear, or nil to clear all
function M.clear(event_name)
  if event_name then
    listeners[event_name] = nil
  else
    listeners = {}
  end
end

-- Get count of listeners for an event (useful for debugging)
-- @param event_name string: Name of the event
-- @return number: Count of active listeners
function M.listener_count(event_name)
  if not listeners[event_name] then
    return 0
  end

  local count = 0
  for _ in pairs(listeners[event_name]) do
    count = count + 1
  end

  return count
end

return M
