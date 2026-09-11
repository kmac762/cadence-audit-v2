#!/bin/sh
set -eu
# Persistent mounts can arrive root-owned. Only the data directory is writable.
DATA_DIR="${DATA_DIR:-/var/data}"
mkdir -p "$DATA_DIR"
chown -R node:node "$DATA_DIR"
chmod 700 "$DATA_DIR"
exec gosu node:node "$@"
