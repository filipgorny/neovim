local setup = {}

local function bootstrap_pckr()
  local pckr_path = vim.fn.stdpath("data") .. "/pckr/pckr.nvim"

  if not vim.loop.fs_stat(pckr_path) then
    vim.fn.system({
      'git',
      'clone',
      "--filter=blob:none",
      'https://github.com/lewis6991/pckr.nvim',
      pckr_path
    })
  end

  vim.opt.rtp:prepend(pckr_path)

  for k in pairs(setup) do
    require[k].setup(setup[k])
  end
end

bootstrap_pckr()
 
function is_installed(package)
  return editor.localdb.get(package .. ".installed") 
end

function install(package, opts)
  if editor.localdb.get(package .. ".installed") then
    return
  end

  require('pckr').add{
    package
  }

  if opts then
    if opts.run then
      require('pckr').run(package, opts.run)
    end

    if opts.setup then
      setup[package] = opts.setup
    end
  end

  editor.localdb.set(package .. ".installed", "installed")
end

function install_and_run(package, cmd)
  require('pckr').add{
    { package, run = cmd }
  }
end

