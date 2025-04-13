\include "../Lib/MusicCommon.ly"
FAEEIxFMoreSylBMusicGlobal = { 
    \set Staff.autoBeaming = ##f
\numericTimeSignature

    \set Score.tempoHideNote = ##t
    \tempo 4 = 120
    \time 3/4
    \key es \major
    \partial 4
    
}
FAEEIxFMoreSylBMusicRHA = \relative c'{ \FAEEIxFMoreSylBMusicGlobal \clef "treble"
    ees4 | g (aes) f \pcAO | ees2 g4 | %3
bes2 c4 |  \nbp bes2 \lbp bes4 | %5
\nbp ees2 d4 | c2 bes4 | bes (aes) g | %8
g (\set Score.tempoHideNote = ##t \tempo 4 = 60  \fpre f) \fpost \set Score.tempoHideNote = ##t \tempo 4 = 120   \lbp f |  \nbp bes2 c4 | %10
d2 bes4 | ees (g,) a | %12
\nbp bes2 \pcAO \lbp ees,4 | %13
\nbp aes2 g4 | f2 \pcAO ees4 | %15
ees8 ([f] g4) f \pcAO \nbp ees2 \he
}
FAEEIxFMoreSylBMusicRHB = \relative c'{ \FAEEIxFMoreSylBMusicGlobal \clef "treble"
    bes4 | ees2 d4 | ees2 ees4 | ees2 ees4 | %4
ees2 f4 | ees2 g4 | ees2 ees4 | f2 ees4 | %8
ees (d) d | f2 f4 | f2 g4 | g2 f4 | %12
d2 ees4 | c (d) ees | d2 ees4 | %15
ees2 d4 ees2
}
FAEEIxFMoreSylBMusicRH =  \partcombine #'(2 . 20)  \FAEEIxFMoreSylBMusicRHA \FAEEIxFMoreSylBMusicRHB
FAEEIxFMoreSylBMusicLHA = \relative c{ \FAEEIxFMoreSylBMusicGlobal \clef "bass"
    g'4 | bes (c) bes | g2 c4 | bes2 aes4 | %4
g2 bes4 | g2 g4 | aes2 g4 | bes2 bes4 | %8
bes2 bes4 | bes2 a4 \pcAO | bes2 d4 | %11
ees2 c4 | bes2 bes4 | aes2 bes4 | %14
bes (aes) g | c (bes) aes g2
}
FAEEIxFMoreSylBMusicLHB = \relative c{ \FAEEIxFMoreSylBMusicGlobal \clef "bass"
    ees4 | ees (aes,) bes | c2 c4 | %3
g2 aes4 | ees'2 d4 | c2 bes4 | %6
aes2 ees'4 | d2 ees4 | \fpre bes2 \fpostbelow bes4 | %9
d2 f4 | bes2 g4 | c,2 f4 | bes,2 g'4 | %13
f2 ees4 | bes2 c4 | aes (bes) bes ees2
}
FAEEIxFMoreSylBMusicLH =  \partcombine #'(2 . 20)  \FAEEIxFMoreSylBMusicLHA \FAEEIxFMoreSylBMusicLHB
FAEEIxFMoreSylBMusicLyrics = \relative c''''{ \FAEEIxFMoreSylBMusicGlobal \clef "treble"
    \hideNotes \voiceFour c4 c4  s4 c4 c2 c4 c2 c4 c2 c4 c2 c4 c2 c4 c4 c4 c4 c4 c4 c4 c2 c4 c2 c4 c2 c4 c2 c4 c2 c4 c2 c4 c2 c4 c2
}

FAEHCxAAMusicGlobal = { 
    \set Staff.autoBeaming = ##f
\numericTimeSignature

    \set Score.tempoHideNote = ##t
    \tempo 4 = 116
    \time 4/4
    \key es \major
    
}
FAEHCxAAMusicRHA = \relative c'{ \FAEHCxAAMusicGlobal \clef "treble"
    \pcAO ees2 g4 bes | bes4. aes8 g2 | %2
f f4 aes | aes4. g8 f2 | g f4 c' | %5
\nbp bes1 | bes2 g4 aes | bes4. c8 bes2 | %8
bes g4 aes | bes4. c8 bes2 | ees d4 c | %11
bes4. aes8 g4 \pcAO \lbp ees | %12
\nbp f2 bes \pcAO \nbp ees,1 \he
}
FAEHCxAAMusicRHB = \relative c'{ \FAEHCxAAMusicGlobal \clef "treble"
    ees2 ees4 g | g4. f8 ees2 | d d4 f | %3
f4. ees8 d2 | ees d4 ees | d1 | %6
g2 ees4 f | g4. aes8 g2 | g ees4 f | %9
g4. aes8 g2 | aes ees4 ees | %11
ees4. ees8 ees4 ees | c2 d ees1
}
FAEHCxAAMusicRH =  \partcombine #'(2 . 20)  \FAEHCxAAMusicRHA \FAEHCxAAMusicRHB
FAEHCxAAMusicLHA = \relative c{ \FAEHCxAAMusicGlobal \clef "bass"
    g'2 bes4 bes | bes4. bes8 bes2 | %2
bes bes4 bes | bes4. bes8 bes2 | %4
bes bes4 a | bes1 | bes2 bes4 bes | %7
ees4. ees8 ees2 | ees bes4 bes | %9
ees4. ees8 ees2 | c bes4 aes | %11
g4. c8 bes4 bes | aes2 aes g1
}
FAEHCxAAMusicLHB = \relative c{ \FAEHCxAAMusicGlobal \clef "bass"
    ees2 ees4 ees | ees4. ees8 ees2 | %2
bes bes4 bes | bes4. bes8 bes2 | %4
ees f4 f | bes,1 | ees2 ees4 ees | %7
ees4. ees8 ees2 | ees ees4 ees | %9
ees4. ees8 ees2 | ees ees4 ees | %11
ees4. ees8 ees4 g, | aes2 bes ees1
}
FAEHCxAAMusicLH =  \partcombine #'(2 . 20)  \FAEHCxAAMusicLHA \FAEHCxAAMusicLHB
FAEHCxAAMusicLyrics = \relative c''''{ \FAEHCxAAMusicGlobal \clef "treble"
    \hideNotes \voiceFour c2 c4 c4 c4. c8 c2 c2 c4 c4 c4. c8 c2 c2 c4 c4 c1 c2 c4 c4 c4. c8 c2 c2 c4 c4 c4. c8 c2 c2 c4 c4 c4. c8 c4 c4 c2 c2 c1
}

