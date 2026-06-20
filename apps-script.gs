// ==========================================
// ARIANA SKY REVIEWS - GOOGLE APPS SCRIPT
// Deploy as Web App (Execute as: Me, Access: Anyone)
// ==========================================

const SHEET_NAME = 'Sheet1';

// Handle ALL requests including OPTIONS (CORS preflight)
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function doOptions(e) {
  var output = ContentService.createTextOutput('');
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  });
  return output;
}

function handleRequest(e) {
  var action = e.parameter.action;

  try {
    var result;

    if (e.postData && e.postData.contents) {
      var postData = JSON.parse(e.postData.contents);

      if (action === 'addComment') {
        result = addComment(postData.name, postData.text);
      } else if (action === 'deleteComment') {
        deleteComment(postData.id);
        result = { success: true };
      } else if (action === 'editComment') {
        editComment(postData.id, postData.text);
        result = { success: true };
      }
    } else if (action === 'getComments') {
      result = { success: true, comments: getAllComments() };
    } else {
      result = { success: false, error: 'Invalid action' };
    }

    return createResponse(result);

  } catch (err) {
    return createResponse({ success: false, error: err.toString() });
  }
}

function createResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  return output;
}

function getAllComments() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var comments = [];
  for (var i = 1; i < data.length; i++) {
    comments.push({
      timestamp: data[i][0],
      name: data[i][1],
      text: data[i][2],
      id: data[i][3]
    });
  }

  comments.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return comments;
}

function addComment(name, text) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var id = Utilities.getUuid();
  var timestamp = new Date().toISOString();

  sheet.appendRow([timestamp, name, text, id]);

  return { timestamp: timestamp, name: name, text: text, id: id };
}

function deleteComment(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function editComment(id, newText) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === id) {
      sheet.getRange(i + 1, 3).setValue(newText);
      return;
    }
  }
}
