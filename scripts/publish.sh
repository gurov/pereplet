#!/bin/sh
# Выпуск в npm: scripts/publish.sh <код 2FA>. Токен — ~/.config/npm-token (в вывод не попадает),
# проверки (тесты, сборка, размер) запускает prepublishOnly.
set -e
[ -n "$1" ] || { echo "Нужен код 2FA: scripts/publish.sh 123456" >&2; exit 1; }
cd "$(dirname "$0")/.."
rc=$(mktemp)
trap 'rm -f "$rc"' EXIT
printf '//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n' > "$rc"
NPM_TOKEN=$(cat ~/.config/npm-token) npm publish --userconfig "$rc" --otp="$1"
