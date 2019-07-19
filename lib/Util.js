let count = 0;

module.exports = new class {
  ts() {
    return new Date().getTime();
  }

  id() {
    return "Lapser-" + ++count;
  }

  log(lapser) {
    console.log(`[Lapser] [${new Date().toUTCString()}] ${lapser.getName()} ${lapser.elapsed()}ms`);
  }
};