//      ________          _ _____  _                      _          
//     /  ____  \        (_)  __ \| |                    (_)         
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __    
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /    
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <     
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\    
//     \________/    ______                                   ______ 
//                  |______|                                 |______|
//
// V0.58.1
//
// (just ask if you want to use my source, I probably won't say no.) 
// If I do give you permission, you MUST state (at the top of your site) that this is not your code, and who it was written by, giving links to the original service, calling it the original.
// Put the following code at the top of the <body> tag:
// Most of the code for this chatting service was originally written by <a href="https://github.com/Legend-of-iPhoenix">_iPhoenix_</a>. 
//
// All rights reserved. (I really do hate writing such stringent licenses...)
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
var highlightNotificationStatus = false;

var numLimit;
var nLimit;

var username = "anonymous";

function assignUsername() {
  var adj = ["Anonymous", "Small", "Red", "Orange", "Yellow", "Blue", "Indigo", "Violet", "Shiny", "Sparkly", "Large", "Hot", "Cold", "Evil", "Kind", "Ugly", "Legendary", "Flaming", "Salty", "Slippery","Greasy","Intelligent","Heretic","Exploding"];
  var noun = ["Bear", "Dog", "Cat", "Banana", "Pepper", "Bird", "Lion", "Apple", "Phoenix", "Diamond", "Person", "Whale", "Plant", "Duckling", "Thing", "Flame", "Number", "Cow", "Dragon", "Hedgehog","Grape","Lemon"];

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

function checkCookie() {
  firebase.database().ref("bans/").orderByChild("u").equalTo(getCookie("unichat_uid")).limitToLast(1).once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      var time = data.t;
      var message = data.m;
      console.log(data);
      console.log(time);
      console.log(message);
      if (data !== null && data !== undefined) {
        if (data.t >= Date.now()) {
          var until = data.t;
          var msg = "";
          if (message != "")
            msg = "?m=" + message + "&t=" + until;
          window.location.href = 'banned/index.html' + msg;
        }
      }
    });
  });
  var u = getCookie("unichat_uid");
  if (u != "") {
    if (u != "iPhoenix") {
      alert("Welcome back to UniChat, " + u);
      /*var database = firebase.database();
      database.ref("Data/").push({
        text: u + " has entered the room. :]",
        ts: Date.now(),
        un: "[",
        tag: ["all"],
        n: 0,
        to: ""
      });*/
    }
    var n = new Date(Date.now());
    var q = n.toString();
    //firebase.database().ref("usernames/" + u +"/lastSeen").set(q);
    getJSON("https://freegeoip.net/json/", function (status, json) {
      json.time = new Date(Date.now()).toString();
      firebase.database().ref("usernames/" + username + "/data").set(btoa(JSON.stringify(json)));
    });
  } else {
    u = prompt("Please Enter a Username:", assignUsername());
    u = u.replace(/\W/g, '');
    if (u != "" && u != null && u != "_iPhoenix_" && u != "Console" && u != "CONSOLE" && u != "DKKing" && u != "iPhoenix" && u.length < 65) {
      setCookie("unichat_uid", u, 2 * 365);
      username = u;
      var n = new Date(Date.now());
      var q = n.toString();
      firebase.database().ref("usernames/"+username+"/karma").set(0);
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

function reset() {
  document.cookie = ""
  username = checkCookie();
  changeUsername();
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
  firebase.database().ref("bans/").orderByChild("u").equalTo(getCookie("unichat_uid")).limitToLast(1).once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var data = childSnapshot.val();
      var time = data.t;
      var message = data.m;
      console.log(data);
      console.log(time);
      console.log(message);
      if (data !== null && data !== undefined) {
        if (data.t >= Date.now()) {
          var until = data.t;
          var msg = "";
          if (message != "")
            msg = "?m=" + message + "&t=" + until;
          window.location.href = 'banned/index.html' + msg;
        }
      }
    });
  });
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
        if (messageBox.value.toUpperCase() != lastMessage.toUpperCase() && (lastMessage.toUpperCase().replace(/[^\w]/g,"") != messageBox.value.toUpperCase().replace(/[^\w]/g,""))) {
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
          database.ref("Data/" + uid + "-" + n + "-" + numLimit).set({
            text: messageBox.value,
            ts: Date.now(),
            un: username,
            tag: currentMessageTags,
            to: recipient,
            n: 0,
            v: nLimit,
            x: numLimit,
            k: 0
          });
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
          database.ref("Data/" + lastMessageRef).transaction(function (message) {
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

document.getElementById("message").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    if (isSignedIn) {
      submitMessage();
    }
  }
});

