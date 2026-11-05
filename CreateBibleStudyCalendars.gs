const aVersion = "1.5";
var CALENDAR_DESCRIPTION_MAX_LENGTH = 8192;

// Text added when scripture has to be truncated.
var SCRIPTURE_TRUNCATED_MESSAGE =
  '[Bible text exceeded the calendar entry limit. Remaining Scripture omitted.]';

/* =========================================================
   MAIN FUNCTIONS
   ========================================================= */

function testCreateAll() {
  CreateAll('1b8V2JQnOESejd8Qm8ISbksHSdHv7JcTAo36IR_I4tw4');
}

function CreateAll(sheetId) {

  if (!sheetId)
    throw new Error('No sheet id specified');

  var ss = SpreadsheetApp.openById(sheetId);

  // Shared state for reference continuation and error reporting.
  // Initialized once per CreateAll execution to preserve the original
  // global-variable lifetime and behaviour.
  var context = {
    prevChapter: ' ',
    oldChapter: ' ',
    currentSubject: ''
  };

  // Read the source data.
  var Sunsheet = ss.getSheetByName('English');
  var Sundata = Sunsheet.getRange('A2:E54').getValues();

  var Wedsheet = ss.getSheetByName('English');
  var Weddata = Wedsheet.getRange('A55:E107').getValues();

  var Subsheet = ss.getSheetByName('Translations');
  var Subdata = Subsheet.getRange('A1:K350').getValues();

  var Bibsheet = ss.getSheetByName('Calendars');
  var Bibdata = Bibsheet.getRange('A2:E20').getValues();

  var Numsheet = ss.getSheetByName('BookNumbers');
  var Numdata = Numsheet.getRange('A1:F70').getValues();

  // Build translation and book lookup tables once.
  var indexes = BuildLookupIndexes(Subdata, Numdata);

  // Process each calendar.
  for (var ii = 0; ii < Bibdata.length - 1; ++ii) {

    var row = Bibdata[ii];

    var tmpBib = row[0];

    if (tmpBib.length == 0)
      continue;

    var tmpMustCreate = row[3];
    var tmpCW = row[4];

    if (tmpMustCreate.length == 0 && tmpCW.length == 0)
      continue;

    var tmpCal = row[1];
    var tmpLang = row[2];

    // Locate the source spreadsheet.
    var Scripts = DriveApp.getFilesByName(tmpBib);

    if (!Scripts.hasNext())
      continue;

    var Script = Scripts.next();
    var aScript = SpreadsheetApp.open(Script);
    var aScriptSheet = aScript.getSheets()[0];

    // Read scripture data once.
    var Scriptdata = aScriptSheet.getRange('A2:D31103').getValues();

    // Build a book/chapter index for this scripture spreadsheet.
    indexes.scriptureByBookAndChapter = BuildScriptureIndex(Scriptdata);

    var aCal = CalendarApp.getCalendarById(tmpCal);

    // Create Sunday entries.
    if (tmpMustCreate.length > 0) {

      CreateCalendarEntries(
        Sundata,
        aCal,
        Subdata,
        Scriptdata,
        Numdata,
        tmpLang,
        indexes,
        context
      );

      Bibsheet.getRange('D' + (ii + 2)).setValue('');
    }

    // Create Wednesday entries.
    if (tmpCW.length > 0) {

      CreateCalendarEntries(
        Weddata,
        aCal,
        Subdata,
        Scriptdata,
        Numdata,
        tmpLang,
        indexes,
        context
      );

      Bibsheet.getRange('E' + (ii + 2)).setValue('');
    }
  }
}


/* =========================================================
   INDEX BUILDING
   ========================================================= */

/**
 * Builds lookup tables for translations and book numbers.
 *
 * These tables replace repeated searches through the same
 * spreadsheet data.
 */
