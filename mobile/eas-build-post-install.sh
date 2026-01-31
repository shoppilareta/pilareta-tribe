#!/bin/bash
set -eo pipefail

echo ">>> Installing mobile dependencies with pnpm..."
npm install -g pnpm@10.28.0
cd /home/expo/workingdir/build
pnpm install --no-frozen-lockfile
echo ">>> Mobile dependencies installed."
