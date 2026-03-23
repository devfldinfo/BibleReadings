//Version 1.6

function onOpen() {
  const ui = SpreadsheetApp.getUi(); // Get the spreadsheet UI
  ui.createMenu('Bible Readings')        // Name of your custom menu
    .addItem('Generate Bible Reading', 'markLanguageFromActiveTab') // Menu item + function
    .addItem('Generate Selected Bible Readings', 'generateSelectedBibleReadings') // Menu item + function
    .addItem('Generate All Bible Readings', 'generateAllBibleReadings') // Menu item + function
    .addItem('Get Alignment Images', 'callGetAlignmentImagesAPI') // Menu item + function
    .addToUi();
}

function markLanguageFromActiveTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet().getName();
  const listsSheet = ss.getSheetByName("Lists");

  const languageSheets = [
    "English",
    "Afrikaans",
    "Shona",
    "Xhosa",
    "Zulu",
    "EA Swahili",
    "Bemba",
    "Português",
    "IO French",
    "Amharic"
  ];

  const index = languageSheets.indexOf(activeSheet);

  if (index === -1) {
    SpreadsheetApp.getUi().alert("This tab is not a language sheet.");
    return;
  }

  const languageLetter = String.fromCharCode(65 + index); // A-K

  // Clear column I from row 2 down
  const lastRow = listsSheet.getLastRow();
  listsSheet.getRange(2, 9, lastRow - 1).clearContent();

  // Read column A to locate correct row
  const values = listsSheet.getRange(2, 1, lastRow - 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === languageLetter) {
      listsSheet.getRange(i + 2, 9).setValue("x");
      break;
    }
  }

  SpreadsheetApp.flush();

  callBibleReadingsAPI();
}

function generateAllBibleReadings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet().getName();
  const listsSheet = ss.getSheetByName("Lists");

  const lastRow = listsSheet.getLastRow();
  listsSheet.getRange(2, 9, lastRow - 1).setValue("x");

  SpreadsheetApp.flush();

  callBibleReadingsAPI();
}

function generateSelectedBibleReadings() {
  callBibleReadingsAPI();
}

function callBibleReadingsAPI() {
  const status = readStatus();

  if (status) {
    throw new Error("Service currently busy, please try again in 3 minutes");
  }

  setStatus("Busy processing..."); 
 
  try
  {
    const url = "https://script.google.com/macros/s/AKfycbw1lWaX34ho792GdxQdfz9bN1BeEzPYeX30zhZ2vNr-DQ4jplpWLeYEKoMadQT8L4lm/exec";

    const props = PropertiesService.getScriptProperties();
    const API_KEY = props.getProperty('API_KEY');

    const payload = {
      action: "generateBibleReadings",
      key: API_KEY   // optional security key if you implemented one
    };

    const options = {
      method: "post",
      payload: payload,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);

    Logger.log(response.getResponseCode());
    Logger.log(response.getContentText());
  }
  finally
  {
    setStatus("");
  }
}

function callGetAlignmentImagesAPI() {
    const url = "https://script.google.com/macros/s/AKfycbw1lWaX34ho792GdxQdfz9bN1BeEzPYeX30zhZ2vNr-DQ4jplpWLeYEKoMadQT8L4lm/exec";

    const props = PropertiesService.getScriptProperties();
    const API_KEY = props.getProperty('API_KEY');

    const payload = {
      action: "getAlignmentImages",
      key: API_KEY   // optional security key if you implemented one
    };

    const options = {
      method: "post",
      payload: payload,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);

    Logger.log(response.getResponseCode());
    Logger.log(response.getContentText());
}

function setStatus(value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  
  if (!sheet) {
    throw new Error('Sheet "Settings" not found.');
  }

  sheet.getRange("B3").setValue(value);

  SpreadsheetApp.flush();
}

function readStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  
  if (!sheet) {
    throw new Error('Sheet "Settings" not found.');
  }

  return sheet.getRange("B3").getValue();
}
