function setCookie(cname, cvalue, ext) {
    var d = new Date();
    d.setTime(d.getTime() + (ext));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function redirectFromHub() {
  var data = document.getElementsByName("hubSelect");
  var selectedRoom = "Chat";
  for(var i = 0; i < data.length; i++) {
   if(data[i].checked)
       selectedRoom = data[i].value;
 }
  setCookie("unichat_room",selectedRoom,30000);
  window.location.replace("https://legend-of-iphoenix.github.io/UniChat/");
}
