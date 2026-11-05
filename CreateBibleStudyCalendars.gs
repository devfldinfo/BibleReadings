var prevChapter = ' ';
var oldChapter = ' ';
var currentsubject = '';

function testCreateAll()
{
  SheetID = '1b8V2JQnOESejd8Qm8ISbksHSdHv7JcTAo36IR_I4tw4';
  CreateAll();
}

function CreateAll() {
  if (!SheetID)
    throw new Error("No sheet id specified");

  var ss = SpreadsheetApp.openById(SheetID);

  var Sunsheet = ss.getSheetByName('English');
  var SundataRange = Sunsheet.getRange("A2:E54");
  var Sundata = SundataRange.getValues();

  var Wedsheet = ss.getSheetByName('English');
  var WeddataRange = Wedsheet.getRange("A55:E107");
  var Weddata = WeddataRange.getValues();

  var Subsheet = ss.getSheetByName('Translations');
  var SubdataRange = Subsheet.getRange("a1:k350");
  var Subdata = SubdataRange.getValues();

  var Bibsheet = ss.getSheetByName('Calendars');
  var BibdataRange = Bibsheet.getRange("A2:E20");
  var Bibdata = BibdataRange.getValues();

  var Numsheet = ss.getSheetByName('BookNumbers');
  var NumdataRange = Numsheet.getRange("A1:F70");
  var Numdata = NumdataRange.getValues();

  for (var ii = 0; (ii < Bibdata.length - 1); ++ii) {

    var row = Bibdata[ii];

    var tmpBib = row[0];
    if (tmpBib.length == 0)
      continue;

    var tmpMustCreate = row[3];
    var tmpCW = row[4];
    if ((tmpMustCreate.length == 0) && (tmpCW.length == 0))
      continue;

    var tmpCal = row[1];
    var tmpLang = row[2];

    var Scripts = DriveApp.getFilesByName(tmpBib);

    if (Scripts.hasNext()) {
      var Script = Scripts.next();
      var aScript = SpreadsheetApp.open(Script);
      var AScriptSheets = aScript.getSheets();
      var aScriptSheet = AScriptSheets[0];
    }
    else
      continue;

    var ScriptdataRange = aScriptSheet.getRange("A2:D31103");
    var Scriptdata = ScriptdataRange.getValues();

    var aCal = CalendarApp.getCalendarById(tmpCal);
    if (tmpMustCreate.length > 0) {
      CreateCalendarEntries(Sundata, aCal, Subdata, Scriptdata, Numdata, tmpLang);
      var Mm = Bibsheet.getRange("D" + (ii + 2));
      var mmm = Mm.setValue("");
     // break;
    }

    if (tmpCW.length > 0) {
      CreateCalendarEntries(Weddata, aCal, Subdata, Scriptdata, Numdata, tmpLang);


      var MustCreateRange = Bibsheet.getRange("E" + (ii + 2));
      var MustCreatedata = MustCreateRange.setValue("");
    //  break;
    }
  }

}

