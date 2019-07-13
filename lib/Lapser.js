const Util = require("./Util");

module.exports = class {
  constructor(name) {
    this.name = name ? name : Util.id();
    this.lapses = [];
    this.epoch = NaN;
  }

  start() {
    this.epoch = Util.ts();
  }

  lapse(key) {
    let ts = Util.ts();
    //Create a default key if non exists
    key = key ? key : this.lapses.length.toString();
    //Calculate elapsed time, using last lapse point if exists or using the start epoch otherwise.
    let elapsed = ts - (this.lapses.length ? this.lapses[this.lapses.length - 1].ts : this.epoch);
    //Add new lapse point
    this.lapses.push({ key, ts, elapsed });
    //Return this instance to enable chaining.
    return this;
  }

  elapsed() {
    if (this.lapses.length === 0) {
      return 0;
    }
    return this.lapses[this.lapses.length - 1].ts - this.epoch;
  } 

  getName() {
    return this.name;
  }

  getStart() {
    return this.epoch;
  }

  getLapses() {
    return this.lapses.slice(0);
  }

  getMax() {
    //Maximum elapsed time is only applicable when at least one time point is present
    if (this.lapses.length === 0) {
      return {
        key: this.name,
        ts: this.epoch,
        elapsed: 0
      };
    }
    //Otherwise sort lapse points based on elapsed time and return the instance with the largest duration.
    else {
      return Object.freeze(this.lapses.sort((a, b) => { return b.elapsed - a.elapsed; })[0]);
    }
  }

  getSummary() {
    return {
      name: this.name,
      start: this.epoch,
      end: this.lapses.length ? this.lapses[this.lapses.length - 1].ts : this.epoch,
      elapsed: this.elapsed(),
      lapses: this.lapses.slice(0)
    };
  }

  json() {
    return {
      name: this.name,
      elapsed: this.elapsed()
    };
  }

  toString() {
    const self = this;
    let str = `${this.name} ${this.elapsed()}ms`;
    if (this.lapses.length > 1) {
      str += this.lapses.reduce((acc, cur) => {
        return acc + `  - ${cur.elapsed}ms\n`;
      }, "\n");
    }
    return str;
  }
};



