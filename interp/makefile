# File: makefile

# Prerequisites:
#
# The Gambit compiler must be installed.  Use the following:
#
#  % git clone git@github.com:gambit/gambit.git
#  % cd gambit
#  % ./configure --enable-single-host --enable-targets=js CC=gcc-10
#  % make
#  % make modules
#  % make install
#
# For minifying .js files install the Google closure compiler:
#
#  % npm install google-closure-compiler

GSC=gsc

.SUFFIXES:
.SUFFIXES: .scm .sld .js .minjs .html .minhtml

all: interp-barebones.js interp-barebones.html
	@echo ">>>>>> In a browser open the file interp-barebones.html"

.sld.js:
	$(GSC) -target js -exe -o $*.js . $*
	gzip -k -9 $*.js

.js.minjs:
	npx google-closure-compiler --js $*.js --js_output_file $*.minjs
	gzip -k -9 $*.minjs

.js.html:
	echo "<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></head><body> <script src=\"$*.js\"></script></body></html>" > $*.html

.minjs.minhtml:
	echo "<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></head><body> <script src=\"$*.minjs\"></script></body></html>" > $*.minhtml

clean:
	rm -f interp-barebones.html interp-barebones.minhtml interp-barebones.js* interp-barebones.minjs*
