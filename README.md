[![npm version](https://badge.fury.io/js/lapser.svg)](https://badge.fury.io/js/lapser)
[![Build Status](https://travis-ci.org/bravecloud/lapser.svg?branch=master)](https://travis-ci.org/bravecloud/lapser)
[![Coverage Status](https://coveralls.io/repos/github/bravecloud/lapser/badge.svg?branch=master)](https://coveralls.io/github/bravecloud/lapser?branch=master)

# Lapser

Lapser is a module for assessing performance of code execution (e.g. expensive function calls, db queries, web service calls...etc.)

## Table of Contents

1. [Installation and Usage](#installation-and-usage)
2. [Examples](#examples)
3. [API](#api)

## <a name="installation-and-usage"></a>Installation and Usage

Prerequisites: [Node.js](https://nodejs.org/) `>=6.0.0`, npm version 3+.

You can install Lapser using npm:

```
$ npm install lapser --save
```

## <a name="examples"></a>Examples

### Simple one-call peformance tracking:

```javascript
const Lapser = require("lapser");

//Create a lapser, providing an identifier for the call
let lapser = Lapser("Slow Algorithm");

//Manually start the tracker (also can autostart by providing flag with instantiation)
lapser.start();
//Begin function call
slowAlgorithm().then(_ => {
  //Mark time lapse and output duration of function call
  console.log(lapser.lapse().toString());
});
```
#### Output:
```
Slow Algorithm 3088ms
```

#### Async/Await alternative:
```javascript
const Lapser = require("lapser");

//Create a lapser, providing an identifier for the call
let lapser = Lapser("Slow Algorithm");

//Manually start the tracker (also can autostart by providing flag with instantiation)
lapser.start();

//Function call
await slowAlgorithm();

//Mark time lapse and output duration of function call
console.log(lapser.lapse().toString());
```

### Multi-call performance tracking for identifying bottlenecks:
```javascript
const Lapser = require("lapser");

//Detailed performance tracking
const slowAlgorithm = (params) => {
  //instantiate new lapser with name and autostart the tracker
  let lapser = Lapser("Slow Algorithm", true);
  //Perform calls
  loadDataset(params).then(dataset => {
    lapser.lapse("Load dataset");
    return reduce(dataset);
  }).then(reducedData => {
    lapser.lapse("Reduce dataset");
    return analyse(reducedData);
  }).then(results => {
    lapser.lapse("Analysation");
    return save(results);
  }).then(_ => {
    lapser.lapse("Save results");
    //Output performance tracking
    console.log(lapser.toString());
  });
};
```

#### Output with total duration and individual durations.
```
Slow Algorithm 16391ms
  - Load dataset 2588ms
  - Reduce dataset 5128ms
  - Analysation 3780ms
  - Save results 4895ms
```

#### Async/Await alternative
```javascript
const Lapser = require("lapser");

//Detailed performance tracking
const slowAlgorithm = (params) => {
  //instantiate new lapser with name and autostart the tracker
  let lapser = Lapser("Slow Algorithm", true);
  
  //Perform calls
  let dataset = await  loadDataset(params);
  lapser.lapse("Load dataset");

  let reducedData = await reduce(dataset);
  lapser.lapse("Reduce dataset");

  let resuts = await analyse(reducedData);
  lapser.lapse("Analysation");

  await save(results);
  lapser.lapse("Save results");
  
  //Output performance tracking
  console.log(lapser.toString());
};
```
**For a more compact async/await style, see `withLapse` function under the API section**

## <a name="api"></a>API

## Lapser([name][,autoStart])
  * `name <string>` An optional name for the lapser instance.  A name will be automatically assigned if no name is provided.
  * `autoStart <boolean>` A flag to indiciate whether or not to automatically mark the start of the tracker.
  * Returns: `<function>` an lapser instance (a.k.a "lapser")

Returns a new instance of an elapase tracker (a.k.a "lapser")

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Login", true);
```

## Lapser.setAutostart(toggle)
  * `toggle <boolean>`

The `Lapser.setAutostart()` function toggles on or off, the autostart feature for all new lapse instances that are created.  This makes it convenient if all lapse instances will use the autostart feature.

```javascript
const Lapser = require("lapser");
Lapser.setAutostart(true);
//No need to provide the autostart flag since it was already set to true globally.
let lapser = Lapser("Login");
```

## start()

The `start()` function marks the beginning of the lapse tracker.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Login");
lapser.start(); //Begin timing
```

## lapse([key])
  * `key <string>` An optional identifier for the timing cycle.  If no argument is provided, one will be automatically assigned.
  * Returns: `<function>` the given lapser instance

The `lapse()` function marks the end of a timing cycle.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Login", true);

```

## withLapse(key, evaluatedArg, [verbose]) [introduced in 0.1.22]
  * `key <string>` A mandatory identifier for the timing cycle.
  * `evaluatedArg <any>` the evaluated target (e.g. executed function)
  * `verbose <boolean>` when true, the elapsed time will be printed to STDOUT [introduced in 0.1.23]
  * Returns: `evaluatedArg` the evaluated target (e.g. executed function)

The `withLapse()` function is used for compact async formatting

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Slow Algorithm", true);

// the evaluated target parameter is passed in and returned as is to facilitate a concise lapse marking.
let dataset  = lapser.withLapse("Load dataset", await loadDataset(params));
let reducedData = lapser.withLapse("Reduce dataset", await reduce(dataset));
let results = lapser.withLapse("Analysation", await analyse(reducedData);

lapser = lapser.withLapse("Save results", await save(results));

//Output performance tracking
console.log(lapser.toString());
```

## elapsed()
  * Returns: `<number>` the number of milliseconds elapsed since the start

The `elapsed()` function provides the number of milliseconds that have elapsed since the lapser instance was started.

## getName()
  * Returns: `<string>` the name of the lapser instance

The `getName()` function returns the name of the lapser instance.

## getStart()
  * Returns: `<number>` start of the lapser instance as a unix timestamp.

The `getStart()` function returns the start of the lapser instance as a unix timestamp.

## getLapses()
  * Returns: `<object>` an array of lapse points

The `getLapses()` function returns all the tracked lapse points of the lapser instance.  The following is an example lapse point object:
```javascript
{
  "key": "queryCustomerDB",
  "ts": 1562882857208,
  "elapsed": 209
}
```

## getMax()
  * Returns: `<object>` the longest duration of the lapse tracker.

The `getMax()` function returns an object that represents the longest lapse point of the tracker.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Customer Login", true);

let customer = await login(credentials); //takes 236ms
lapser.lapse("login");

let mfaCheck = await mfa(customer);  //takes 714ms
lapser.lapse("mfa");

let offers = await getOffers(customer); //takes 429ms
lapser.lapse("offers");

//use getMax to figure what call is the bottleneck
console.log(lapser.getMax());
```
Output:
```
{
  key: "mfa",
  ts: 1562717736237,
  elapsed: 714
}
```

## getSummary()
  * Returns: `<object>` an object that summarizes the lapse tracker

The `getSummary()` function provides a summary of the lapse tracker that includes the name, start timestamp, end timestamp,
the total time elapsed in milliseconds, and an array of all the time lapses.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Customer Login", true);

let customer = await login(credentials); //takes 236ms
lapser.lapse("login");

let mfaCheck = await mfa(customer);  //takes 714ms
lapser.lapse("mfa");

let offers = await getOffers(customer); //takes 429ms
lapser.lapse("offers");

console.log(lapser.getSummary());
```
Output:
```
{
    name: "Customer Login",
    start: 1562719037320,
    end: 1562719038699,
    elapsed: 1379,
    lapses: [
      {
        key: "login",
        ts: 1562719037556,
        elapsed: 236
      },
      {
        key: "mfa",
        ts: 1562719038270,
        elapsed: 714
      },
      {
        key: "offers",
        ts: 1562719038699,
        elapsed: 429
      }
    ]
};
```

## toString()
  * Returns: <string> a formatted string representation of the tracker

The `toString()` function returns a string representation of the tracker that shows the entire duration tracked as well as the individual time lapses that make up the entire duration.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Customer Login", true);

let customer = await login(credentials); //takes 236ms
lapser.lapse("login");

let mfaCheck = await mfa(customer);  //takes 714ms
lapser.lapse("mfa");

let offers = await getOffers(customer); //takes 429ms
lapser.lapse("offers");

console.log(lapser.toString());
```
Output:
```
Customer Login 1379ms
  - login 236ms
  - mfa 714ms
  - offers 429ms
```

## json()
  * Returns: <object> a simplified representation of the lapser object.

The `json()` function returns a json object with the name and the elapsed duration of the lapser.  This can be used as an alternative to logging the lapser using the toString() function in situations where performance tracking output is to be parsed 
(e.g. storing lapser tracking in a NoSQL database or time series database.)

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Customer Login", true);

let customer = await login(credentials); //takes 236ms
lapser.lapse("login");

let mfaCheck = await mfa(customer);  //takes 714ms
lapser.lapse("mfa");

let offers = await getOffers(customer); //takes 429ms
lapser.lapse("offers");

console.log(lapser.json());
```
Output:
```
{
  name: 'Customer Login',
  elapsed: 1379,
  ts: 1562719037556
}
```

## log()

The `log()` function prints the high level elapsed duration of a lapser instance to Standard Out using console.log. This saves having to manually type console.log(lapser.toString()) for ad-hoc debugging.

```javascript
const Lapser = require("lapser");
let lapser = Lapser("Customer Login", true);

let customer = await login(credentials); //takes 236ms
lapser.lapse("login");

let mfaCheck = await mfa(customer);  //takes 714ms
lapser.lapse("mfa");

let offers = await getOffers(customer); //takes 429ms
lapser.lapse("offers");

lapser.log();
```
Output:
```
[Lapser] [Fri, 19 Jul 2019 00:22:53 GMT] Customer Login 1379ms
```