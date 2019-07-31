const Lapser = require("../index");

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
    let lapser = Lapser();
    assert.equal("Lapser-1", lapser.getName());
  });
  it('lapse - autostart', function () {
    let lapser = Lapser("Test", true);
    assert.notEqual(lapser.getStart(), NaN);
  });
  it('lapse - default non-autostart ', function () {
    let lapser = Lapser("Test");
    assert(isNaN(lapser.getStart()))
  });
  it('lapse - default autostart via config', function () {
    Lapser.setAutostart(true);
    let lapser = Lapser("Test");
    assert(!isNaN(lapser.getStart()));
    //Restore default
    Lapser.setAutostart(false);
  });
  it('lapse - basic total with 1 lapse, inline chain', function (done) {
    let lapser = Lapser("Test", true);
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
    let lapser = Lapser("Test", true);
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
    let lapser = Lapser("Test");
    let max = lapser.getMax();
    assert.notEqual(max, undefined);
    assert.equal(max.key, "Test");
    assert(isNaN(max.ts));

    lapser.start();
    max = lapser.getMax();
    assert.equal(max.ts, lapser.getStart());
  });
  it('getMax with one lapse', function (done) {
    let lapser = Lapser("Test", true);
    pause(200).then(_ => {
      lapser.lapse("t1");
      assert(lapser.getMax().key === "t1");
      assert.deepEqual(lapser.getLapses()[0], lapser.getMax());
      //assert immutability
      let max = lapser.getMax();
      max.elapsed = -1;
      assert(max.elapsed !== -1);
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('getSummary', function (done) {
    let lapser = Lapser("Test");
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
      assert(summary.lapses.reduce((acc, curr) => { return acc.elapsed + curr.elapsed; }) === summary.elapsed);
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('toString none', function () {
    let lapser = Lapser("TestToString", true);
    assert(lapser.toString().indexOf("TestToString") !== -1 && lapser.toString().indexOf("0ms") !== -1);
  });
  it('toString single', function (done) {
    let lapser = Lapser("TestToString", true);
    pause(200).then(_ => {
      lapser.lapse();
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('toString multiple lapses', function (done) {
    let lapser = Lapser("Test Multi", true);
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
  it('json', function (done) {
    let lapser = Lapser("Test Multi", true);
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
      let json = lapser.json();
      assert(json.name === lapser.getName());
      assert(json.elapsed === lapser.elapsed());
      assert(json.ts === lapser.getStart());
      done();
    }).catch(e => {
      done(e);
    });
  });
  it('log', function (done) {
    let lapser = Lapser("TestToString", true);
    pause(200).then(_ => {
      lapser.lapse();
      let origLog = console.log;
      console.log = (arguments) => {
        assert(arguments.indexOf("TestToString") !== -1);
      };
      lapser.log();
      console.log = origLog;
      done();
    }).catch(e => {
      done(e);
    });
  });
});