

return {
    {
        "HiPhish/rainbow-delimiters.nvim",
        config = function()
            local highlight = {
                "RainbowRed",
                "RainbowYellow",
                "RainbowBlue",
                "RainbowOrange",
                "RainbowGreen",
                "RainbowViolet",
                "RainbowCyan",
            }

            local rainbow_delimiters = require("rainbow-delimiters")

            vim.g.rainbow_delimiters = {
                highlight = highlight
            }
        end
    }
}