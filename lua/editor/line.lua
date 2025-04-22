install("nvim-lualine/lualine.nvim")
install("nvim-tree/nvim-web-devicons")

function ShowLine()
  require('lualine').setup({
  options = {
    theme = 'tokyonight',
    iconsenabled = true,
    component_separators = { left = '', right = '' },
    section_separators = { left = '', right = '' },
    disabled_filetypes = { "NvimTree", "TelescopePrompt" },
  },
  sections = {
    lualine_a = {
      function()
        return require('auto-session.lib').current_session_name(true)
      end
    },
    lualine_b = { 'mode' },
    lualine_c = { 'branch' },
    lualine_d = { 'filename' },
    lualine_e = { 'location' },
    lualine_f = { 'datetime' },
  },
  winbar = {
    lualine_a = {
      {
        'filename',
         colored = true,
         path = 1,
      }
    },
  },
  inactive_winbar = {
    lualine_a = { { 'filename', path = 1 } }
  }
})
end

