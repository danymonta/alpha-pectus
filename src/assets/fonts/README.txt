Font istanziati dai pacchetti @fontsource-variable (spec B.2). Non modificare a mano.
Rigenerazione (fontTools + brotli):
  fonttools varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 wdth=68:100 wght=400:820 -o a.woff2
  pyftsubset a.woff2 --unicodes="U+0020-007E,U+00A0-00FF,U+0152-0153,U+2018-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2122,U+2009,U+202F" --layout-features='kern,liga,calt,tnum,lnum,pnum,case,ccmp,locl,mark,mkmk' --flavor=woff2 --desubroutinize --output-file=archivo-latin-inst.woff2
  fonttools varLib.instancer node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2 wght=400:500 -o n.woff2
  pyftsubset n.woff2 --unicodes="U+0020-007E,U+00A0" --text="àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ«»·’‘“”…€°ç" --layout-features='kern,liga,tnum,lnum,ccmp,mark,mkmk' --flavor=woff2 --desubroutinize --output-file=newsreader-latin-italic-inst.woff2
Non usare --no-hinting: toglie la tabella prep (SCANCTRL) e FreeType (Chrome su Linux e Android) passa all'autohinter,
che a 16px sbilancia la spaziatura ("PETT O", "Inst agram", spazi tra parole quasi nulli). Senza istruzioni nei glifi il peso non cambia.
Nessun trattino lungo o medio nei font: se compare nel testo, esce nel font di sistema (ed è comunque vietato).
