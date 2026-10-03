#!/usr/bin/env bash
# PreToolUse hook on Bash: blocks recursive force deletes. Use `trash` instead (recoverable).
# It reads the whole tool call, so a command that only mentions the pattern is blocked too;
# that is the safe side to err on.
input="$(cat)"
if echo "$input" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|-r[[:space:]]+-f|-f[[:space:]]+-r|--recursive[[:space:]]+--force|--force[[:space:]]+--recursive)'; then
  echo "Blocked: 'rm -rf' is not allowed in this project. Use 'trash <path>' so files stay recoverable." >&2
  exit 2
fi
exit 0
