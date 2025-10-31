local M = {}

local pickers = require("telescope.pickers")
local finders = require("telescope.finders")
local conf = require("telescope.config").values
local action_state = require("telescope.actions.state")
local actions = require("telescope.actions")
local previewers = require("telescope.previewers")

-- Funkcja parsująca git status
local function parse_git_status()
  local handle = io.popen("git status --porcelain")
  if not handle then return {} end

  local entries = {}
  for line in handle:lines() do
    local staged_char = line:sub(1,1)
    local unstaged_char = line:sub(2,2)
    local filename = line:sub(4)

    if staged_char == "?" and unstaged_char == "?" then
      table.insert(entries, { type = "?", staged = false, filename = filename })
    else
      if staged_char ~= " " and (staged_char == "M" or staged_char == "D") then
        table.insert(entries, { type = staged_char, staged = true, filename = filename })
      end
      if unstaged_char ~= " " and (unstaged_char == "M" or unstaged_char == "D") then
        table.insert(entries, { type = unstaged_char, staged = false, filename = filename })
      end
    end
  end

  handle:close()
  return entries
end

-- Główny picker
M.review_changes = function()
  local entries = parse_git_status()
  if #entries == 0 then
    print("✅ Brak zmian w repozytorium!")
    return
  end

  pickers.new(
    { -- opts
      prompt_title = "Git Stage & Commit",
      sorter = conf.generic_sorter({}),
      previewer = previewers.new_termopen_previewer({
        get_command = function(entry)
          return { "git", "diff", "--color=always", "--", entry.filename }
        end,
      }),
    },
    { -- finder_table
      finder = finders.new_table({
        results = entries,
        entry_maker = function(entry)
          return {
            value = entry.filename,
            display = function(e)
              local icon = e.staged and "" or "" -- staged/unstaged icon
              return string.format("%s %s %s", icon, entry.type, e.value)
            end,
            ordinal = entry.filename,
            type = entry.type,
            staged = entry.staged,
          }
        end,
      }),
      attach_mappings = function(prompt_bufnr, map)
        local picker = action_state.get_current_picker(prompt_bufnr)

        -- toggle stage/reset
        local function toggle_and_stage()
          local selection_index = picker:get_selection_row()
          local entry = action_state.get_selected_entry()
          entry.checked = not entry.checked

          if entry.checked then
            vim.fn.jobstart({ "git", "add", entry.value }, { detach = true })
          else
            vim.fn.jobstart({ "git", "reset", entry.value }, { detach = true })
          end

          picker:refresh()
          picker:set_selection(selection_index)
        end

        -- commit dla zaznaczonych plików
        local function commit_selected()
          actions.close(prompt_bufnr)
          vim.ui.input({ prompt = "Commit message: " }, function(msg)
            if not msg or msg == "" then return end
            local staged_files = {}
            for _, e in ipairs(entries) do
              if e.checked then
                table.insert(staged_files, e.filename)
              end
            end
            if #staged_files == 0 then
              print("❌ Nie wybrano żadnych plików do commita!")
              return
            end

            vim.fn.jobstart({ "git", "commit", "-m", msg }, { detach = true })
            print("✅ Commit: " .. msg)
          end)
        end

        map("i", "<space>", toggle_and_stage)
        map("n", "<space>", toggle_and_stage)
        map("i", "<C-c>", commit_selected)
        map("n", "<C-c>", commit_selected)

        return true
      end,
    }
  ):find()
end

-- Navigate to next git hunk/change
M.next_hunk = function()
  if vim.wo.diff then
    vim.cmd('normal! ]c')
    return
  end

  local ok, gitsigns = pcall(require, 'gitsigns')
  if ok then
    vim.schedule(function()
      gitsigns.next_hunk()
    end)
  else
    vim.notify("Gitsigns not loaded", vim.log.levels.WARN)
  end
end

-- Navigate to previous git hunk/change
M.prev_hunk = function()
  if vim.wo.diff then
    vim.cmd('normal! [c')
    return
  end

  local ok, gitsigns = pcall(require, 'gitsigns')
  if ok then
    vim.schedule(function()
      gitsigns.prev_hunk()
    end)
  else
    vim.notify("Gitsigns not loaded", vim.log.levels.WARN)
  end
