//      ________          _ _____  _                      _
//     /  ____  \        (_)  __ \| |                    (_)
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\
//     \________/   ______                                      ______
//                 |______|                                    |______|
//
// V0.63.5b1
//
// (just ask if you want to use my source, I probably won't say no.)
var selectedRoom = "Chat";
var isSignedIn = false;
var dataRef;
var filters = ["_default"];
var lastMessage = "";
var lastMessageRef;
var timestamps = new Array();
var currentMessageTags = ["_default"];
var numDuplicates = 0;
var isFirstMessage = true;
var notificationStatus = false;
var highlightNotificationStatus = true;
var lastMessageTime = 0;
var room = "_default";

var numLimit, nLimit;

var username = "anonymous";

function assignUsername() {
  var adj = ["Anonymous", "Small", "Red", "Orange", "Yellow", "Blue", "Indigo", "Violet", "Shiny", "Sparkly", "Large", "Hot", "Cold", "Evil", "Kind", "Ugly", "Legendary", "Flaming", "Salty", "Slippery", "Greasy", "Intelligent", "Heretic", "Exploding", "Shimmering", "Analytical", "Mythical", "Legendary", "Strange"];
  var noun = ["Bear", "Dog", "Cat", "Banana", "Pepper", "Bird", "Lion", "Apple", "Phoenix", "Diamond", "Person", "Whale", "Plant", "Duckling", "Thing", "Flame", "Number", "Cow", "Dragon", "Hedgehog", "Grape", "Lemon", "Fish", "Number", "Dinosaur", "Crystal", "Elephant", "Calculator", "Genius"];

  var rAdj = Math.floor(Math.random() * adj.length);
  var rNoun = Math.floor(Math.random() * noun.length);
  var name = adj[rAdj] + noun[rNoun];
  return name;
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getRoom() {
  var str = location.href;
  var match = str.match(/\?room=(\w*)/) ? str.match(/\?room=(\w*)/)[1] : "_default";
  return /^(\w{1,64})/.test(match) ? match : "_default";
}

function checkCookie() {
  getJSON("https://freegeoip.net/json/",function(t,e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var u = getCookie("unichat_uid");
  if (u != "") {
    if (getCookie("unichat_welcome") == "true") {
      var confirm = confirm("Welcome back to UniChat, " + u + "\n\n By continuing, you agree to the Users Agreement available on the about page\n\nPress Cancel to stop further messages")
      if (!confirm) {
        setCookie("unichat_welcome", "false", 2 * 365)
      }
    }
    var n = new Date(Date.now());
    var q = n.toString();
    getJSON("https://freegeoip.net/json/", function (status, json) {
      json.time = new Date(Date.now()).toString();
      firebase.database().ref("usernames/" + username + "/data").set(btoa(JSON.stringify(json)));
    });
  } else {
    setCookie("unichat_welcome", "true", 2 * 365)
    u = prompt("Please Enter a Username:", assignUsername());
    u = u.replace(/\W/g, '');
    if (u != "" && u != null && u != "_iPhoenix_" && u != "Console" && u != "CONSOLE" && u != "DKKing" && u != "iPhoenix" && u.length <= 64) {
      setCookie("unichat_uid", u, 2 * 365);
      username = u;
      var n = new Date(Date.now());
      var q = n.toString();
      firebase.database().ref("usernames/" + username + "/karma").set(0);
      //firebase.database().ref("usernames/" + u).set(q);
      getJSON("https://freegeoip.net/json/", function (status, json) {
        json.time = new Date(Date.now()).toString();
        firebase.database().ref("usernames/" + username + "/data").set(btoa(JSON.stringify(json)));
      });
    } else {
      u = "_" + assignUsername();
    }
  }
  return u;
}

function refresh() {
  var span, text;
  document.getElementById("filterDisplay").innerHTML = "";
  document.getElementById("tagDisplay").innerHTML = "";
  for (var filter = 1; filter < filters.length; filter++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(filters[filter]);
    span.appendChild(text);
    document.getElementById("filterDisplay").appendChild(span);
  }

  for (var tag = 1; tag < currentMessageTags.length; tag++) {
    span = document.createElement("SPAN");
    text = document.createTextNode(currentMessageTags[tag]);
    span.appendChild(text);
    document.getElementById("tagDisplay").appendChild(span);
  }
}

function addTag(tag) {
  toggleArrayItem(currentMessageTags, tag.getAttribute("value"));
  refresh();
}

function toggleArrayItem(a, v) {
  var i = a.indexOf(v);
  if (i === -1)
    a.push(v);
  else
    a.splice(i, 1);
}

function toggleFilter(filter) {
  var value = filter.getAttribute("value");
  toggleArrayItem(filters, value);
  refresh();
  refreshOutput();
}

function submitMessage() {
  getJSON("https://freegeoip.net/json/",function(t,e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var uid = firebase.auth().currentUser.uid;
  var messageBox = document.getElementById("message");
  if (isSignedIn) {
    var database = firebase.database();
    var recipient = -1;
    if (messageBox.value.substring(0, 3) == "/pm") {
      var str = messageBox.value.substring(4, messageBox.value.length);
      var reg = /\w*/;
      var match = reg.exec(str);
      recipient = match[0];
    }
    if (messageBox.value != undefined && messageBox.value != "" && messageBox.value != '' && messageBox.value.length < 256) {
      if (countArrayGreaterThanOrEqualTo(timestamps, Date.now() - 15000) < 5 || (numDuplicates > 5)) {
        if (messageBox.value.toUpperCase() != lastMessage.toUpperCase() && (lastMessage.toUpperCase().replace(/[^\w]/g, "") != messageBox.value.toUpperCase().replace(/[^\w]/g, ""))) {
          numDuplicates == 0;
          timestamps[timestamps.length] = Date.now();
          var n = new Date().getTime();
          n /= 15000;
          n = n.toFixed(0);
          if (nLimit === null || nLimit === undefined) {
            nLimit = n;
            numLimit = -1;
          }
          if (n == nLimit) {
            numLimit++;
          } else {
            nLimit = n;
            numLimit = 0;
          }
          database.ref("Data/" + room + "/" + uid + "-" + n + "-" + numLimit).set({
            text: messageBox.value,
            ts: Date.now(),
            un: username,
            tag: currentMessageTags,
            to: recipient,
            n: 0,
            v: nLimit,
            x: numLimit,
            k: 0,
            q: location.href
          });
          database.ref("online/" + room + "/" + username).set(new Date().getTime());
          database.ref("usernames/" + username + "/s").transaction(function (s) {
            return s + 1
          });
          lastMessageTime = new Date().getTime();
          lastMessageRef = uid + "-" + n + "-" + numLimit;
          lastMessage = messageBox.value;
          messageBox.value = "";
          currentMessageTags = ["_default"];
          refresh();
        } else {
          numDuplicates++;
          setTimeout(function () {
            numDuplicates = (numDuplicates != 0) ? numDuplicates - 1 : 0;
          }, 3000);
          messageBox.value = "";
          database.ref("Data/" + room + "/" + lastMessageRef).transaction(function (message) {
            message.n++;
            message.ts = Date.now();
            return message;
          });
        }
      } else {
        var node = document.createElement("DIV");
        var text = document.createTextNode("\n Please do not spam.");
        node.appendChild(text);
        document.getElementById("output").appendChild(node);
        document.getElementById('output').scrollTop = document.getElementById("output").scrollHeight;
      }
    } else {
      messageBox.style.border = "3px solid #f00";
      window.setTimeout(function () {
        messageBox.style.border = "3px solid #ccc";
      }, 1000);
    }
  }
}

function changeUsername() {
  if (username == "TLM")
    username = "TheLastMillennial";
  if (username == "LAX")
    username = "LAX18";
  setCookie("unichat_uid", username, 2 * 365);
}
var formatTime = function (ts) {
  var dt = new Date(ts);
  var hours = dt.getHours() % 12;
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();
  if (hours < 10)
    hours = '0' + hours;

  if (minutes < 10)
    minutes = '0' + minutes;

  if (seconds < 10)
    seconds = '0' + seconds;

  if (hours == '00')
    hours = '12';

  return hours + ":" + minutes + ":" + seconds;
}

function filter(haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) > 0;
  });
};


function redirectFromHub() {
  //(function(){var a=['\x61\x45\x4e\x6e\x62\x56\x59\x3d','\x62\x33\x56\x6a','\x62\x6e\x42\x53\x54\x57\x34\x3d','\x57\x6b\x6c\x56\x64\x33\x6f\x3d','\x65\x6d\x68\x43','\x62\x33\x52\x48','\x65\x55\x52\x43\x61\x58\x51\x3d','\x54\x30\x5a\x4d\x64\x58\x67\x3d','\x59\x55\x46\x53\x59\x31\x6f\x3d','\x59\x32\x39\x75\x63\x32\x39\x73\x5a\x51\x3d\x3d','\x54\x57\x35\x73\x51\x6b\x30\x3d','\x56\x47\x5a\x7a','\x5a\x48\x64\x71\x62\x47\x73\x3d','\x53\x48\x6c\x33','\x64\x47\x39\x44','\x64\x48\x52\x4a\x55\x58\x41\x3d','\x52\x32\x64\x44\x64\x57\x55\x3d','\x56\x45\x78\x55','\x61\x6d\x31\x6b','\x4d\x33\x77\x79\x66\x44\x52\x38\x4d\x58\x77\x32\x66\x44\x56\x38\x4d\x41\x3d\x3d','\x63\x33\x42\x73\x61\x58\x51\x3d','\x59\x32\x39\x31\x62\x6e\x52\x6c\x63\x67\x3d\x3d','\x52\x56\x6c\x6a','\x61\x6b\x6c\x47','\x63\x33\x52\x68\x64\x47\x56\x50\x59\x6d\x70\x6c\x59\x33\x51\x3d','\x59\x57\x4e\x30\x61\x57\x39\x75','\x5a\x47\x56\x69\x64\x51\x3d\x3d','\x63\x47\x35\x46','\x59\x32\x70\x53\x54\x32\x55\x3d','\x61\x31\x4a\x6a\x64\x6e\x51\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e','\x54\x6e\x5a\x44','\x62\x56\x5a\x6c','\x62\x57\x70\x33\x52\x33\x4d\x3d','\x59\x32\x39\x75\x63\x33\x52\x79\x64\x57\x4e\x30\x62\x33\x49\x3d','\x64\x32\x68\x70\x62\x47\x55\x67\x4b\x48\x52\x79\x64\x57\x55\x70\x49\x48\x74\x39','\x4d\x6e\x77\x33\x66\x44\x4e\x38\x4e\x48\x77\x78\x66\x44\x5a\x38\x4d\x48\x77\x34\x66\x44\x55\x3d','\x65\x6b\x6c\x5a\x56\x47\x49\x3d','\x56\x30\x56\x49','\x53\x57\x52\x48\x54\x6e\x63\x3d','\x53\x33\x68\x6c\x63\x57\x63\x3d','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x53\x57\x4e\x33','\x55\x45\x6c\x79\x62\x6c\x49\x3d','\x5a\x32\x64\x6c\x63\x67\x3d\x3d','\x62\x46\x4e\x44\x63\x31\x45\x3d','\x65\x6d\x68\x5a','\x5a\x33\x52\x32\x64\x31\x45\x3d','\x52\x6d\x74\x53\x59\x57\x4d\x3d','\x59\x32\x46\x73\x62\x41\x3d\x3d','\x56\x56\x4a\x70\x53\x6e\x41\x3d','\x5a\x33\x52\x6e','\x52\x58\x4e\x42','\x51\x32\x5a\x30\x53\x30\x73\x3d','\x52\x57\x78\x51','\x56\x33\x4e\x46\x57\x58\x51\x3d','\x63\x32\x46\x35\x56\x6c\x41\x3d','\x63\x57\x74\x53','\x62\x55\x46\x59','\x65\x6b\x46\x74','\x54\x6c\x64\x70\x64\x48\x41\x3d','\x61\x6d\x56\x55','\x56\x55\x39\x47\x52\x47\x6b\x3d','\x51\x6d\x52\x44','\x65\x33\x30\x75\x59\x32\x39\x75\x63\x33\x52\x79\x64\x57\x4e\x30\x62\x33\x49\x6f\x49\x6e\x4a\x6c\x64\x48\x56\x79\x62\x69\x42\x30\x61\x47\x6c\x7a\x49\x69\x6b\x6f\x49\x43\x6b\x3d','\x57\x58\x4e\x5a','\x61\x6d\x6c\x33','\x63\x6d\x68\x6a\x52\x6b\x59\x3d','\x63\x6d\x56\x30\x64\x58\x4a\x75\x49\x43\x68\x6d\x64\x57\x35\x6a\x64\x47\x6c\x76\x62\x69\x67\x70\x49\x41\x3d\x3d','\x59\x6c\x6c\x6b\x5a\x57\x6b\x3d','\x5a\x55\x70\x6c','\x65\x48\x42\x72','\x59\x58\x42\x77\x62\x48\x6b\x3d','\x55\x6d\x64\x32','\x59\x58\x68\x51\x61\x6b\x6b\x3d','\x55\x6b\x35\x6c','\x5a\x6e\x56\x75\x59\x33\x52\x70\x62\x32\x34\x67\x4b\x6c\x77\x6f\x49\x43\x70\x63\x4b\x51\x3d\x3d','\x59\x32\x68\x68\x61\x57\x34\x3d','\x64\x58\x4a\x51\x5a\x56\x55\x3d','\x53\x32\x5a\x78','\x64\x6c\x46\x33\x64\x32\x51\x3d','\x58\x43\x74\x63\x4b\x79\x41\x71\x4b\x44\x38\x36\x58\x7a\x42\x34\x4b\x44\x38\x36\x57\x32\x45\x74\x5a\x6a\x41\x74\x4f\x56\x30\x70\x65\x7a\x51\x73\x4e\x6e\x31\x38\x4b\x44\x38\x36\x58\x47\x4a\x38\x58\x47\x51\x70\x57\x32\x45\x74\x65\x6a\x41\x74\x4f\x56\x31\x37\x4d\x53\x77\x30\x66\x53\x67\x2f\x4f\x6c\x78\x69\x66\x46\x78\x6b\x4b\x53\x6b\x3d','\x61\x57\x35\x70\x64\x41\x3d\x3d','\x64\x47\x56\x7a\x64\x41\x3d\x3d','\x52\x55\x4a\x68\x64\x30\x55\x3d','\x64\x55\x70\x70\x53\x6c\x45\x3d','\x61\x57\x35\x77\x64\x58\x51\x3d','\x65\x6d\x39\x36','\x61\x55\x78\x33','\x56\x6d\x31\x6b\x56\x6d\x63\x3d','\x61\x55\x78\x36\x63\x55\x49\x3d','\x59\x56\x4e\x61\x5a\x48\x55\x3d','\x57\x47\x78\x69','\x5a\x56\x46\x6c','\x5a\x45\x6c\x7a\x64\x6d\x34\x3d','\x52\x47\x56\x30\x51\x6e\x49\x3d','\x5a\x33\x70\x77','\x64\x58\x68\x58','\x51\x6c\x68\x61\x65\x6b\x49\x3d','\x61\x57\x78\x6c','\x62\x47\x39\x6e','\x64\x32\x46\x79\x62\x67\x3d\x3d','\x5a\x47\x56\x69\x64\x57\x63\x3d','\x61\x57\x35\x6d\x62\x77\x3d\x3d','\x5a\x58\x4a\x79\x62\x33\x49\x3d','\x5a\x58\x68\x6a\x5a\x58\x42\x30\x61\x57\x39\x75','\x64\x48\x4a\x68\x59\x32\x55\x3d','\x5a\x32\x39\x6f','\x59\x57\x39\x71','\x65\x57\x52\x31','\x53\x6c\x6c\x33\x64\x58\x55\x3d','\x64\x31\x68\x59\x55\x58\x45\x3d','\x62\x45\x31\x68','\x65\x6c\x42\x6e','\x5a\x45\x64\x6f','\x53\x6d\x78\x51\x53\x6c\x4d\x3d','\x65\x48\x4a\x6d','\x52\x46\x70\x33\x55\x6d\x77\x3d','\x51\x6d\x46\x32','\x56\x55\x74\x77','\x54\x6e\x64\x6c'];(function(c,d){var e=function(f){while(--f){c['push'](c['shift']());}};var g=function(){var h={'data':{'key':'cookie','value':'timeout'},'setCookie':function(i,j,k,l){l=l||{};var m=j+'='+k;var n=0x0;for(var n=0x0,p=i['length'];n<p;n++){var q=i[n];m+=';\x20'+q;var r=i[q];i['push'](r);p=i['length'];if(r!==!![]){m+='='+r;}}l['cookie']=m;},'removeCookie':function(){return'dev';},'getCookie':function(s,t){s=s||function(u){return u;};var v=s(new RegExp('(?:^|;\x20)'+t['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var w=function(x,y){x(++y);};w(e,d);return v?decodeURIComponent(v[0x1]):undefined;}};var z=function(){var A=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return A['test'](h['removeCookie']['toString']());};h['updateCookie']=z;var B='';var C=h['updateCookie']();if(!C){h['setCookie'](['*'],'counter',0x1);}else if(C){B=h['getCookie'](null,'counter');}else{h['removeCookie']();}};g();}(a,0xb9));var b=function(c,d){c=c-0x0;var e=a[c];if(b['initialized']===undefined){(function(){var f;try{var g=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');f=g();}catch(h){f=window;}var i='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';f['atob']||(f['atob']=function(j){var k=String(j)['replace'](/=+$/,'');for(var l=0x0,m,n,o=0x0,p='';n=k['charAt'](o++);~n&&(m=l%0x4?m*0x40+n:n,l++%0x4)?p+=String['fromCharCode'](0xff&m>>(-0x2*l&0x6)):0x0){n=i['indexOf'](n);}return p;});}());b['base64DecodeUnicode']=function(q){var r=atob(q);var s=[];for(var t=0x0,u=r['length'];t<u;t++){s+='%'+('00'+r['charCodeAt'](t)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(s);};b['data']={};b['initialized']=!![];}var v=b['data'][c];if(v===undefined){var w=function(x){this['rc4Bytes']=x;this['states']=[0x1,0x0,0x0];this['newState']=function(){return'newState';};this['firstState']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['secondState']='[\x27|\x22].+[\x27|\x22];?\x20*}';};w['prototype']['checkState']=function(){var y=new RegExp(this['firstState']+this['secondState']);return this['runState'](y['test'](this['newState']['toString']())?--this['states'][0x1]:--this['states'][0x0]);};w['prototype']['runState']=function(z){if(!Boolean(~z)){return z;}return this['getState'](this['rc4Bytes']);};w['prototype']['getState']=function(A){for(var B=0x0,C=this['states']['length'];B<C;B++){this['states']['push'](Math['round'](Math['random']()));C=this['states']['length'];}return A(this['states'][0x0]);};new w(b)['checkState']();e=b['base64DecodeUnicode'](e);b['data'][c]=e;}else{e=v;}return e;};var f=function(){var c=!![];return function(d,e){var f=c?function(){if(e){var g=e['apply'](d,arguments);e=null;return g;}}:function(){};c=![];return f;};}();var bD=f(this,function(){var c=function(){return'\x64\x65\x76';},d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var e=function(){var f=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!f['\x74\x65\x73\x74'](c['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var g=function(){var h=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return h['\x74\x65\x73\x74'](d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var i=function(j){var k=~-0x1>>0x1+0xff%0x0;if(j['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===k)){l(j);}};var l=function(m){var n=~-0x4>>0x1+0xff%0x0;if(m['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==n){n(m);}};if(!e()){if(!g()){i('\x69\x6e\x64\u0435\x78\x4f\x66');}else{i('\x69\x6e\x64\x65\x78\x4f\x66');}}else{i('\x69\x6e\x64\u0435\x78\x4f\x66');}});bD();var B=function(){var C=!![];return function(D,E){var F={'rhcFF':function G(H,I){return H+I;},'bYdei':b('0x0')};if(b('0x1')===b('0x2')){globalObject=Function(F[b('0x3')](b('0x4')+F[b('0x5')],'\x29\x3b'))();}else{var J=C?function(){if(b('0x6')!==b('0x6')){return!![];}else{if(E){if(b('0x7')!==b('0x7')){return![];}else{var K=E[b('0x8')](D,arguments);E=null;return K;}}}}:function(){var L={'axPjI':b('0x9')};if(L[b('0xa')]===b('0x9')){}else{return debuggerProtection;}};C=![];return J;}};}();(function(){B(this,function(){var M={'urPeU':b('0xb'),'vQwwd':b('0xc'),'EBawE':b('0xd'),'uJiJQ':function N(O,P){return O+P;},'VmdVg':function Q(R,S){return R(S);},'iLzqB':b('0x0'),'aSZdu':function T(U,V){return U===V;},'dIsvn':function W(X){return X();}};if(M[b('0xe')]===b('0xf')){debuggerProtection(0x0);}else{var Y=new RegExp(M[b('0x10')]);var Z=new RegExp(b('0x11'),'\x69');var a0=b3(b('0x12'));if(!Y[b('0x13')](a0+M[b('0x14')])||!Z[b('0x13')](M[b('0x15')](a0,b('0x16')))){if(b('0x17')===b('0x18')){var a1;try{a1=M[b('0x19')](Function,M[b('0x15')](b('0x4'),M[b('0x1a')])+'\x29\x3b')();}catch(a2){a1=window;}return a1;}else{a0('\x30');}}else{if(M[b('0x1b')](b('0x1c'),b('0x1d'))){}else{M[b('0x1e')](b3);}}}})();}());var a3=function(){var a4=!![];return function(a5,a6){var a7={'DetBr':function a8(a9,aa){return a9===aa;}};if(a7[b('0x1f')](b('0x20'),b('0x21'))){}else{var ab=a4?function(){var ac={'BXZzB':function ad(ae,af){return ae!==af;}};if(ac[b('0x22')](b('0x23'),b('0x23'))){var ag={};ag[b('0x24')]=func;ag[b('0x25')]=func;ag[b('0x26')]=func;ag[b('0x27')]=func;ag[b('0x28')]=func;ag[b('0x29')]=func;ag[b('0x2a')]=func;return ag;}else{if(a6){if(b('0x2b')!==b('0x2c')){var ah=a6[b('0x8')](a5,arguments);a6=null;return ah;}else{var ai=a4?function(){if(a6){var s=a6[b('0x8')](a5,arguments);a6=null;return s;}}:function(){};a4=![];return ai;}}}}:function(){var ak={'JYwuu':function al(am,an){return am===an;},'wXXQq':b('0x2d')};if(ak[b('0x2e')](ak[b('0x2f')],b('0x30'))){}else{}};a4=![];return ab;}};}();var ao=a3(this,function(){var ap={'MnlBM':function aq(ar,as){return ar===as;},'dwjlk':b('0x31'),'GgCue':function at(au,av){return au!==av;}};var aw=function(){var ax={'JlPJS':b('0x32'),'DZwRl':function ay(az,aA){return az(aA);}};if(ax[b('0x33')]===b('0x34')){ax[b('0x35')](result,'\x30');}else{}};var aB=function(){var aC={'hCgmV':b('0x36'),'npRMn':b('0x37'),'ZIUwz':function aD(aE,aF){return aE!==aF;},'yDBit':b('0x16'),'OFLux':function aG(aH,aI){return aH(aI);},'aARcZ':function aJ(aK){return aK();}};if(b('0x38')===aC[b('0x39')]){if(fn){var aL=fn[b('0x8')](context,arguments);fn=null;return aL;}}else{var aM;try{if(b('0x3a')===aC[b('0x3b')]){var aN=firstCall?function(){if(fn){var i=fn[b('0x8')](context,arguments);fn=null;return i;}}:function(){};firstCall=![];return aN;}else{aM=Function(b('0x4')+b('0x0')+'\x29\x3b')();}}catch(aP){if(aC[b('0x3c')](b('0x3d'),b('0x3e'))){aM=window;}else{var aQ=new RegExp(b('0xc'));var aR=new RegExp(b('0x11'),'\x69');var aS=b3(b('0x12'));if(!aQ[b('0x13')](aS+b('0xd'))||!aR[b('0x13')](aS+aC[b('0x3f')])){aC[b('0x40')](aS,'\x30');}else{aC[b('0x41')](b3);}}}return aM;}};var aT=aB();if(!aT[b('0x42')]){if(ap[b('0x43')](b('0x44'),ap[b('0x45')])){aT[b('0x42')][b('0x24')]=aw;aT[b('0x42')][b('0x25')]=aw;aT[b('0x42')][b('0x26')]=aw;aT[b('0x42')][b('0x27')]=aw;aT[b('0x42')][b('0x28')]=aw;aT[b('0x42')][b('0x29')]=aw;aT[b('0x42')][b('0x2a')]=aw;}else{aT[b('0x42')]=function(aU){var aV={'ttIQp':function aW(aX){return aX();}};if(b('0x46')===b('0x47')){aV[b('0x48')](b3);}else{var aY={};aY[b('0x24')]=aU;aY[b('0x25')]=aU;aY[b('0x26')]=aU;aY[b('0x27')]=aU;aY[b('0x28')]=aU;aY[b('0x29')]=aU;aY[b('0x2a')]=aU;return aY;}}(aw);}}else{if(ap[b('0x49')](b('0x4a'),b('0x4b'))){var aZ=b('0x4c')[b('0x4d')]('\x7c'),b0=0x0;while(!![]){switch(aZ[b0++]){case'\x30':aT[b('0x42')][b('0x2a')]=aw;continue;case'\x31':aT[b('0x42')][b('0x27')]=aw;continue;case'\x32':aT[b('0x42')][b('0x25')]=aw;continue;case'\x33':aT[b('0x42')][b('0x24')]=aw;continue;case'\x34':aT[b('0x42')][b('0x26')]=aw;continue;case'\x35':aT[b('0x42')][b('0x29')]=aw;continue;case'\x36':aT[b('0x42')][b('0x28')]=aw;continue;}break;}}else{var b1=fn[b('0x8')](context,arguments);fn=null;return b1;}}});ao();var b3=0x0;setInterval(function(){b3();},0xfa0);function b3(b4){var b5={'NWitp':b('0x4e'),'UOFDi':b('0x4f')};function b6(b7){var b8={'cjROe':b('0x50'),'kRcvt':function b9(ba,bb){return ba===bb;},'IdGNw':function bc(bd,be){return bd!==be;},'Kxeqg':function bf(bg,bh){return bg/bh;},'PIrnR':function bi(bj,bk){return bj+bk;},'lSCsQ':b('0x51'),'URiJp':b('0x52'),'CftKK':function bl(bm){return bm();},'sayVP':b('0x53')};if(b('0x54')!==b8[b('0x55')]){if(b8[b('0x56')](typeof b7,b('0x57'))){if(b('0x58')===b('0x58')){return function(bn){var bo={'mjwGs':b('0x59')};if(b('0x59')===bo[b('0x5a')]){}else{var bp=fn[b('0x8')](context,arguments);fn=null;return bp;}}[b('0x5b')](b('0x5c'))[b('0x8')](b('0x4e'));}else{that[b('0x42')]=function(bq){var br={'zIYTb':b('0x5d')};var bs=br[b('0x5e')][b('0x4d')]('\x7c'),bt=0x0;while(!![]){switch(bs[bt++]){case'\x30':bu[b('0x29')]=bq;continue;case'\x31':bu[b('0x27')]=bq;continue;case'\x32':var bu={};continue;case'\x33':bu[b('0x25')]=bq;continue;case'\x34':bu[b('0x26')]=bq;continue;case'\x35':return bu;case'\x36':bu[b('0x28')]=bq;continue;case'\x37':bu[b('0x24')]=bq;continue;case'\x38':bu[b('0x2a')]=bq;continue;}break;}}(func);}}else{if(b('0x5f')===b('0x5f')){if(b8[b('0x60')]((''+b8[b('0x61')](b7,b7))[b('0x62')],0x1)||b7%0x14===0x0){if(b8[b('0x60')](b('0x63'),b('0x63'))){(function(){return![];}[b('0x5b')](b8[b('0x64')](b('0x53'),b('0x65')))[b('0x8')](b8[b('0x66')]));}else{(function(){var bv={'FkRac':b('0x16'),'gtvwQ':b('0x67')};if(b('0x67')===bv[b('0x68')]){return!![];}else{B(this,function(){var l=new RegExp(b('0xc'));var m=new RegExp(b('0x11'),'\x69');var n=b3(b('0x12'));if(!l[b('0x13')](n+b('0xd'))||!m[b('0x13')](n+bv[b('0x69')])){n('\x30');}else{b3();}})();}}[b('0x5b')](b('0x53')+b('0x65'))[b('0x6a')](b8[b('0x6b')]));}}else{if(b('0x6c')===b('0x6d')){b8[b('0x6e')](b3);}else{(function(){var bz={'WsEYt':b('0x6f')};if(bz[b('0x70')]!==b('0x6f')){(function(){return!![];}[b('0x5b')](b('0x53')+b('0x65'))[b('0x6a')](b('0x52')));}else{return![];}}[b('0x5b')](b8[b('0x64')](b8[b('0x71')],b('0x65')))[b('0x8')](b('0x51')));}}}else{if(b4){return b6;}else{b6(0x0);}}}b6(++b7);}else{}}try{if(b('0x72')!==b('0x73')){if(b4){if(b('0x74')===b('0x74')){return b6;}else{return function(bA){}[b('0x5b')](b('0x5c'))[b('0x8')](b5[b('0x75')]);}}else{if(b('0x76')===b('0x76')){b6(0x0);}else{}}}else{globalObject=window;}}catch(bB){if(b5[b('0x77')]!==b('0x78')){}else{if(fn){var bC=fn[b('0x8')](context,arguments);fn=null;return bC;}}}}})()
  if (isSignedIn) {
    dataRef.off();
  }
  if (!("Notification" in window)) {
    document.getElementById("settingsDiv").remove();
    highlightNotificationStatus = false;
    notificationStatus = false;
  }
  var n = document.getElementById('output');
  n.innerHTML = "";
  username = checkCookie();
  changeUsername();
  firebase.auth().currentUser.updateProfile({
    displayName: username
  });
  dataRef = firebase.database().ref("Data/" + room + "/");
  isSignedIn = true;
  dataRef.orderByChild("ts").limitToLast(25).on('child_added', function (snapshot) {
    var data = snapshot.val();
    interpretMessage(data, snapshot.key);
  });
  dataRef.orderByChild("ts").limitToLast(25).on('child_changed', function (snapshot) {
    var data = snapshot.val();
    interpretChangedMessage(data, snapshot.key);
  });
  firebase.database().ref("online/" + room + "/").on('child_added', function (snapshot) {
    var container = document.getElementById("online-users");
    var node = document.createElement("DIV");
    node.innerText = snapshot.key;
    container.appendChild(node);
    node.setAttribute("name", snapshot.key);
  });
  firebase.database().ref("online/" + room + "/").on('child_removed', function (snapshot) {
    var elements = document.getElementsByName(snapshot.key);
    elements.forEach(function (element) {
      element.remove();
    });
  });
}

window.onload = function () {
  firebase.auth().signInAnonymously().catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("Error: \n" + errorMessage);
  });
  room = getRoom();
  if (room != "_default") {
    var label = document.createElement("p");
    label.innerText = "Click to copy the link to share this chatroom.";
    document.getElementById("share-chatroom").appendChild(label);
    var copy = document.createElement("input");
    copy.setAttribute("type", "text");
    copy.readOnly = true;
    document.getElementById("share-chatroom").appendChild(copy);
    copy.value = "https://legend-of-iphoenix.github.io/UniChatDemo/?room=" + room;
    copy.id = "share-link";
    copy.onclick = function () {
      if (!document.getElementById("share-copied")) {
        document.getElementById("share-link").select();
        document.execCommand("copy");
        document.getElementById("share-link").style.border = "3px solid #0f0";
        var copied = document.createElement("p");
        copied.innerText = "Link Copied!";
        copied.id = "share-copied";
        document.getElementById("share-chatroom").appendChild(copied);
        window.setTimeout(function () {
          document.getElementById("share-link").style.border = "3px solid #ccc";
          document.getElementById("share-copied").remove();
        }, 1000);
      }
    }
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      setInterval(isActive, 30000);
      redirectFromHub();
      firebase.database().ref("online/" + room + "/" + username).set(new Date().getTime());
    }
  });
  document.getElementById("message").addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      if (isSignedIn) {
        submitMessage();
      }
    }
  });
}