FAEHIxDBMoreSylMusicGlobal = { 
    \set Staff.autoBeaming = ##f
\numericTimeSignature

    \set Score.tempoHideNote = ##t
    \tempo 4 = 68
    \time 6/8
    \key c \major
    \partial 8
    
}
FAEHIxDBMoreSylMusicRHA = \relative c'{ \FAEHIxDBMoreSylMusicGlobal \clef "treble"
    g'8 |  \nbp e [g] c e4 c8 | %2
d [c] a c4 \lbp a8 | %3
\nbp g [e] \pcAO c g'4 e8 | %4
\nbp e4. (d4) \lbp f8 | %5
\nbp e [g] c e4 c8 | %6
d [c] a c4 \lbp a8 | %7
\nbp g [e] \pcAO c e4 d8 \pcAp | %8
\nbp c4.~c4 \cbp \pcAu g'8 \postCho | %9
\nbp g [d] e f4 b8 | %10
c [e,] f g4 \lbp g8 | %11
\nbp fis [g] a c4 fis,8 | %12
\nbp g4.~g4 \lbp f8 | %13
\nbp e [g] c e4 c8 | %14
d [c] a c4 \lbp a8 | %15
\nbp g [e] \pcAO c e4 d8 \pcAp \nbp c4.~c4 \pcAu \he
}
FAEHIxDBMoreSylMusicRHB = \relative c'{ \FAEHIxDBMoreSylMusicGlobal \clef "treble"
    e8 | c [e] e g4 e8 | f4 f8 f4 f8 | %3
