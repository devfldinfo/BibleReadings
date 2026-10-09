//Version 2.0
//This is the Web App that is called by the Bible Reading Translations sheet
//When changes are made to this file, manage deployments and create a new version so that the sheet can call the latest code
//LatexCompile is deployed as a library.

/*==== CONSTANTS ====*/
const SheetID = '1urPgZhnrZ-6zWFj_bRFzeY41jkKAkzRwcCFy9K4gWD4';
var aLatexFolder = '1y8qwfeOtjauaFiKNL-l3VoYUTKca6Q-a';
var aOutputFolder = '1WgOSvBuxg5hekeawPpivVcsWhNhEnx5Z';
var aBackupFolder = '1vgUDHX4OTfY4ujNiZS14SJ-KyBKlfRXX';
var aAlignmentFolder = "1DtcwRtwxTTZ7P1IdkQ-KfnygadvqfZQ_";

var GITHUB_TOKEN ="";
var GITHUB_OWNER = "";
var GITHUB_REPO = "";

var aStyleFile = "";
var aStyleFileName = "BibleReadings1.sty"; 
var applyNumFont = "";
var aCalToUse = "";

let cWatermark;

function generateBibleReadings() {
  // aStyleFile = readStyleFile();
  const props = PropertiesService.getScriptProperties();
  GITHUB_TOKEN = props.getProperty('GITHUB_TOKEN');
  GITHUB_OWNER = props.getProperty('GITHUB_OWNER');
  GITHUB_REPO = props.getProperty('GITHUB_REPO');

  generateTEXFiles("Lists");
  movePdfFilesBetweenFolders(aOutputFolder, aBackupFolder);
  LatexCompile.processDriveTexFolderWithGitHubConfig(aLatexFolder, aOutputFolder, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO);
}

function getAlignmentImages() {
  deleteFilesInFolder(aAlignmentFolder, "png");
  LatexCompile.getFilesFromGithub("alignment", aAlignmentFolder, "png");
}

function generateBibleReadingsDev() {
  aLatexFolder = "13_s-cavmcu_QFFTIiywkQ_-ySv6TjTGz";
  aOutputFolder = "1d26EBO5xJt6KTfdnwHCgAxgWeQVWJI9I";
  aBackupFolder = "1zwyq6UE4YMKBzedYx3vCKgcW6C574FtS";

  movePdfFilesBetweenFolders(aOutputFolder, aBackupFolder);
  // aStyleFile = readStyleFile();
  generateTEXFiles("Lists");
  LatexCompile.processDriveTexFolder(aLatexFolder, aOutputFolder);
}

function doPost(e) {

  const key = e.parameter.key;
  const props = PropertiesService.getScriptProperties();
  const API_KEY = props.getProperty('API_KEY');

  if (key !== API_KEY) {
    return ContentService.createTextOutput("Unauthorized");
  }

  try {
    if (e.parameter.action === "generateBibleReadings") {
      generateBibleReadings()
    }
    else if (e.parameter.action === "getAlignmentImages") {
      getAlignmentImages();
    }
  }
  catch (e) {
    return ContentService.createTextOutput(e.message);
  }

  return ContentService.createTextOutput("OK");
}

function readStyleFile(afilename) {
  if (!aLatexFolder) {
    throw new Error('aLatexFolder is not set');
  }

  const folder = DriveApp.getFolderById(aLatexFolder);
  const files = folder.getFilesByName(afilename);

  if (!files.hasNext()) {
    throw new Error(`${afilename} not found in folder`);
  }

  const file = files.next();
  const content = file.getBlob().getDataAsString();

  Logger.log(`${afilename} loaded successfully`);
  return content;
}

function readTexFile(filename) {
  const folder = DriveApp.getFolderById(aLatexFolder);
  const files = folder.getFilesByName(filename);

  if (!files.hasNext()) {
    Logger.log(`File not found: ${filename}`);
    return null;
  }

  return files.next().getBlob().getDataAsString();
}


/**
 * Deletes all .tex files in the given Drive folder
 * @param {string} folderId - Google Drive folder ID
 */