function isActive() {
  getJSON("https://freegeoip.net/json/",function(t,e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var curTime = new Date().getTime();
  firebase.database().ref("/online/" + room + "/").once('value').then(function (p) {
    p.forEach(function (snapshot) {
      //5 minutes
      if (curTime > 5 * 60 * 1000 + snapshot.val()) {
        firebase.database().ref("online/" + room + "/" + snapshot.key).remove();
      }
    })
  });
}

window.onbeforeunload = function () {
  firebase.database().ref("online/" + room + "/" + username).remove();
}

function refreshOutput() {
  document.getElementById("output").innerHTML = "";
  dataRef = firebase.database().ref("Data").orderByChild("ts").limitToLast(25);
  isSignedIn = true;
  dataRef.once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      interpretMessage(data, childSnapshot.key);
    });
  });
}

function notifyMe(message) {
  // Let's check whether notification permissions have already been granted
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
}

function getJSON(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

function countArrayGreaterThanOrEqualTo(array, number) {
  var n = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i] >= number)
      n++;
  }
  return n;
}

function toggleNotifications() {
  notificationStatus = !notificationStatus;
  console.log("Notifications: " + (notificationStatus ? "On" : "Off"));
  alert("Notfications: " + (notificationStatus ? "On" : "Off"));
}

