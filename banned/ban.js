function getMessage(tag) {
  var href = window.location.href;
  var reg = new RegExp('[?&]' + tag + '=([^&#]*)', 'i');
  var string = reg.exec(href);
  return string ? string[1] : null;
};

window.onload = function() {
  var message = getMessage("m");
  var until = getMessage("t");
  console.warn(message);
  if (message === null) {
    document.getElementById("adminMessage").innerHTML = "You were probably breaking the rules.";
  } else {
    document.getElementById("adminMessage").innerHTML = "Message: " + message.replace(/%([0-9]{2})/g, " &#$1 ");
  }
  setInterval(function() {
    document.getElementById("timeLeft").innerHTML = formatTime(until - Date.now());
  }, 1000);
}

function formatTime(ts) {
  if (ts > 0) {
    var dt = new Date(ts);
    var shours = "s",
      sminutes = "s",
      sseconds = "s";
    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var seconds = dt.getSeconds();

    if (hours == 1)
      shours = "";
    if (minutes == 1)
      sminutes = "";
    if (seconds == 1)
      sseconds = "";

    return hours + " hour" + shours + ", " + minutes + " minute" + sminutes + ", and " + seconds + " second" + sseconds + "."
  } else {
    return 'Your ban has expired. Click <a href="../index.html">here</a> to go back to UniChat.';
  }
}