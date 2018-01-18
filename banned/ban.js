function getMessage(tag) {
  var href = window.location.href;
  var reg = new RegExp('[?&]' + tag + '=([^&#]*)', 'i');
  var string = reg.exec(href);
  return string ? string[1] : null;
};

window.onload = function () {
  var message = getMessage("m");
  var until = getMessage("t");
  console.warn(message);
  if (message === null) {
    document.getElementById("adminMessage").innerHTML = "You were probably breaking the rules.";
  } else {
    document.getElementById("adminMessage").innerHTML = "Message: " + message.replace(/%([0-9]{2})/g, " &#$1 ");
  }
  setInterval(function () {
    document.getElementById("timeLeft").innerHTML = formatTime(until - Date.now());
  }, 1000);
}

function formatTime(ts) {
  if (ts > 0) {

    var sec = ts / 1000,
      min = sec / 60,
      hour = min / 60,
      day = hour / 24;
    sec %= 60;
    min %= 60;
    hour %= 24;

    function format(n, unit) {
      n = Math.floor(n);
      return n + " " + unit + (n == 1 ? "" : "s") + ", "
    }
    sec = format(sec, "second");
    min = format(min, "minute");
    hour = format(hour, "hour");
    day = format(day, "day");
    sec = sec.substring(0, sec.length - 2);
    var result = day + hour + min + "and " + sec + "."
    return result;
  } else {
    return 'Your ban has expired. Click <a href="../index.html">here</a> to go back to UniChat.';
  }
}