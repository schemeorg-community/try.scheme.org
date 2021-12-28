#!/bin/sh
set -eu
cd "$(dirname "$0")"
echo VM.js
echo VM.min.js
echo UI.js
echo UI.css
echo index.html
echo browserfs.min.js
grep -oE 'codemirror.*.(css|js)' index.html
find lib -type f -name "*.js"
find lib -type f -name "*.o1"
find lib -type f -name "*.scm"
find lib -type f -name "*.sld"
