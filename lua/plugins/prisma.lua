-- Prisma support for Neovim
-- 
-- To enable LSP, install Prisma language server manually:
-- sudo npm install -g @prisma/language-server
--
-- Or install locally in your project:
-- cd /path/to/project && npm install -D @prisma/language-server

return {
  -- Prisma syntax highlighting
  "prisma/vim-prisma",
  ft = "prisma",
}
