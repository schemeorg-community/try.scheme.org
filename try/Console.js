//=============================================================================

// File: "Console.js"

// Copyright (c) 2020-2021 by Marc Feeley, All Rights Reserved.

//=============================================================================

function Console(elem) {

    var cons = this;

    var cm_opts = {
        value: '',
        matchBrackets: true,
        mode: 'scheme',
        autofocus: true,
        lineWrapping: true,
        extraKeys: {
            'Ctrl-C': function (cm) { cons.interrupted(); },
            'Ctrl-D': function (cm) { cons.delete_forward(); },
            'Ctrl-L': function (cm) { cons.clear_transcript(); },
            'Up':     function (cm) { cons.move_history(true); },
            'Ctrl-P': function (cm) { cons.move_history(true); },
            'Down':   function (cm) { cons.move_history(false); },
            'Ctrl-N': function (cm) { cons.move_history(false); },
            'Enter':  function (cm) { cons.enter(); }
        }
    };

    elem.classList.add('console');
    cons.cm = CodeMirror(elem, cm_opts);
    cons.id = elem.id || 'DefaultConsole';
    cons.doc = cons.cm.getDoc();
    cons.transcript_marker = null;
    cons.input_buffer = [];
    cons.eof = false;
    cons.process = null;
    cons.history_max_length = 1000;
    cons.restore_history();
}

Console.prototype.transcript_opts = {
    className: 'console_transcript',
    inclusiveLeft: false,
    inclusiveRight: false,
    atomic: true,
    selectLeft: false
};

Console.prototype.input_opts = {
    className: 'console_input',
    inclusiveLeft: true,
    inclusiveRight: false
};

Console.prototype.output_opts = {
    className: 'console_output',
    inclusiveLeft: true,
    inclusiveRight: false
};

Console.prototype.line0ch0 = { line: 0, ch: 0 };
Console.prototype.line0ch1 = { line: 0, ch: 1 };

Console.prototype.end_of_doc = function () {
    var cons = this;
    return cons.doc.posFromIndex(Infinity);
};

Console.prototype.read = function () {
    var cons = this;
    if (cons.input_buffer.length > 0) {
        return cons.input_buffer.shift();
    } else {
        return null;
    }
};

Console.prototype.write = function (text) {
    var cons = this;
    if (text.length > 0) {

        var pos;
        var insert_marker;

        if (cons.transcript_marker) {
            pos = cons.transcript_marker.find().to;
            cons.transcript_marker.clear();
        } else {
            pos = cons.line0ch0;
        }

        cons.doc.replaceRange('_', pos, pos);

        var right_of_pos = { line: pos.line, ch: pos.ch+1 };
        var insert_marker = cons.doc.markText(pos,
                                              right_of_pos,
                                              cons.output_opts);

        cons.doc.replaceRange(text, pos, pos);

        pos = insert_marker.find().to;
        var left_of_pos = { line: pos.line, ch: pos.ch-1 };
        cons.doc.replaceRange('', left_of_pos, pos);
        cons.transcript_marker = cons.doc.markText(cons.line0ch0,
                                                   left_of_pos,
                                                   cons.transcript_opts);
        cons.cm.scrollIntoView(null); // scroll cursor into view
    }
};

Console.prototype.accept_input = function () {

    var cons = this;
    var pos;

    if (cons.transcript_marker) {
        pos = cons.transcript_marker.find().to;
        cons.transcript_marker.clear();
    } else {
        pos = cons.line0ch0;
    }

    var end = cons.end_of_doc();
    var input = cons.doc.getRange(pos, end);

    if (end.line > 0 || end.ch > 0) {

        cons.doc.markText(pos, end, cons.input_opts);

        cons.transcript_marker = cons.doc.markText(cons.line0ch0,
                                                   end,
                                                   cons.transcript_opts);
    }

    cons.write('\n');

    return input;
};

Console.prototype.clear_transcript = function () {

    var cons = this;

    if (cons.transcript_marker) {
        var pos = cons.transcript_marker.find().to;
        if (pos.line > 0) {
            var bol = { line: pos.line, ch: 0 };
            cons.doc.replaceRange('', cons.line0ch0, bol);
            if (pos.ch === 0) cons.transcript_marker = null;
        }
    }
};

Console.prototype.delete_forward = function () {

    var cons = this;
    var pos;

    if (cons.transcript_marker) {
        pos = cons.transcript_marker.find().to;
    } else {
        pos = cons.line0ch0;
    }

    var end = cons.end_of_doc();

    if (pos.line === end.line && pos.ch === end.ch) {
        cons.add_input(''); // signal EOF
    } else {
        cons.cm.execCommand('delCharAfter');
    }
};

Console.prototype.enter = function () {
    var cons = this;
    var input = cons.accept_input();
    if (input.length > 0) {
        cons.history[cons.history.length-1] = input;
        cons.save_history();
    }
    cons.restore_history();
    cons.add_input(input + '\n');
};

Console.prototype.add_input = function (text) {
    var cons = this;
    cons.input_buffer.push(text);
    cons.readable();
};

Console.prototype.connect = function (process) {
    var cons = this;
    cons.process = process;
    cons.writable();
    if (cons.input_buffer.length > 0) cons.readable();
};

Console.prototype.writable = function () {
    var cons = this;
    if (cons.process) cons.process.console_writable(cons);
};

Console.prototype.readable = function () {
    var cons = this;
    if (cons.process) cons.process.console_readable(cons);
};

Console.prototype.interrupted = function () {
    var cons = this;
    if (cons.process) cons.process.console_interrupted(cons);
};

Console.prototype.restore_history = function () {

    var cons = this;

    cons.history = [];

    try {
        cons.history = JSON.parse(localStorage[cons.id + '/history']);
    } catch (e) {
    }

    cons.history_pos = cons.history.length;
    cons.history.push('');
};

Console.prototype.save_history = function () {

    var cons = this;

    try {
        localStorage[cons.id + '/history'] =
            JSON.stringify(cons.history.slice(-cons.history_max_length));
    } catch (e) {
    }
};

Console.prototype.move_history = function (prev) {

    var cons = this;
    var pos = cons.history_pos;

    if (prev ? pos > 0 : pos < cons.history.length-1) {
        var newpos = prev ? pos-1 : pos+1;
        cons.change_input(cons.history[newpos]);
        cons.history_pos = newpos;
    }
};

Console.prototype.change_input = function (text) {

    var cons = this;
    var pos;

    if (cons.transcript_marker) {
        pos = cons.transcript_marker.find().to;
    } else {
        pos = cons.line0ch0;
    }

    var end = cons.end_of_doc();
    var input = cons.doc.getRange(pos, end);

    cons.history[cons.history_pos] = input;

    cons.doc.replaceRange(text, pos, end);
};
