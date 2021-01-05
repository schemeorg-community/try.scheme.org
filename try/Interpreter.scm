;;;============================================================================

;;; File: "Interpreter.scm"

;;; Copyright (c) 2020-2021 by Marc Feeley, All Rights Reserved.

;;;============================================================================

(##include "~~lib/_gambit#.scm")

(declare (extended-bindings) (standard-bindings) (block))

(macro-case-target

 ((js) (##inline-host-statement #<<EOF

function Interpreter() {

  var interp = this;

  interp.encoder = new TextEncoder();
  interp.decoder = new TextDecoder();
  interp.cons = null; // not connected to a console yet
  interp.delayed_output = '';
  interp.user_interrupt_pending = false;
  interp.heartbeat_interval = 10000;
  interp.heartbeat_count = interp.heartbeat_interval;

  G_Device_console.prototype.use_async_input = function () {
    return true;
  };

  G_Device_console.prototype.use_async_output = function () {
    var dev = this;
    var output = interp.decoder.decode(dev.wbuf);
    if (interp.cons === null) {
      interp.delayed_output += output;
    } else {
      interp.cons.write(interp.delayed_output + output);
      interp.delayed_output = '';
    }
    dev.wbuf = new Uint8Array(0);
    return true;
  };

  g_check_heap_limit0 = function () {
    if (--interp.heartbeat_count === 0) {
      interp.heartbeat_count = interp.heartbeat_interval;
      setTimeout(function () {
        g_nargs = 0;
        g_trampoline(g_glo['##thread-heartbeat!']);
      }, 10);
      return null; // exit trampoline
    } else if (interp.user_interrupt_pending) {
      interp.user_interrupt_pending = false;
      g_nargs = 0;
      return g_glo['##user-interrupt!'];
    } else {
      g_r1 = void 0;
      return g_r0;
    }
  };
};

Interpreter.prototype.console_writable = function (cons) {
  var interp = this;
  interp.cons = cons;
  cons.write(interp.delayed_output);
  interp.delayed_output = '';
};

Interpreter.prototype.console_readable = function (cons) {
  var interp = this;
  interp.cons = cons;
  var input = cons.read();
  var condvar_scm = g_os_console.read_condvar_scm;
  if (condvar_scm !== null) {
    if (input === null) {
      g_os_console.rbuf = new Uint8Array(0);
    } else {
      g_os_console.rbuf = interp.encoder.encode(input);
    }
    g_os_console.rlo = 0;
    g_os_console.read_condvar_scm = null;
    interp.user_interrupt_pending = false;
    interp.heartbeat_count = 1;
    g_os_condvar_ready_set(condvar_scm, true);
  }
};

Interpreter.prototype.console_interrupted = function (cons) {
  var interp = this;
  interp.cons = cons;
  interp.user_interrupt_pending = true;
};

g_interp = new Interpreter();

EOF
))

 (else
  #f))

;; Define fib here for testing speed of compiled code.

(define (fib x)
  (if (< x 2)
      x
      (+ (fib (- x 1)) (fib (- x 2)))))

;; Prevent exiting the REPL with EOF.

(macro-repl-channel-really-exit?-set!
 (##thread-repl-channel-get! (macro-current-thread))
 (lambda (channel) #f))

(define (##repl-no-banner)
  (##repl-debug
   (lambda (first port) #f)
   #t))

(##repl-no-banner)

;;;============================================================================
