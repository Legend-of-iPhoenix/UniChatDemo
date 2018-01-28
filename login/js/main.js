var usernameDiv;
var data;

window.onload = function () {
  if (location.href.indexOf("?logout") != -1) {
    document.cookie="unichat_uid2=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;";
    document.body.innerHTML += '<p id="logged-out">You have successfully been logged out of your account.</p>';
    setTimeout(function(){document.getElementById("logged-out").remove();},10000);
  }
  else {
    if (document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") != "") {
      location.href = "https://legend-of-iphoenix.github.io/UniChatDemo/?u="+document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }
  }
  usernameDiv = document.getElementById("username");
  usernameDiv.oninput = function () {
    var value = usernameDiv.value;
    if (value) {
      usernameDiv.classList = "invalid";
      if (value.length >= 2 && value.length <= 32) {
        var match = value.match(/\w{2,32}/) ? value.match(/\w{2,32}/)[0] : null;
        if (match === value) {
          usernameDiv.classList = "valid";
        }
      }
    } else {
      usernameDiv.classList = "";
    }
  }
  document.getElementById("password").oninput = function () {
    var value = document.getElementById("password").value;
    if (value) {
      document.getElementById("password").classList = "invalid";
      if (value.length >= 2 && value.length <= 32) {
        var match = value.match(/.{8,64}/) ? value.match(/.{8,64}/)[0] : null;
        if (match === value) {
          document.getElementById("password").classList = "valid";
        }
      }
    } else {
      document.getElementById("password").classList = "";
    }
  }
}

function submit() {
  function contains(json, value) {
    let keyName = false;
    Object.keys(json).some(key => {
      if (json[key] === value) {
        keyName = key;
      }
      return keyName;
    });
    return keyName;
  }
  var value = usernameDiv.value;
  if (usernameDiv.classList[0] == "valid") {
    firebase.database().ref("uids/").once('value').then(function (snapshot) {
      var uid = contains(snapshot.val(), value);
      if (uid) {
        firebase.database().ref("pass/" + uid).set(btoa(document.getElementById("password").value)).then(function () {
          document.cookie = "unichat_uid2=" + uid + ";expires=" + new Date(Date.now() + 157784760000);
          location.href = "https://legend-of-iphoenix.github.io/UniChatDemo/?u="+uid;
        }).catch(function (error) {
          document.getElementById("messages").innerText = "Incorrect password!";
        });
      }
      else {
        document.getElementById("messages").innerText = "Username does not exist. Please click the register link and sign up!";
      }
    });
  }
}
