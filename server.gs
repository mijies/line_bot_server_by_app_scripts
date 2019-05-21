var LINE_ACCESS_TOKEN = ''; // Your own LINE Messaging API Token
var SPREAD_SHEET_ID = '';   // Your own spreadsheet ID

function doPost(e) {
  var reply_token= JSON.parse(e.postData.contents).events[0].replyToken;
  if (typeof reply_token === 'undefined') return;

  
  var user_id = JSON.parse(e.postData.contents).events[0].source.userId;
  var user_message = JSON.parse(e.postData.contents).events[0].message.text;
  replyHanndler(reply_token, user_id, user_message);
  
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}


function replyHanndler(reply_token, user_id, msg) {
  var sess = new SessionOnSpreadSheet(user_id, msg);

  var handleObj;
  if (msg === "トップメニュー"　|| msg === "1" || msg === "１") {
    handleObj = new MenuObj();
  } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
    handleObj = new HelpObj();
  } else {
    handleObj = new UnknownObj();
  }
  handleObj.run(new RepMsgObj(reply_token));

  sess.updateSession();
}


function RepMsgObj(reply_token) {
  this.reply_token = reply_token;
  this.url  = 'https://api.line.me/v2/bot/message/reply';
  this.messages = [];
  this.appendMessages = function(type, text) {
    this.messages.push({
      'type': type,
      'text': text,
    });
  };
  this.reply = function(reply_message){
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

var MenuObj =　function() {
  this.head = "キーまたはメニュー名を１つご入力の上、メッセージを送信ください。\nキー : メニュー名";
  this.menus = [
    "  1　:　トップメニュー",
    "  ?　:　ヘルプ"
  ];
  this.run = function(handle) {
    var repMsg = this.head;
    this.menus.forEach(function(x){repMsg += "\n" + x});
    handle.appendMessages('text', repMsg);
    handle.reply(repMsg);
  };
};

var HelpObj =　function() {
  this.head = "本チャットボットは階層的にメニュー一覧からご選択いただくことでご案内差し上げます。";
  
  this.run = function(handle) {
    var repMsg = this.head;
    handle.appendMessages('text', repMsg);
    repMsg　= "<メニューフォーマット>\nキー : メニュー名\n";
    repMsg += "\nキーまたはメニュー名を１つ選んでメッセージをご送信いただくことでご案内またはサブメニューへ進みます。";
    handle.appendMessages('text', repMsg);
    handle.reply(repMsg);
  };
};

var UnknownObj =　function() {
  this.head = "ご送信いただいた内容からご案内方法がわかりませんでした。";
  
  this.run = function(handle) {
    var repMsg = this.head;
    handle.appendMessages('text', repMsg);
    handle.reply(repMsg);
  };
};




function SessionOnSpreadSheet(user_id, msg) {
  this.user_id = user_id;
  this.hash_id = SessionOnSpreadSheet.prototype.hashUserId(user_id);
  this.row = this.hash_id % 200 + 1;
  this.col = Math.ceil(this.hash_id / 200) * 4 - 3; // every 4 colums
  this.msgHistory = ["","",""];

  this.spreadsheet = SpreadsheetApp.openById(SPREAD_SHEET_ID);
  this.sheet = this.spreadsheet.getSheetByName('session');

  var id, tstamp;
  while (true) {
    this.sheet.getRange(4, 1, 1, 2).setValues(  [[this.row, this.col]]  );
    [id, tstamp] = this.sheet.getRange(this.row, this.col, 1, 1).getValues()[0][0].split(";;;");  
    if (id == "" || id == this.user_id) break;
    this.row++; // Shift row by 1 if the address is used by another user
  }

  if (tstamp > new Date().getTime() - 1000*60*60*12) { // if last session is less than 12 hours ago
    this.msgHistory = this.sheet.getRange(this.row, this.col + 1, 1, 3).getValues()[0];
  }
  this.msgHistory = this.msgHistory.filter(function(s){return s != ""});
  this.msgHistory.push(msg);

  // Construct user query tree structure

  this.updateSession = function() {
    this.sheet.getRange(this.row, this.col, 1, 4).setValues(
      [
        [String(this.user_id) + ";;;" + String(new Date().getTime())]
        .concat(this.msgHistory)
      ]
    );
  }; 
  
}

SessionOnSpreadSheet.prototype.hashUserId = function(user_id) {
  var bytes = "";
  for (i=0; i<8; i++) bytes += user_id.charCodeAt(i);
  return bytes % 1000; 
};
