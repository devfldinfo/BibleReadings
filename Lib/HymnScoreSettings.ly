\override Score.TimeSignature #'style = #'() %%makes timesigs always numerical
\override SpacingSpanner #'common-shortest-duration = #(ly:make-moment 1 1)
\override SpacingSpanner #'packed-spacing = ##t
\override Score.ChordName #'font-family = #'roman
\set Score.tempoHideNote = ##f
