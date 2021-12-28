# The online Scheme REPL is composed of the following files:
#
# - UI.js       the UI showing a REPL and editor in the browser
# - UI.css      the CSS for UI.js
# - VM.scm      the interface between the Gambit interpreter and console
# - VM.js       this file is generated from VM.scm by gsc
# - index.html  the main HTML file
#
# To build VM.js you need the latest Gambit, which should be
# compiled like this (from an existing bootstrapped recent installation):
#
#   cd gambit
#   git pull
#   make clean
#   ./configure --enable-single-host --enable-targets=js --prefix=/usr/local/Gambit
#   make
#   sudo make install
#
# After that, in this directory do:
#
#   make
#
# Then in a browser open index.html .

CODEMIRROR=codemirror-5.59.1
BROWSERFS=2.0.0

PRELUDE_OPT = -prelude "(define-cond-expand-feature|disable-s8vector|)(define-cond-expand-feature|disable-u16vector|)(define-cond-expand-feature|disable-s16vector|)(define-cond-expand-feature|disable-u32vector|)(define-cond-expand-feature|disable-s32vector|)(define-cond-expand-feature|disable-u64vector|)(define-cond-expand-feature|disable-s64vector|)(define-cond-expand-feature|disable-f32vector|)"

all: VM.js VM.min.js lib codemirror browserfs.min.js

$(CODEMIRROR).zip:
	wget https://codemirror.net/$(CODEMIRROR).zip

browserfs.min.js:
	wget https://cdnjs.cloudflare.com/ajax/libs/BrowserFS/$(BROWSERFS)/browserfs.min.js

codemirror: $(CODEMIRROR).zip
	shasum -a 256 -c checksum
	rm -rf -- $(CODEMIRROR)
	unzip -q $(CODEMIRROR).zip
	mv $(CODEMIRROR) codemirror

VM.js: VM.scm
	gsc -target js -label-namespace "z" -exe -o VM.js $(PRELUDE_OPT) -nopreload js.scm six-expand.scm extra.scm VM.scm

VM.min.js: VM.js
	npx google-closure-compiler --language_in=ECMASCRIPT_2020 --language_out=ECMASCRIPT_2020 --js VM.js --js_output_file VM.min.js
	sed -i.tmp -e "s/^'use strict';//" VM.min.js
	gzip -k -9 VM.min.js

lib:
	rm -rf lib doc
	cp -r `gsc -e '(display (path-expand "~~lib"))'` lib
	find lib -type f -name "*.o1" -exec cp "{}" "{}.js" ";"
	mkdir doc
	cp `gsc -e '(display (path-expand "~~doc"))'`/gambit.html doc

clean:
	rm -rf VM.js VM.min.js* lib codemirror $(CODEMIRROR)

manifest: codemirror lib manifest.sh
	./manifest.sh >manifest

upload: manifest
	rsync -crv --files-from manifest ./ alpha.servers.scheme.org:/production/try/www/

.PHONY: all clean upload