function BuildLookupIndexes(Subdata, Numdata) {

  var indexes = {

    topicRowByName: new Map(),
    topicColumnByLanguage: new Map(),

    bookRowByName: new Map(),
    bookColumnByLanguage: new Map(),

    bookNameByAbbreviation: new Map(),
    bookNumberByAbbreviation: new Map(),
    bookNumberByName: new Map(),

    scriptureByBookAndChapter: null

  };

  // Topic rows.
  for (var i = 0; i < Subdata.length; ++i) {

    var topic = Subdata[i][0];

    try {
      topic = topic.trim();
    }
    catch (e) { }

    // Preserve the first matching row.
    if (!indexes.topicRowByName.has(topic))
      indexes.topicRowByName.set(topic, i);
  }

  // Topic language columns (columns A:O in the original logic).
  var topicHeaders = Subdata[0];

  for (var i = 0; i < 15; ++i) {

    var language = topicHeaders[i];

    if (!indexes.topicColumnByLanguage.has(language))
      indexes.topicColumnByLanguage.set(language, i);
  }

  // Book rows.
  for (var i = 0; i < Subdata.length; ++i) {

    var book = Subdata[i][0];

    if (!indexes.bookRowByName.has(book))
      indexes.bookRowByName.set(book, i);
  }

  // Book language columns (columns B:Q in the original logic).
  var bookHeaders = Subdata[0];

  for (var i = 1; i < 17; ++i) {

    var language = bookHeaders[i];

    if (!indexes.bookColumnByLanguage.has(language))
      indexes.bookColumnByLanguage.set(language, i);
  }

  // Book number and abbreviation lookup tables.
  for (var i = 0; i < Numdata.length; ++i) {

    var row = Numdata[i];

    // GetBookNumber originally searches only the first 68 rows.
    if (i < 68) {

      var bookName = row[1];

      if (!indexes.bookNumberByName.has(bookName))
        indexes.bookNumberByName.set(bookName, row[0]);
    }

    // FindBookNumberFromAbr searches the first six columns.
    for (var ii = 0; ii < 6; ++ii) {

      var abbreviation = row[ii];

      if (!indexes.bookNumberByAbbreviation.has(abbreviation))
        indexes.bookNumberByAbbreviation.set(abbreviation, row[0]);
    }

    // FindBookNameFromAbr searches every column in the row.
    for (var ii = 0; ii < row.length; ++ii) {

      var abbreviation = row[ii];

      if (!indexes.bookNameByAbbreviation.has(abbreviation))
        indexes.bookNameByAbbreviation.set(abbreviation, row[1]);
    }
  }

  return indexes;
}


/**
 * Indexes scripture rows by book number and chapter.
 *
 * The original code scanned all scripture rows for every
 * chapter lookup. This allows us to retrieve only the
 * rows belonging to the required book and chapter.
 */
function BuildScriptureIndex(Scriptdata) {

  var index = new Map();

  for (var i = 0; i < Scriptdata.length; ++i) {

    var row = Scriptdata[i];

    var book = row[0];
    var chapter = row[1];

    if (!index.has(book))
      index.set(book, new Map());

    var chapters = index.get(book);

    if (!chapters.has(chapter))
      chapters.set(chapter, []);

    chapters.get(chapter).push(row);
  }

  return index;
}


/* =========================================================
   CALENDAR ENTRIES
   ========================================================= */

