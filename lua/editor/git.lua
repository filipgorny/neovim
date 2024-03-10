install("mhinz/vim-signify")

configure(function ()
  vim.g.signify_sign_add = '+'
  vim.g.signify_sign_change = '~'
  vim.g.signify_sign_delete = '-'
  vim.cmd("hi SignColumn ctermbg=none")
end)

local function command(cmd)
  local handle = io.popen(cmd)
  local result = handle:read("*a")
  handle:close()
  return result
end

function show_changed_files()
  local changed_files = command("/usr/bin/git status --porcelain")

  local Popup = require("nui.popup")

  local popup = Popup({
    enter = true,
    focusable = true,
    border = {
      style = "rounded",
      text = {
        top = "Git changed files",
        top_align = "center",
      }
    },
    position = "50%",
    size = {
      width = "80%",
      height = "60%",
    },
  })

  local event = require("nui.utils.autocmd").event

  popup:mount()
  popup:on(event.BufLeave, function()
    popup:unmount()
  end)

  function write(line, text)
    vim.api.nvim_buf_set_lines(popup.bufnr, line, line+1, false, { text })
  end

  index = 0
  for file in changed_files:gmatch("[^\r\n]+") do
    write(index, file)
    index = index + 1
  end
end
  
--keys.map_all("<leader>g", "<Esc>:lua show_changed_files()<CR>")

-- telescope changed files
install("freestingo/telescope-changed-files")

configure(function ()
  require("telescope").load_extension("changed_files")
end)

keys.map_all("<leader>gd", "<Esc>:Telescope changed_files<CR>")
keys.map_all("<leader>gb", "<Esc>:Telescope changed_files choose_base_branch<CR>")