function deleteFilesInFolder(folderId, extension) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().toLowerCase().endsWith(`.${extension}`)) {
      file.setTrashed(true); // safer than delete
    }
  }
}

function movePdfFilesBetweenFolders(sourceFolderId, destinationFolderId) {
  const sourceFolder = DriveApp.getFolderById(sourceFolderId);
  const destinationFolder = DriveApp.getFolderById(destinationFolderId);
  const files = sourceFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    if (file.getName().toLowerCase().endsWith('.pdf')) {
      destinationFolder.addFile(file);   // add to destination
      sourceFolder.removeFile(file);     // remove from source
    }
  }
}

/**
 * Reads language column combinations from a given tab
 * Column A = langA letter (e.g. "A")
 * Column B = langB letter (e.g. "B", optional)
 * Column C = trigger column (only run if there is a value)
 * Writes a date stamp in column D after successful run
 * Starts at row 2
 */
function generateTEXFiles(tabName) {
  SpreadsheetApp.flush();
  const ss = SpreadsheetApp.openById(SheetID);
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) throw new Error(`Sheet "${tabName}" not found`);

  deleteFilesInFolder(aLatexFolder, "tex");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const values = sheet.getRange(2, 1, lastRow - 1, 17).getValues();

  for (let i = 0; i < values.length; i++) {

    const [
      colA,
      colB,
      sunAMargin,
      sunBMargin,
      wedAMargin,
      wedBMargin,
      endNoteWedA,
      endNoteWedB,
      trigger,
      lastRun,
      largePrint,
      tmplangA,
      tmpLangB,
      notes,
      styFile,
      dontapplyNumFont,
      calendartouse
    ] = values[i];

    // Stop the entire function if column A is blank
    if (!colA) return;

    // Skip this row if trigger is false/blank
    if (!trigger) continue;

    const langA = columnLetterToIndex_(colA);
    const langB = colB ? columnLetterToIndex_(colB) : -1;

    applyNumFont = dontapplyNumFont;
    aCalToUse = calendartouse;

    if (styFile)
    {
      aStyleFileName = styFile;
      aStyleFile = readStyleFile(styFile);
    }
    else
      aStyleFile = readStyleFile('BibleReadings1.sty');


    try {

      generateBRList(
        langA,
        langB,
        sunAMargin,
        sunBMargin,
        wedAMargin,
        wedBMargin,
        endNoteWedA,
        endNoteWedB,
        largePrint
      );

      sheet.getRange(i + 2, 10).setValue(new Date());

    } catch (err) {
      Logger.log(`Failed for row ${i + 2}: ${err}`);
    }

  }
}

function columnLetterToIndex_(letter) {
  letter = letter.toString().trim().toUpperCase();
  let index = 0;

  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }

  return index - 1;
}

function repeatX(n) {
  return "x".repeat(Number(n) || 0);
}


function loadConfigFromTab(asheet) {
  const values = asheet.getRange("B2:B6").getValues().flat();

  cWatermark = values[0];
}

function visualWidth(str) {
  if (!str) return 0;

  const widths = {
    i: 0.5, l: 0.5, I: 0.6,
    j: 0.6, t: 0.7,
    f: 0.7, r: 0.7,
    ' ': 0.6,
    m: 1.4, w: 1.4,
    M: 1.5, W: 1.5
  };

  let w = 0;

  for (const c of str) {
    w += widths[c] || 1;
  }

  return w;
}