function CreateCalendarEntries(
  Caldata,
  aCal,
  Subdata,
  Scriptdata,
  Numdata,
  tmpLang,
  indexes,
  context
) {

  context.currentSubject = '';

  for (var i = 0; i < Caldata.length; ++i) {

    var row = Caldata[i];

    var tmpDate = row[0];

    if (tmpDate.length == 0)
      continue;

    var aDate = new Date(tmpDate);

    var tmpTopic = row[1];
    var tmpRef = row[2];
    var tmpBook = row[3];
    var tmpChapter = row[4];

    context.currentSubject =
      tmpDate + ' - ' +
      tmpTopic + ' - ' +
      tmpRef + ' - ' +
      tmpBook + ' - ' +
      tmpChapter;

    // Delete existing events for the date.
    var events = aCal.getEventsForDay(aDate);

    for (var iii = 0; iii < events.length; ++iii) {
      events[iii].deleteEvent();
    }

    // Translate the topic, book and reference.
    var tmpTranslatedTopic =
      GetTranslatedTopic(Subdata, tmpLang, tmpTopic, indexes);

    var tmpTranslatedBook =
      GetTranslatedBook(Subdata, tmpLang, tmpBook, 1, Numdata, indexes);

    var tmpTranslatedRef =
      GetTranslatedRef(Subdata, tmpLang, tmpRef);

    // Prepare event heading.
    var tmpHeadingBook = tmpTranslatedBook;
    var tmpHeadingTopic = tmpTopic;
    var tmpHeadingTranslatedRef = tmpTranslatedRef;

    if (tmpHeadingBook != '' && tmpTopic != '')
      tmpHeadingBook = tmpHeadingBook + ' ' + tmpChapter + ' - ';
    else
      tmpHeadingBook = tmpHeadingBook + ' ' + tmpChapter;

    if (tmpTopic == tmpTranslatedTopic)
      tmpHeadingTopic = tmpTopic;
    else if (tmpTopic != '')
      tmpHeadingTopic = tmpTranslatedTopic + ' / ' + tmpHeadingTopic;
    else
      tmpHeadingTopic = '';

    if (tmpTranslatedRef != '')
      tmpHeadingTranslatedRef = ' (' + tmpTranslatedRef + ')';
    else
      tmpHeadingTranslatedRef = '';

    var eventTitle =
      'Meeting: ' +
      tmpHeadingBook +
      tmpHeadingTopic +
      tmpHeadingTranslatedRef;

    // Create the calendar event.
    var aEntry = aCal.createAllDayEvent(eventTitle, aDate);

    // Retrieve the scripture.
    var aScripture = GetScripture(
      Scriptdata,
      Numdata,
      tmpBook,
      tmpChapter,
      tmpRef,
      tmpTranslatedBook,
      Subdata,
      tmpLang,
      indexes,
      context
    );

    // Append creation date.
    var tmpDateTime =
      'Created on: ' +
      Utilities.formatDate(
        new Date(),
        'GMT+2',
        'yyyy-MM-dd HH:mm:ss'
      ) + ' Version: ' + aVersion;

    // Fit the scripture into the calendar description limit.
    // The footer is always preserved.
    aScripture = FitScriptureToCalendarLimit(
      aScripture,
      tmpDateTime
    );

    //    aScripture = aScripture.replace(/\n+$/, '');
    //    aScripture = aScripture + '\n\n' + tmpDateTime;

    aEntry.setDescription(aScripture);
  }
}


/* =========================================================
   TRANSLATIONS
   ========================================================= */

function GetTranslatedTopic(aData, aLang, aTopic, indexes) {

  aTopic = aTopic.trim();

  if (aTopic.length == 0)
    return aTopic;

  var aBookRow = -1;
  var aBookCol = -1;

  if (indexes) {

    if (!indexes.topicRowByName.has(aTopic))
      return aTopic;

    aBookRow = indexes.topicRowByName.get(aTopic);

    if (!indexes.topicColumnByLanguage.has(aLang))
      return aTopic;

    aBookCol = indexes.topicColumnByLanguage.get(aLang);

  }
  else {

    // Original lookup logic retained for compatibility.
    for (var i = 0; i < aData.length; ++i) {

      var tmpBook = aData[i][0];

      try {
        tmpBook = tmpBook.trim();
      }
      catch (e) { }

      if (aTopic == tmpBook) {
        aBookRow = i;
        break;
      }
    }

    if (aBookRow == -1)
      return aTopic;

    var row = aData[0];

    for (var i = 0; i < 15; ++i) {

      if (row[i] == aLang) {
        aBookCol = i;
        break;
      }
    }

    if (aBookCol == -1)
      return aTopic;
  }

  return aData[aBookRow][aBookCol];
}


