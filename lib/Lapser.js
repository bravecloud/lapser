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
    this.lapses.push({
      key: key ? key : this.lapses.length.toString(),
      ts: Util.ts()
    });
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

  getMax() {
    //Maximum elapsed time is only applicable when at least one time point is present
    if (this.lapses.length === 0) {
      return {
        key: this.name,
        ts: this.epoch,
        elapsed: 0
      };
    }
    //If only one time point is present, it is the max
    else if (this.lapses.length === 1) {
      return {
        key: this.lapses[0].key,
        ts: this.lapses[0].ts,
        elapsed: this.lapses[0].ts - this.epoch
      };
    }
    //Otherwise, calculate the elapsed time for each time point and return the greatest.
    else {
      //Start with first time point as the max
      let max = {
        key: this.lapses[0].key,
        ts: this.lapses[0].ts,
        elapsed: this.lapses[0].ts - this.epoch
      };
      //Skip the 1st element since it's initialized as the max time point
      for (let i=1, last=this.lapses[i - 1];i < this.lapses.length;i++, last = this.lapses[i - 1]) {
        let current = this.lapses[i];
        //Set the new max if applicable.
        if (current.ts - last.ts > max.elapsed) {
          max = {
            key: current.key,
            ts: current.ts,
            elapsed: current.ts - last.ts
          };
        }
      }
      return max;
    }
  }

  getSummary() {
    let summaryLapses = [];
    this.lapses.forEach((lapse, idx) => {
      summaryLapses.push({
        key: lapse.key,
        ts: lapse.ts,
        elapsed: lapse.ts - (idx > 0 ? this.lapses[idx - 1].ts : this.epoch)
      });
    });
    return {
      name: this.name,
      start: this.epoch,
      end: this.lapses.length ? this.lapses[this.lapses.length - 1].ts : this.epoch,
      elapsed: this.elapsed(),
      lapses: summaryLapses
    };
  }

  toString() {
    const self = this;
    let str = `${this.name} ${this.elapsed()}ms`;
    if (this.lapses.length > 1) {
      str += this.lapses.reduce((acc, cur, idx, src) => {
        let lastTs = self.epoch;
        if (idx > 0) {
          lastTs = src[idx - 1].ts;
        }
        return acc + `  - ${cur.key} ${cur.ts - lastTs}ms\n`;
      }, "\n");
    }
    return str;
  }
};