function CreateCalendarEntries(Sundata, aCal, Subdata, Scriptdata, Numdata, tmpLang) {
  currentsubject = "";
  for (var i = 0; (i < Sundata.length); ++i) {


    var row = Sundata[i];
    var tmpDate = '';
    var tmpTopic = '';
    var tmpRef = '';
    var tmpBook = '';
    var tmpChapter = '';

    tmpDate = row[0];
    if (tmpDate.length == 0)
      continue;


    aDate = new Date(tmpDate);
    tmpTopic = row[1];
    tmpRef = row[2];
    tmpBook = row[3];
    tmpChapter = row[4];

    currentsubject = tmpDate + " - " + tmpTopic + " - " + tmpRef + " - " + tmpBook + " - " + tmpChapter;

    var e = aCal.getEventsForDay(aDate)
    for (var iii = 0; iii < e.length; ++iii) {
      e[iii].deleteEvent();
    }

    var tmpTranslatedTopic = GetTranslatedTopic(Subdata, tmpLang, tmpTopic);
    var tmpTranslatedBook = GetTranslatedBook(Subdata, tmpLang, tmpBook, 1, Numdata);
    var tmpTranslatedRef = GetTranslatedRef(Subdata, tmpLang, tmpRef);

    var tmpHeadingBook = tmpTranslatedBook;
    var tmpHeadingTopic = tmpTopic;
    var tmpHeadingTranslatedTopic = tmpTranslatedTopic;
    var tmpHeadingTranslatedRef = tmpTranslatedRef;


    if ((tmpHeadingBook != '') && (tmpTopic != ''))
      tmpHeadingBook = tmpHeadingBook + ' ' + tmpChapter + ' - ';
    else
      tmpHeadingBook = tmpHeadingBook + ' ' + tmpChapter;

    if (tmpTopic == tmpTranslatedTopic)
      tmpHeadingTopic = tmpTopic;
    else
      if (tmpTopic != '')
        tmpHeadingTopic = tmpTranslatedTopic + ' / ' + tmpHeadingTopic;
      else
        tmpHeadingTopic = '';

    if (tmpTranslatedRef != '')
      tmpHeadingTranslatedRef = ' (' + tmpTranslatedRef + ')';
    else
      tmpHeadingTranslatedRef = '';

    var aEntry = aCal.createAllDayEvent('Meeting: ' + tmpHeadingBook + tmpHeadingTopic + tmpHeadingTranslatedRef, aDate)

    var aScripture = GetScripture(Scriptdata, Numdata, tmpBook, tmpChapter, tmpRef, tmpTranslatedBook, Subdata, tmpLang);

    var tmpDateTime = "Created on: " + Utilities.formatDate(new Date(), "GMT+2", "yyyy-MM-dd   HH:mm:ss");
    aScripture = aScripture + '\n\n' + tmpDateTime;

    aEntry.setDescription(aScripture);
  }

}

function GetTranslatedTopic(aData, aLang, aTopic) {
  var aBookRow = -1;
  aTopic = aTopic.trim();

  if (aTopic.length == 0)
    return aTopic;

  for (var i = 0; i < aData.length; ++i) {

    var row = aData[i];

    var tmpBook = row[0];
    try {
      tmpBook = tmpBook.trim();
    }
    catch (e) { }

    aBookRow = -1;
    if (aTopic == tmpBook) {
      aBookRow = i;
      break;
    }
  }

  if (aBookRow == -1)
    return aTopic;

  var row = aData[0];
  for (var i = 0; i < 15; ++i) {

    var tmpLang = row[i];
    var aBookCol = -1;
    if (tmpLang == aLang) {
      aBookCol = i;
      break;
    }
  }
  if (aBookCol == -1)
    return aTopic;

  var row = aData[aBookRow];

  return row[aBookCol];

}

function GetTranslatedBook(aData, aLang, aBook, aRetry, aNumdata) {
  var aBookRow = -1;

  if (aBook.length == 0)
    return aBook;

  for (var i = 0; i < aData.length; ++i) {

    var row = aData[i];

    var tmpBook = row[0];
    aBookRow = -1;
    if (aBook == tmpBook) {
      aBookRow = i;
      break;
    }
  }

  if (aBookRow == -1) {
    if (aRetry > 1)
      return aBook
    else {
      aBook = FindBookNameFromAbr(aBook, aNumdata);
      return GetTranslatedBook(aData, aLang, aBook, 2, aNumdata);
    }
  }

  var row = aData[0];
  for (var i = 1; i < 17; ++i) {

    var tmpLang = row[i];
    var aBookCol = -1;
    if (tmpLang == aLang) {
      aBookCol = i;
      break;
    }
  }
  if (aBookCol == -1)
    return aBook;

  var row = aData[aBookRow];

  return row[aBookCol];

}

function GetTranslatedRef(aData, aLang, aRef) {
  return aRef

}

