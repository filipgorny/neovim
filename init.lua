function setup()
  -- Load core packages
  require("editor/config")
  require("editor/packaging")
  
  -- Load the common functions
  require("utils/components")

  -- Load the plugins
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
  require("editor/projects")
  --require("editor/session")
end

function initialize() 
  setup()
  packages_sync()
  run_config()

  require("config/preferences")
  require("config/keys")
end

initialize()

keys.map_all("<leader>i", "<Esc>:lua initialize()<CR>")