end

-- Get current git branch
local function get_current_branch()
  local handle = io.popen("git rev-parse --abbrev-ref HEAD 2>/dev/null")
  if not handle then return nil end

  local branch = handle:read("*l")
  handle:close()

  if branch and branch ~= "" then
    return branch
  end
  return nil
end

-- Get main branch name (master or main)
M.get_main_branch = function()
  -- First try to get default branch from remote
  local handle = io.popen("git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null")
  if handle then
    local output = handle:read("*l")
    handle:close()
    if output and output ~= "" then
      local branch = output:match("refs/remotes/origin/(.+)")
      if branch then
        return branch
      end
    end
  end

  -- Fallback: check if main exists, otherwise use master
  handle = io.popen("git rev-parse --verify main 2>/dev/null")
  if handle then
    local result = handle:read("*l")
    handle:close()
    if result and result ~= "" then
      return "main"
    end
  end

  -- Default to master
  return "master"
end

-- Save all modified buffers
local function save_all_buffers()
  local saved_count = 0
  for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_valid(bufnr) and vim.api.nvim_buf_get_option(bufnr, "modified") then
      local bufname = vim.api.nvim_buf_get_name(bufnr)
      if bufname ~= "" then
        vim.api.nvim_buf_call(bufnr, function()
          vim.cmd("silent! write")
        end)
        saved_count = saved_count + 1
      end
    end
  end
  return saved_count
end

-- Check if there are uncommitted changes (staged or unstaged)
local function has_uncommitted_changes()
  local handle = io.popen("git status --porcelain 2>/dev/null")
  if not handle then return false end

  local output = handle:read("*a")
  handle:close()

  return output and output ~= ""
end

-- Create a branch-specific git stash
local function create_branch_stash(branch_name)
  if not has_uncommitted_changes() then
    return true -- No changes to stash
  end

  local stash_name = string.format("autostash-%s-%s", branch_name, os.time())
  local handle = io.popen(string.format("git stash push -u -m '%s' 2>&1", stash_name))
  if not handle then
    vim.notify("Failed to create git stash", vim.log.levels.ERROR)
    return false
  end

  local output = handle:read("*a")
  handle:close()

  vim.notify(string.format("Created stash: %s", stash_name), vim.log.levels.INFO)
  return true
end

-- Apply branch-specific git stash if it exists
local function apply_branch_stash(branch_name)
  -- Get list of stashes
  local handle = io.popen("git stash list 2>/dev/null")
  if not handle then return end

  local stash_index = nil
  local i = 0
  for line in handle:lines() do
    -- Look for stash with matching branch name
    if line:match("autostash%-" .. branch_name:gsub("%-", "%%-")) then
      stash_index = i
      break
    end
    i = i + 1
  end
  handle:close()

  if stash_index then
    -- Apply and drop the stash
    local apply_handle = io.popen(string.format("git stash pop stash@{%d} 2>&1", stash_index))
    if apply_handle then
      local output = apply_handle:read("*a")
      apply_handle:close()
      vim.notify(string.format("Applied stash for branch: %s", branch_name), vim.log.levels.INFO)
    end
  end
end

