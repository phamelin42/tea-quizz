#!/bin/bash
# Prépare une session Claude Code sur le web (claude.ai/code) : l'image fournit
# Node 22.22.0, que la CLI d'Angular 22 refuse (minimum 22.22.3 ou 24.15), et un
# Chromium préinstallé qui n'est pas la révision qu'attend Playwright.
# Synthèse des hooks de crochet-helper et de phil-mp. Idempotent.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Version voulue : celle de `.nvmrc`, sinon 24.
WANTED="$(cat .nvmrc 2>/dev/null || echo 24)"
WANTED="${WANTED#v}"

current="$(node -v 2>/dev/null || true)"
case "$current" in
  "v$WANTED" | "v$WANTED".*) ;; # déjà la bonne version (« 24 » accepte toute 24.x)
  *)
    if [ -s "${NVM_DIR:-/opt/nvm}/nvm.sh" ]; then
      export NVM_DIR="${NVM_DIR:-/opt/nvm}"
      # nvm ne supporte ni `set -e` ni `set -u` : un premier `nvm install` sortait en erreur.
      set +eu
      # shellcheck source=/dev/null
      source "$NVM_DIR/nvm.sh"
      nvm install "$WANTED" >/dev/null 2>&1
      BIN="$(dirname "$(nvm which "$WANTED" 2>/dev/null)")"
      set -eu
      if [ ! -x "$BIN/node" ]; then
        echo "session-start : impossible d'installer Node $WANTED par nvm" >&2
        exit 1
      fi
    else
      # Repli sans nvm : archive officielle, mise en cache entre deux sessions.
      VERSION="$(curl -sSfL https://nodejs.org/dist/index.json |
        node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const w=process.argv[1];const v=JSON.parse(s).find(r=>r.version===('v'+w)||r.version.startsWith('v'+w+'.'));process.stdout.write(v.version)})" "$WANTED")"
      DIR="$HOME/.cache/node-$VERSION"
      if [ ! -x "$DIR/bin/node" ]; then
        tmp="$(mktemp -d)"
        curl -sSfL "https://nodejs.org/dist/$VERSION/node-$VERSION-linux-x64.tar.xz" | tar -xJ -C "$tmp"
        mkdir -p "$(dirname "$DIR")" && rm -rf "$DIR" && mv "$tmp/node-$VERSION-linux-x64" "$DIR"
        rm -rf "$tmp"
      fi
      BIN="$DIR/bin"
    fi
    export PATH="$BIN:$PATH"
    echo "export PATH=\"$BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
    ;;
esac

# `npm ci` quand le lockfile existe (installation reproductible), sinon `npm install`.
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# Chromium préinstallé : on le désigne plutôt que de lancer `playwright install`
# (interdit). Le projet le lit dans playwright.config.ts (PW_CHROMIUM ou
# PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, selon le projet).
if [ -x /opt/pw-browsers/chromium ]; then
  CHROME="$(readlink -f /opt/pw-browsers/chromium)"
  {
    echo "export PW_CHROMIUM=$CHROME"
    echo "export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$CHROME"
  } >> "$CLAUDE_ENV_FILE"
fi
