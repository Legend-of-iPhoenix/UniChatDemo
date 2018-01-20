var usernameDiv;
var data;

window.onload = function () {
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
      var uuid = null;
      firebase.database().ref("uids/").once('value').then(function (uid) {
      	data = uid.val()
        uid = contains(uid.val(),value);
        if (!uid) {
          firebase.database().ref("maxUid").transaction(function (max_uid) {
            max_uid++;
            uuid = max_uid;
            return max_uid;
          }).then(function () {
            uid = uuid;
            firebase.database().ref("uids/" + uid).set(value).then(function () {
						  localStorage.setItem("unichat_uid2",uid)
              window.open("../");
            });
          });
        }
        else {
        	document.getElementById("messages").innerText = "That username is already taken!";
        }
      });
    }
    else {
    	document.getElementById("messages").innerText = "That username is not valid!";
    }
  }
  else {
  	document.getElementById("messages").innerText = "That username is not valid!";
  }
}