-- Switch branch with session and stash management
M.switch_branch = function()
  local current_branch = get_current_branch()
  if not current_branch then
    vim.notify("Not in a git repository", vim.log.levels.WARN)
    return
  end

  -- Get list of branches
  local handle = io.popen("git branch --all --format='%(refname:short)' 2>/dev/null")
  if not handle then
    vim.notify("Failed to get git branches", vim.log.levels.ERROR)
    return
  end

  local branches = {}
  for line in handle:lines() do
    -- Skip HEAD and current branch marker
    local branch = line:gsub("^%*%s*", ""):gsub("^origin/", "")
    if branch ~= "" and branch ~= "HEAD" and branch ~= current_branch then
      -- Avoid duplicates
      local already_exists = false
      for _, existing in ipairs(branches) do
        if existing == branch then
          already_exists = true
          break
        end
      end
      if not already_exists then
        table.insert(branches, branch)
      end
    end
  end
  handle:close()

  if #branches == 0 then
    vim.notify("No other branches found", vim.log.levels.WARN)
    return
  end

  -- Show telescope picker
  pickers.new({}, {
    prompt_title = string.format("Switch from '%s' to", current_branch),
    finder = finders.new_table({
      results = branches,
      entry_maker = function(entry)
        return {
          value = entry,
          display = entry,
          ordinal = entry,
        }
      end,
    }),
    sorter = conf.generic_sorter({}),
    attach_mappings = function(prompt_bufnr, map)
      actions.select_default:replace(function()
        local selection = action_state.get_selected_entry()
        actions.close(prompt_bufnr)

        local target_branch = selection.value
        local session_module = require("system.session")

        -- Step 1: Save all unsaved buffers
        local saved_count = save_all_buffers()
        if saved_count > 0 then
          vim.notify(string.format("Saved %d buffer(s)", saved_count), vim.log.levels.INFO)
        end

        -- Step 2: Save current session
        if session_module and session_module.save_session then
          session_module.save_session()
          vim.notify("Session saved for current branch", vim.log.levels.INFO)
        end

        -- Step 3: Create stash for current branch if there are uncommitted changes
        if not create_branch_stash(current_branch) then
          vim.notify("Failed to stash changes, aborting branch switch", vim.log.levels.ERROR)
          return
        end

        -- Step 4: Switch branch
        vim.notify(string.format("Switching to branch: %s", target_branch), vim.log.levels.INFO)
        local switch_handle = io.popen(string.format("git checkout %s 2>&1", target_branch))
        if not switch_handle then
          vim.notify("Failed to switch branch", vim.log.levels.ERROR)
          return
        end

        local switch_output = switch_handle:read("*a")
        switch_handle:close()

        if switch_output:match("error:") or switch_output:match("fatal:") then
          -- Log git errors to :messages without popup
          vim.api.nvim_echo({{"[Git Error] " .. switch_output, "ErrorMsg"}}, true, {})
          return
        end

        -- Step 5: Close all current buffers
        vim.schedule(function()
          -- Close all buffers except special ones
          for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
            if vim.api.nvim_buf_is_valid(bufnr) then
              local bufname = vim.api.nvim_buf_get_name(bufnr)
              local buftype = vim.api.nvim_buf_get_option(bufnr, "buftype")
              -- Only close normal file buffers
              if buftype == "" and bufname ~= "" then
                vim.api.nvim_buf_delete(bufnr, { force = false })
              end
            end
          end

          -- Step 6: Apply stash for target branch if it exists
          apply_branch_stash(target_branch)

          -- Step 7: Check if target branch has a session and load it
          vim.schedule(function()
            if session_module and session_module.session_exists and session_module.session_exists() then
              -- Session exists, load it
              session_module.load_session(true)
              vim.notify(string.format("Switched to branch: %s (session loaded)", target_branch), vim.log.levels.INFO)
            else
              -- No session exists, just show message
              vim.notify(string.format("Switched to branch: %s (no session found)", target_branch), vim.log.levels.INFO)
            end
          end)
        end)
      end)

      return true
    end,
  }):find()
end

-- Get list of files with merge conflicts
M.get_conflicted_files = function()
  local handle = io.popen("git diff --name-only --diff-filter=U 2>/dev/null")
  if not handle then return {} end

  local files = {}
  for line in handle:lines() do
    if line ~= "" then
      table.insert(files, line)
    end
  end
  handle:close()

  return files
end

-- Get the three versions of a conflicted file
-- Returns: { ours = string, theirs = string, merged = string, base_path = string }
M.get_conflict_versions = function(filepath)
  local result = {
    ours = nil,      -- HEAD version (current branch)
    theirs = nil,    -- Incoming version (branch being merged)
    merged = nil,    -- Current file with conflict markers
    base_path = filepath
  }

  -- Get HEAD version (ours)
  local ours_handle = io.popen(string.format("git show :2:'%s' 2>/dev/null", filepath))
  if ours_handle then
    result.ours = ours_handle:read("*a")
    ours_handle:close()
  end

  -- Get incoming version (theirs)
  local theirs_handle = io.popen(string.format("git show :3:'%s' 2>/dev/null", filepath))
  if theirs_handle then
    result.theirs = theirs_handle:read("*a")
    theirs_handle:close()
  end

  -- Get current file with conflict markers
  if vim.fn.filereadable(filepath) == 1 then
    result.merged = table.concat(vim.fn.readfile(filepath), "\n")
  end

  return result
