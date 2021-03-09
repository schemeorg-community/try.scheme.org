;;;============================================================================

;;; File: "six.scm"

;;; Copyright (c) 2020-2021 by Marc Feeley, All Rights Reserved.

;;;============================================================================

(##include "~~lib/_gambit#.scm")

(define-runtime-syntax js.infix
  (lambda (src)

    (include "six-convert.scm")

    (##deconstruct-call
     src
     2
     (lambda (ast-src)
       (let ((ast (##source-strip ast-src)))
         (if (and (pair? ast)
                  (eq? 'six.import (##source-strip (car ast)))
                  (pair? (cdr ast))
                  (null? (cddr ast)))
             (let ((ident (##source-strip (cadr ast))))
               (if (and (pair? ident)
                        (eq? 'six.identifier (##source-strip (car ident)))
                        (pair? (cdr ident))
                        (null? (cddr ident)))
                   `(begin
                      (error "JavaScript import not implemented")
                      (js-import ,(symbol->string (##source-strip (cadr ident))))
                      (void))
                   (error "invalid import")))

             (let* ((x (six->js ast-src))
                    (body (car x))
                    (params (cdr x))
                    (def
                     (string-append "function ("
                                    (flatten-string
                                     (comma-separated (map car params)))
                                    ") {\n"
                                    "  return " 
                                    body ";\n}")))
               `((host-eval ,def) ,@(map cdr params)))))))))

;; Convenience JavaScript function to pass JavaScript objects to Scheme
;; without an automatic conversion.

(##inline-host-declaration
 "function foreign(obj) { return g_host2foreign(obj); }\n")

;; Define the six.infix macro so that it can be used from the REPL.

(eval
 '(##define-syntax six.infix
    (##make-alias-syntax 'js.infix)))
