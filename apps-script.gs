// ==========================================
// ARIANA SKY REVIEWS - GOOGLE APPS SCRIPT
// Deploy as Web App (Execute as: Me, Access: Anyone)
// ==========================================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace after creating sheet
const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const action = e.parameter.action;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (action === 'getComments') {
      const comments = getAllComments();
      return jsonResponse({ success: true, comments }, headers);
    }

    return jsonResponse({ success: false, error: 'Invalid action' }, headers, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, headers, 500);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (action === 'addComment') {
      const result = addComment(data.name, data.text);
      return jsonResponse({ success: true, comment: result }, headers);
    }

    if (action === 'deleteComment') {
      deleteComment(data.id);
      return jsonResponse({ success: true }, headers);
    }

    if (action === 'editComment') {
      editComment(data.id, data.text);
      return jsonResponse({ success: true }, headers);
    }

    return jsonResponse({ success: false, error: 'Invalid action' }, headers, 400);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, headers, 500);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function getAllComments() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  const comments = [];
  // Skip header row (row 0)
  for (let i = 1; i < data.length; i++) {
    comments.push({
      timestamp: data[i][0],
      name: data[i][1],
      text: data[i][2],
      id: data[i][3]
    });
  }

  // Sort by timestamp descending (newest first)
  comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return comments;
}

function addComment(name, text) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();

  sheet.appendRow([timestamp, name, text, id]);

  return { timestamp, name, text, id };
}

function deleteComment(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function editComment(id, newText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === id) {
      sheet.getRange(i + 1, 3).setValue(newText); // Column C = text
      return;
    }
  }
}

function jsonResponse(data, headers, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  for (const key in headers) {
    output.setHeader(key, headers[key]);
  }

  return output;
}
