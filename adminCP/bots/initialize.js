var iPhoenixBot = new Bot("iPhoenixBot", "~");
var karmaBot = new Bot("karmaBot", "~");
var wompBot = new Bot("wompBot", "#");

function initializeBots() {
  iPhoenixBot.register();
  karmaBot.register();
  wompBot.register();
}