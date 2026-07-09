-- Pliki zmienione w commitach obecnego brancha względem brancha bazowego
-- (merge-base — stąd trzykropek w `git diff base...HEAD`). Branch bazowy to
-- origin/HEAD, z fallbackiem na main/master. Wynik cache'owany per repo
-- i odświeżany co kilka sekund, bo after_render w neo-tree odpala się często.

local M = {}

local uv = vim.uv or vim.loop

local cache = { root = nil, files = {}, ts = 0 }
local TTL_MS = 5000

local function git(root, args)
  local cmd = { "git", "-C", root }
  vim.list_extend(cmd, args)
  local out = vim.fn.systemlist(cmd)

  if vim.v.shell_error ~= 0 then
    return nil
  end

  return out
end

local function base_ref(root)
  local head = git(root, { "symbolic-ref", "--short", "refs/remotes/origin/HEAD" })

  if head and head[1] and head[1] ~= "" then
    return head[1]
  end

  for _, name in ipairs({ "main", "master" }) do
    if git(root, { "rev-parse", "--verify", "--quiet", name }) then
      return name
    end
  end

  return nil
end

-- Zwraca set { [abs_path] = true } plików różniących się od brancha bazowego.
function M.get_files()
  local root_out = vim.fn.systemlist({ "git", "rev-parse", "--show-toplevel" })

  if vim.v.shell_error ~= 0 or not root_out[1] or root_out[1] == "" then
    return {}
  end

  local root = root_out[1]
  local now = uv.now()

  if cache.root == root and (now - cache.ts) < TTL_MS then
    return cache.files
  end

  cache.root = root
  cache.ts = now
  cache.files = {}

  local base = base_ref(root)

  if not base then
    return cache.files
  end

  local names = git(root, { "diff", "--name-only", base .. "...HEAD" }) or {}

  for _, rel in ipairs(names) do
    if rel ~= "" then
      cache.files[root .. "/" .. rel] = true

      -- Wyróżnij też wszystkie katalogi nadrzędne, od roota repo w dół.
      local dir = vim.fn.fnamemodify(root .. "/" .. rel, ":h")

      while dir ~= root and #dir > #root do
        cache.files[dir] = true
        dir = vim.fn.fnamemodify(dir, ":h")
      end
    end
  end

  return cache.files
end

return M
