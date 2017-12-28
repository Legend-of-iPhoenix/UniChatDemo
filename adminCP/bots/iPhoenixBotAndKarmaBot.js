iPhoenixBot.executeCommand = function (data) {
  var poster = data.poster;
  var message = data.message;
  if (message.substring(0, 5) == "rules") {
    this.respond("Please stop breaking the rules.");
  }
  if (message.substring(0, 4) == "spam") {
    this.respond("Please stop spamming.");
  }
  if (message.substring(0, 14) == "releasethebots") {
    this.respond("THE BOTS HAVE BEEN RELEASED!!!");
  }
  if (message.substring(0, 10) == "stophating") {
    this.respond("It has \"Beta\" in the title for a reason.");
  }
  if (message.substring(0, 11) == "commandlist" || message.substring(0, 8) == "factoids" || message.substring(0, 8) == "commands") {
    this.respond("Command List: https://github.com/Legend-of-iPhoenix/UniChatDemo/wiki/Command-List");
  }
  if (message.substring(0, 3) == "bad") {
    this.respond("That's so bad, it's almost impressive!");
  }
}
karmaBot.karmaRankingCallback = function (data) {
  this.respond(data.username + " is ranked #" + data.ranking + " in our database, with " + data.karma + " karma.");
}
karmaBot.getKarmaRanking = function (username) {
  var children = [];
  firebase.database().ref("usernames/").orderByChild("karma").once('value').then(function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      children[children.length] = [childSnapshot.key, childSnapshot.val().karma];
    });
    children.sort(function (a, b) {
      var n = 0;
      if (a[1] === undefined) {
        n = 1;
      } else {
        if (b[1] === undefined) {
          n = -1;
        } else {
          n = b[1] - a[1];
        }
      }
      return n
    });
    var j = 0;
    children.forEach(function (child) {
      j++;
      if (child[0] == username) {
        karmaBot.respond(child[0] + " is ranked #" + j + " in our database, with " + child[1] + " karma.");
      }
    });
  });
}
karmaBot.executeCommand = function (data) {
  var posterUsername = data.poster;
  var message = data.message;
  if (message.substring(0, 7) == "profile") {
    var username = message.substring(9, message.length);
    username = (username == "" ? posterUsername : username);
    this.respond(posterUsername + ": https://legend-of-iphoenix.github.io/UniChatDemo/profile/index.html?u=" + encodeURI(username));
  }
  if (message.substring(0, 5) == "karma") {
    var username = message.substring(7, message.length);
    username = (username == "" ? posterUsername : username);
    var karma = 0;
    firebase.database().ref("usernames/" + username + "/karma").once('value').then(function (snapshot) {
      karma = (snapshot.val() ? parseInt(snapshot.val()) : 0);
      karmaBot.respond(posterUsername + ": " + username + " has " + karma + " karma.");
    });
  }
  if (message.substring(0, 4) == "rank") {
    var username = message.substring(6, message.length);
    this.getKarmaRanking(((username) == "" ? posterUsername : username));
  }
}