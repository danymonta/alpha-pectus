// Scrittore minimo di file .xlsx (Excel), senza librerie: uno zip "stored" con i file XML del foglio.
// Un solo foglio, riga di intestazione in grassetto con filtro e riga bloccata, colonne con larghezza.

const enc = new TextEncoder();

const TAB_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TAB_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const xml = (s) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function colonna(n) {
  let s = '';
  for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function zip(file) {
  const parti = [];
  const centrale = [];
  let offset = 0;
  const u16 = (v) => [v & 255, (v >>> 8) & 255];
  const u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  for (const [nome, contenuto] of file) {
    const n = enc.encode(nome);
    const d = enc.encode(contenuto);
    const crc = crc32(d);
    const testa = Uint8Array.from([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0)]);
    parti.push(testa, n, d);
    centrale.push(Uint8Array.from([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), n);
    offset += testa.length + n.length + d.length;
  }
  const dimCentrale = centrale.reduce((a, b) => a + b.length, 0);
  const fine = Uint8Array.from([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(file.length), ...u16(file.length), ...u32(dimCentrale), ...u32(offset), ...u16(0)]);
  return new Blob([...parti, ...centrale, fine], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * @param {string[]} intestazioni
 * @param {(string|number|null)[][]} righe
 * @param {number[]} larghezze larghezza di ogni colonna, in caratteri
 * @param {string} nomeFoglio
 */
export function creaXlsx(intestazioni, righe, larghezze = [], nomeFoglio = 'Lead') {
  const cella = (v, r, c, stile) => {
    const ref = `${colonna(c)}${r}`;
    const s = stile ? ` s="${stile}"` : '';
    if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"${s}><v>${v}</v></c>`;
    if (v == null || v === '') return `<c r="${ref}"${s}/>`;
    return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
  };
  const tutte = [intestazioni, ...righe];
  const dati = tutte
    .map((riga, i) => `<row r="${i + 1}">${riga.map((v, c) => cella(v, i + 1, c, i === 0 ? 1 : 2)).join('')}</row>`)
    .join('');
  const ultima = `${colonna(intestazioni.length - 1)}${tutte.length}`;
  const cols = intestazioni.map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="${larghezze[i] ?? 18}" customWidth="1"/>`).join('');
  const foglio = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${dati}</sheetData><autoFilter ref="A1:${ultima}"/></worksheet>`;
  const stili = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF780000"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  return zip([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(nomeFoglio)}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', stili],
    ['xl/worksheets/sheet1.xml', foglio],
  ]);
}