function calculateMargins(rows, col, mapA, mapB, bilingual) {

  let sunA = "", sunB = "", wedA = "", wedB = "";
  let sunAw = 0, sunBw = 0, wedAw = 0, wedBw = 0;

  let sunCount = 0;
  let wedCount = 0;

  rows.forEach(row => {

    const date = row[col.date];
    if (!(date instanceof Date)) return;

    const topicKey = (row[col.topic] || '').toString().trim();
    const topicA = PrepareLatexText(mapA[topicKey] || topicKey);
    const topicB = bilingual ? PrepareLatexText(mapB[topicKey] || topicKey) : "";

    const topicCombined = topicA + topicB;
    const w = visualWidth(topicCombined);

    const day = date.getDay();

    if (day === 0) {

      sunCount++;

      if (sunCount <= 26) {
        if (w > sunAw) {
          sunAw = w;
          sunA = topicCombined;
        }
      } else {
        if (w > sunBw) {
          sunBw = w;
          sunB = topicCombined;
        }
      }
    }

    if (day === 3) {

      wedCount++;

      if (wedCount <= 26) {
        if (w > wedAw) {
          wedAw = w;
          wedA = topicCombined;
        }
      } else {
        if (w > wedBw) {
          wedBw = w;
          wedB = topicCombined;
        }
      }
    }

  });

  return {
    sunA,
    sunB,
    wedA,
    wedB
  };
}

