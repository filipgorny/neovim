local M = {}

local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local conf = require("telescope.config").values
local actions = require("telescope.actions")
local action_state = require("telescope.actions.state")

-- Registry of available generators
local generators = {}

-- Register a generator
M.register = function(name, generator_module)
  generators[name] = generator_module
end

-- Run a generator by name
M.run = function(name)
  local generator = generators[name]
  if not generator then
    vim.notify(string.format("Generator '%s' not found", name), vim.log.levels.ERROR)
    return
  end

  if type(generator.generate) ~= "function" then
    vim.notify(string.format("Generator '%s' has no generate function", name), vm.log.levels.ERROR)
    return
  end

  generator.generate()
end

-- List all available generators
M.list = function()
  local names = {}
  for name, _ in pairs(generators) do
    table.insert(names, name)
  end
  return names
end

-- Open Telescope picker to select a generator
M.pick = function(callback)
  local generator_list = {}

  for name, gen in pairs(generators) do
    table.insert(generator_list, {
      name = name,
      description = gen.description or "No description",
      module = gen
    })
  end

  if #generator_list == 0 then
    vim.notify("No generators available", vim.log.levels.WARN)
    return
  end

  pickers.new({}, {
    prompt_title = "Select Generator",
    finder = finders.new_table({
      results = generator_list,
      entry_maker = function(entry)
        return {
          value = entry,
          display = function()
            return string.format("%-30s %s", entry.name, entry.description)
          end,
          ordinal = entry.name .. " " .. entry.description,
        }
      end,
    }),
    sorter = conf.generic_sorter({}),
    attach_mappings = function(prompt_bufnr, map)
      actions.select_default:replace(function()
        local selection = action_state.get_selected_entry()
        actions.close(prompt_bufnr)

        if selection and callback then
          vim.schedule(function()
            callback(selection.value.name, selection.value.module)
          end)
        end
      end)
      return true
    end,
  }):find()
end

-- Initialize and register all generators
M.setup = function()
  -- Register React component generator
  local react_component = require("utils.generator.react-component")
  M.register("react-component", react_component)

  -- Add more generators here as they are created
end

return M
