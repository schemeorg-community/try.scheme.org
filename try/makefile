# The online Scheme REPL is composed of the following files:
#
# - Console.js        a simple console built on top of CodeMirror
# - Interpreter.scm   the interface between the Gambit interpreter and console
# - Interpreter.js    this file is generated from Interpreter.scm by gsc
# - index.html        the main HTML file
#
# To build Interpreter.js you need the latest Gambit, which should be
# compiled like this (from an existing bootstrapped recent installation):
#
#   cd gambit
#   git pull
#   make clean
#   ./configure --enable-single-host --enable-targets=js --prefix=/usr/local/Gambit
#   make
#   make modules
#   sudo make install
#
# After that, in this directory do:
#
#   make
#
# Then in a browser open index.html .

CODEMIRROR=codemirror-5.59.1
BROWSERFS=2.0.0

all: Interpreter.js Interpreter.min.js lib codemirror browserfs.min.js

$(CODEMIRROR).zip:
	wget https://codemirror.net/$(CODEMIRROR).zip

browserfs.min.js:
	wget https://cdnjs.cloudflare.com/ajax/libs/BrowserFS/$(BROWSERFS)/browserfs.min.js

codemirror: $(CODEMIRROR).zip
	shasum -a 256 -c checksum
	rm -rf -- $(CODEMIRROR)
	unzip -q $(CODEMIRROR).zip
	mv $(CODEMIRROR) codemirror

Interpreter.js: Interpreter.scm
	gsc -target js -exe -o Interpreter.js Interpreter.scm

Interpreter.min.js: Interpreter.js
	npx google-closure-compiler --js Interpreter.js --js_output_file Interpreter.min.js
	gzip -k -9 Interpreter.min.js

lib:
	rm -rf lib doc
	cp -r `gsc -e '(display (path-expand "~~lib"))'` lib
	mkdir doc
	cp `gsc -e '(display (path-expand "~~doc"))'`/gambit.html doc

clean:
	rm -rf Interpreter.js Interpreter.min.js* lib codemirror $(CODEMIRROR)

manifest: codemirror lib manifest.sh
	./manifest.sh >manifest

upload: manifest
	rsync -vrx --files-from manifest ./ alpha.servers.scheme.org:/production/try/www/

.PHONY: all clean upload
