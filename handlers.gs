var TopMenuHandler =　function() {
  this.handler;
  this.name = "TopMenuHandler"

  this.reply = function(reply_token) {
    var repMsgObj = new RepMsgObj(reply_token);

    var msg = "キーまたはメニュー名を１つご入力の上、メッセージを送信ください。\nキー : メニュー名";
    msg += "  1　:　トップメニュー\n";
    msg += "  ?　:　ヘルプ\n";
    repMsgObj.appendMessages('text', msg);
    repMsgObj.reply();
  };

  this.run = function(msg, reply_token) {
    
    if (msg === "トップ"　|| msg === "1" || msg === "１") {
      this.handler = new TopMenuHandler();
    } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
      this.handler = new HelpHandler();
    } else {
      this.handler = new UnknownHandler();
    }
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };

};

var HelpHandler =　function() {
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

var UnknownHandler =　function() {
  this.handler;

  this.reply = function(reply_token) {
    var repMsgObj = new RepMsgObj(reply_token);

    var msg = "unknownhandler。\nキー : メニュー名";
    msg += "  1　:　トップメニュー";
    msg += "  ?　:　ヘルプ";
    repMsgObj.appendMessages('text', msg);
    repMsgObj.reply();
  };

  this.run = function(msg, reply_token) {

    if (msg === "トップ"　|| msg === "1" || msg === "１") {
      this.handler = new TopMenuHandler();
    } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
      this.handler = new HelpHandler();
    } else {
      this.handler = new UnknownHandler();
    }
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.constructor.name;
  };

};

var Handlers = {
  "TopMenuHandler": TopMenuHandler,
  "HelpHandler": HelpHandler,
  "UnknownHandler": UnknownHandler
};