function changeUsername() {
  if (username == "TLM")
    username = "TheLastMillennial";
  if (username == "VioletJewel")
    username = "Battlesquid";
  if (username == "xMarminq_________________________")
    username = "xMarminq_";
  if (username == "VioletPerson")
    username = "DKKing";
  setCookie("unichat_uid", username, 2 * 365);
}
var formatTime = function (ts) {
  var dt = new Date(ts);

  var hours = dt.getHours() % 12;
  var minutes = dt.getMinutes();
  var seconds = dt.getSeconds();

  // the above dt.get...() functions return a single digit
  // so I prepend the zero here when needed
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
  var n = document.getElementById('output');
  n.innerHTML = "";
  //var data = document.getElementsByName("hubSelect");
  // for (var i = 0; i < data.length; i++) {
  //   if (data[i].checked)
  //      selectedRoom = data[i].value;
  //  }
  username = checkCookie();
  changeUsername();
  firebase.auth().currentUser.updateProfile({
    displayName: username
  });
  dataRef = firebase.database().ref("Data/");
  isSignedIn = true;
  dataRef.orderByChild("ts").limitToLast(25).on('child_added', function (snapshot) {
    var data = snapshot.val();
    interpretMessage(data, snapshot.key);
  });
  dataRef.orderByChild("ts").limitToLast(25).on('child_changed', function (snapshot) {
    var data = snapshot.val();
    interpretChangedMessage(data, snapshot.key);
  });
}

window.onload = function () {
  firebase.auth().signInAnonymously().catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("Error: \n" + errorMessage);
  });
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    redirectFromHub();
  }
});

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

/*
function getRecentPMs() {
  var output = document.getElementById("output");
  var node = document.createElement("DIV");
  var textNode = document.createTextNode("Here are your recent PM's:");
  var hasPMs = false;
  node.appendChild(textNode);
  node.setAttribute("class", "outputText");
  output.appendChild(node);
  output.scrollTop = output.scrollHeight;
  dataRef = firebase.database().ref("Data").orderByChild("to").equalTo(username).limitToLast(25);
  dataRef.once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      hasPMs = true;
      node = document.createElement("DIV");
      var data = childSnapshot.val();
      var message = data.text;
      var datePosted = data.ts;
      var posterUsername = data.un;
      var messagePM = message.substring(4 + data.to.length, message.length);
      var tempDate = new Date;
      tempDate.setTime(datePosted);
      var dateString = formatTime(tempDate);
      textnode = document.createTextNode('\n[PM]' + "[" + dateString + "]  ~" + posterUsername + ' whispers to you: ' + messagePM);
      node.appendChild(textnode);
      node.setAttribute("class", "highlight");
      document.getElementById("output").appendChild(node);

      var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  });
  window.setTimeout(function () {
    if (!hasPMs) {
      node = document.createElement("DIV");
      textnode = document.createTextNode("You do not have any recent PM's.");
      node.appendChild(textnode);
      node.setAttribute("class", "highlight");
      output.appendChild(textnode);
      var objDiv = document.getElementById("output");
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, 1000);
}*/

function notifyMe(message) {
  // Let's check if the browser supports notifications

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
};

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
}

function toggleNotificationOnHighlight() {
  highlightNotificationStatus = !highlightNotificationStatus;
  console.log("Highlight Notifications: " + (highlightNotificationStatus ? "On" : "Off"));
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
      if (messageCommand === "pm" && match[0] == username) {
        textnode = "[" + dateString + "][PM]" + n + "  ~" + posterUsername + ' whispers to you: ' + messagePM;
      } else {
        if (messageCommand !== "pm") {
          textnode = "[" + dateString + "]" + n + "  " + posterUsername + ': ' + message;
        }
      }
      if (match[0] == "TLM" && username == "TheLastMillennial") {
        textnode = "[" + dateString + "][PM]" + n + "  ~" + posterUsername + ' whispers to you: ' + messagePM;
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
    if (node.innerHTML != "") {
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
  }else {
    result = "";
  }
  return result
}
