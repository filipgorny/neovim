install("ton/vim-bufsurf")

local history = {}

history.jump_back = function () 
  vim.cmd("BufSurfBack")
end

history.jump_forward = function ()
  vim.cmd("BufSurfForward")
end

return history
