var UnknownHandler =　function() {
  this.handler; // The calling handler must be instantiated
  this.name;    // The calling handler must update with own name
  this.messages = ["ご送信いただいた内容から、どのようにご案内すべきかわかりませんでした。\n"];

  this.reply = function(reply_token) {
    this.handler.messages[0] = this.messages[0] + this.handler.messages[0];
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };
};

var HelpHandler =　function() {
  this.handler; // The calling handler must be instantiated
  this.name;    // The calling handler must update with own name
  this.messages = ["ヘルプを表示します。\n"];

  this.reply = function(reply_token) {
    this.handler.messages = this.messages.concat(this.handler.messages);
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };
};

var TopMenuHandler =　function() {
  this.handler;
  this.name = "TopMenuHandler";
  this.messages = ["ただいま、トップメニューです。\nキーまたはメニュー名を１つご入力の上、メッセージを送信ください。\n"];
  this.messages[0] += "  1　:　サブメニュー1\n";
  this.messages[0] += "  ?　:　ヘルプ\n";
  this.help = ["トップメニューのヘルプです\n"];
  this.help[0] += "  1　:　サブメニュー1\n";
  this.help[0] += "  ?　:　ヘルプ\n";

  this.reply = function(reply_token) {
    var repMsgObj = new RepMsgObj(reply_token);
    this.messages.forEach(function(msg){
      repMsgObj.appendMessage('text', msg);
    });
    repMsgObj.reply();
  };

  this.run = function(msg, reply_token) {
    
    if (msg === "サブメニュー1"　|| msg === "1" || msg === "１") {
      this.handler = new SubMenu1Handler();
    } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
      this.handler = new HelpHandler();
      this.handler.name = this.name;
      this.handler.handler = new TopMenuHandler();
    } else {
      this.handler = new UnknownHandler();
      this.handler.name = this.name;
      this.handler.handler = new TopMenuHandler();
    }
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };

};

var SubMenu1Handler =　function() {
  this.handler;
  this.name = "SubMenu1Handler";
  this.messages = ["ただいま、サブメニュー1です。\nキーまたはメニュー名を１つご入力の上、メッセージを送信ください。\n"];
  this.messages[0] += "  0　:　戻る\n";
  this.messages[0] += "  ?　:　ヘルプ\n";
  this.help = ["サブメニュー1のヘルプです\n"];
  this.help[0] += "  0　:　戻る\n";
  this.help[0] += "  ?　:　ヘルプ\n";

  this.reply = function(reply_token) {
    var repMsgObj = new RepMsgObj(reply_token);
    this.messages.forEach(function(msg){
      repMsgObj.appendMessage('text', msg);
    });
    repMsgObj.reply();
  };

  this.run = function(msg, reply_token) {
    
    if (msg === "戻る"　|| msg === "0" || msg === "０") {
      this.handler = new TopMenuHandler();
    } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
      this.handler = new HelpHandler();
      this.handler.name = this.name;
      this.handler.handler = new SubMenu1Handler();
    } else {
      this.handler = new UnknownHandler();
      this.handler.name = this.name;
      this.handler.handler = new SubMenu1Handler();
    }
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };

};

var Handlers = {
  "UnknownHandler": UnknownHandler,
  "HelpHandler": HelpHandler,
  "TopMenuHandler": TopMenuHandler,
  "SubMenu1Handler": SubMenu1Handler
};
