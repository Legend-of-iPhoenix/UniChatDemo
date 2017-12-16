var karma;
var user;

function getData() {
    var href = window.location.href;
    var reg = new RegExp( '[?&]u=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

window.onload = function() {
  user = getData();
  if (user) {
  	document.title = "View Profile: " + user + "| UniChat Beta";
    firebase.database().ref("/usernames/"+user+"/karma").once("value").then(function(snapshot) {
     karma = snapshot.val();
     var n = "profileLink";
     var str = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
     str = str.substring(0, str.length - (1 + n.length));
     window.location.replace(str + "profile/index.html?u="+user+"&k="+karma);
    });
  }
}