//      ________          _ _____  _                      _
//     /  ____  \        (_)  __ \| |                    (_)
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\
//     \________/   ______                                      ______
//                 |______|                                    |______|
//
// V0.67.0b0
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
var isMentioned = false;
var room = "_default";
var unread = 0;
var unichat_uid2 = null;
var preventDouble = false;

var numLimit, nLimit;

var username = "anonymous";

/*
 * Format: [<replacenment>,<name of file>]
 * <replacement> is the text you want the image to replace.
 * <name of file> is the name of the file in the /emotes/ folder, minus the .png at the end.
*/
var emoteReplacements = [
  [":P","tounge"],
  [":)","smile"],
  [";)","wink"],
  [":roll:","eyeroll"],
  [":D","happy"],
  [":O=","vomit"],
  ["???","what"],
  [":o","whistle"],
  ["!!!","exclamationpoint"],
  ["O.o","confused"],
  [":rofl:","rofl"],
  [":(","sad"],
  [":X","angry"],
  [":p","tounge2"]
];

function getRoom() {
  var str = location.href;
  var match = str.match(/\?room=(\w*)/) ? str.match(/\?room=(\w*)/)[1] : "_default";
  return /^(\w{1,64})/.test(match) ? match : "_default";
}

function checkUsername(callback) {
  var u = document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") ? document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") : ((location.href.match(/u=[0-9]*/) ? location.href.match(/u=([0-9]*)/)[1] : false));
  console.log(u);
  unichat_uid2 = u;
  var n = unichat_uid2;
  firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function (a) {
    a.forEach(function (a) {
      var n = a.val(),
        i = (n.t, n.m);
      if (null !== n && void 0 !== n && n.t >= Date.now()) {
        var t = n.t,
          e = "";
        "" != i && (e = "?m=" + i + "&t=" + t), window.location.href = "banned/index.html" + e
      }
    })
  });
  if (u && u != "") {
    document.cookie = "unichat_uid2=" + u + ";expires=" + new Date(Date.now() + 157784760000);
    firebase.database().ref("users/" + u).transaction(function (d) {
      d = d ? d : {
        karma: 0
      }
      d.l = new Date()
      return d;
    }).then(function () {
      firebase.database().ref("uids/" + u).once('value').then(function (s) {
        var n = s.val();
        if (n) {
          firebase.database().ref("users/" + u + "/u").set(n);
          username = n;
          callback();
        } else {
          document.getElementById("contentDiv").innerHTML = '<p>You do not have an account or you have been signed out. Please log in or create an account <a href="https://legend-of-iphoenix.github.io/UniChatDemo/login/index.html">here</a>.</p>'
        }
      });
    });
  } else {
    if (!navigator.userAgent.match(/bot/g)) {
      document.getElementById("contentDiv").innerHTML = '<p>You do not have an account or you have been signed out. Please log in or create an account <a href="https://legend-of-iphoenix.github.io/UniChatDemo/login/index.html">here</a>.</p>'
    }
  }
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
  var n = unichat_uid2;
  firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function (a) {
    a.forEach(function (a) {
      var n = a.val(),
        i = (n.t, n.m);
      if (null !== n && void 0 !== n && n.t >= Date.now()) {
        var t = n.t,
          e = "";
        "" != i && (e = "?m=" + i + "&t=" + t), window.location.href = "banned/index.html" + e
      }
    })
  });
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
            tag: currentMessageTags,
            to: recipient,
            n: 0,
            v: nLimit,
            x: numLimit,
            k: 0
          });
          database.ref("online/" + room + "/" + unichat_uid2).set(new Date().getTime());
          database.ref("users/" + document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") + "/s").transaction(function (s) {
            return s + 1
          });
          lastMessageTime = new Date().getTime();
          lastMessageRef = unichat_uid2 + "-" + n + "-" + numLimit;
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
  checkUsername(function () {
    firebase.auth().currentUser.updateProfile({
      email: username + "@fake.co"
    });
    dataRef = firebase.database().ref("Data/" + room + "/");
    isSignedIn = true;
    firebase.database().ref("online/" + room + "/" + unichat_uid2).set(new Date().getTime());
    dataRef.orderByChild("ts").limitToLast(25).on('child_added', function (snapshot) {
      var data = snapshot.val();
      interpretMessage(data, snapshot.key);
    });
    dataRef.orderByChild("ts").limitToLast(25).on('child_changed', function (snapshot) {
      var data = snapshot.val();
      interpretChangedMessage(data, snapshot.key);
    });
    firebase.database().ref("online/" + room + "/").on('child_added', function (snapshot) {
      firebase.database().ref("uids/"+snapshot.key).once('value').then(function(username) {
        var container = document.getElementById("online-users");
        var node = document.createElement("A");
        node.setAttribute("href","https://legend-of-iphoenix.github.io/UniChatDemo/profile/index.html?u="+snapshot.key);
        node.innerText = username.val() + "\n";
        container.appendChild(node);
        node.setAttribute("name", snapshot.key);
      });
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
  room = getRoom();
  setInterval(function () {
    isHidden() || (unread = 0, isMentioned = !1, document.title = "UniChat Beta")
  }, 250);
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
      setInterval(isActive, 60000);
      setTimeout(isActive, 3000);
      redirectFromHub();
    } else {
      document.getElementById("contentDiv").innerHTML = '<p>You do not have an account or you have been signed out. Please log in or create an account <a href="https://legend-of-iphoenix.github.io/UniChatDemo/login/index.html">here</a>.</p>'
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
  var n = unichat_uid2;
  if (firebase.auth().currentUser.email == unichat_uid2 + "@fake.co") {
    firebase.database().ref("bans/").orderByChild("i").equalTo(n).limitToLast(1).once("value").then(function (a) {
      a.forEach(function (a) {
        var n = a.val(),
          i = (n.t, n.m);
        if (null !== n && void 0 !== n && n.t >= Date.now()) {
          var t = n.t,
            e = "";
          "" != i && (e = "?m=" + i + "&t=" + t), window.location.href = "banned/index.html" + e
        }
      })
    });
    var curTime = new Date().getTime();
    firebase.database().ref("/online/" + room + "/").once('value').then(function (p) {
      p.forEach(function (snapshot) {
        //5 minutes
        if (curTime > 5 * 60 * 1000 + snapshot.val()) {
          firebase.database().ref("online/" + room + "/" + snapshot.key).remove();
        }
      })
    });
    var list = document.getElementById('output');

    var items = list.childNodes;
    var itemsArr = [];
    for (var i in items) {
      if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
        itemsArr.push(items[i]);
      }
    }

    itemsArr.sort(function (a, b) {
      return a.id == b.id ?
        0 :
        (a.id > b.id ? 1 : -1);
    });

    for (i = 0; i < itemsArr.length; ++i) {
      list.appendChild(itemsArr[i]);
    }
  }
  else {
    firebase.auth().signOut();
  }
}

window.onbeforeunload = function () {
  firebase.database().ref("online/" + room + "/" + unichat_uid2).remove();
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
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }
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
  var uid = data.un;
  firebase.database().ref("uids/" + uid.replace(/\W/g,"")).once('value').then(function (un) {
    data.un = un.val();
    if (uid.startsWith('[')) {
      data.un = uid
    }
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
        textnode = n + "  *" + posterUsername + ' ' + message.substring(3, message.length);
      } else {
        var str = message.substring(4, message.length);
        var reg = /\w*/;
        var match = reg.exec(str);
        var messagePM = message.substring(4 + match[0].length, message.length);
        if (messageCommand === "pm") {
          if (match[0] == username) {
            textnode = "[PM][" + posterUsername + "-> You]: " + messagePM;
          } else {
            if (posterUsername == username) {
              textnode = "[PM][You -> " + match[0] + "]: " + messagePM;
            }
          }
        } else {
          if (messageCommand !== "pm") {
            textnode = n + "  " + posterUsername + ': ' + message;
          }
        }
      }
      if (notificationStatus && messageCommand != "pm") {
        notifyMe(textnode);
      }
      node.innerHTML = "[" + dateString + "]" + detectURL(textnode);
      var textClass = "outputText";
      if (message.indexOf(username.substring(0, Math.max(Math.min(username.length, 4), 4))) != -1) {
        textClass = "highlight";
        if (highlightNotificationStatus)
          notifyMe(textnode);
      }
      if (username == "TheLastMillennial" && message.indexOf("TLM") != -1) {
        textClass = "highlight";
        if (highlightNotificationStatus)
          notifyMe(textnode);
      }
      if (isHidden()) {
        if (!message.startsWith("/pm")) {
          preventDouble = !preventDouble;
          if (preventDouble) {
            unread++;
          }
          isMentioned = (textClass == "highlight") || isMentioned;
          document.title = (isMentioned ? "*" : "+") + " UniChat Beta (" + unread + " unread)";
        }
      } else {
        unread = 0;
        isMentioned = false;
        document.title = "UniChat Beta";
      }
      if (detectURL(textnode) != "undefined") {
        node.setAttribute("class", textClass);
        node.setAttribute("name", key);
        node.setAttribute("id", data.ts);
        document.getElementById("output").appendChild(node);
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
      }
    }
  });
}

