var usernameDiv;
var data;
window.onload = function () {
  if (document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1") != "") {
    location.href = "https://legend-of-iphoenix.github.io/UniChatDemo/?u="+document.cookie.replace(/(?:(?:^|.*;\s*)unichat_uid2\s*\=\s*([^;]*).*$)|^.*$/, "$1");
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
    let contains = false;
    Object.keys(json).some(key => {
      contains = !contains ? json[key] === value : false;
      return json[key] === value;
    });
    return contains;
  }
  var value = usernameDiv.value;
  if (document.getElementById("readAgreement").checked) {
    if (usernameDiv.classList[0] == "valid") {
      if (document.getElementById("password").classList[0] == "valid") {
        var uuid = null;
        firebase.database().ref("uids/").once('value').then(function (uid) {
          data = uid.val()
          uid = contains(uid.val(), value);
          if (!uid) {
            firebase.database().ref("maxUid").transaction(function (max_uid) {
              max_uid++;
              uuid = max_uid;
              return max_uid;
            }).then(function () {
              uid = uuid;
              firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function () {
                firebase.database().ref("uids/" + uid).set(value).then(function () {
                  firebase.auth().createUserWithEmailAndPassword(uid+"@fake.co",document.getElementById("password").value).then(function() {
                    document.cookie = "unichat_uid2=" + uid + ";expires=" + new Date(Date.now() + 157784760000);
                    location.href = "https://legend-of-iphoenix.github.io/UniChatDemo/?u="+uid;
                  });
                });
              });
            });
          } else {
            document.getElementById("messages").innerText = "That username is already taken!";
          }
        });
      } else {
        document.getElementById("messages").innerText = "That password is not valid!";
      }
    } else {
      document.getElementById("messages").innerText = "That username is not valid!";
    }
  } else {
    document.getElementById("messages").innerText = "Do you agree to the User Agreement?";
  }
}
