#!/usr/bin/env bash
# desc: Generate a Go project (golang-standards/project-layout)
# args: module*:Module path (e.g. github.com/user/repo);app:App name (blank = last segment of module);dir:Target directory (blank = cwd)
set -euo pipefail

module="${1:-}"
app="${2:-}"
dir="${3:-}"

if [[ -z "$module" ]]; then
  echo "usage: $0 <module> [app] [dir]" >&2
  exit 1
fi

if [[ -z "$app" ]]; then
  app="${module##*/}"
fi

if [[ -z "$dir" ]]; then
  dir="$(pwd)"
fi

mkdir -p "$dir"
cd "$dir"

if [[ -f go.mod ]]; then
  echo "error: $dir/go.mod already exists, refusing to overwrite" >&2
  exit 1
fi

mkdir -p \
  "cmd/$app" \
  "internal/app" \
  "pkg" \
  "api" \
  "configs" \
  "scripts" \
  "test"

cat > "cmd/$app/main.go" <<EOF
package main

import "fmt"

func main() {
	fmt.Println("Hello from $app")
}
EOF

cat > Makefile <<EOF
APP := $app
BIN := bin/\$(APP)

.PHONY: build run test tidy clean

build:
	go build -o \$(BIN) ./cmd/\$(APP)

run:
	go run ./cmd/\$(APP)

test:
	go test ./...

tidy:
	go mod tidy

clean:
	rm -rf bin
EOF

cat > .gitignore <<'EOF'
/bin/
*.exe
*.dll
*.so
*.dylib
*.test
*.out
coverage.html
.idea/
.vscode/
*.swp
.DS_Store
.env
.env.local
EOF

cat > README.md <<EOF
# $app

## Layout

- \`cmd/$app\` — application entrypoint
- \`internal/\` — private application code
- \`pkg/\` — library code safe for external use
- \`api/\` — API contracts (OpenAPI, protobuf, etc.)
- \`configs/\` — configuration files / templates
- \`scripts/\` — build / install / analysis scripts
- \`test/\` — additional external test apps and test data

Layout follows [golang-standards/project-layout](https://github.com/golang-standards/project-layout).

## Quick start

\`\`\`sh
make run
make test
make build
\`\`\`
EOF

for d in internal/app pkg api configs scripts test; do
  touch "$d/.keep"
done

if command -v go >/dev/null 2>&1; then
  go mod init "$module"
else
  cat > go.mod <<EOF
module $module

go 1.22
EOF
  echo "warn: 'go' not found, wrote a placeholder go.mod — run 'go mod tidy' later" >&2
fi

echo "Generated Go project at $dir (module: $module, app: $app)"