function GetScripture(aScriptdata, aNumdata, aBook, aChapter, aRef, tmpTranslatedBook, Subdata, tmpLang) {
  var tmpScripture = '';
  var a = " ";
  a = a + aChapter;
  if ((aBook.length != 0) && (aChapter.length != 0)) {
    if (a.indexOf('&') > -1) {
      var tmpChapters = Utilities.parseCsv(a, '&')[0];
      for (var i = 0; i < tmpChapters.length; ++i) {

        var tmpChapter = tmpChapters[i].trim();
        if (tmpScripture != '')
          tmpScripture = tmpScripture + '\n\n';
        tmpScripture = tmpScripture + GetChapterScripture(aScriptdata, aNumdata, aBook, tmpChapter, -1, tmpTranslatedBook);
      }
    }
    else
      if (a.indexOf('-') > -1) {
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
        if (ec = -1) {
          tmpScripture = GetChapterScripture(aScriptdata, aNumdata, aBook, sc, sv + '-' + ev, tmpTranslatedBook);

        }
        else {
          tmpScripture = GetChapterScripture(aScriptdata, aNumdata, aBook, sc, sv + '-999', tmpTranslatedBook);
          tmpScripture = tmpScripture + '\n\n' + GetChapterScripture(aScriptdata, aNumdata, aBook, ec, '1-' + ev, tmpTranslatedBook);
        }
      }
      else
        tmpScripture = GetChapterScripture(aScriptdata, aNumdata, aBook, aChapter, -1, tmpTranslatedBook);
  }
  else
    if (aRef.length != 0)
      tmpScripture = GetRefScripture(aScriptdata, aNumdata, aRef, Subdata, tmpLang);

  return tmpScripture;
}

function GetRefScripture(aScriptdata, aNumdata, aRef, Subdata, tmpLang) {
  var tmpScripture = '';
  try {

    aRef = aRef.replace(/\n/g, "");
    var tmpRefs = Utilities.parseCsv(aRef, ';')[0];
    for (var i = 0; i < tmpRefs.length; ++i) {

      var tmpRef = tmpRefs[i].trim();
      var tmpRefs2 = Utilities.parseCsv(tmpRef, ',')[0];
      try {
        for (var ii = 0; ii < tmpRefs2.length; ++ii) {

          var tmpRef2 = tmpRefs2[ii].trim();
          var tmprefverscript = GetRefVerseScripture(aScriptdata, aNumdata, tmpRef2, Subdata, tmpLang) + '\n\n';

          tmpScripture = tmpScripture + tmprefverscript;
        }
      }
      catch (e) { }
    }
  }
  catch (e) {
    tmpScripture = "Could not parse references. " + aRef;
    MailApp.sendEmail({
      to: "devfldinfo@gmail.com",
      subject: "Error Creating Bible reading Entry " + tmpLang,
      htmlBody: aRef
    }
    )


  }
  return tmpScripture;
}

function GetRefVerseScripture(aScriptdata, aNumdata, tmpRef, Subdata, tmpLang) {
  // var tmpBookNumber = GetRefBookNumber(tmpRef,aNumdata);
  var tmpBookName = GetRefBookName(tmpRef, aNumdata);

  if (tmpBookName == '')
    tmpBookName = prevChapter
  else
    prevChapter = tmpBookName;

  var tmpChapter = GetRefChapter(tmpRef);
  if (tmpChapter == '')
    tmpChapter = oldChapter;
  oldChapter = tmpChapter;

  var tmpVerses = GetRefVerses(tmpRef);
  var tmpTranslatedBook = GetTranslatedBook(Subdata, tmpLang, tmpBookName, 1, aNumdata);
  return GetChapterScripture(aScriptdata, aNumdata, tmpBookName, tmpChapter, tmpVerses, tmpTranslatedBook)


}

function GetRefVerses(tmpRef) {
  var tmpVerses = tmpRef.substring(tmpRef.indexOf(':') + 1, 999).trim();
  return tmpVerses;

}