function GetTranslatedBook(
  aData,
  aLang,
  aBook,
  aRetry,
  aNumdata,
  indexes
) {

  if (aBook.length == 0)
    return aBook;

  var aBookRow = -1;
  var aBookCol = -1;

  if (indexes) {

    if (indexes.bookRowByName.has(aBook))
      aBookRow = indexes.bookRowByName.get(aBook);

  }
  else {

    for (var i = 0; i < aData.length; ++i) {

      if (aBook == aData[i][0]) {
        aBookRow = i;
        break;
      }
    }
  }

  if (aBookRow == -1) {

    if (aRetry > 1)
      return aBook;

    aBook = FindBookNameFromAbr(aBook, aNumdata, indexes);

    return GetTranslatedBook(
      aData,
      aLang,
      aBook,
      2,
      aNumdata,
      indexes
    );
  }

  if (indexes) {

    if (!indexes.bookColumnByLanguage.has(aLang))
      return aBook;

    aBookCol = indexes.bookColumnByLanguage.get(aLang);

  }
  else {

    var row = aData[0];

    for (var i = 1; i < 17; ++i) {

      if (row[i] == aLang) {
        aBookCol = i;
        break;
      }
    }

    if (aBookCol == -1)
      return aBook;
  }

  return aData[aBookRow][aBookCol];
}


function GetTranslatedRef(aData, aLang, aRef) {
  return aRef;
}


/* =========================================================
   SCRIPTURE RETRIEVAL
   ========================================================= */

function GetScripture(
  aScriptdata,
  aNumdata,
  aBook,
  aChapter,
  aRef,
  tmpTranslatedBook,
  Subdata,
  tmpLang,
  indexes,
  context
) {

  var tmpScripture = '';

  var a = ' ';
  a = a + aChapter;

  if (aBook.length != 0 && aChapter.length != 0) {

    if (a.indexOf('&') > -1) {

      var tmpChapters = Utilities.parseCsv(a, '&')[0];

      for (var i = 0; i < tmpChapters.length; ++i) {

        var tmpChapter = tmpChapters[i].trim();

        if (tmpScripture != '')
          tmpScripture = tmpScripture + '\n\n';

        tmpScripture += GetChapterScripture(
          aScriptdata,
          aNumdata,
          aBook,
          tmpChapter,
          -1,
          tmpTranslatedBook,
          indexes,
          context
        );
      }
    }

    else if (a.indexOf('-') > -1) {

      var tmpChapters = Utilities.parseCsv(a, '-')[0];

      var sc = tmpChapters[0].trim();
      var sv = 1;

      if (sc.indexOf(':') > -1) {

        sv = sc.substring(sc.indexOf(':') + 1, 999).trim();
        sc = sc.substring(0, sc.indexOf(':')).trim();
      }

      var ec = tmpChapters[1].trim();
      var ev = 999;

      if (ec.indexOf(':') > -1) {

        ev = ec.substring(ec.indexOf(':') + 1, 999).trim();
        ec = ec.substring(0, ec.indexOf(':')).trim();

      }
      else {

        ev = ec;
        ec = -1;
      }

      /*
       * Important:
       * The original code used:
       *
       *     if (ec = -1)
       *
       * This assigns -1 instead of comparing it.
       * Consequently, the original code always retrieves
       * the specified verses from the starting chapter.
       *
       * The behavior is intentionally retained here so
       * existing scripture descriptions do not change.
       */

      ec = -1;

      if (ec == -1) {

        tmpScripture = GetChapterScripture(
          aScriptdata,
          aNumdata,
          aBook,
          sc,
          sv + '-' + ev,
          tmpTranslatedBook,
          indexes,
          context
        );
      }

    }

    else {

      tmpScripture = GetChapterScripture(
        aScriptdata,
        aNumdata,
        aBook,
        aChapter,
        -1,
        tmpTranslatedBook,
        indexes,
        context
      );
    }
  }

  else if (aRef.length != 0) {

    tmpScripture = GetRefScripture(
      aScriptdata,
      aNumdata,
      aRef,
      Subdata,
      tmpLang,
      indexes,
      context
    );
  }

  return tmpScripture;
}

