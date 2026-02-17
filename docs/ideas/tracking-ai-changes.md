# Tracking AI Changes

## Goal

Know which lines in a file were written by the user and which by AI.

## Approach

Append-only log of user edits in SQLite. Every line the user changes gets recorded.
Lines with no record = AI-written or original untouched code.

## Storage

Table: `user_edits`

```sql
CREATE TABLE IF NOT EXISTS user_edits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  line_content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

No unique constraint. Every edit is a new row. Append-only log.

## Detection mechanism

Two-layer approach:

1. **`nvim_buf_attach` with `on_lines`** — captures precise changed line ranges
   for every buffer change (user AND API). Stores range in a per-buffer
   `pending_changes` variable. Does NOT persist to storage.

2. **`TextChanged` / `TextChangedI` autocmds** — fire ONLY for user-initiated
   changes (typing, normal mode commands like `dd`, `p`, `ciw`, etc.).
   API calls (`nvim_buf_set_lines`) do NOT trigger these events.
   On these events: read the pending line range, fetch actual line content
   from buffer, insert rows into `user_edits`, clear pending.

This means:
- User types/edits -> `on_lines` records range -> `TextChanged` fires -> persist to DB
- AI writes via API -> `on_lines` records range -> `TextChanged` does NOT fire -> not persisted
- Next `on_lines` call overwrites stale pending data

## Module

New file: `lua/utils/user_edits.lua`

```lua
-- setup() called from init.lua
-- Creates table, sets up BufEnter autocmd to attach to buffers

-- attach_buffer(bufnr)
--   nvim_buf_attach with on_lines callback
--   Stores pending_changes = { start_row, new_end } (overwritten each call)
--   Sets up TextChanged/TextChangedI autocmds for that buffer
--   On event: read lines from start_row to new_end, insert into user_edits

-- query(file_path, line_number) -> boolean
--   Returns true if any user_edits entry exists for that file + line

-- query_range(file_path, start_line, end_line) -> set of line numbers
--   Returns which lines in range have user edits
```

## Filtering

- Only track real files (`buftype == ""`, named, not `term://`)
- Only track files within current git repo

## Usage (later)

- In git overview: show a sign/marker next to lines that have NO user_edits record
  (= AI-authored lines)
- Could add a gutter indicator in normal editing too
- Query: "show me all AI-written lines in this file"

## Open questions

- When to clean up old entries? On `git commit`? On explicit user command?
  Or keep forever and let SQLite handle the size?
- Should we track the git branch in the table for branch-aware tracking?
- Paste from clipboard (`p`, `P`, `"+p`) triggers `TextChanged` so it gets
  attributed to the user -- is this correct behavior? (probably yes)