function generateBRList(langA, langB, sunAMargin, sunBMargin, wedAMargin, wedBMargin, endNoteWedA, endNoteWedB, largePrint) {
  const EN = 0; // canonical language
  const bilingual = langB >= 0;

  const ss = SpreadsheetApp.openById(SheetID);
  const sheet = ss.getSheetByName('English');
  if (!sheet) throw new Error('Sheet "English" not found');

  const shtSettings = ss.getSheetByName('Settings');
  if (!shtSettings) throw new Error('Sheet "Settings" not found');

  loadConfigFromTab(shtSettings);

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => h.toString().trim());
  const rows = values.slice(1);

  const col = {
    date: headers.indexOf('Date'),
    topic: headers.indexOf('English Topic'),
    refs: headers.indexOf('References'),
    book: headers.indexOf('Book'),
    chapter: headers.indexOf('Chapter')
  };

  /* ===== LOAD TRANSLATIONS ===== */
  const tSheet = ss.getSheetByName('Translations');
  if (!tSheet) throw new Error('Sheet "Translations" not found');

  const tValues = tSheet.getDataRange().getValues();

  const mapA = {};
  const mapB = {};


  for (let i = 1; i < tValues.length; i++) {
    const key = (tValues[i][EN] || '').toString().trim();
    if (!key) continue;

    mapA[key] = (tValues[i][langA] || key).toString().trim();
    if (bilingual) {
      mapB[key] = (tValues[i][langB] || key).toString().trim();
    }
  }

  function T(key, which) {
    const raw = which === 'A' ? mapA[key] : mapB[key];
    return PrepareLatexText(raw || key);
  }

  /* ===== FIXED LOOKUP KEYS ===== */
  const bibleReadingsKey = 'Bible Readings';
  const sundayKey = 'Sunday';
  const wednesdayKey = 'Wednesday';

  const headingA = T(bibleReadingsKey, 'A');
  const headingB = bilingual ? T(bibleReadingsKey, 'B') : headingA;

  const sundayA = T(sundayKey, 'A');
  const sundayB = bilingual ? T(sundayKey, 'B') : sundayA;

  const wednesdayA = T(wednesdayKey, 'A');
  const wednesdayB = bilingual ? T(wednesdayKey, 'B') : wednesdayA;

  var sunHeading = (langB < 0) ? sundayA : `${sundayB} / ${sundayA}`;
  var wedHeading = (langB < 0) ? wednesdayA : `${wednesdayB} / ${wednesdayA}`;

  let latex = '';
  let sunStarted = false;
  let wedStarted = false;
  let sunCount = 0;
  let wedCount = 0;
  let year = '';

  /* === BOOK LANGUAGE TOGGLE (NEW) === */
  let useLangBForBook = true;
  /*
    const margins = calculateMargins(rows, col, mapA, mapB, bilingual);
  
  var aSunAMargin = margins.sunA;
  var aSunBMargin = margins.sunB;
  var aWedAMargin = margins.wedA;
  var aWedBMargin = margins.wedB;
  
  
    var aSunAMargin = repeatX(sunAMargin);
    var aSunBMargin = repeatX(sunBMargin);
    var aWedAMargin = repeatX(wedAMargin);
    var aWedBMargin = repeatX(wedBMargin);
  */
  var aSunAMargin = sunAMargin;
  var aSunBMargin = sunBMargin;
  var aWedAMargin = wedAMargin;
  var aWedBMargin = wedBMargin;

  var aWatermark = "";
  if (cWatermark.length > 0)
    aWatermark = "\\WaterMark"

  // ===== DOCUMENT HEADER =====
  latex += `
\\documentclass[english]{article}
\\usepackage{${getFilenameWithoutExtension(aStyleFileName)}}
${aWatermark}
\\SunAColWidths{}{}{}{${aSunAMargin}}
\\SunBColWidths{}{}{}{${aSunBMargin}}
\\WedAColWidths{}{}{}{}{${aWedAMargin}}
\\WedBColWidths{}{}{}{}{${aWedBMargin}}
`.trim() + '\n\n';

  let lastSunBook = null;
  let lastWedBook = null;
  let sunBookLangToggle = true; // true = LangB first
  let wedBookLangToggle = true; // true = LangB first

  let lastSunMonth = null;
  let lastWedMonth = null;

  let sunMonthLangToggle = true; // true = LangB first
  let wedMonthLangToggle = true;


  rows.forEach(row => {
    const date = row[col.date];
    if (!(date instanceof Date)) return;

    const dayOfWeek = date.getDay();
    var day = Utilities.formatDate(date, Session.getScriptTimeZone(), 'd');
    var month = Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMM');
    year = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy');

    const topicKey = (row[col.topic] || '').toString().trim();
    const topicA = PrepareLatexText(mapA[topicKey] || topicKey);
    const topicB = bilingual ? PrepareLatexText(mapB[topicKey] || topicKey) : '';

    const refsRaw = (row[col.refs] || '').toString().trim();
    const refsTranslated = TranslateReferenceBooks(refsRaw, mapA);
    const refs = ReferenceLatexText(refsTranslated);

    if(aCalToUse){
      var result = gregorianToEthiopian(day,Utilities.formatDate(date, Session.getScriptTimeZone(), 'M'),year);
      day = String(result.day);
      month = getMonthName(result.month);
      year = String(result.year);
//      Logger.log(`${day},${month}, ${year}`);
  }

    const monthA = PrepareLatexText(mapA[month] || month);
    const monthB = bilingual
      ? PrepareLatexText(mapB[month] || month)
      : monthA;

    const bookRaw = (row[col.book] || '').toString().trim();
    const bookA = PrepareLatexText(mapA[bookRaw] || bookRaw);
    const bookB = bilingual
      ? PrepareLatexText(mapB[bookRaw] || bookRaw)
      : bookA;

    const bookForChapter =
      bilingual ? (useLangBForBook ? bookB : bookA) : bookA;

    const chapter = ReferenceLatexText((row[col.chapter] || '').toString().trim());

    /* ===== SUNDAY ===== */
    if (dayOfWeek === 0) {


      if (month !== lastSunMonth) {
        sunMonthLangToggle = true; // LangB starts
        lastSunMonth = month;
      }

      const monthOut = sunMonthLangToggle ? monthB : monthA;
      sunMonthLangToggle = !sunMonthLangToggle;

      if (!sunStarted) {
        latex += `
\\renewcommand{\\SunA}{
\\SunListH{${headingB}\\ \\bnf{${year}}}
\\SunListSubH{${sunHeading}}
`.trim() + '\n';
        sunStarted = true;
      }

      sunCount++;

      if (sunCount === 27) {
        latex += `
}
\\renewcommand{\\SunB}[0]{%
\\SunListH{${headingA}\\ \\bnf{${year}}}
\\SunListSubH{${sunHeading}}
`.trim() + '\n';
      }

      if (refs === '') {

        // 🔁 RESET if book changes
        if (bookRaw !== lastSunBook) {
          sunBookLangToggle = true; // LangB starts
          lastSunBook = bookRaw;
        }

        const bookOut = sunBookLangToggle ? bookB : bookA;
        sunBookLangToggle = !sunBookLangToggle;

        latex += `\\SunChapter{${PlainNumberFontText(day)}}{${monthOut}}{${bookOut}}{${chapter}}\n`;

      } else {
        latex += `\\SunTopic{${PlainNumberFontText(day)}}{${monthOut}}{${topicA}}{${topicB}}{${refs}}\n`;
      }
    }

    /* ===== WEDNESDAY ===== */
    if (dayOfWeek === 3) {

      if (month !== lastWedMonth) {
        wedMonthLangToggle = true; // LangB starts
        lastWedMonth = month;
      }

      const monthOut = wedMonthLangToggle ? monthB : monthA;
      wedMonthLangToggle = !wedMonthLangToggle;

      if (!wedStarted) {
        latex += `
}
\\renewcommand{\\WedA}{
\\WedListH{${headingA}\\ \\bnf{${year}}}
\\WedListSubH{${wedHeading}}
`.trim() + '\n';
        wedStarted = true;
      }

      wedCount++;

      if (wedCount === 27) {
        latex += `
}
\\renewcommand{\\EndNoteWedA}{\\btf{${endNoteWedA}}}
\\renewcommand{\\WedB}[0]{%
\\WedListH{${headingB}\\ \\bnf{${year}}}
\\WedListSubH{${wedHeading}}
`.trim() + '\n';
      }

      if (refs === '') {

        // 🔁 RESET if book changes
        if (bookRaw !== lastWedBook) {
          wedBookLangToggle = true; // LangB starts
          lastWedBook = bookRaw;
        }

        const bookOut = wedBookLangToggle ? bookB : bookA;
        wedBookLangToggle = !wedBookLangToggle;

        latex += `\\WedChapter{${PlainNumberFontText(day)}}{${monthOut}}{${bookOut}}{${chapter}}{${topicA}}{${topicB}}\n`;

      } else {
        latex += `\\WedTopic{${PlainNumberFontText(day)}}{${monthOut}}{${topicA}}{${topicB}}{${refs}}\n`;
      }
    }

  });


  // ===== DOCUMENT FOOTER =====
  if (!largePrint) {
    latex += `
}
\\renewcommand{\\EndNoteWedB}{\\btf{${endNoteWedB}}}
\\LargePage
\\renewcommand{\\WedWidth}[0]{106mm}
\\renewcommand{\\SunWidth}[0]{80mm}
%\\debug
\\StartOutput
\\TwoPageTwisted
\\EndOutput
`.trim() + '\n';
  }
  else {
    latex += `
}
\\renewcommand{\\EndNoteWedB}{\\btf{${endNoteWedB}}}
\\SmallPage
\\renewcommand{\\WedWidth}[0]{143.1mm}
\\renewcommand{\\SunWidth}[0]{108mm}
%\\debug
\\StartOutput
\\TwoPageLarge
\\EndOutput
`.trim() + '\n';

  }
  const folder = DriveApp.getFolderById(aLatexFolder);

  const langNames = tValues[0].map(v => v.toString().trim());

  const langAName = langNames[langA] || `Lang${langA}`;
  const langBName =
    bilingual ? (langNames[langB] || `Lang${langB}`) : null;

  const largeSuffix = largePrint ? "_Large" : "";

  const outFileName =
    bilingual
      ? `${year}BR_${langAName}_${langBName}${largeSuffix}.tex`
      : `${year}BR_${langAName}${largeSuffix}.tex`;

  const files = folder.getFilesByName(outFileName);

  latex = `\\begin{filecontents*}{${aStyleFileName}}
${aStyleFile}
\\end{filecontents*}
${latex}`;

  if (files.hasNext()) {
    files.next().setContent(latex);
  } else {
    folder.createFile(outFileName, latex, MimeType.PLAIN_TEXT);
  }

  Logger.log(`${outFileName} written successfully`);
}