function GetRefScripture(
  aScriptdata,
  aNumdata,
  aRef,
  Subdata,
  tmpLang,
  indexes,
  context
) {

  var tmpScripture = '';

  try {

    aRef = aRef.replace(/\n/g, '');

    // Semicolons separate references.
    // Commas separate verses within the same chapter.
    var tmpRefs = Utilities.parseCsv(aRef, ';')[0];

    for (var i = 0; i < tmpRefs.length; ++i) {

      var tmpRef = tmpRefs[i].trim();

      var tmprefverscript = GetRefVerseScripture(
        aScriptdata,
        aNumdata,
        tmpRef,
        Subdata,
        tmpLang,
        indexes,
        context
      );

      // Add a blank line before each subsequent reference.
      if (tmpScripture != '')
        tmpScripture += '\n';

      tmpScripture += tmprefverscript + '\n';
    }
  }

  catch (e) {

    tmpScripture = 'Could not parse references. ' + aRef;

    MailApp.sendEmail({
      to: 'devfldinfo@gmail.com',
      subject: 'Error Creating Bible reading Entry ' + tmpLang,
      htmlBody: aRef
    });
  }

  return tmpScripture;
}

function GetRefScriptureold(
  aScriptdata,
  aNumdata,
  aRef,
  Subdata,
  tmpLang,
  indexes,
  context
) {

  var tmpScripture = '';

  try {

    aRef = aRef.replace(/\n/g, '');

    var tmpRefs = Utilities.parseCsv(aRef, ';')[0];

    for (var i = 0; i < tmpRefs.length; ++i) {

      var tmpRef = tmpRefs[i].trim();

      var tmpRefs2 = Utilities.parseCsv(tmpRef, ',')[0];

      try {

        for (var ii = 0; ii < tmpRefs2.length; ++ii) {

          var tmpRef2 = tmpRefs2[ii].trim();

          var tmprefverscript = GetRefVerseScripture(
            aScriptdata,
            aNumdata,
            tmpRef2,
            Subdata,
            tmpLang,
            indexes,
            context
          );

          // Add a blank line before each subsequent reference.
          if (tmpScripture != '')
            tmpScripture += '\n';

          tmpScripture += tmprefverscript + '\n';
        }
      }
      catch (e) { }
    }
  }

  catch (e) {

    tmpScripture = 'Could not parse references. ' + aRef;

    MailApp.sendEmail({
      to: 'devfldinfo@gmail.com',
      subject: 'Error Creating Bible reading Entry ' + tmpLang,
      htmlBody: aRef
    });
  }

  return tmpScripture;
}


function GetRefVerseScripture(
  aScriptdata,
  aNumdata,
  tmpRef,
  Subdata,
  tmpLang,
  indexes,
  context
) {

  var tmpBookName = GetRefBookName(tmpRef, aNumdata, indexes);

  if (tmpBookName == '')
    tmpBookName = context.prevChapter;
  else
    context.prevChapter = tmpBookName;

  var tmpChapter = GetRefChapter(tmpRef);

  if (tmpChapter == '')
    tmpChapter = context.oldChapter;

  context.oldChapter = tmpChapter;

  var tmpVerses = GetRefVerses(tmpRef);

  var tmpTranslatedBook = GetTranslatedBook(
    Subdata,
    tmpLang,
    tmpBookName,
    1,
    aNumdata,
    indexes
  );

  return GetChapterScripture(
    aScriptdata,
    aNumdata,
    tmpBookName,
    tmpChapter,
    tmpVerses,
    tmpTranslatedBook,
    indexes,
    context
  );
}


