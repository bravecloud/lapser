const Lapse = require("../index");

const pause = (ms) => {
  return new Promise((r, e) => {
    setTimeout(() => {
      r();
    }, ms);
  });
};

const assert = require('assert');
describe('Lapser', function () {
  it('Instantiation', function () {
    let lapser = Lapse();
    assert.equal("Lapser-1", lapser.getName());
  });
  it('lapse - autostart', function () {
    let lapser = Lapse("Test", true);
    assert.notEqual(lapser.getStart(), NaN);
  });
  it('lapse - default non-autostart ', function () {
    let lapser = Lapse("Test");
    assert(isNaN(lapser.getStart()))
  });
  it('lapse - default autostart via config', function () {
    Lapse.setAutostart(true);
    let lapser = Lapse("Test");
    assert(!isNaN(lapser.getStart()));
    //Restore default
    Lapse.setAutostart(false);
  });
  it('lapse - basic total with 1 lapse, inline chain', function (done) {
    let lapser = Lapse("Test", true);
    pause(200).then(_ => {
      //Some latency is expected with code execution, so elapsed time won't match exactly with pauses.
      //Check accuracy within a reasonable range.
      assert((lapser.lapse().elapsed() - 200) <= 50);
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('lapse - basic total with multiple lapses and max', function (done) {
    let lapser = Lapse("Test", true);
    pause(200).then(_ => {
      lapser.lapse("t1"); 
      return pause(300);
    }).then(_ => {
      lapser.lapse("t2");
      return pause(125)
    }).then(_ => {
      lapser.lapse("t3");
      return pause(150)
    }).then(_ => {
      lapser.lapse("t4");
      return pause(125);
    }).then(_ => {
      lapser.lapse("t5");
      assert((lapser.elapsed() - 900) <= 50);
      assert.equal(lapser.getMax().key, "t2");
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('getMax with no lapses', function () {
    let lapser = Lapse("Test");
    let max = lapser.getMax();
    assert.notEqual(max, undefined);
    assert.equal(max.key, "Test");
    assert(isNaN(max.ts));

    lapser.start();
    max = lapser.getMax();
    assert.equal(max.ts, lapser.getStart());
  });
  it('getSummary', function (done) {
    let lapser = Lapse("Test");
    let summary = lapser.getSummary();
    assert.equal(summary.name, "Test");
    assert(isNaN(summary.start));
    assert(isNaN(summary.end));
    assert(summary.lapses.length === 0);

    lapser.start();
    pause(200).then(_ => {
      lapser.lapse("t1");
      return pause(100);
    }).then(_ => {
      lapser.lapse("t2");
      //re-assert summary with lapse data
      summary = lapser.getSummary();
      assert(summary.name === "Test");
      assert(!isNaN(summary.start));
      assert(summary.lapses.length === 2);
      assert(summary.lapses[1].ts === summary.end);
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('toString single', function (done) {
    let lapser = Lapse("TestToString", true);
    pause(200).then(_ => {
      lapser.lapse();
      // console.log(lapser.toString());
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('toString multiple lapses', function (done) {
    let lapser = Lapse("Test Multi", true);
    pause(200).then(_ => {
      lapser.lapse("t1");
      return pause(25);
    }).then(_ => {
      lapser.lapse("t2");
      return pause(25);
    }).then(_ => {
      lapser.lapse("t3");
      return pause(25);
    }).then(_ => {
      lapser.lapse("t4")
      return pause(25);
    }).then(_ => {
      lapser.lapse("t5");
      let lines = lapser.toString().split("\n").filter(line => line.trim().length > 0);
      assert(lines.length === 6)

      const msRegex = /(\d{1,})ms/;
      //verify format of each line and pull out times
      times = lines.map(line => {
        let match = msRegex.exec(line);
        assert(match !== null);
        return match[1];
      });
      //verify all lapses add up to total
      assert.equal(times[0], times.slice(1).reduce((acc, cur) => { return parseInt(acc) + parseInt(cur)}), "Expected all lapses to add up to total elapsed time");
      done();
    }).catch(e => {
      done(e);
    });
  });
});