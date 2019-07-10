const Lapser = require("./lib/Lapser.js");

const LOCAL_CONFIG = { };

const newLapser = (name, autostart) => {
  let lapser = new Lapser(name);
  if (autostart === true || LOCAL_CONFIG.autostart === true){
    lapser.start();
  }
  return lapser;
};

newLapser.setAutostart = (toggle) => {
  LOCAL_CONFIG.autostart = toggle;
};

module.exports = newLapser;

