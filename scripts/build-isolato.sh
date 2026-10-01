#!/usr/bin/env bash
# Build (o dev) in una copia isolata del progetto, per lavorare in parallelo senza collisioni
# su .astro/ e sulla cache immagini.
# Uso:
#   scripts/build-isolato.sh <etichetta>             build in /tmp/<etichetta>-dist + controllo copy + budget
#   scripts/build-isolato.sh <etichetta> dev <porta> server di sviluppo sulla porta indicata
set -euo pipefail
L="${1:?Uso: scripts/build-isolato.sh <etichetta> [dev <porta>]}"
MODO="${2:-build}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
W="/tmp/${L}-work"
OUT="/tmp/${L}-dist"
mkdir -p "$W"
# Copia sorgenti (senza node_modules, dist, .astro, .git), poi collega node_modules.
find "$W" -mindepth 1 -maxdepth 1 ! -name node_modules ! -name .cache -exec rm -rf {} +
tar -C "$ROOT" --exclude=./node_modules --exclude=./dist --exclude=./.astro --exclude=./.git -cf - . | tar -C "$W" -xf -
ln -sfn "$ROOT/node_modules" "$W/node_modules"
cd "$W"
export ASTRO_CACHE_DIR="$W/.cache/astro"
if [ "$MODO" = "dev" ]; then
  exec npx astro dev --port "${3:?porta}" --host 127.0.0.1
fi
rm -rf "$OUT"
npx astro build --outDir "$OUT"
DIST="$OUT" node scripts/check-copy.mjs
DIST="$OUT" node scripts/budget.mjs
echo "Output: $OUT"
