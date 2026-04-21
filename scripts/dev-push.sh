#!/usr/bin/env bash
# Dev-time sync: push the local integration folder to the remote HA
# container via rsync over SSH. Faster than git for iteration — commit
# only when you are ready to version-pin a change.
#
# Usage:
#   ./scripts/dev-push.sh            # push, verbose
#   ./scripts/dev-push.sh --quiet    # minimal output (safe to chain in hooks)
#   ./scripts/dev-push.sh --dry-run  # preview without writing
#
# After a push:
#   Python change  → restart the HA container to pick up changes.

set -euo pipefail

REMOTE_HOST="rpi25"
REMOTE_PATH="/home/rolandzeiner/docker/configuration/custom_components/nextbike_austria/"
LOCAL_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/custom_components/nextbike_austria/"

QUIET=false
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=true ;;
    --dry-run) DRY_RUN=true ;;
    -h|--help)
      sed -n '2,13p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

RSYNC_OPTS=(
  -az --delete
  --exclude='__pycache__' --exclude='*.pyc' --exclude='.DS_Store'
  # HA's Docker container runs as root and rewrites files with root ownership.
  # Use sudo rsync on the remote so we can overwrite regardless of current
  # owner. Requires a NOPASSWD sudoers rule for rsync on rpi25:
  #   rolandzeiner ALL=(ALL) NOPASSWD: /usr/bin/rsync
  --rsync-path='sudo rsync'
)
$QUIET || RSYNC_OPTS+=(-v)
$DRY_RUN && RSYNC_OPTS+=(--dry-run)

rsync "${RSYNC_OPTS[@]}" "$LOCAL_PATH" "$REMOTE_HOST:$REMOTE_PATH"

if ! $QUIET; then
  echo ""
  echo "✓ Synced to $REMOTE_HOST:$REMOTE_PATH"
  echo "  Python change → restart HA container"
fi
