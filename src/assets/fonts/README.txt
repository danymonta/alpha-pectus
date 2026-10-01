Font istanziati dai pacchetti @fontsource-variable (spec B.2). Non modificare a mano.
Rigenerazione (fontTools + brotli):
  fonttools varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 wdth=68:100 wght=400:820 -o a.woff2
  pyftsubset a.woff2 --unicodes="U+0020-007E,U+00A0,U+00A9,U+00AB,U+00B0,U+00B7,U+00BB,U+00C0,U+00C8,U+00C9,U+00CC,U+00D2,U+00D9,U+00E0,U+00E8,U+00E9,U+00EC,U+00ED,U+00F2,U+00F3,U+00F9,U+00FA,U+2018,U+2019,U+201C,U+201D,U+2026,U+20AC" --layout-features='kern,liga,calt,tnum,lnum,pnum,case,ccmp,locl,mark,mkmk' --flavor=woff2 --desubroutinize --output-file=archivo-latin-inst.woff2
  fonttools varLib.instancer node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2 wght=400:500 -o n.woff2
  pyftsubset n.woff2 --unicodes="U+0020-007E,U+00A0" --text="àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ«»·’‘“”…€°ç" --layout-features='kern,liga,tnum,lnum,ccmp,mark,mkmk' --flavor=woff2 --desubroutinize --output-file=newsreader-latin-italic-inst.woff2
Non usare --no-hinting: toglie la tabella prep (SCANCTRL) e FreeType (Chrome su Linux e Android) passa all'autohinter,
che a 16px sbilancia la spaziatura ("PETT O", "Inst agram", spazi tra parole quasi nulli). Senza istruzioni nei glifi il peso non cambia.
Nessun trattino lungo o medio nei font: se compare nel testo, esce nel font di sistema (ed è comunque vietato).
Archivo contiene solo i caratteri della lista sopra (circa 33 KB, precaricato: pesa sull'LCP). La lista è anche in
src/lib/regole-copy.mjs (CARATTERI_FONT): npm run check fallisce se testo visibile, attributi o JSON-LD usano un carattere
fuori lista. Se serve un carattere nuovo, aggiungilo in entrambi i posti e rigenera il font.
