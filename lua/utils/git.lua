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

return M