end

-- Mark a file as resolved
M.mark_resolved = function(filepath)
  local handle = io.popen(string.format("git add '%s' 2>&1", filepath))
  if not handle then
    return false, "Failed to execute git add"
  end

  local output = handle:read("*a")
  local success = handle:close()

  if output and (output:match("error:") or output:match("fatal:")) then
    return false, output
  end

  return true, nil
end

-- Get branch names involved in the conflict
M.get_merge_branch_names = function()
  local result = {
    current = nil,
    incoming = nil
  }

  -- Get current branch
  local current_handle = io.popen("git rev-parse --abbrev-ref HEAD 2>/dev/null")
  if current_handle then
    result.current = current_handle:read("*l")
    current_handle:close()
  end

  -- Try to get incoming branch from MERGE_HEAD
  local merge_head_handle = io.popen("git rev-parse --abbrev-ref MERGE_HEAD 2>/dev/null")
  if merge_head_handle then
    result.incoming = merge_head_handle:read("*l")
    merge_head_handle:close()
  end

  -- If MERGE_HEAD doesn't work, try to get it from .git/MERGE_MSG
  if not result.incoming or result.incoming == "" then
    local git_dir_handle = io.popen("git rev-parse --git-dir 2>/dev/null")
    if git_dir_handle then
      local git_dir = git_dir_handle:read("*l")
      git_dir_handle:close()

      if git_dir and vim.fn.filereadable(git_dir .. "/MERGE_MSG") == 1 then
        local merge_msg = vim.fn.readfile(git_dir .. "/MERGE_MSG")[1]
        if merge_msg then
          local branch = merge_msg:match("Merge branch '([^']+)'")
          if branch then
            result.incoming = branch
          end
        end
      end
    end
  end

  return result
end

-- Open conflict resolution UI for current file or show picker
M.resolve_conflicts = function()
  local conflicted_files = M.get_conflicted_files()

  if #conflicted_files == 0 then
    vim.notify("No merge conflicts found", vim.log.levels.INFO)
    return
  end

  -- If current file is conflicted, open it directly
  local current_file = vim.api.nvim_buf_get_name(0)
  local git_root_handle = io.popen("git rev-parse --show-toplevel 2>/dev/null")
  local git_root = nil
  if git_root_handle then
    git_root = git_root_handle:read("*l")
    git_root_handle:close()
  end

  if git_root and current_file:find(git_root, 1, true) == 1 then
    local relative_path = current_file:sub(#git_root + 2)
    for _, file in ipairs(conflicted_files) do
      if file == relative_path then
        -- Current file is conflicted, open resolver
        local ui = require("utils.ui")
        ui.open_conflict_resolver(file)
        return
      end
    end
  end

  -- Otherwise, show picker
  if #conflicted_files == 1 then
    local ui = require("utils.ui")
    ui.open_conflict_resolver(conflicted_files[1])
  else
    -- Show telescope picker for multiple files
    pickers.new({}, {
      prompt_title = string.format("Resolve Conflicts (%d files)", #conflicted_files),
      finder = finders.new_table({
        results = conflicted_files,
        entry_maker = function(entry)
          return {
            value = entry,
            display = "⚠️  " .. entry,
            ordinal = entry,
          }
        end,
      }),
      sorter = conf.generic_sorter({}),
      attach_mappings = function(prompt_bufnr, map)
        actions.select_default:replace(function()
          local selection = action_state.get_selected_entry()
          actions.close(prompt_bufnr)

          local ui = require("utils.ui")
          ui.open_conflict_resolver(selection.value)
        end)
        return true
      end,
    }):find()
  end
end

return M
