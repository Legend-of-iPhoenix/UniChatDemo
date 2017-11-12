var username = "anonymous";
function assignUsername()
{
  var adj = ["Anonymous","Small", "Red","Orange","Yellow","Blue","Indigo","Violet","Shiny","Sparkly","Large","Hot","Cold","Evil","Kind","Ugly","Legendary"];
  var noun = ["Bear", "Dog","Cat","Banana","Pepper","Bird","Lion","Apple","Phoenix","Diamond","Jewel","Person","Whale","Plant","Duckling","Thing"];

  var rAdj = Math.floor(Math.random()*adj.length);
  var rNoun = Math.floor(Math.random()*noun.length);
var name = adj[rAdj] + noun[rNoun];
  var u = prompt("Please Enter Your Username:", name);
  u = u.replace(/[\'\"\;]/g,'');
  document.cookie = "unichat_uid="+u+";expires=Tue, 19 Jan 2038 03:14:07 UTC";
  alert("Username set to \'"+u+"\'");
  username = u;
}

assignUsername();

function submitMessage() {
	var database = firebase.database();
  var messageBox = document.getElementById("message");
  database.ref("Data").push({
    value: messageBox.value,
    timestamp: Date.now(),
    userName: username;
  });
  messageBox.value = "";
}
