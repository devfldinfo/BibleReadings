\paper {
  indent = 0\mm
  ragged-bottom = ##f
  ragged-last-bottom = ##f
  ragged-last = ##f
  ragged-right = ##f
  oddFooterMarkup = \markup ""
  evenFooterMarkup = \markup ""
  print-all-headers = ##t
  print-page-number = ##f
  auto-first-page-number = ##f
  blank-page-penalty = 5 %5
  blank-last-page-penalty = 0 %0
  blank-after-score-page-penalty = 4 %2
  system-system-spacing =  #'((basic-distance . 7)  (padding . 2) (stretchability . 60) (minimum-distance . 3))
  score-system-spacing = #'((basic-distance . 9) (minimum-distance . 4) (padding . 1) (stretchability . 120))
  markup-system-spacing = #'((basic-distance . 5) (padding . 2) (stretchability . 20) (minimum-distance .  2))
  score-markup-spacing = #'((basic-distance . 6) (padding . 1) (stretchability . 100)(minimum-distance . 2))
  markup-markup-spacing = #'((basic-distance . 1) (padding . 0.5) (stretchability . 20)(minimum-distance . 0.5))
  top-system-spacing = #'((basic-distance . 0) (minimum-distance . 0) (padding . 0.5)(stretchability . 20))
  top-markup-spacing = #'((basic-distance . 0) (minimum-distance . 0) (padding . 0.5)(stretchability . 20))
  last-bottom-spacing =  #'((basic-distance . 0.1)  (padding . 0.5) (stretchability . 60) (minimum-distance . 0))
}
#(define space-set
  (list->char-set (string->list ".?-;,:â€œâ€?â€˜â€™â€“â€” */()[]{}|<>!`~&â€¦’")))
%  (list->char-set (string->list ".?-;,:” */()[]{}|<>!`~&¦’")))
#(define (width grob text-string)
  (let* ((layout (ly:grob-layout grob))
         (props
          (ly:grob-alist-chain
           grob
           (ly:output-def-lookup layout 'text-font-defaults)))
         (X-extent (ly:stencil-extent
                    (ly:text-interface::interpret-markup layout props
                     (markup text-string)) X)))
   (if (interval-empty? X-extent)
    0 (cdr X-extent))))
#(define (center-on-word grob)
  (let* ((text (ly:grob-property-data grob 'text))
         (syllable (if (string? text) text ""))
         (word-position
          (if (integer? (string-skip syllable space-set))
           (string-skip syllable space-set)
           0))
         (word-end
          (if (integer? (string-skip-right syllable space-set))
           (+ (string-skip-right syllable space-set) 1)
           (string-length syllable)))
         (preword (substring syllable 0 word-position))
         (word (substring syllable word-position word-end))
         (preword-width (if (string? text) (width grob preword) 0))
         (word-width (if (string? text) (width grob word) (width grob text)))
         (notehead (ly:grob-parent grob X))
         (refp (ly:grob-common-refpoint notehead grob X))
         (note-extent (ly:grob-extent notehead refp X))
         (note-width (- (cdr note-extent) (car note-extent))))
   (if (= -1 (ly:grob-property-data grob 'self-alignment-X))
    (- 0 preword-width)
    (- (/ (- note-width word-width) 2) preword-width))))
\layout {
  \context {
    \Lyrics
%    \override LyricText #'X-offset = #center-on-word
  }
}
\layout {
  \context {
    \Score
    % disabled for debugging
    \remove "Bar_number_engraver"
  }
 \context {
        \Lyrics
        %minimumVerticalExtent = #'(10 . 10)
  }
}
