install("nvim-lua/plenary.nvim")
install("echasnovski/mini.icons")
install("goolord/alpha-nvim")

function Startup()
   local startify = require("alpha.themes.startify")
      -- available: devicons, mini, default is mini
      -- if provider not loaded and enabled is true, it will try to use another provider
      startify.file_icons.provider = "devicons"
      require("alpha").setup(
        startify.config
      )
end
