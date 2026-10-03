#!/usr/bin/env bash
# Create the labels the Ava issue format uses. Safe to re-run: existing labels are updated.
#
#   bash labels.sh <area> [<area>...]      e.g.  bash labels.sh mobile backend infra
set -euo pipefail

command -v gh >/dev/null || { echo "gh is not installed" >&2; exit 1; }

label() {
  gh label create "$1" --color "$2" --description "$3" --force >/dev/null
  echo "  $1"
}

label "severity:critical" B60205 "Data loss, a security hole, or the product cannot be used"
label "severity:high"     D93F0B "A requirement is broken, or a release is blocked"
label "severity:medium"   FBCA04 "Wrong or missing behaviour with a workaround"
label "severity:low"      0E8A16 "Polish, cleanup, a minor inconsistency"
label "epic"              5319E7 "Tracks one milestone"
label "compliance"        006B75 "A store, legal or policy rule"
label "privacy"           006B75 "Personal data"
label "tech-debt"         C5DEF5 "A shortcut taken on purpose"
label "blocked:user"      E99695 "Needs the user's data, credentials or decision"

for area in "$@"; do
  label "area:$area" 1D76DB "Area: $area"
done