/* =========================================================
   REFERENCE PARSING
   ========================================================= */

function GetRefVerses(tmpRef) {

  var tmpVerses =
    tmpRef.substring(tmpRef.indexOf(':') + 1, 999).trim();

  return tmpVerses;
}


function GetRefChapter(tmpRef) {

  var tmpChapter =
    tmpRef.substring(tmpRef.indexOf(' '), 999).trim();

  tmpChapter =
    tmpChapter.substring(0, tmpChapter.indexOf(':')).trim();

  return tmpChapter;
}


function GetRefBookName(tmpRef, aNumdata, indexes) {

  var tmpBookAbr =
    tmpRef.substring(0, tmpRef.indexOf(' ')).trim();

  if (tmpBookAbr == '')
    return '';

  return FindBookNameFromAbr(tmpBookAbr, aNumdata, indexes);
}


function GetRefBookNumber(tmpRef, aNumdata, indexes) {

  var tmpBookAbr =
    tmpRef.substring(0, tmpRef.indexOf(' '));

  return FindBookNumberFromAbr(tmpBookAbr, aNumdata, indexes);
}


/* =========================================================
   BOOK LOOKUPS
   ========================================================= */

function FindBookNumberFromAbr(tmpBookAbr, aNumdata, indexes) {

  if (indexes) {

    if (indexes.bookNumberByAbbreviation.has(tmpBookAbr))
      return indexes.bookNumberByAbbreviation.get(tmpBookAbr);

    return '';
  }

  for (var i = 0; i < aNumdata.length; ++i) {

    var row = aNumdata[i];

    for (var ii = 0; ii < 6; ++ii) {

      if (tmpBookAbr == row[ii])
        return row[0];
    }
  }

  return '';
}


function FindBookNameFromAbr(tmpBookAbr, aNumdata, indexes) {

  if (indexes) {

    if (indexes.bookNameByAbbreviation.has(tmpBookAbr))
      return indexes.bookNameByAbbreviation.get(tmpBookAbr);

    return '';
  }

  for (var i = 0; i < aNumdata.length; ++i) {

    var row = aNumdata[i];

    for (var ii = 0; ii < row.length; ++ii) {

      if (tmpBookAbr == row[ii])
        return row[1];
    }
  }

  return '';
}


/* =========================================================
   CHAPTER SCRIPTURE
   ========================================================= */

function GetChapterScripture(
  aScriptdata,
  aNumdata,
  aBook,
  aChapter,
  aVerses,
  tmpTranslatedBook,
  indexes,
  context
) {

  var tmpScripture = tmpTranslatedBook + ' ' + aChapter;

  if (aBook.length == 0)
    return '';

  var tmpBookNumber = GetBookNumber(aNumdata, aBook, indexes);

  if (aChapter.length == 0)
    return '';

  var sometextfound = false;

  var rowsToScan = aScriptdata;

  // Retrieve the book using loose comparison.
  if (indexes && indexes.scriptureByBookAndChapter) {

    var chapters = GetMapValueLoose(
      indexes.scriptureByBookAndChapter,
      tmpBookNumber
    );

    if (chapters) {

      // Retrieve the chapter using loose comparison.
      var chapterRows = GetMapValueLoose(chapters, aChapter);

      rowsToScan = chapterRows || [];

    }
    else {
      rowsToScan = [];
    }
  }

  for (var i = 0; i < rowsToScan.length; ++i) {

    var row = rowsToScan[i];

    var tmpBook = row[0];

    if (tmpBook != tmpBookNumber)
      continue;

    var tmpChapter = row[1];

    if (tmpChapter != aChapter)
      continue;

    var tmpVerseNumber = row[2];

    // Remove source line breaks inside a verse while preserving word spacing.
    var tmpVerseScripture = String(row[3] || '')
      .replace(/\s*[\r\n]+\s*/g, ' ')
      .trim();

    if (IsInVerses(tmpVerseNumber, aVerses)) {

      tmpScripture =
        tmpScripture +
        '\n' +
        tmpVerseNumber +
        '. ' +
        tmpVerseScripture;
    }

    sometextfound = true;
  }

  if (!sometextfound) {

    MailApp.sendEmail({
      to: 'devfldinfo@gmail.com',
      subject: context.currentSubject + ' - Scripture not found ',
      htmlBody: '...'
    });
  }

  return tmpScripture;
}

