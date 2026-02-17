return {
  "tveskag/nvim-blame-line",
  config = function() 
    local keymap = require("utils.keymap")
    keymap.bind("n", "<leader>bm", function()
      vim.cmd("ToggleBlameLine")
    end)
  end
}
