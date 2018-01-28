//Thanks, guys. It means a lot. - The Development Team
var closedBetaTesters = ["SM84CE", "TheLastMillennial", "TLM", "Battlesquid", "xMarminq_"];

var bot_contributors = ["SM84CE", "jcgter777", "womp", "123outerme"];

var helpers = ["LAX18","MrDKKing","jcgter777","Drewster30","mets11rap"];

function getMessage(tag) {
  var href = window.location.href;
  var reg = new RegExp('[?&]' + tag + '=([^&#]*)', 'i');
  var string = reg.exec(href);
  return string ? string[1] : null;
};

window.onload = function () {
  getKarma(decodeURI(getMessage("u")));
}

function display(user, karma) {
  if (user !== "undefined" && user !== "null"  && user) {
    document.getElementById("username").innerText = user;
    document.getElementById("karma").innerText = "Karma: +" + karma;
    document.getElementById("rank").innerHTML = getTitle(user, karma);
  } else {
    document.getElementById("username").innerText = "That user does not appear in our database, or the request was badly formatted.";
    document.getElementById("rank").innerHTML = "Sorry!";
  }
}

function getTitle(username, karma) {
  if (username == "Drewster30" || username == "iPhoenix" || username == "_iPhoenix_") {
    if (username == "Drewster30") {
      document.getElementById("username").style.color = "#0f0";
      document.getElementById("username").style.fontWeight = "bold";
      return "Moderator";
    } else {
      document.getElementById("username").style.color = "#d50";
      document.getElementById("username").style.fontWeight = "bolder";
      if (username == "iPhoenix" || username == "_iPhoenix_") {
        document.getElementById("username").style = "background: -webkit-linear-gradient(#f83000, #f90); linear-gradient(#f83000, #f90); -webkit-background-clip: text; -webkit-text-fill-color: transparent;";
      }
      return "Admin";
    }
  } else {
    if (username == "Battlesquid") {
      document.getElementById("username").className = "battlesquid";
      return "Closed Beta Tester";
    }
    if (username == "SM84CE") {
      document.getElementById('username').style.color = "#94f3bd";
      return "Closed Beta Tester";
    }
    if (helpers.indexOf(username) != -1) {
      document.getElementById("username").className = "glowing";
      return "Contributor"
    }
    if (closedBetaTesters.indexOf(username) != -1) {
      document.getElementById("username").style.textShadow = "#999 0px 0px 100px";
      return "Closed Beta Tester";
    }
    if (bot_contributors.indexOf(username) != -1) {
      document.getElementById("username").style.textShadow = "#999 0px 0px 100px";
      return "Contributed a bot!";
    }
    if (karma < 10) {
      return "New User";
    }
    if (karma >= 10 && karma < 25) {
      return "User";
    }
    if (karma >= 25 && karma < 50) {
      return "Member";
    }
    if (karma >= 50 && karma < 100) {
      return "Well-Respected Member";
    }
    if (karma >= 100) {
      return "^^ has no life";
    }
  }
}

function getKarma(user) {
  firebase.database().ref("uids/"+user).once('value').then(function(s) {
    var k = s.val();
    firebase.database().ref("users/"+user).once("value").then(function(snapshot) {
      display(snapshot.val().u, snapshot.val().karma);
    });
  });
}
