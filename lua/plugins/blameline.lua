return {
  "tveskag/nvim-blame-line",
  config = function() 
    local keymap = require("utils.keymap")
    keymap.bind("n", "<leader>b", function()
      vim.cmd("ToggleBlameLine")
    end)
  end
}