function GetRefChapter(tmpRef) {
  var tmpChapter = tmpRef.substring(tmpRef.indexOf(' '), 999).trim();
  tmpChapter = tmpChapter.substring(0, tmpChapter.indexOf(':')).trim();
  return tmpChapter;

}

function GetRefBookName(tmpRef, aNumdata) {
  var tmpBookAbr = tmpRef.substring(0, tmpRef.indexOf(' ')).trim();
  if (tmpBookAbr == '')
    return '';
  else
    return FindBookNameFromAbr(tmpBookAbr, aNumdata);

}
function GetRefBookNumber(tmpRef, aNumdata) {
  var tmpBookAbr = tmpRef.substring(0, tmpRef.indexOf(' '));
  return FindBookNumberFromAbr(tmpBookAbr, aNumdata);

}

function FindBookNumberFromAbr(tmpBookAbr, aNumdata) {
  for (var i = 0; i < aNumdata.length; ++i) {

    var row = aNumdata[i];
    for (var ii = 0; ii < 6; ++ii) {
      if (tmpBookAbr == row[ii]) {
        return row[0];
        break;
      }
    }
  }
  return '';
}

function FindBookNameFromAbr(tmpBookAbr, aNumdata) {
  for (var i = 0; i < aNumdata.length; ++i) {

    var row = aNumdata[i];
    for (var ii = 0; ii < row.length; ++ii) {
      if (tmpBookAbr == row[ii]) {
        return row[1];
        break;
      }
    }
  }
  return '';
}

function GetChapterScripture(aScriptdata, aNumdata, aBook, aChapter, aVerses, tmpTranslatedBook) {
  var tmpScripture = tmpTranslatedBook + ' ' + aChapter;
  var tmpBookNumber = '';


  if (aBook.length > 0)
    var tmpBookNumber = GetBookNumber(aNumdata, aBook);
  else {


    return '';
  }

  if (aChapter.length == 0)
    return '';

  var sometextfound = false;

  for (var i = 0; i < aScriptdata.length; ++i) {

    var row = aScriptdata[i];

    var tmpBook = row[0];
    if (tmpBook != tmpBookNumber)
      continue;

    var tmpChapter = row[1];

    if (tmpChapter != aChapter)
      continue;

    var tmpVerseNumber = row[2];
    var tmpVerseScripture = row[3];

    if (IsInVerses(tmpVerseNumber, aVerses))
      tmpScripture = tmpScripture + '\n' + tmpVerseNumber + '. ' + tmpVerseScripture;
    sometextfound = true;

  }
  if (!sometextfound) {
    MailApp.sendEmail({
      to: "devfldinfo@gmail.com",
      subject: currentsubject + " - Scripture not found ",
      htmlBody: "..."
    });


  }

  return tmpScripture;
}

function IsInVerses(tmpVerseNumber, aVerses) {
  var aStartVerse = -1;
  var aEndVerse = -1;

  if (aVerses == -1)
    return true;
  else
    if (tmpVerseNumber == aVerses)
      return true;
    else
      if (aVerses.indexOf('-') > -1) {
        aStartVerse = aVerses.substring(0, aVerses.indexOf('-'));
        aEndVerse = aVerses.substring(aVerses.indexOf('-') + 1, 9);
        if ((tmpVerseNumber >= aStartVerse) && (tmpVerseNumber <= aEndVerse))
          return true;

      }
      else
        if (aVerses.indexOf(',') > -1) {
          var atmpVerses = Utilities.parseCsv(aVerses, ',')[0];
          for (var i = 0; i < atmpVerses.length; ++i) {
            var tmpv = ' ';
            var tmpv = atmpVerses[i];
            var tmpv2 = ' ';
            tmpv2 = tmpVerseNumber;
            if (tmpv2 == tmpv)
              return true;
          }
        }

  return false;
}

function GetBookNumber(aNumdata, aBook) {

  for (var i = 0; i < 68; ++i) {

    var row = aNumdata[i];

    var tmpNumber = row[0];
    var tmpBook = row[1];
    if (tmpBook == aBook)
      return tmpNumber;

  }


  return -1;
}

