-- Skill "figma": daje agentowi dostęp do plików Figmy przez SERWER MCP Figmy.
--
-- W przeciwieństwie do skilla `editor` (który odpala własny serwer po stdio),
-- Figma wystawia serwer ZDALNY po HTTP: nie ma czego spawnować, jest sam adres.
-- Autoryzacja idzie po OAuth i NIE siedzi w tym configu — token trzyma CLI
-- w swoim magazynie poświadczeń, kluczując go nazwą serwera. Dlatego nazwa
-- ("figma") i URL muszą być te same, co w konfiguracji, w której się logowałeś
-- (`claude mcp add --transport http figma https://mcp.figma.com/mcp`), inaczej
-- serwer wystartuje nieautoryzowany.
--
-- Pierwsze logowanie robi się RAZ, w zwykłym terminalu: `claude` → `/mcp` →
-- figma → authenticate. Agent w nvimie chodzi w trybie -p, więc sam przez
-- przeglądarkowy flow OAuth nie przejdzie.
--
-- Uwaga na --strict-mcp-config w providerze claude: agent NIE dziedziczy
-- serwerów MCP z ~/.claude.json, więc Figmy nie ma, dopóki nie wniesie jej
-- ten skill.

local M = {
  name = "figma",
  description = "Dostęp do plików i mockupów Figmy przez zdalny serwer MCP (design → kod)",
}

M.config = {
  -- Zdalny serwer Figmy. Alternatywa: Dev Mode MCP w aplikacji desktopowej
  -- (Figma → Preferences → Enable MCP server) pod "http://127.0.0.1:3845/mcp";
  -- działa bez OAuth, ale tylko na pliku otwartym w desktopie.
  url = "https://mcp.figma.com/mcp",
}

-- Narzędzia dopuszczone bez pytania: wyłącznie ODCZYT projektu (+ eksport
-- assetów, bez którego nie da się zaimplementować ekranu). Narzędzia PISZĄCE
-- do Figmy (use_figma, create_new_file, generate_figma_design, add_code_connect_map,
-- upload_assets…) świadomie zostają poza allowlistą — CLI poprosi o nie przez
-- --permission-prompt-tool, czyli pytaniem w czacie (patrz permission.lua).
local READ_TOOLS = {
  "get_design_context",
  "get_screenshot",
  "get_metadata",
  "get_variable_defs",
  "get_code_connect_map",
  "get_context_for_code_connect",
  "get_code_connect_suggestions",
  "list_file_components_for_code_connect",
  "get_motion_context",
  "get_figjam",
  "search_design_system",
  "get_libraries",
  "download_assets",
  "whoami",
}

function M.mcp(_)
  return {
    name = "figma",
    type = "http",
    url = M.config.url,
    tools = READ_TOOLS,
  }
end

function M.system_prompt(_)
  return [[## Figma (serwer MCP `figma`)

Masz dostęp do plików Figmy użytkownika. Gdy w wiadomości pada link do Figmy
(https://figma.com/design/<fileKey>/<nazwa>?node-id=<id>), przekaż go tym
narzędziom W CAŁOŚCI — `node-id` wskazuje konkretny ekran/komponent, a bez
niego dostaniesz cały plik.

- `get_design_context` — podstawa przy „zaimplementuj ten ekran": struktura
  warstw, layout, typografia, kolory i tokeny wskazanego node'a. UWAGA: dla
  całego ekranu potrafi zwrócić ~100 KB. Zawęź node'a (patrz `get_metadata`)
  i ciągnij kontekst dla fragmentu, który właśnie implementujesz, zamiast raz
  dla całości — inaczej zajedziesz kontekst rozmowy pierwszym wywołaniem.
- `get_screenshot` — obejrzyj mockup, gdy liczy się wygląd albo gdy kontekst
  z `get_design_context` jest niejednoznaczny.
- `get_metadata` — tanie drzewo warstw z id; ZACZYNAJ OD NIEGO przy każdym
  większym ekranie, żeby znaleźć id właściwej sekcji, i dopiero ten węzeł
  podawaj do `get_design_context`.
- `get_variable_defs` — zmienne/tokeny (kolory, spacing) użyte w zaznaczeniu.
- `get_code_connect_map` — mapowanie node'ów Figmy na komponenty w repo.
- `download_assets` — eksport ikon/obrazów, których nie da się odtworzyć kodem.

Zasady:
- Implementuj przez ISTNIEJĄCE komponenty i tokeny projektu; wartości z Figmy
  (hexy, piksele) wstawiaj dosłownie tylko wtedy, gdy repo nie ma odpowiednika.
  Najpierw sprawdź `get_code_connect_map`, potem poszukaj w repo.
- Nie zgaduj wyglądu i nie dopowiadaj wartości, których nie zwróciło narzędzie —
  dociągnij je z Figmy albo powiedz wprost, czego brakuje.
- Narzędzia PISZĄCE do Figmy wymagają zgody użytkownika — sięgaj po nie tylko,
  gdy wprost o to prosi.
- Gdy serwer odpowie błędem autoryzacji, nie próbuj go obchodzić: napisz, że
  trzeba zalogować się do Figmy przez `/mcp` w zwykłym terminalu `claude`.]]
end

return M