e [c] c e4 c8 | c4. (b4) b8 | %5
c [e] e g4 g8 | f4 f8 f4 f8 | %7
e [c] c c4 b8 | c4.~c4 e8 | %9
d4 c8 b4 f'8 | e [c] d e4 e8 | %11
d4 d8 d4 c8 | b4.~b4 b8 | %13
c [e] e g4 e8 | f4 f8 f4 f8 | %15
e [c] c b4 b8 c4.~c4
}
FAEHIxDBMoreSylMusicRH =  \partcombine #'(2 . 20)  \FAEHIxDBMoreSylMusicRHA \FAEHIxDBMoreSylMusicRHB
FAEHIxDBMoreSylMusicLHA = \relative c{ \FAEHIxDBMoreSylMusicGlobal \clef "bass"
    g'8 | g4 g8 c4 g8 | a4 c8 a4 c8 | %3
c [g] e c'4 g8 | g4.~g4 g8 | %5
g4 g8 c4 c8 | a4 c8 a4 c8 | %7
c [g] e g4 f8 | e4.~e4 c'8 | %9
b4 c8 g4 g8 | g4 g8 c4 c8 | %11
a [b] c fis,4 a8 | g4.~g4 g8 | %13
g4 g8 c4 g8 | a4 c8 a4 c8 | %15
c [g] e g4 f8 e4.~e4
}
FAEHIxDBMoreSylMusicLHB = \relative c{ \FAEHIxDBMoreSylMusicGlobal \clef "bass"
    c8 | c4 c8 c4 c8 | f4 f8 f4 f8 | %3
c4 c8 c4 c8 | g4.~g4 g8 | c4 c8 c4 e8 | %6
f4 f8 f4 f,8 | g4 a8 g4 g8 | c4.~c4 c8 | %9
g'4 g8 g,4 g8 | c4 c8 c4 c8 | %11
d4 d8 d4 d8 | g,4.~g4 g8 | c4 c8 c4 c8 | %14
f4 f8 f4 f,8 | g4 g8 g4 g8 c4.~c4
}
FAEHIxDBMoreSylMusicLH =  \partcombine #'(2 . 20)  \FAEHIxDBMoreSylMusicLHA \FAEHIxDBMoreSylMusicLHB
FAEHIxDBMoreSylMusicLyrics = \relative c''''{ \FAEHIxDBMoreSylMusicGlobal \clef "treble"
    \hideNotes \voiceFour c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4. c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c8*5 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c8*5 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4 c8 c4.
}

FAEIExDFMusicGlobal = { 
    \set Staff.autoBeaming = ##f
\numericTimeSignature

    \set Score.tempoHideNote = ##t
    \tempo 4 = 94
    \time 4/4
    \key g \major
    
}
FAEIExDFMusicRHA = \relative c'{ \FAEIExDFMusicGlobal \clef "treble"
    \repeat volta 2 {b'2 b4 b | c2. b4 | %2
b a \pcAO g a |  \nbp b2. \lbp g4 | %4
\nbp a2 fis |  \nbp g1} | a2 a4 b | %7
c2 a | d4 c b a |  \nbp b2. \lbp d4 | %10
\nbp e2 d |  \nbp c2. \lbp b4 | %12
\nbp d c b a \pcAO g1 \he
}
FAEIExDFMusicRHB = \relative c'{ \FAEIExDFMusicGlobal \clef "treble"
    g'2 g4 g | g2. g4 | fis fis g fis | %3
g2. e4 | e2 d | d1 | fis2 fis4 g | %7
fis2 fis | fis4 fis g fis | g2. g4 | %10
g2 g | fis2. g4 | a a g fis g1
}
FAEIExDFMusicRH =  \partcombine #'(2 . 20)  \FAEIExDFMusicRHA \FAEIExDFMusicRHB
FAEIExDFMusicLHA = \relative c{ \FAEIExDFMusicGlobal \clef "bass"
    d'2 d4 d | e2. d4 | d c b a \pcAO | %3
g2. b4 | c2 c | b1 | d2 c4 b | a2 d | %8
d4 d d d | d2. d4 \pcAO | c2 d | %11
d2. d4 | e e d c b1
}
FAEIExDFMusicLHB = \relative c{ \FAEIExDFMusicGlobal \clef "bass"
    g'2 g4 g | g2. g4 | d d d d | g2. e4 | %4
c2 d | g1 | d2 d4 d | d2 d | b'4 a g d | %9
g2. b4 | c2 b | a2. g4 | c, c d d g1
}
FAEIExDFMusicLH =  \partcombine #'(2 . 20)  \FAEIExDFMusicLHA \FAEIExDFMusicLHB
FAEIExDFMusicLyrics = \relative c''''{ \FAEIExDFMusicGlobal \clef "treble"
    \hideNotes \voiceFour c2 c4 c4 c2. c4 c4 c4 c4 c4 c2. c4 c2 c2 c1 c2 c4 c4 c2 c2 c4 c4 c4 c4 c2. c4 c2 c2 c2. c4 c4 c4 c4 c4 c1
}

