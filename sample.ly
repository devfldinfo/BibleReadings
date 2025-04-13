\version "2.18.2"
#(ly:set-option 'point-and-click #f)
\include "Zulu 2012Lyrics.ly"
chorusStr = Chorus
\include "Zulu 2012Music.ly"
\include "../Lib/HymnSetup.ly"
#(set! paper-alist (cons '("my size" . (cons (* 148 mm) (* 210 mm))) paper-alist))
#(set-default-paper-size "my size")
#(set-global-staff-size 14.4) 

\paper {
  two-sided = ##t 
  indent = 0 \mm 

 page-breaking = #ly:page-turn-breaking
% annotate-spacing = ##t
  top-margin = 20\mm
  bottom-margin=20\mm
  inner-margin = 22\mm
  outer-margin = 20\mm
system-system-spacing =  #'((basic-distance . 6)  (padding . 1) (stretchability . 60) (minimum-distance . 4))
  score-markup-spacing = #'((basic-distance . 8) (padding . 2) (stretchability . 120)(minimum-distance . 4))  
  markup-system-spacing = #'((basic-distance . 6) (padding . 1) (stretchability . 40) (minimum-distance .  3))
  score-system-spacing = #'((basic-distance . 6) (minimum-distance . 1) (padding . 2) (stretchability . 60))  
 markup-markup-spacing = #'((basic-distance . 0) (minimum-distance . 0) (padding . 0) (stretchability . 0))}
\include "../Lib/HymnCommon.ly"

\bookpart {
\include "../Lib/HymnBookPartSetup.ly"
\markup \column{
    \justify-line {
        \fontsize #6 \bold {3}
        \fontsize #1 \center-align \line {When I survey (6)}
        \null
    }
    \vspace #-10
}
\noPageBreak
\score { <<
    \context StaffGroup = CStaffGroup <<
        \context Staff = CStaffRH <<
            \override Staff.BarLine #'allow-span-bar  = ##f
            \set Staff.printPartCombineTexts = ##f
            \context NullVoice = CVoiceLyrics \FAEEIxFMoreSylBMusicLyrics
            \context Voice = CVoiceRH \FAEEIxFMoreSylBMusicRH
        >>
        \new Lyrics  = CLyricsA
        \new Lyrics = CLyricsAAlt
        \new Lyrics  = CLyricsB
        \new Lyrics = CLyricsBAlt
        \new Lyrics  = CLyricsC
        \new Lyrics = CLyricsCAlt
        \new Lyrics  = CLyricsD
        \new Lyrics = CLyricsDAlt
        \context Staff = CStaffLH <<
            \set Staff.printPartCombineTexts = ##f
            \context Voice = CVoiceLH \FAEEIxFMoreSylBMusicLH
        >>
        \context Lyrics = CLyricsA \lyricsto CVoiceLyrics \CVerseA
        \context Lyrics = CLyricsAAlt \lyricsto CVoiceLyrics \CVerseAAlt
        \context Lyrics = CLyricsB \lyricsto CVoiceLyrics \CVerseB
        \context Lyrics = CLyricsBAlt \lyricsto CVoiceLyrics \CVerseBAlt
        \context Lyrics = CLyricsC \lyricsto CVoiceLyrics \CVerseC
        \context Lyrics = CLyricsCAlt \lyricsto CVoiceLyrics \CVerseCAlt
        \context Lyrics = CLyricsD \lyricsto CVoiceLyrics \CVerseD
        \context Lyrics = CLyricsDAlt \lyricsto CVoiceLyrics \CVerseDAlt

    >>
    \include "../Lib/HymnScoreSettings.ly"
>>
\include "../Lib/HymnLayoutOutput.ly"
}

\markup \column{
    \justify-line {
        \fontsize #6 \bold {27}
        \fontsize #1 \center-align \line {Jesus is still the same (11)}
        \null
    }
    \vspace #-10
}
\noPageBreak
\score { <<
    \context StaffGroup = BGStaffGroup <<
        \context Staff = BGStaffRH <<
            \override Staff.BarLine #'allow-span-bar  = ##f
            \set Staff.printPartCombineTexts = ##f
            \context NullVoice = BGVoiceLyrics \FAEHCxAAMusicLyrics
            \context Voice = BGVoiceRH \FAEHCxAAMusicRH
        >>
        \new Lyrics  = BGLyricsA
        \new Lyrics = BGLyricsAAlt
        \new Lyrics  = BGLyricsB
        \new Lyrics = BGLyricsBAlt
        \new Lyrics  = BGLyricsC
        \new Lyrics = BGLyricsCAlt
        \context Staff = BGStaffLH <<
            \set Staff.printPartCombineTexts = ##f
            \context Voice = BGVoiceLH \FAEHCxAAMusicLH
        >>
        \context Lyrics = BGLyricsA \lyricsto BGVoiceLyrics \BGVerseA
        \context Lyrics = BGLyricsAAlt \lyricsto BGVoiceLyrics \BGVerseAAlt
        \context Lyrics = BGLyricsB \lyricsto BGVoiceLyrics \BGVerseB
        \context Lyrics = BGLyricsBAlt \lyricsto BGVoiceLyrics \BGVerseBAlt
        \context Lyrics = BGLyricsC \lyricsto BGVoiceLyrics \BGVerseC
        \context Lyrics = BGLyricsCAlt \lyricsto BGVoiceLyrics \BGVerseCAlt

    >>
    \include "../Lib/HymnScoreSettings.ly"
>>
\include "../Lib/HymnLayoutOutput.ly"
}

\markup \column{
    \justify-line {
        \fontsize #6 \bold {33}
        \fontsize #1 \center-align \line {There is a way (42)}
        \null
    }
    \vspace #-10
}
\noPageBreak
\score { <<
    \context StaffGroup = CCStaffGroup <<
        \context Staff = CCStaffRH <<
            \override Staff.BarLine #'allow-span-bar  = ##f
            \set Staff.printPartCombineTexts = ##f
            \context NullVoice = CCVoiceLyrics \FAEHIxDBMoreSylMusicLyrics
            \context Voice = CCVoiceRH \FAEHIxDBMoreSylMusicRH
        >>
        \new Lyrics  = CCLyricsA
        \new Lyrics = CCLyricsAAlt
        \new Lyrics  = CCLyricsB
        \new Lyrics = CCLyricsBAlt
        \new Lyrics  = CCLyricsC
        \new Lyrics = CCLyricsCAlt
        \new Lyrics  = CCLyricsD
        \new Lyrics = CCLyricsDAlt
        \context Staff = CCStaffLH <<
            \set Staff.printPartCombineTexts = ##f
            \context Voice = CCVoiceLH \FAEHIxDBMoreSylMusicLH
        >>
        \context Lyrics = CCLyricsA \lyricsto CCVoiceLyrics \CCVerseA
        \context Lyrics = CCLyricsAAlt \lyricsto CCVoiceLyrics \CCVerseAAlt
        \context Lyrics = CCLyricsB \lyricsto CCVoiceLyrics \CCVerseB
        \context Lyrics = CCLyricsBAlt \lyricsto CCVoiceLyrics \CCVerseBAlt
        \context Lyrics = CCLyricsC \lyricsto CCVoiceLyrics \CCVerseC
        \context Lyrics = CCLyricsCAlt \lyricsto CCVoiceLyrics \CCVerseCAlt
        \context Lyrics = CCLyricsD \lyricsto CCVoiceLyrics \CCVerseD
        \context Lyrics = CCLyricsDAlt \lyricsto CCVoiceLyrics \CCVerseDAlt

    >>
    \include "../Lib/HymnScoreSettings.ly"
>>
\include "../Lib/HymnLayoutOutput.ly"
}

\markup \column{
    \justify-line {
        \fontsize #6 \bold {39}
        \fontsize #1 \center-align \line {Lord Jesus, lead (46)}
        \null
    }
    \vspace #-10
}
\noPageBreak
\score { <<
    \context StaffGroup = CIStaffGroup <<
        \context Staff = CIStaffRH <<
            \override Staff.BarLine #'allow-span-bar  = ##f
            \set Staff.printPartCombineTexts = ##f
            \context NullVoice = CIVoiceLyrics \FAEIExDFMusicLyrics
            \context Voice = CIVoiceRH \FAEIExDFMusicRH
        >>
        \new Lyrics  = CILyricsA
        \new Lyrics = CILyricsAAlt
        \new Lyrics  = CILyricsB
        \new Lyrics = CILyricsBAlt
        \new Lyrics  = CILyricsC
        \new Lyrics = CILyricsCAlt
        \context Staff = CIStaffLH <<
            \set Staff.printPartCombineTexts = ##f
            \context Voice = CIVoiceLH \FAEIExDFMusicLH
        >>
        \context Lyrics = CILyricsA \lyricsto CIVoiceLyrics \CIVerseA
        \context Lyrics = CILyricsAAlt \lyricsto CIVoiceLyrics \CIVerseAAlt
        \context Lyrics = CILyricsB \lyricsto CIVoiceLyrics \CIVerseB
        \context Lyrics = CILyricsBAlt \lyricsto CIVoiceLyrics \CIVerseBAlt
        \context Lyrics = CILyricsC \lyricsto CIVoiceLyrics \CIVerseC
        \context Lyrics = CILyricsCAlt \lyricsto CIVoiceLyrics \CIVerseCAlt

    >>
    \include "../Lib/HymnScoreSettings.ly"
>>
\include "../Lib/HymnLayoutOutput.ly"
}

}
