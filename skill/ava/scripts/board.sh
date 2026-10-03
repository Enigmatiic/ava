#!/usr/bin/env bash
# Put every issue of this repository on a GitHub Project board, creating the board once.
# Re-run it after a milestone adds issues: a board with the same title is reused, and an
# issue already on it is skipped.
#
#   bash board.sh ["Board title"]          default: "<repository> roadmap"
#
# It needs the project scope, which only the user can grant:  gh auth refresh -s project
set -euo pipefail

command -v gh >/dev/null || { echo "gh is not installed" >&2; exit 1; }

owner="$(gh repo view --json owner --jq .owner.login)"
repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
title="${1:-${repo#*/} roadmap}"

if ! gh project list --owner "$owner" >/dev/null 2>&1; then
  echo "gh is missing the project scope. Grant it, then re-run:  gh auth refresh -s project" >&2
  exit 1
fi

number="$(gh project list --owner "$owner" --format json \
  --jq ".projects[] | select(.title == \"$title\") | .number" | head -n 1)"
if [ -z "$number" ]; then
  number="$(gh project create --owner "$owner" --title "$title" --format json --jq .number)"
  echo "created project #$number"
else
  echo "reusing project #$number"
fi

# Closed issues go on the board too, so it shows what was fixed and not only what is left.
added=0
while read -r url; do
  [ -z "$url" ] && continue
  if gh project item-add "$number" --owner "$owner" --url "$url" >/dev/null 2>&1; then
    added=$((added + 1))
  fi
done < <(gh issue list --repo "$repo" --state all --limit 500 --json url --jq '.[].url')
echo "$added issue(s) on the board"

gh project view "$number" --owner "$owner" --format json --jq .url
echo "In the browser: add a view grouped by Status, and turn on the workflows"
echo "'Item closed -> Done' and 'Item added to project -> Todo' in the project settings."
