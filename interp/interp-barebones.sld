;;; File: interp-barebones.sld

;;; A barebones Scheme interpreter webapp.

(define-library (interp-barebones)

  (namespace "")

  (begin

(declare (extended-bindings)) ;; to have access to ##inline-host-XXX

;; provide alert and prompt procedures

(define (alert msg)
  (##inline-host-statement "alert(g_scm2host(@1@))"
                           (if (string? msg)
                               msg
                               (object->string msg))))

(define (prompt msg)
  (##inline-host-expression "g_host2scm(prompt(g_scm2host(@1@)))"
                            (if (string? msg)
                                msg
                                (object->string msg))))

;; redirect I/O to console

(current-input-port ##console-port)
(current-output-port ##console-port)

;; setup execution of REPL when webapp is all loaded

(##inline-host-declaration #<<end-of-inline-host-declaration

document.addEventListener('DOMContentLoaded', function () {
  g_DOMContentLoaded();
});

end-of-inline-host-declaration
)

(##inline-host-statement "g_DOMContentLoaded = g_scm2host(@1@);"
                         ##repl-debug-main) ;; start REPL when DOM loaded
))
