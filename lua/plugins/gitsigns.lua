return {
    "lewis6991/gitsigns.nvim",
    config = function()
        require("gitsigns").setup()
    end,
    dependecies = {
        "nvim-lua/plenary.nvim",
    },
}
