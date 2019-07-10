let count = 0;

module.exports = new class {
  ts() { return new Date().getTime(); };
  id() { return "Lapser-" + ++count; };
};