/* =========================================================
   VERSE SELECTION
   ========================================================= */

function IsInVerses(tmpVerseNumber, aVerses) {

  var aStartVerse = -1;
  var aEndVerse = -1;

  if (aVerses == -1)
    return true;

  else if (tmpVerseNumber == aVerses)
    return true;

  else if (aVerses.indexOf('-') > -1) {

    aStartVerse =
      aVerses.substring(0, aVerses.indexOf('-'));

    aEndVerse =
      aVerses.substring(aVerses.indexOf('-') + 1, 9);

    if (
      tmpVerseNumber >= aStartVerse &&
      tmpVerseNumber <= aEndVerse
    )
      return true;
  }

  else if (aVerses.indexOf(',') > -1) {

    var atmpVerses = Utilities.parseCsv(aVerses, ',')[0];

    for (var i = 0; i < atmpVerses.length; ++i) {
      var tmpv = atmpVerses[i].trim();
      var tmpv2 = tmpVerseNumber;

      if (tmpv2 == tmpv)
        return true;
    }
  }

  return false;
}


/* =========================================================
   BOOK NUMBER
   ========================================================= */

function GetBookNumber(aNumdata, aBook, indexes) {

  if (indexes) {

    if (indexes.bookNumberByName.has(aBook))
      return indexes.bookNumberByName.get(aBook);

    return -1;
  }

  // Original search limit of 68 rows is retained.
  for (var i = 0; i < 68; ++i) {

    var row = aNumdata[i];

    var tmpNumber = row[0];
    var tmpBook = row[1];

    if (tmpBook == aBook)
      return tmpNumber;
  }

  return -1;
}

/**
 * Retrieves a Map value using the same loose comparison
 * behaviour as the original script.
 */
function GetMapValueLoose(aMap, aKey) {

  if (aMap.has(aKey))
    return aMap.get(aKey);

  for (var entry of aMap.entries()) {

    if (entry[0] == aKey)
      return entry[1];
  }

  return undefined;
}

function FitScriptureToCalendarLimit(scripture, footer) {

  var maxLength = CALENDAR_DESCRIPTION_MAX_LENGTH;

  // Remove trailing blank lines.
  scripture = scripture.replace(/\n+$/, '');

  // First check whether everything fits.
  var completeText = scripture + '\n\n' + footer;

  if (completeText.length <= maxLength)
    return completeText;

  // Reserve space for the truncation notice and footer.
  var suffix =
    '\n\n' +
    SCRIPTURE_TRUNCATED_MESSAGE +
    '\n\n' +
    footer;

  var availableLength = maxLength - suffix.length;

  if (availableLength <= 0)
    throw new Error('Calendar description limit is too small.');

  // Split scripture into lines.
  var lines = scripture.split('\n');

  var result = '';
  var previousLine = '';

  for (var i = 0; i < lines.length; ++i) {

    var line = lines[i];

    // Preserve blank lines and chapter headings.
    var candidate = result
      ? result + '\n' + line
      : line;

    // Never include a line that exceeds the available space.
    if (candidate.length > availableLength)
      break;

    result = candidate;
    previousLine = line;
  }

  // Remove trailing blank lines.
  result = result.replace(/\n+$/, '');

  // Append truncation notice and footer.
  return result + suffix;
}
