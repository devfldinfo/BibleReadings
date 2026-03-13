/*==== CONSTANTS ====*/
const FirstRefRow = 200;
const FirstTranslationRow = 50;
const lastTranslationRow = 350;

function generateBibleReadings()
{
  processLatexReferencesTwoSheets();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi(); // Get the spreadsheet UI
  ui.createMenu('Bible Tools')        // Name of your custom menu
    .addItem('Generate Bible Readings', 'generateBibleReadings') // Menu item + function
    .addToUi();
}

/*==== SHEET HELPERS ====*/
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function colToLetter(col) {
  let temp, letter = '';
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

function letterToCol(letter) {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col;
}

function getLangValue(cell) {
  return getSheet("Edit Translations").getRange(cell).getValue().toString();
}

/*==== LANGUAGE COLUMNS ====*/
function LangDefaultNo() { return getLangValue("B3"); }
function LangANo() { return getLangValue("B4"); }
function LangBNo() { return getLangValue("B5"); }
function RefLangNo() { return getLangValue("B6"); }
function BookLangANo() { let val = getLangValue("B7"); return isNaN(val) ? LangANo() : val; }
function BookLangBNo() { let val = getLangValue("B8"); return isNaN(val) ? LangBNo() : val; }
function LangSettingsNo() { return getLangValue("B10"); }

/*==== COLUMN & VALUE HELPERS ====*/
function LangNoToColumn(No) { return String.fromCharCode(65 + No); }
function ValueSample(Row, Lang) { return Number(getSheet("Edit Translations").getRange(LangNoToColumn(Lang) + Row).getValue()); }
function ValueSampleB(row) { return ValueSample(row, parseInt(LangBNo())); }
function ValueSampleSettings(row) { return ValueSample(row, parseInt(LangSettingsNo())); }

/*==== TEXT SAMPLE ====*/
function TextSample(row, langA, langB) {
  const sheet = getSheet("Edit Translations");
  const colA = letterToCol(LangNoToColumn(langA));
  let textA = sheet.getRange(row, colA).getValue().toString();
  if (langB > 0) {
    const colB = letterToCol(LangNoToColumn(langB));
    let textB = sheet.getRange(row, colB).getValue().toString();
    return textA + '\n' + textB;
  }
  return textA;
}

function TextSampleA(row) { return TextSample(row, parseInt(LangANo()), -1); }
function TextSampleB(row) { return TextSample(row, parseInt(LangBNo()), -1); }
function TextSampleAB(row) { return TextSample(row, parseInt(LangANo()), parseInt(LangBNo())); }

/*==== LOOKUP FUNCTIONS ====*/
function LookupEngID(eng) {
  const sheet = getSheet("Edit Translations");
  for (let row = FirstTranslationRow; row <= lastTranslationRow; row++) {
    if (sheet.getRange("D" + row).getValue() === eng) {
      return sheet.getRange("C" + row).getValue();
    }
  }
  return "";
}

function LookupID(LangNo, eng, StartRow = FirstTranslationRow) {
  const sheet = getSheet("Edit Translations");
  const column = LangNoToColumn(LangNo);
  for (let row = StartRow; row <= lastTranslationRow; row++) {
    if (sheet.getRange(column + row).getValue().trim() === eng.trim()) {
      return sheet.getRange("C" + row).getValue();
    }
  }
  return "";
}

function LookupTrans(StartRow, LangNo, TransID) {
  const sheet = getSheet("Edit Translations");
  const column = LangNoToColumn(LangNo);
  const ref = "C" + StartRow + ":" + column + lastTranslationRow;
  const result = sheet.getRange(ref).getValues().flat().find(val => val === TransID);
  if (!result || result === 0) return "";
  return result.trim();
}

function LookupTransA(TransID) { return LookupTrans(FirstTranslationRow, LangANo(), TransID); }
function LookupTransB(TransID) { return LookupTrans(FirstTranslationRow, LangBNo(), TransID); }
function LookupTransRef(TransID) { return LookupTrans(FirstRefRow, RefLangNo(), TransID); }

/*==== TRANSLATION FUNCTIONS ====*/
function TransEngToLangA(str) {
  const id = LookupEngID(str);
  if (!id || isNaN(id) || id === "0") return str;
  const trans = LookupTransA(Number(id));
  return trans || str;
}

function TransEngToLang(EngStr, LangNo) {
  const id = LookupEngID(EngStr);
  if (!isNumeric(id) || id === "0") return EngStr;
  const trans = LookupTrans(FirstTranslationRow, parseInt(LangNo), parseInt(id));
  return trans || EngStr;
}

function TransEngToRefLang(defLangStr) {
  if (RefLangNo() === "2") return defLangStr;
  const id = LookupID(LangDefaultNo(), defLangStr, FirstRefRow);
  if (!id || isNaN(id) || id === "0") return defLangStr;
  return LookupTrans(FirstRefRow, RefLangNo(), id) || defLangStr;
}

function TransLangAToLangB(langAStr) {
  let id = LookupID(LangANo(), langAStr);
  if (!id) id = LookupID(LangDefaultNo(), langAStr);
  if (!id || isNaN(id) || id === "0") return langAStr;
  return LookupTrans(FirstTranslationRow, LangBNo(), Number(id)) || langAStr;
}

function TransBookLangAToBookLangB(langAStr) {
  let id = LookupID(BookLangANo(), langAStr);
  if (!id) id = LookupID(LangDefaultNo(), langAStr);
  if (!id || isNaN(id) || id === "0") return langAStr;
  return LookupTrans(FirstTranslationRow, BookLangBNo(), Number(id)) || langAStr;
}

/*==== LATEX HELPERS ====*/
function UnbreakableRefs(srcText) {
  srcText = srcText.replace("\\textendash ", "<EnDash>");
  srcText = srcText.replace(";\ ", "<Break>");
  srcText = srcText.replace("\\ ", "~");
  srcText = srcText.replace("<Break>", ";\ ");
  srcText = srcText.replace("<EnDash>", "\\textendash ");
  return srcText;
}

function NumberCommandText(srcText, cmd, altcmd) {
  let doneText = "", curNums = "", curStr = "";
  for (let i = 0; i < srcText.length; i++) {
    const ch = srcText[i];
    if (isDigit(ch)) { if (curStr) { doneText += altcmd + "{" + curStr + "}"; curStr = ""; } curNums += ch; }
    else { if (curNums) { doneText += cmd + "{" + curNums + "}"; curNums = ""; } if (altcmd) curStr += ch; else doneText += ch; }
  }
  if (curNums) doneText += cmd + "{" + curNums + "}"; 
  if (curStr) doneText += altcmd + "{" + curStr + "}"; 
  return doneText;
}

function BoldNumberFontText(srcText) { return NumberCommandText(srcText, "\\bnf", ""); }
function PlainNumberFontText(srcText) { return srcText; }
function isDigit(ch) { return /^[0-9]$/.test(ch); }
function isNumeric(value) { return !isNaN(value - parseFloat(value)); }

function ConvertToLatexText(srcText) {
  const replacements = {
    "\\": "\\textbackslash ",
    " ": "\\ ",
    [String.fromCharCode(145)]: "\\lq ",
    [String.fromCharCode(146)]: "\\rq ",
    [String.fromCharCode(147)]: "``",
    [String.fromCharCode(148)]: "''",
    [String.fromCharCode(150)]: "\\textendash ",
    [String.fromCharCode(151)]: "\\textemdash ",
    [String.fromCharCode(160)]: " ",
    "-": "\\textendash ",
    "#": "\\#",
    "$": "\\$",
    "%": "\\%",
    "&": "\\&",
    "_": "\\_",
    "{[": "",
    "]}": "",
    "{": "\\ulineB{",
    "~": "\\~",
    "^": "\\^{}",

    // Lowercase accented letters
    "â": "\\'a", "à": "\\`a", "á": "\\^a", "ã": "\\~a", "å": "\\aa", "æ": "\\ae", "ä": "\\\"a",
    "ç": "\\c{c}", "è": "\\`e", "é": "\\'e", "ê": "\\^e", "ë": "\\\"e",
    "ì": "\\`i", "í": "\\'i", "î": "\\^i", "ï": "\\\"i",
    "ñ": "\\~n", "ò": "\\`o", "ó": "\\'o", "ô": "\\^o", "õ": "\\~o", "ö": "\\o", "ø": "\\oe ",
    "ù": "\\`u", "ú": "\\'u", "û": "\\^u", "ü": "\\\"u",
    "ý": "\\'y", "ÿ": "\\\"y",

    // Uppercase accented letters
    "À": "\\`A", "Á": "\\'A", "Â": "\\~A", "Å": "\\AA", "Æ": "\\AE", "Ä": "\\\"A",
    "Ç": "\\c{C}", "È": "\\`E", "É": "\\'E", "Ê": "\\^E", "Ë": "\\\"E",
    "Ì": "\\`I", "Í": "\\'I", "Î": "\\^I", "Ï": "\\\"I",
    "Ñ": "\\~N", "Ò": "\\`O", "Ó": "\\'O", "Ô": "\\~O", "Ö": "\\\"O", "Ø": "\\OE",
    "Ù": "\\`U", "Ú": "\\^U", "Û": "\\'U", "Ü": "\\\"U",
    "Ý": "\\'Y", "Ÿ": "\\\"Y", "ß": "\\ss"
  }

  for (let key in replacements) {
    const escapedKey = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp(escapedKey, 'g');
    srcText = srcText.replace(re, replacements[key]);
  }

  return srcText;
}

function ReferenceLatexText(srcText) {
  let latexText = UnbreakableRefs(ConvertToLatexText(srcText));
  latexText = latexText.replace("\\textendash ", "\\nobreakrefrange ");
  latexText = PlainNumberFontText(latexText);
  return latexText;
}

function PrepareLatexText(srcText) { return PlainNumberFontText(ConvertToLatexText(srcText)); }
function PrepareBoldLatexText(srcText) { return BoldNumberFontText(ConvertToLatexText(srcText)); }

function wrapAmharicText(input) {
   if (!input) return '';
   return input;


  const amharicRegex = /([\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF]+)/g;
  return input.replace(amharicRegex, '\\amharicfont{$1}');
}

/*==== GENERIC PROCESSOR FOR TWO SHEETS ====*/
function processLatexReferencesTwoSheets(sheetNames = ["Preview Wed", "Preview Sun"]) {
  const startRow = 4;
  const numRows = 57; // Rows 4 to 60

  sheetNames.forEach(sheetName => {
    const sheet = getSheet(sheetName);
    const valuesM = sheet.getRange(startRow, 13, numRows, 1).getValues();
    const valuesPtoZ = sheet.getRange(startRow, 16, numRows, 11).getValues();

    const results = {AD:[], AE:[], AF:[], AH:[], AI:[], AJ:[], AK:[]};

    for (let i = 0; i < numRows; i++) {
      const m = valuesM[i][0];
      const p = valuesPtoZ[i][0];
      const q = valuesPtoZ[i][1];
      const r = valuesPtoZ[i][2];
      const v = valuesPtoZ[i][6];
      const w = valuesPtoZ[i][7];
      const z = valuesPtoZ[i][10];

      results.AD.push([v ? wrapAmharicText(ReferenceLatexText(v)) : '']);
      results.AE.push([p ? wrapAmharicText(PrepareLatexText(p)) : '']);
      results.AF.push([q ? wrapAmharicText(PrepareLatexText(q)) : '']);
      results.AH.push([r ? wrapAmharicText(PrepareLatexText(r)) : '']);
      results.AI.push([m ? wrapAmharicText(ReferenceLatexText(m)) : '']);
      results.AJ.push([w ? wrapAmharicText(PrepareLatexText(w)) : '']);
      results.AK.push([z ? wrapAmharicText(PrepareLatexText(z)) : '']);
    }

    sheet.getRange(startRow, 30, numRows, 1).setValues(results.AD);
    sheet.getRange(startRow, 31, numRows, 1).setValues(results.AE);
    sheet.getRange(startRow, 32, numRows, 1).setValues(results.AF);
    sheet.getRange(startRow, 34, numRows, 1).setValues(results.AH);
    sheet.getRange(startRow, 35, numRows, 1).setValues(results.AI);
    sheet.getRange(startRow, 36, numRows, 1).setValues(results.AJ);
    sheet.getRange(startRow, 37, numRows, 1).setValues(results.AK);
  });
}