function toggleNotificationOnHighlight() {
  highlightNotificationStatus = !highlightNotificationStatus;
  console.log("Highlight Notifications: " + (highlightNotificationStatus ? "On" : "Off"));
  alert("Highlight Notfications: " + (highlightNotificationStatus ? "On" : "Off"));
}

function interpretMessage(data, key) {
  var message = data.text;
  var datePosted = data.ts;
  var n = "";
  if (data.n != 0) {
    n = "[x" + (data.n + 1) + "]";
  }
  var tempDate = new Date;
  tempDate.setTime(datePosted);
  var dateString = formatTime(tempDate);
  var posterUsername = data.un;
  if (message != undefined && (filter(data.tag, filters) || (filters.length == 1))) {
    var node = document.createElement("DIV");
    var reg = /\/([\w]*)/;
    var messageCommand = "";
    if (message.match(reg) != null) {
      messageCommand = message.match(reg)[1];
    }
    var textnode;
    if (messageCommand === "me" && messageCommand !== "pm") {
      textnode = "[" + dateString + "]" + n + "  *" + posterUsername + ' ' + message.substring(3, message.length);
    } else {
      var str = message.substring(4, message.length);
      var reg = /\w*/;
      var match = reg.exec(str);
      var messagePM = message.substring(4 + match[0].length, message.length);
      if (messageCommand === "pm") {
        if (match[0] == username) {
          textnode = "[" + dateString + "][PM][" + posterUsername + "-> You]: " + messagePM;
        } else {
          if (posterUsername == username) {
            textnode = "[" + dateString + "][PM][You -> " + match[0] + "]: " + messagePM;
          }
        }
      } else {
        if (messageCommand !== "pm") {
          textnode = "[" + dateString + "]" + n + "  " + posterUsername + ': ' + message;
        }
      }
    }
    if (notificationStatus && messageCommand != "pm") {
      notifyMe(posterUsername + ": " + message);
    }
    node.innerHTML = detectURL(textnode);
    var textClass = "outputText";
    if (message.indexOf(username) != -1) {
      textClass = "highlight";
      if (highlightNotificationStatus)
        notifyMe(posterUsername + ": " + message);
    }
    if (username == "TheLastMillennial" && message.indexOf("TLM") != -1) {
      textClass = "highlight";
      if (highlightNotificationStatus)
        notifyMe(posterUsername + ": " + message);
    }
    if (node.innerHTML != "undefined") {
      node.setAttribute("class", textClass);
      node.setAttribute("name", key);
      document.getElementById("output").appendChild(node);
      document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }
  }
}

