editor = {}

function setup()
  -- libs
  require("lib/packaging")
  
  editor.sysutils = require("lib/sysutils")
  editor.localdb = require("lib/localdb")

  
  -- Load core packages
  require("editor/config")
  
  -- Load the common functions
  require("utils/components")

  -- Load the plugins
  require("editor/tabs")
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
  require("editor/session")
  --require("editor/emoji")
  --
  require("editor/rest")
end

function initialize() 
  setup()
  run_config()


  require("config/preferences")
  require("config/keys")
end

initialize()

keys.map_all("<leader>i", "<Esc>:lua initialize()<CR>")
