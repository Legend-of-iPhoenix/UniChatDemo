var chrome_sent,
  website_sent,
  total_sent,
  chrome_sent_val,
  website_sent_val,
  total_sent_val;
window.onload = function () {
  chrome_sent = document.getElementById("chrome_sent"),
    website_sent = document.getElementById("website_sent"),
    total_sent = document.getElementById("total_sent"),
    chrome_sent_val = 317,
    website_sent_val = 6831,
    firebase.database().ref("/users/").once("value").then(function (e) {
      e.forEach(function (e) {
          var t = e.val();
          chrome_sent_val += void 0 !== t.t ? t.t : 0,
            website_sent_val += void 0 !== t.s ? t.s : 0
        }),
        total_sent_val = chrome_sent_val + website_sent_val,
        chrome_sent.innerText = chrome_sent_val,
        website_sent.innerText = website_sent_val,
        total_sent.innerText = total_sent_val
    }),
    firebase.database().ref("/users/").on("child_changed",
      function (e) {
        chrome_sent_val = 317,
          website_sent_val = 6831,
          firebase.database().ref("/users/").once("value").then(function (e) {
            e.forEach(function (e) {
                var t = e.val();
                chrome_sent_val += void 0 !== t.t ? t.t : 0,
                  website_sent_val += void 0 !== t.s ? t.s : 0
              }),
              total_sent_val = chrome_sent_val + website_sent_val,
              chrome_sent.innerText = chrome_sent_val,
              website_sent.innerText = website_sent_val,
              total_sent.innerText = total_sent_val
          })
      })
}