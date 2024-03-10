function setup()
  require("editor/config")
  require("editor/packaging")
  require("editor/keymap")
  require("editor/telescope")
  require("editor/tree")
  require("editor/theming")
  require("editor/dotenv")
  require("editor/chatgpt")
  require("editor/coc")
  require("editor/fzf")
  require("editor/notifications")
  require("editor/copilot")
  require("editor/git")
  require("editor/line")
  require("editor/terminal")
  require("editor/pairs")
  require("editor/tree-sitter")
  require("editor/projects")
  require("editor/org")
end

function initialize() 
  setup()
  run_config()

  require("config/preferences")
  require("config/keys")
end

initialize()

keys.map_all("<leader>i", "<Esc>:lua initialize()<CR>")