function interpretChangedMessage(data, key) {
  if (document.getElementsByName(key)[0] && data.n) {
    document.getElementsByName(key)[0].remove();
    interpretMessage(data, key);
  }
}

function cleanse(message) {
  var n = document.createElement("DIV");
  n.innerText = message;
  return n.innerHTML;
}

function detectURL(message) {
  message = cleanse(message);
  message = message.replace(/\*([^\*]*)\*/g, '<div style="display: inline-block;" class="md-bold">$1</div>');
  message = message.replace(/\~([^\~]*)\~/g, '<div style="display: inline-block;" class="md-italic">$1</div>');
  message = emotes(message)
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

function emotes(message) {
  //Replace each of the emotes with an image tag pointing towards the file name given.
  emoteReplacements.forEach(function(emote){
      message = message.split(emote[0]).join('<img src="emotes/'+emote[1]+'.png" class="emote" alt="'+emote[0]+'"></img>');
  });
  return message;
}

function isHidden() {
  var n = function () {
    var n = ["webkit", "moz", "ms", "o"];
    if ("hidden" in document) return "hidden";
    for (var e = 0; e < n.length; e++)
      if (n[e] + "Hidden" in document) return n[e] + "Hidden";
    return null
  }();
  return !!n && document[n]
};

function redirect(url) {
  window.open(url, '_self');
}

function redirectToNewPrivateRoom() {
  var roomID = Math.floor(Math.random() * 1048576).toString(16) + (new Date().getTime().toString(16).substring(2, 8)) + Math.floor(Math.random() * 1048576).toString(16);
  window.open("https://legend-of-iphoenix.github.io/UniChatDemo/?room=" + roomID)
}
