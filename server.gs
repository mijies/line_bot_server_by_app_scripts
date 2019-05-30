var LINE_ACCESS_TOKEN = ''; // Your own LINE Messaging API Token
var SPREAD_SHEET_ID = '';   // Your own spreadsheet ID

function doPost(e) {
  var reply_token= JSON.parse(e.postData.contents).events[0].replyToken;
  if (typeof reply_token === 'undefined') return;

  var user_id = JSON.parse(e.postData.contents).events[0].source.userId;
  
  // !! event type check to be implemented here
  // !! message type check to be implemented here
  var user_message = JSON.parse(e.postData.contents).events[0].message.text;
  
  var sess = new SessionOnSpreadSheet(user_id);
  var handler = sess.getHandler();
  handler.run(user_message, reply_token);
  sess.updateSession(user_message, handler.getNextHandlerName());
  
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}


function RepMsgObj(reply_token) {
  this.reply_token = reply_token;
  this.url  = 'https://api.line.me/v2/bot/message/reply';
  this.messages = [];
  
  this.appendMessage = function(type, text) {
    this.messages.push({
      'type': type,
      'text': text,
    });
  };
  
  this.reply = function(){
    UrlFetchApp.fetch(this.url, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
      },
      'method': 'post',
      'payload': JSON.stringify({
        'replyToken': this.reply_token,
        'messages': this.messages,
      }),
    });
  };
}


function SessionOnSpreadSheet(user_id) {
  this.user_id = user_id;
  this.hash_id = SessionOnSpreadSheet.prototype.hashUserId(user_id);
  this.row = this.hash_id % 200 + 1;
  this.col = Math.ceil(this.hash_id / 200) * 4 - 3; // every 4 colums
  this.handler_name;
  this.msgHistory = ["","",""];

  this.spreadsheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
  this.sheet = this.spreadsheet.getSheetByName('session');

  var id, tstamp, handler_name;
  while (true) {
    [id, tstamp, handler_name] = this.sheet.getRange(this.row, this.col, 1, 1).getValues()[0][0].split(";;;");  
    if (id == "" || id == this.user_id) break;
    this.row++; // Shift row by 1 if the address is used by another user
  }
  this.msgHistory = this.sheet.getRange(this.row, this.col + 1, 1, 3).getValues()[0];
  this.handler_name = handler_name ? handler_name : "TopMenuHandler"; // Keep track where user was in navigation
  
  // if (tstamp > new Date().getTime() - 1000*60*60*12) { // if last session is less than 12 hours ago
//   this.msgHistory = this.sheet.getRange(this.row, this.col + 1, 1, 3).getValues()[0];
  // }
//  this.msgHistory = this.msgHistory.filter(function(s){return s != ""});

  this.getHandler = function() {
    return new Handlers[this.handler_name]();
  };

  this.updateSession = function(msg, handler_name) {
    this.sheet.getRange(this.row, this.col, 1, 4).setValues(
      [
        [String(this.user_id) + ";;;" + String(new Date().getTime()) + ";;;" + handler_name]
        .concat(
          [msg].concat(this.msgHistory.slice(0, 2))
        )
      ]
    );
  }; 
  
}

SessionOnSpreadSheet.prototype.hashUserId = function(user_id) {
  var bytes = "";
  for (i=0; i<8; i++) bytes += user_id.charCodeAt(i);
  return bytes % 1000; 
};
