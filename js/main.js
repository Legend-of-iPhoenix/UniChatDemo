var provider = new firebase.auth.GoogleAuthProvider();

var userID;
function assignUID()
{
  //var fireNewID = firebase.database().ref().child("NewID");
  firebase.auth().signInWithRedirect(provider);
  
  firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // ...
  }
  // The signed-in user info.
  var user = result.user;
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  // ...
});
  
  /*fireNewID.once('value').then(function(snapshot) {
    userID = snapshot.val();
  });
  
  console.log(UID);
  
  document.cookie; */
}

assignUID();

function submitMessage() {
	var database = firebase.database();
  var messageBox = document.getElementById("message");
  database.ref("Data").push({
    value: messageBox.value,
    timestamp: Date.now()//,
    //UID: userID
  });
  messageBox.value = "";
}
