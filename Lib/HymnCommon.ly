staffSetup = {  \set Staff.minimumPageTurnLength = #(ly:make-moment 10 1)
        \override Staff.BarLine #'allow-span-bar  = ##f
        \set Staff.printPartCombineTexts = ##f}
breatheA = {
  \override BreathingSign #'text = \markup { \bold \roman \raise #1 \fontsize #3 "," }
  \breathe}
breatheB = {
  \override BreathingSign #'text = \markup { \roman \raise #1 \fontsize #2 "," }
  \breathe}
intro = {
  \override BreathingSign #'text = \markup { \bold \roman \fontsize #2 "*" }
  \breathe}
introA = {
  \override BreathingSign #'text = \markup { \bold \roman \raise #1 \fontsize #3 "," \fontsize #2 "*" }
  \breathe}
introB = {
  \override BreathingSign #'text = \markup { \roman \raise #1 \fontsize #2 "," \bold  \fontsize #2 "*" }
  \breathe}
blankBreak = { \bar "" \break }
final = { \bar "|." \break }
doubleBar = { \bar "||" }
ref = \markup { \italic \sans \bold \small \center-align "Chorus" }
j = \partcombineChords
auto = \partcombineAutomatic
u = \partcombineApart