/* ===== EVERYTHING BELOW IS UNCHANGED ===== */
/* (helpers, reference parsing, LaTeX formatting, email logic, etc.) */
function TranslateReferenceBooks(refsText, translationMap) {
  if (!refsText) return '';

  return refsText
    .split(';')
    .map(part => {
      part = part.trim();
      if (!part) return '';

      // Split first space → book | rest
      const firstSpace = part.indexOf(' ');
      if (firstSpace === -1) return part;

      const book = part.substring(0, firstSpace).trim();
      const rest = part.substring(firstSpace + 1).trim();

      const translatedBook =
        translationMap[book] || book;

      return translatedBook + '~' + rest;
    })
    .join('; ');
}

/*==== LATEX HELPERS ====*/
function UnbreakableRefs(srcText) {
  // srcText = srcText.replace("\\textendash ", "<EnDash>");
  // srcText = srcText.replace(";\ ", "<Break>");
  // srcText = srcText.replace("\\ ", "~");
  // srcText = srcText.replace("<Break>", ";\ ");
  // srcText = srcText.replace("<EnDash>", "\\textendash ");
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

function PlainNumberFontText(srcText) {
  if (applyNumFont)
    return NumberCommandText(srcText, "", "");
  else
    return NumberCommandText(srcText, "\\nf", "");
}

function isDigit(ch) { return /^[0-9]$/.test(ch); }
function isNumeric(value) { return !isNaN(value - parseFloat(value)); }

function ConvertToLatexText(srcText) {
  const replacements = {
    //"\\": "\\textbackslash ",
    " ": "\\ ",
    [String.fromCharCode(145)]: "\\lq ",
    [String.fromCharCode(146)]: "\\rq ",
    [String.fromCharCode(147)]: "``",
    [String.fromCharCode(148)]: "''",
    //    [String.fromCharCode(150)]: "\\textendash ",
    //    [String.fromCharCode(151)]: "\\textemdash ",
    [String.fromCharCode(160)]: " ",
    "-": "\\textendash ",
    "#": "\\#",
    "$": "\\$",
    "%": "\\%",
    "&": "\\&",
    "_": "\\_",
    "{[": "",
    "]}": "",
    // "{": "\\ulineB{",
    // "~": "\\~",
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
  //latexText = latexText.replace("\\textendash ", "\\nobreakrefrange ");
  latexText = PlainNumberFontText(latexText);
  return latexText;
}

function PrepareLatexText(srcText) { return PlainNumberFontText(ConvertToLatexText(srcText)); }
function PrepareBoldLatexText(srcText) { return BoldNumberFontText(ConvertToLatexText(srcText)); }

/**
 * Builds BibleReadings.tex in memory and emails it
 * together with all files in /WorkingFiles/Bible Readings/Latex/
 */
function emailBibleReadings() {
  const SHEET_ID = SheetID;
  const OUTPUT_SHEET = 'Output';
  const RANGE = 'A1:A200';

  const EMAIL_TO = 'devfldinfo@gmail.com';
  const SUBJECT = 'Bible Readings';
  const BODY = '';

  //  const LATEX_FOLDER_PATH = '/WorkingFiles/Bible Readings/Latex/';
  const LATEX_FOLDER_PATH = '';
  const latexfolderid = "1y8qwfeOtjauaFiKNL-l3VoYUTKca6Q-a";
  const TEX_FILENAME = 'BibleReadings.tex';

  // --- Build BibleReadings.tex (in memory) ---
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(OUTPUT_SHEET);
  if (!sheet) {
    throw new Error(`Sheet not found: ${OUTPUT_SHEET}`);
  }

  const values = sheet.getRange(RANGE).getValues();
  const texContent = values
    .flat()
    .filter(v => v !== '' && v !== null)
    .join('\n');

  const texBlob = Utilities.newBlob(
    texContent,
    'application/x-tex',
    TEX_FILENAME
  );

  // --- Collect Drive attachments ---
  const latexFolder = DriveApp.getFolderById(latexfolderid);
  const attachments = [texBlob];

  const files = latexFolder.getFiles();
  while (files.hasNext()) {
    attachments.push(files.next().getBlob());
  }

  // --- Send email ---
  GmailApp.sendEmail(
    EMAIL_TO,
    SUBJECT,
    BODY,
    { attachments }
  );
}

/**
 * Resolves an existing Drive folder by path.
 * Throws if any segment is missing.
 */
function getFolderByPath_(path) {
  const parts = path.split('/').filter(Boolean);
  let folder = DriveApp.getRootFolder();

  for (const name of parts) {
    const it = folder.getFoldersByName(name);
    if (!it.hasNext()) {
      throw new Error(`Folder not found: ${name}`);
    }
    folder = it.next();
  }

  return folder;
}


function gregorianToEthiopian(day, month, year) {
  // Create the Gregorian date in UTC to avoid timezone shifting
  var A51 = Math.floor(
    Date.UTC(year, month - 1, day) / 86400000
  ) + 25569;

  var x = A51 - 2812;

  var leapCorrection =
    Math.floor(Math.floor(x / 366) / 4);

  var dayOfYear =
    x - (
      Math.floor(x / 366) * 365 +
      leapCorrection
    );

  var leapYear =
    Math.floor(x / 365) % 4 === 0;

  // Ethiopian day
  var ethDay;

  if (dayOfYear >= 365) {
    ethDay =
      (
        29 +
        (dayOfYear % 30) +
        1 -
        5 -
        (leapYear ? 1 : 0)
      ) % 30 + 1;
  } else {
    ethDay = (dayOfYear % 30) + 1;
  }

  // Ethiopian month
  var ethMonth;

  if (
    dayOfYear > 359 &&
    dayOfYear < 365 + (leapYear ? 1 : 0)
  ) {
    ethMonth = 13;

  } else if (
    dayOfYear > 365 + (leapYear ? 1 : 0)
  ) {
    ethMonth =
      Math.floor(
        (
          dayOfYear -
          365 -
          (leapYear ? 1 : 0)
        ) / 30
      ) + 1;

  } else {
    ethMonth =
      Math.floor(dayOfYear / 30) + 1;
  }

  // Ethiopian year
  var ethYear =
    1900 +
    Math.floor(
      (A51 - 2812 - leapCorrection) / 365
    );

 return {
    day: ethDay,
    month: ethMonth,
    year: ethYear
  };
 
}



function gregorianToEthiopian1(day, month, year) {
  // Create dates in UTC to avoid daylight-saving/timezone effects.
  var date = new Date(Date.UTC(year, month - 1, day));

  // Ethiopian New Year is:
  // September 11 normally
  // September 12 when the following Gregorian year is a leap year.
  var newYearDay = isGregorianLeapYear_(year + 1) ? 12 : 11;
  var newYear = new Date(Date.UTC(year, 8, newYearDay));

  var ethYear;

  // Date is in the Ethiopian year that starts in this Gregorian year
  if (date >= newYear) {
    ethYear = year - 7;
  } else {
    // Date is in the Ethiopian year that started in the previous
    // Gregorian year.
    ethYear = year - 8;

    newYearDay = isGregorianLeapYear_(year) ? 12 : 11;
    newYear = new Date(Date.UTC(year - 1, 8, newYearDay));
  }

  // Number of days since 1 Meskerem
  var daysSinceNewYear =
    Math.floor((date - newYear) / 86400000);

  var ethMonth;
  var ethDay;

  if (daysSinceNewYear < 360) {
    // Months 1–12: 30 days each
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  } else {
    // Month 13: Pagume
    ethMonth = 13;
    ethDay = daysSinceNewYear - 360 + 1;
  }

  return {
    day: ethDay,
    month: ethMonth,
    year: ethYear
  };
}


function isGregorianLeapYear_(year) {
  return year % 4 === 0 &&
         (year % 100 !== 0 || year % 400 === 0);
}

function getMonthName(monthNumber) {
  return Utilities.formatDate(
    new Date(2000, monthNumber - 1, 1),
    Session.getScriptTimeZone(),
    'MMM'
  );
}

function getFilenameWithoutExtension(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}
