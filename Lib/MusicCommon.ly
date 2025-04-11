pcAu = \partcombineAutomatic
pcAp = \partcombineApart
pcAO = {\once \partcombineApart}
pcAOb = {\once \partcombineApart} %When needed for more than just the old reason
pcCh = \partcombineChords
% Use this to see which line are broken at non-barlines
%lbp = \bar ""
% Use this to beautify lines which are broken at non-barlines
%\defineBarLine "lb" #'("|" #f #f)
%lbp ={ \bar "lb"  \noPageTurn}
\defineBarLine "-lb" #'("|" #f #f)
% (define-bar-line "||" "||" #f "||")
lbp ={ \bar "-lb" }
fb =  {\bar "|" \break}
cfb =  {\bar "||" \break}
cbp =  \bar "||"
he =  \bar "|."
nbp =  {\noBreak \noPageTurn}
fpre = {}
fpost = \fermata
fcont = \fermata
fcontbelow = _\fermata
fpostbelow = _\fermata
postCho = ^\markup{\small \caps  \chorusStr} %\smallCaps
postDS = {\once \override Score.RehearsalMark #'break-visibility = #end-of-line-visible
  \once \override Score.RehearsalMark #'self-alignment-X = #RIGHT
\mark \markup {\tiny{D.S.}}}
postDSAfterRepeat = {\once \override Score.RehearsalMark #'break-visibility = #end-of-line-visible
  \once \override Score.RehearsalMark #'self-alignment-X = #RIGHT
\mark \markup {\tiny{D.S. after repeat}}}
postDSEtFine = {\once \override Score.RehearsalMark #'break-visibility = #end-of-line-visible
  \once \override Score.RehearsalMark #'self-alignment-X = #RIGHT
\mark \markup {\tiny{Dal Segno et Fine}}}
postDC =   {\once \override Score.RehearsalMark #'break-visibility = #end-of-line-visible
  \once \override Score.RehearsalMark #'self-alignment-X = #RIGHT
\mark \markup {\tiny{D.C.}}}
postFine = {\once \override Score.RehearsalMark #'break-visibility = #begin-of-line-invisible
  \once \override Score.RehearsalMark #'self-alignment-X = #RIGHT
\mark \markup {\tiny{Fine}}}
postSegnoMark = {\mark \markup { \tiny{\musicglyph #"scripts.segno" }}}
