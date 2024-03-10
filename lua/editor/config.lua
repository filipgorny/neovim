local config_functions = {} 

function configure(func)
	table.insert(config_functions, func)
end

function run_config()
  for k, f in pairs(config_functions) do
    f()
  end
end
