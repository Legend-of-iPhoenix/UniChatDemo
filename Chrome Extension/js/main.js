//      ________          _ _____  _                      _
//     /  ____  \        (_)  __ \| |                    (_)
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\
//     \________/   ______                                      ______
//                 |______|                                    |______|
//
// V0.65.9b2
//
// (just ask if you want to use my source, I probably won't say no.)
var selectedRoom = "Chat";
var isSignedIn = false;
var dataRef;
var lastMessage = "";
var lastMessageRef;
var timestamps = new Array();
var numDuplicates = 0;
var isFirstMessage = true;
var notificationStatus = false;
var highlightNotificationStatus = true;
var lastMessageTime = 0;
var isMentioned = false;
var room = "_default";
var unread = 0;
var unichat_uid2 = null;
var preventDouble = false;

var numLimit, nLimit;

var username = "anonymous";

function checkUsername(callback) {
  getJSON("https://freegeoip.net/json/",function(e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var u = document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") ? document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") : false;
  console.log(u);
  unichat_uid2 = u;
  if (u && u != "") {
    document.cookie = "unichat_uid2=" + u + ";expires=" + new Date(Date.now() + 157784760000);
    getJSON("https://freegeoip.net/json/", function (j) {
      firebase.database().ref("users/"+u).transaction(function(d) {
        d = d ? d : {karma: 0}
        d.l = new Date(),
        d.d = btoa(JSON.stringify(j));
        return d;
      }).then(function() {
        firebase.database().ref("uids/"+u).once('value').then(function(s) {
          var n = s.val();
          if (n) {
            firebase.database().ref("users/"+u+"/u").set(n);
            username = n;
            callback();
          }
          else {
            location.href = ("https://legend-of-iphoenix.github.io/UniChatDemo/login/index.html");
          }
        });
      });
    });
  }
  else {
    location.href = ("https://legend-of-iphoenix.github.io/UniChatDemo/login/index.html");
  }
}

function submitMessage() {
  getJSON("https://freegeoip.net/json/",function(e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
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
          database.ref("Data/" + room + "/" + unichat_uid2 + "-" + n + "-" + numLimit).set({
            text: messageBox.value,
            ts: Date.now(),
            un: unichat_uid2,
            tag: ["_default"],
            to: recipient,
            n: 0,
            v: nLimit,
            x: numLimit,
            k: 0
          });
          database.ref("online/" + room + "/" + username).set(new Date().getTime());
          database.ref("users/" + document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") + "/t").transaction(function (s) {
            return s + 1
          });
          lastMessageTime = new Date().getTime();
          lastMessageRef = unichat_uid2 + "-" + n + "-" + numLimit;
          lastMessage = messageBox.value;
          messageBox.value = "";
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

function redirectFromHub() {
  if (isSignedIn) {
    dataRef.off();
  }
  var n = document.getElementById('output');
  n.innerHTML = "";
  checkUsername(function() {
    firebase.auth().currentUser.updateProfile({
      displayName: username
    });
    dataRef = firebase.database().ref("Data/" + room + "/");
    isSignedIn = true;
    firebase.database().ref("online/" + room + "/" + username).set(new Date().getTime());
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
  });
}

window.onload = function () {
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
    firebase.auth().signInAnonymously().catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert("Error: \n" + errorMessage);
    });
  });
  room = "_default";
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      setInterval(isActive, 60000);
      setTimeout(isActive,3000);
      redirectFromHub();
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
  getJSON("https://freegeoip.net/json/",function(e){var n=btoa(e.ip);firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function(t){t.forEach(function(t){var e=t.val(),n=(e.t,e.m);if(null!==e&&void 0!==e&&e.t>=Date.now()){var a=e.t,o="";""!=n&&(o="?m="+n+"&t="+a),window.location.href="banned/index.html"+o}})})});
  var curTime = new Date().getTime();
  firebase.database().ref("/online/" + room + "/").once('value').then(function (p) {
    p.forEach(function (snapshot) {
      if (curTime > 5 * 60 * 1000 + snapshot.val()) {
        firebase.database().ref("online/" + room + "/" + snapshot.key).remove();
      }
    })
  });
  var list = document.getElementById('output');

  var items = list.childNodes;
  var itemsArr = [];
  for (var i in items) {
      if (items[i].nodeType == 1) {
          itemsArr.push(items[i]);
      }
  }

  itemsArr.sort(function(a, b) {
    return a.id == b.id
            ? 0
            : (a.id > b.id ? 1 : -1);
  });

  for (i = 0; i < itemsArr.length; ++i) {
    list.appendChild(itemsArr[i]);
  }

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
  if (Notification.permission === "granted") {
    var notification = new Notification(message);
  }
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
}

function getJSON(e,n){var s=new XMLHttpRequest;s.open("GET",e,!0),s.responseType="json",s.onload=function(){s.status;n(s.response)},s.send()}

function countArrayGreaterThanOrEqualTo(array, number) {
  var n = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i] >= number)
      n++;
  }
  return n;
}

function interpretMessage(data, key) {
  var uid = data.un;
  firebase.database().ref("uids/"+uid).once('value').then(function(un) {
    data.un = un.val();
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
    if (message != undefined) {
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
      node.innerHTML = detectURL(textnode);
      var textClass = "outputText";
      if (message.indexOf(username.substring(0,Math.max(Math.min(username.length,4),4))) != -1) {
        textClass = "highlight";
      }
      if (node.innerHTML != "undefined") {
        node.setAttribute("class", textClass);
        node.setAttribute("name", key);
        node.setAttribute("id",data.ts);
        document.getElementById("output").appendChild(node);
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
      }
    }
  });
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
