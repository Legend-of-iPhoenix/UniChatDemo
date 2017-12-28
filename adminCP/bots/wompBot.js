//You are welcome.
wompBot.executeCommand = function (data) {
  var poster = data.poster;
  var message = data.message;
  var numDecimals = 5;
  var result = ""
  if (message.substring(0, 5) == "beta(") {
    var args_raw = message.substring(5).slice(0, -1).split(",");
    var args = [];
    args_raw.forEach(function(element) {
      args[args.length] = (parseFloat(element));
      console.log(element)
    });
    var result = ((Lanczos_Gamma(args[0]) * Lanczos_Gamma(args[1])) / Lanczos_Gamma(args[0] + args[1])).toFixed(numDecimals);
    this.respond(poster + ": beta(" + args[0] + ", " + args[1]+") is roughly equal to "+ result + ".");
  }
  if (message.substring(0, 6) == "gamma(") {
    var args_raw = message.substring(6).slice(0, -1).split(",");
    var args = [];
    args_raw.forEach(function(element) {
      args.push(parseFloat(args_raw));
    });
    this.respond(poster + ": gamma("+args[0]+") is roughly equal to " + (Lanczos_Gamma(args[0])).toFixed(numDecimals) + ".");
  }
}
//source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-49.php
//I modified this so it worked. The example given on that page has a small error.
function Lanczos_Gamma(num) {
  var p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  var i;
  var g = 7;
  if (num < 0.5) return Math.PI / (Math.sin(Math.PI * num) * Lanczos_Gamma(1 - num));
  num -= 1;
  var a = p[0];
  var t = num + g + 0.5;
  for (i = 1; i < p.length; i++) {
    a += p[i] / (num + i);
  }
  return Math.sqrt(2 * Math.PI) * Math.pow(t, num + 0.5) * Math.exp(-t) * a;
}