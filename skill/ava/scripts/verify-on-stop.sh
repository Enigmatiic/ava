#!/usr/bin/env bash
# Stop hook: the agent cannot end a turn while the project's fast checks fail.
# The checks are .ava/verify.sh, written by `/ava init`.
input="$(cat)"
# A stop this hook already continued goes through, or the turn would never end.
if echo "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# The project root is four levels above <root>/<provider dir>/skills/ava/scripts.
cd "$(dirname "$0")/../../../.." || exit 0
[ -f .ava/verify.sh ] || exit 0

# A turn that changed no file should not pay for the test suite: skip when the tree is the
# one that last passed. The marker lives in the git directory, so it is never committed.
marker=""
if gitdir="$(git rev-parse --git-dir 2>/dev/null)"; then
  marker="$gitdir/ava-verified"
  state="$({ git rev-parse HEAD; git diff HEAD; git ls-files -o --exclude-standard -z | xargs -0 cat; } 2>/dev/null | git hash-object --stdin)"
  [ "$state" = "$(cat "$marker" 2>/dev/null)" ] && exit 0
fi

if ! out="$(bash .ava/verify.sh 2>&1)"; then
  echo "Verification failed (.ava/verify.sh). Fix the root cause before finishing; do not skip or disable a check:" >&2
  echo "$out" | tail -n 60 >&2
  exit 2
fi
if [ -n "$marker" ]; then echo "$state" > "$marker"; fi
exit 0
