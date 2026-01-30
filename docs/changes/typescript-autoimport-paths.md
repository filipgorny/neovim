# TypeScript Auto-Import z preferencją path aliases

## Zmiana

Dodano konfigurację `importModuleSpecifier = "non-relative"` do ts_ls, która sprawia że:

1. Gdy zaczniesz pisać nazwę klasy/funkcji/typu, LSP pokaże ją w podpowiedziach
2. Po wybraniu podpowiedzi (Enter/Tab), import zostanie automatycznie dodany na górze pliku
3. Import będzie używał ścieżek z `tsconfig.json` (np. `@/components/Button`) zamiast relatywnych (`../../components/Button`)

## Jak działa

TypeScript Language Server obsługuje opcję `importModuleSpecifier`:
- `"shortest"` - najkrótsza ścieżka (domyślnie)
- `"relative"` - zawsze relatywne
- `"non-relative"` - preferuje aliasy z tsconfig.json
- `"project-relative"` - relatywne do projektu

## Wymagania

Żeby aliasy działały, projekt musi mieć skonfigurowane `paths` w `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

## Plik

`lua/plugins/lsp-config.lua` - sekcja ts_ls
