//      ________          _ _____  _                      _          
//     /  ____  \        (_)  __ \| |                    (_)         
//    /  / ___|  \        _| |__) | |__   ___   ___ _ __  ___  __    
//   |  | |       |      | |  ___/| '_ \ / _ \ / _ \ '_ \| \ \/ /    
//   |  | |___    |      | | |    | | | | (_) |  __/ | | | |>  <     
//    \  \____|  /       |_|_|    |_| |_|\___/ \___|_| |_|_/_/\_\    
//     \________/    ______                                   ______ 
//                  |______|                                 |______|
//
// (just ask if you want to use my source, I probably won't say no.) 


var selectedRoom = "Chat";
var isSignedIn = false;
var dataRef;

var username = "anonymous";

function assignUsername()
{
  var adj = ["Anonymous","Small", "Red","Orange","Yellow","Blue","Indigo","Violet","Shiny","Sparkly","Large","Hot","Cold","Evil","Kind","Ugly","Legendary","Flaming","Salty","Slippery"];
  var noun = ["Bear", "Dog","Cat","Banana","Pepper","Bird","Lion","Apple","Phoenix","Diamond","Jewel","Person","Whale","Plant","Duckling","Thing","Flame","Number","Cow","Dragon","Hedgehog"];

  var rAdj = Math.floor(Math.random()*adj.length);
  var rNoun = Math.floor(Math.random()*noun.length);
  var name = adj[rAdj] + noun[rNoun];
  return name;
}
function unRegisterAllEventListeners(obj) {
	if ( typeof obj._eventListeners == 'undefined' || obj._eventListeners.length == 0 ) {
		return;	
	}
	for(var i = 0, len = obj._eventListeners.length; i < len; i++) {
		var e = obj._eventListeners[i];
		obj.removeEventListener(e.event, e.callback);
	}

	obj._eventListeners = [];
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
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
    var u = getCookie("unichat_uid");
    if (u != "") {
        alert("Welcome back to UniChat, " + u);
    } else {
        u = prompt("Please Enter a Username:", assignUsername());
	    u = u.replace(/\W/g,'');
        if (u != "" && u != null && u != "_iPhoenix_" && u != "Console" && u != "CONSOLE") {
            setCookie("unichat_uid", u, 2*365);
        }
	else
	{
	    u = "_"+assignUsername();
	}
    }
    return u;
}


function submitMessage() {
    if(isSignedIn)
    {
	var database = firebase.database();
  var messageBox = document.getElementById("message");
	if (messageBox.value != undefined && messageBox.value != "" && messageBox.value != '' && messageBox.value.length < 256)
	{
	  database.ref("Data/"+selectedRoom).push({
 	      text: messageBox.value,
	      ts: Date.now(),
	      un: username
 	 });
	}
  messageBox.value = "";
    }
}

 document.getElementById("message") .addEventListener("keyup", function(event) { event.preventDefault(); if (event.keyCode === 13) { if (isSignedIn) {submitMessage();} } });

var formatTime = function(ts) {
    var dt = new Date(ts);

    var hours = dt.getHours();
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

    return hours + ":" + minutes + ":" + seconds;
}

function redirectFromHub() {
	if (isSignedIn)
	{
		dataRef.off();
	}
  var n = document.getElementById('output');
  while (n.hasChildNodes()) {
    n.removeChild(n.firstChild);
  }
  var data = document.getElementsByName("hubSelect");
  for(var i = 0; i < data.length; i++) {
   if(data[i].checked)
       selectedRoom = data[i].value;
 }
  username = checkCookie();
  dataRef = firebase.database().ref("Data/"+selectedRoom);
  isSignedIn = true;
  dataRef.orderByChild("ts").limitToLast(25).on('child_added', function (snapshot) {
    var data = snapshot.val();
    var message = data.text;
	
    var datePosted = data.ts;
    var tempDate = new Date;
    tempDate.setTime(datePosted);
    var dateString = formatTime(tempDate);

    var posterUsername = data.un;
    if (message != undefined)
    {
      var node = document.createElement("DIV");
      var messageHeader = message.substring(0,3);
      var textnode;
      if (messageHeader === "/me" && messageHeader !== "/pm")
      {
	textnode = document.createTextNode('\n' + "[" + dateString + "]  *" + posterUsername + ' ' + message.substring(3,message.length));
      }
      else
      {
	//var usernamePotential = message.substring(0,3);
	var str = message.substring(4,message.length);
	var reg = /\w*/;
        var match = reg.exec(str);
	var messagePM = message.substring(4+match[0].length,message.length);
	if (messageHeader === "/pm" && match[0] == username)
	{
           textnode = document.createTextNode('\n' + "[" + dateString + "]  *" + posterUsername + ' whispers to you: ' + messagePM);
	}
	else
	{
           if (messageHeader !== "/pm")
	   {
              textnode = document.createTextNode('\n' + "[" + dateString + "]  " + posterUsername + ': ' + message);
	   }
	}
      }
      node.appendChild(textnode);
      document.getElementById("output").appendChild(node);
      
var objDiv = document.getElementById("output");
objDiv.scrollTop = objDiv.scrollHeight;
    }
});
}
