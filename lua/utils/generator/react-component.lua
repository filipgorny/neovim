local M = {}

local ui = require("utils.ui")

-- Helper to convert component name to PascalCase
local function to_pascal_case(name)
  -- Remove special characters and split by spaces, dashes, underscores
  local words = {}
  for word in name:gmatch("[%w]+") do
    table.insert(words, word:sub(1,1):upper() .. word:sub(2):lower())
  end
  return table.concat(words, "")
end

-- Parse prop definition to extract name, type, optional, and default value
local function parse_prop(prop_string)
  -- Trim whitespace
  prop_string = prop_string:match("^%s*(.-)%s*$")

  -- Remove trailing semicolon if present
  prop_string = prop_string:gsub(";$", "")

  if prop_string == "" then
    return nil
  end

  -- Parse: name?: type or name: type or name = "default"
  local prop_name, optional, prop_type, default_value

  -- Check for default value: name = "value" or name = 123
  local name_with_default, default = prop_string:match("^([%w_]+)%s*=%s*(.+)$")
  if name_with_default then
    prop_name = name_with_default
    default_value = default
    -- Try to infer type from default value
    if default:match("^['\"]") then
      prop_type = "string"
    elseif default:match("^%d+$") then
      prop_type = "number"
    elseif default == "true" or default == "false" then
      prop_type = "boolean"
    else
      prop_type = "any"
    end
    optional = true
  else
    -- Check for optional: name?: type
    local name_part, type_part = prop_string:match("^([%w_]+)%??%s*:%s*(.+)$")
    if name_part then
      prop_name = name_part
      optional = prop_string:match("%?") ~= nil
      prop_type = type_part
    else
      -- Invalid format
      return nil
    end
  end

  return {
    name = prop_name,
    type = prop_type,
    optional = optional,
    default_value = default_value,
    original = prop_string
  }
end

-- Generate the React component code
local function generate_component_code(component_name, prop_definitions)
  local pascal_name = to_pascal_case(component_name)
  local lines = {}

  -- Imports
  table.insert(lines, "import React from 'react';")
  table.insert(lines, "")

  -- Props type
  if #prop_definitions > 0 then
    table.insert(lines, string.format("type %sProps = {", pascal_name))
    for _, prop in ipairs(prop_definitions) do
      if prop.optional then
        table.insert(lines, string.format("  %s?: %s;", prop.name, prop.type))
      else
        table.insert(lines, string.format("  %s: %s;", prop.name, prop.type))
      end
    end
    table.insert(lines, "};")
  else
    table.insert(lines, string.format("type %sProps = {};", pascal_name))
  end
  table.insert(lines, "")

  -- Component function with destructuring logic
  if #prop_definitions == 0 then
    -- No props
    table.insert(lines, string.format("const %s = () => {", pascal_name))
  elseif #prop_definitions <= 4 then
    -- 4 or fewer props: use destructuring
    local prop_names = {}
    local defaults = {}

    for _, prop in ipairs(prop_definitions) do
      if prop.default_value then
        table.insert(prop_names, string.format("%s = %s", prop.name, prop.default_value))
      else
        table.insert(prop_names, prop.name)
      end
    end

    local destructured = table.concat(prop_names, ", ")
    table.insert(lines, string.format("const %s = ({ %s }: %sProps) => {",
      pascal_name, destructured, pascal_name))
  else
    -- More than 4 props: use props object
    table.insert(lines, string.format("const %s = (props: %sProps) => {", pascal_name, pascal_name))

    -- Add destructuring inside the component for convenience
    local prop_names = {}
    for _, prop in ipairs(prop_definitions) do
      if prop.default_value then
        table.insert(prop_names, string.format("%s = %s", prop.name, prop.default_value))
      else
        table.insert(prop_names, prop.name)
      end
    end

    local destructured = table.concat(prop_names, ", ")
    table.insert(lines, string.format("  const { %s } = props;", destructured))
    table.insert(lines, "")
  end

  -- Component body
  table.insert(lines, "  return (")
  table.insert(lines, "    <div>")
  table.insert(lines, string.format("      <h1>%s</h1>", pascal_name))
  table.insert(lines, "    </div>")
  table.insert(lines, "  );")
  table.insert(lines, "};")
  table.insert(lines, "")

  -- Export
  table.insert(lines, string.format("export default %s;", pascal_name))

  return lines
end

-- Main generate function
M.generate = function()
  -- Step 1: Ask for component name in interactive window
  ui.input_window(
    " Generate: React Component ",
    "Enter component name:",
    function(component_name)
      if not component_name or component_name == "" then
        vim.notify("Component name is required", vim.log.levels.WARN)
        return
      end

      -- Step 2: Build props list in interactive window
      ui.list_builder_window(
        " Generate: React Component (" .. to_pascal_case(component_name) .. ") ",
        "Add prop (name: type | name?: type | name = \"value\"):",
        function(prop_strings)
          -- Parse all props
          local prop_definitions = {}
          for _, prop_str in ipairs(prop_strings) do
            local parsed = parse_prop(prop_str)
            if parsed then
              table.insert(prop_definitions, parsed)
            else
              vim.notify(string.format("Invalid prop format: %s", prop_str), vim.log.levels.WARN)
            end
          end

          -- Step 3: Generate the code
          local code_lines = generate_component_code(component_name, prop_definitions)

          -- Step 4: Insert code at cursor or create new buffer
          vim.schedule(function()
            local current_buf = vim.api.nvim_get_current_buf()
            local current_ft = vim.api.nvim_buf_get_option(current_buf, "filetype")

            local prop_count = #prop_definitions
            local destructure_type = prop_count <= 4 and "destructured" or "props object"

            -- Check if current buffer is a .tsx file
            if current_ft == "typescriptreact" then
              -- Insert at cursor position
              local cursor = vim.api.nvim_win_get_cursor(0)
              local row = cursor[1] - 1 -- 0-indexed

              vim.api.nvim_buf_set_lines(current_buf, row, row, false, code_lines)

              -- Move cursor to the end of inserted code
              vim.api.nvim_win_set_cursor(0, {row + #code_lines, 0})

              vim.notify(
                string.format("Inserted React component: %s (%d props, %s)",
                  to_pascal_case(component_name),
                  prop_count,
                  destructure_type
                ),
                vim.log.levels.INFO
              )
            else
              -- Create new buffer
              local buf = vim.api.nvim_create_buf(true, false)

              -- Set buffer options
              vim.api.nvim_buf_set_option(buf, "filetype", "typescriptreact")
              vim.api.nvim_buf_set_option(buf, "buftype", "")

              -- Insert the generated code
              vim.api.nvim_buf_set_lines(buf, 0, -1, false, code_lines)

              -- Open the buffer in current window
              vim.api.nvim_set_current_buf(buf)

              -- Set the buffer as modified so user can save it with a name
              vim.api.nvim_buf_set_option(buf, "modified", true)

              vim.notify(
                string.format("Generated React component: %s (%d props, %s)",
                  to_pascal_case(component_name),
                  prop_count,
                  destructure_type
                ),
                vim.log.levels.INFO
              )
            end
          end)
        end
      )
    end
  )
end

M.description = "Generate a React functional component with TypeScript"

return M
