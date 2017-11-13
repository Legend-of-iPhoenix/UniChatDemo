var username = "anonymous";
function assignUsername()
{
  var adj = ["Anonymous","Small", "Red","Orange","Yellow","Blue","Indigo","Violet","Shiny","Sparkly","Large","Hot","Cold","Evil","Kind","Ugly","Legendary","Flaming"];
  var noun = ["Bear", "Dog","Cat","Banana","Pepper","Bird","Lion","Apple","Phoenix","Diamond","Jewel","Person","Whale","Plant","Duckling","Thing","Flame"];

  var rAdj = Math.floor(Math.random()*adj.length);
  var rNoun = Math.floor(Math.random()*noun.length);
var name = adj[rAdj] + noun[rNoun];
  var u = prompt("Please Enter Your Username:", name);
  u = u.replace(/[\'\"\;]/g,'');
	if (u == "_iPhoenix_")
	{
		u = name;
	}
  document.cookie = "unichat_uid="+u+";expires=Tue, 19 Jan 2038 03:14:07 UTC";
  alert("Username set to \'"+u+"\'");
  username = u;
}

assignUsername();


function submitMessage() {
	var database = firebase.database();
  var messageBox = document.getElementById("message");
	if (messageBox.value != undefined && messageBox.value != "" && messageBox.value != '')
	{
	  database.ref("Data").push({
 	      text: messageBox.value,
	      ts: Date.now(),
	      un: username
 	 });
	}
  messageBox.value = "";
}

 document.getElementById("message") .addEventListener("keyup", function(event) { event.preventDefault(); if (event.keyCode === 13) { submitMessage(); } });

var dataRef = firebase.database().ref("Data");
dataRef.orderByChild("ts").limitToLast(10).on('child_added', function (snapshot) {
    var data = snapshot.val();
    var message = data.text;
	
    var datePosted = data.ts;
    var tempDate = new Date;
    tempDate.setTime(datePosted);
    var dateString = tempDate.getHours() + ":" + tempDate.getMinutes() + ":" + tempDate.getSeconds()

    var posterUsername = data.un;
    if (message != undefined)
    {
      var node = document.createElement("DIV");
      var textnode = document.createTextNode('\n' + "[" + dateString + "]  " + posterUsername + ': ' + message);
      node.appendChild(textnode);
      document.getElementById("output").appendChild(node);
    }
});
