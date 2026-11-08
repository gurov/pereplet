#!/bin/sh
# Выпуск в npm: scripts/publish.sh [код 2FA]. Токен — ~/.config/npm-token, в вывод не попадает;
# у токена с обходом 2FA код не нужен. Проверки (тесты, сборка, размер) запускает prepublishOnly.
set -e
cd "$(dirname "$0")/.."
rc=$(mktemp)
trap 'rm -f "$rc"' EXIT
printf '//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n' > "$rc"
NPM_TOKEN=$(cat ~/.config/npm-token) npm publish --userconfig "$rc" ${1:+--otp="$1"}
