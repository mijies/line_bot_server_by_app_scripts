var UnknownHandler =　function() {
  this.handler; // The calling handler must be instantiated
  this.name;    // The calling handler must update with own name
  this.messages = ["ご連絡の内容から適切なご案内を見つけられませんでした。"];

  this.reply = function(reply_token) {
    this.handler.messages = this.messages.concat(this.handler.messages);
//    this.handler.messages[0] = this.messages[0] + this.handler.messages[0];
    this.handler.reply(reply_token);
  };

  this.getNextHandlerName = function() {
    return this.handler.name;
  };
};

var HelpHandler =　function() {
  this.handler; // The calling handler must be instantiated
  this.name;    // The calling handler must update with own name
  this.messages = ["ヘルプを表示します。"];

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
  this.messages = ["ただいま、トップメニューです。\n以下より１つご入力の上、メッセージを送信ください。\n"];
  this.messages[0] += "  1　:　サブメニュー1\n";
  this.messages[0] += "  2　:　Wiki検索\n";
  this.messages[0] += "  ?　:　ヘルプ";
  this.help = ["トップメニューのヘルプです\n"];
  this.help[0] += "  1　:　サブメニュー1\n";
  this.help[0] += "  2　:　Wiki検索\n";
  this.help[0] += "  ?　:　ヘルプ";

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
    } else if (msg === "Wiki検索"　|| msg === "2" || msg === "２") {
      this.handler = new WikiHandler();
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
  this.messages = ["ただいま、サブメニュー1です。\n以下より１つご入力の上、メッセージを送信ください。\n"];
  this.messages[0] += "  0　:　戻る\n";
  this.messages[0] += "  ?　:　ヘルプ";
  this.help = ["サブメニュー1のヘルプです\n"];
  this.help[0] += "  0　:　戻る\n";
  this.help[0] += "  ?　:　ヘルプ";

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


var WikiHandler =　function() {
  this.handler;
  this.name = "WikiHandler";
  this.messages = ["ただいま、Wikipedia検索です。\n検索ワード、または以下のメニューから１つご入力の上、メッセージを送信ください。\n"];
  this.messages[0] += "  0　:　戻る\n";
  this.messages[0] += "  ?　:　ヘルプ";
  this.help = ["Wikipedia検索のヘルプです\n"];
  this.help[0] += "  0　:　戻る\n";
  this.help[0] += "  ?　:　ヘルプ";

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
      this.handler.reply(reply_token);
      return;
    } else if (msg === "ヘルプ"　|| msg === "?" || msg === "？") {
      this.handler = new HelpHandler();
      this.handler.name = this.name;
      this.handler.handler = new WikiHandler();
      this.handler.reply(reply_token);
      return;
    }
    
    var url = 'https://ja.wikipedia.org/w/api.php';
    msg = encodeURI(msg);
    var options = {
      format: 'json',
      action: 'query',
      redirects: 1,
      list: 'search',
      srsearch: msg,
      srlimit: 3,           // 検索結果の最大取得件数
      prop: 'extracts',
      exchars: 200,         // 説明文の最大文字列長
      explaintext: 1,
    };
    url += '?'
    Object.keys(options).forEach(function(key) {
      url += key + '=' + options[key] + '&';
    });
    
    var res = JSON.parse(UrlFetchApp.fetch(url));
    var repMsg = '';
    if (res !== null) {
      var wikiURL = 'https://ja.wikipedia.org/wiki/';
      var search = res['query']['search']; 
      Object.keys(search).forEach(function(key) {
        
        if (key == -1) {
          repMsg += '該当ワードへの結果がありませんでした。';
        }
        
        var item = search[key];
        if (item.title && item.snippet) {
          repMsg += item.title + '\n';
          repMsg += encodeURI(wikiURL + item.title) + '\n';
          repMsg += item.snippet;
          repMsg = repMsg.replace(/<span class="searchmatch">/g, '');
          repMsg = repMsg.replace(/<\/span>/g , '');
          repMsg += '\n\n';
        }
      
      });
    } else {
      repMsg += '何らかの理由でWikipediaへの問い合わせに失敗しました。';
    }

    var repMsgObj = new RepMsgObj(reply_token);
    repMsgObj.appendMessage('text', repMsg);
    this.messages.forEach(function(msg){
      repMsgObj.appendMessage('text', msg);
    });
    repMsgObj.reply();
  };
    

  this.getNextHandlerName = function() {
    return this.handler.name;
  };

};

var Handlers = {
  "UnknownHandler": UnknownHandler,
  "HelpHandler": HelpHandler,
  "TopMenuHandler": TopMenuHandler,
  "SubMenu1Handler": SubMenu1Handler,
  "WikiHandler": WikiHandler
};
