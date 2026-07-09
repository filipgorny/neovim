-- Skill "clipboard": pozwala agentowi ZOBACZYĆ obrazek ze schowka systemowego.
--
-- Modele multimodalne nie mają bezpośredniego dostępu do schowka OS. Gdy user
-- wrzuci screenshot do schowka (Print Screen / wycinek) i powie "zobacz screena",
-- agent musi najpierw ZAPISAĆ zawartość schowka do pliku w /tmp, a dopiero potem
-- odczytać go narzędziem Read (które widzi obrazki).
--
-- Zrzut robimy przez wl-paste (Wayland) z fallbackiem na xclip (X11) — helper
-- _G.agent_clip_image(path) wykrywa dostępne narzędzie i zwraca ścieżkę pliku.

local M = {
  name = "clipboard",
  description = "Zapis zawartości schowka (obraz/tekst) do /tmp, żeby agent mógł ją zobaczyć",
  tools = { "Bash", "Read" },
}

function M.on_enable(_)
  -- Zapisz OBRAZ ze schowka do `path`. Zwraca ścieżkę przy sukcesie albo
  -- "error: ..." przy porażce. Wykrywa Wayland (wl-paste) / X11 (xclip).
  function _G.agent_clip_image(path)
    path = path or "/tmp/agent-clip.png"

    local function run(cmd)
      local ok = os.execute(cmd .. " > " .. vim.fn.shellescape(path) .. " 2>/dev/null")

      if ok == true or ok == 0 then
        local size = vim.fn.getfsize(path)

        return type(size) == "number" and size > 0
      end

      return false
    end

    if vim.fn.executable("wl-paste") == 1 then
      -- najczęstszy typ zrzutu ekranu to image/png
      if run("wl-paste --no-newline --type image/png") then
        return path
      end
    end

    if vim.fn.executable("xclip") == 1 then
      if run("xclip -selection clipboard -t image/png -o") then
        return path
      end
    end

    return "error: schowek nie zawiera obrazu (albo brak wl-paste/xclip)"
  end
end

function M.system_prompt(_)
  return [[## Skill: Clipboard (viewing screenshots)

You cannot access the OS clipboard directly, and you cannot "see" the user's
screen. But when the user copies a screenshot to the clipboard (Print Screen,
region snip, etc.) you CAN view it — by first dumping the clipboard to a file
and then reading that file with the Read tool (Read renders images).

WHEN the user says things like "zobacz screena", "spójrz na screenshot",
"look at the screenshot", "popatrz na to co skopiowałem", "sprawdź co mam w
schowku" — the image is in the clipboard. Do this immediately, without asking
them to send/attach anything:

1. Dump the clipboard image to /tmp via the live-editor helper (Bash tool):
     nvim --server "$NVIM_AGENT_SERVER" --remote-expr 'luaeval("_G.agent_clip_image(\"/tmp/agent-clip.png\")")'
   It prints the file path on success, or a message starting with "error:".

   (Fallback without the RPC helper, straight shell — Wayland then X11:
     wl-paste --no-newline --type image/png > /tmp/agent-clip.png
     xclip -selection clipboard -t image/png -o > /tmp/agent-clip.png )

2. Read /tmp/agent-clip.png with the Read tool to actually see the screenshot,
   then answer based on what's in it.

Notes:
- If the dump returns "error: ..." the clipboard holds no image — tell the user
  to copy the screenshot again (do NOT guess at the contents).
- The clipboard may also hold plain TEXT; if the user wants you to see copied
  text, save it the same way with `wl-paste --no-newline > /tmp/agent-clip.txt`
  and Read that.
- Reuse /tmp/agent-clip.png; overwrite it on each new request so you never read
  a stale screenshot.]]
end

return M
