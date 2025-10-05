local M = {}

M.trim = function(s)
  return s:match("^%s*(.-)%s*$")
end

M.is_blank = function (s)
  return s == nil or s:match("^%s*$") ~= nil
end

return M
