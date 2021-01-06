#!/bin/sh
set -eu
cd "$(dirname "$0")"
echo Console.js
echo Interpreter.min.js
echo console.css
echo index.html
grep -oE 'codemirror.*.(css|js)' index.html
find lib -type f -name "*.js"