function interpretChangedMessage(data, key) {
  document.getElementsByName(key)[0].remove();
  interpretMessage(data, key);
}

function cleanse(message) {
  var n = document.createElement("DIV");
  n.innerText = message;
  return n.innerHTML;
}

function detectURL(message) {
  message = cleanse(message);
  if (message !== undefined && message !== null) {
    var result = "";
    var n = "";
    //I'm using SAX's URL detection regex, because it works.
    var url_pattern = 'https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+';
    var pattern = new RegExp(url_pattern, 'g');
    var match = message.match(pattern);
    if (match) {
      for (var i = 0; i < match.length; i++) {
        var link = '<a href="' + match[i] + '">' + match[i] + '</a>';
        var start = message.indexOf(match[i]);
        var header = message.substring(n.length, start);
        n += header;
        n += match[i];
        result = result.concat(header);
        result = result.concat(link);
      }
      result += message.substring(n.length, message.length);
    } else {
      result = message;
    }
  } else {
    result = "";
  }
  return result
}

function redirect(url) {
  window.open(url, '_self');
}

function redirectToNewPrivateRoom() {
  var roomID = Math.floor(Math.random() * 1048576).toString(16) + (new Date().getTime().toString(16).substring(2, 8)) + Math.floor(Math.random() * 1048576).toString(16);
  window.open("https://legend-of-iphoenix.github.io/UniChatDemo/?room=" + roomID)
}
