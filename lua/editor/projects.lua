install("ahmedkhalf/project.nvim")

configure(function () 
  require("project_nvim").setup({
    detection_methods = { "pattern" },
    patterns = { "~/Projects", "~/.config/nvim" }
  })

  require('telescope').load_extension('projects')

  keys.map_all("<leader>p", "<cmd>:lua open_projects_list()<CR>")
end)

function open_projects_list()
  require('telescope').extensions.projects.projects{}
end

