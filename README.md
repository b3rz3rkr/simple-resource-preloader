# Simple Resources Preloader

Load any resources using vanilla JS (ES6) with triggering events and/or callbacks.  
It uses ES6 class syntax, you can check browser support [here](https://caniuse.com/es6-class).
If you need IE support you need to transpile code to ES5 with Babel or other transpiler or use converted code to [ES5 version](#es5-usage).

1. [Installation](#installation)
1. [Basic Usage](#basic-usage)
1. [Options](#options)
1. [Events](#events)
	- [preloadend](#preloadend)
	- [preloaderror](#preloaderror)
	- [preloadprogress](#preloadprogress)
1. [Methods and Properties](#methods-and-properties)
	- [Getters and setters](#getters-and-setters)
	- [Properties](#properties)
1. [Without bundler usage](#without-bundler-usage)
1. [ES5 Usage](#es5-usage)
1. [License ](#license)

## Installation

``` 
npm install simple-resources-preloader
```

---

## Basic Usage

If you are using Webpack or another bundler you can just import it. If you don't use any bundlers go to [this section](#without-bundler-usage)  

``` javascript
import SRPreloader from 'simple-resources-preloader';
```

Then you need to create a new preloader object, only "files" is required property, but you can set it later with [setter "preloader.files"](#getters-and-setters).  

``` javascript
const preloader = new SRPreloader({
    files: ['./video/intro.mp4', './video/background.mp4']
});
```

to execute preloader you need to run .preload() method

``` javascript
preloader.preload();
```

## Options

| Key              | Default value                      | Examples of other values | Type                    | Description                                                                                                             |
|:-----------------|:-----------------------------------|:-------------------------|:------------------------|:------------------------------------------------------------------------------------------------------------------------|
| callback         | hide preloader function            | function\(a, b\)\{\}     | function\any            | This function will run after preload complete without errors<sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup>  |
| cbParams         | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in callback key                                                                 |
| debug            | false                              | true\'true'              | boolean\string          | You can enable additional messages in console<sup id="fnref2"><a href="#fn2" rel="footnote">2</a></sup>                 |
| eventEnd         | 'preloadend'                       | 'anyString'              | string                  | Event name that will be triggered on end of preloading                                                                  |
| eventError       | 'preloaderror'                     | 'anyString'              | string                  | Event name that will be triggered on errors                                                                             |
| eventProgress    | 'preloadprogress'                  | 'anyString'              | string                  | Event name that will be triggered on progress changes                                                                   |
| events           | true                               | false\'true'             | boolean\string          | You can disable all events triggering with the plugin<sup id="fnref2-2"><a href="#fn2" rel="footnote">2</a></sup>       |
| eventsTarget     | document                           | '\#selector'\DOM         | string\DOM object       | All events will trigger on this DOM element or document<sup id="fnref3"><a href="#fn3" rel="footnote">3</a></sup>       |
| files            | \[\]                               | \['path\file', 'file2'\] | array of stings         | Files list to preload                                                                                                   |
| ifError          | hide preloader function            | e => console\.log\(e\)   | function\any            | This function will run after preload complete with errors<sup id="fnref1-2"><a href="#fn1" rel="footnote">1</a></sup> |
| ifErrorParams    | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in ifError key<sup id="fnref4"><a href="#fn4" rel="footnote">4</a></sup>        |
| onProgress       | update percents function           | e => console\.log\(e\)   | function\any            | this function will be executed on every percents change<sup id="fnref1-3"><a href="#fn1" rel="footnote">1</a></sup>   |
| onProgressParams | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in onProgress key<sup id="fnref5"><a href="#fn5" rel="footnote">5</a></sup>     |
| preloader        | DOM '\#preloader'                  | '\#selector'\DOM         | string\DOM object       | Hide this DOM element after preload with default functions<sup id="fnref3-2"><a href="#fn3" rel="footnote">3</a></sup>  |
| progress         | NodeList '\#preloader \[progress\]'| '\.selector'\node list   | string\NodeList object  | This DOM elements will receive updates of progress attribute<sup id="fnref6"><a href="#fn6" rel="footnote">6</a></sup>  |
| writePercentsAttr| 'txt\-progress'                    | 'attribute\-name'        | 'string'                | Progress elements with this attribute will get updates of text<sup id="fnref7"><a href="#fn7" rel="footnote">7</a></sup>|

<ol>
    <li id="fn1">
        <p>
            If type of this value is not a function this key will be ignored.&nbsp;
            <a href="#fnref1" rev="footnote">↩</a>
            <a href="#fnref1-2" rev="footnote">↩</a>
            <a href="#fnref1-3" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn2">
        <p>
            This value can be true or 'true' any other values is false.&nbsp;
            <a href="#fnref2" rev="footnote">↩</a>
            <a href="#fnref2-2" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn3">
        <p>
            Only first DOM Element, if no DOM elements found or value is invalid it will be ignored.&nbsp;
            <a href="#fnref3" rev="footnote">↩</a>
            <a href="#fnref3-2" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn4">
        <p>
            First parameter of the executed function will be the error object, parameters from this array will be added after it.&nbsp;
            <a href="#fnref4" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn5">
        <p>
        First parameter of the executed function will be the loading percentage (integer number), parameters from this array will be added after it.&nbsp;
            <a href="#fnref5" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn6">
        <p>
            All DOM Elements selected with this selector will get updates of progress attribute during loading. It's also can be outside preloader or/and event target.&nbsp;
            <a href="#fnref6" rev="footnote">↩</a>
        </p>
    </li>
    <li id="fn7">
        <p>
            All progress DOM Elements with this attribute wil get inner text updates during loading.&nbsp;
            <a href="#fnref7" rev="footnote">↩</a>
        </p>
    </li>
</ol>
 
---
 
## Events

All plugin events have event.detail.loaded and event.detail.failed properties, types is number.

#### preloadend

``` javascript
document.addEventListener('preloadend', e => {
    console.log('total loaded =' + e.detail.loaded); 
    console.log('total fails =' + e.detail.failed); 
});
```

#### preloaderror

Error event have event.detail.error property, which contains last Error object.
``` javascript
document.addEventListener('preloaderror', e => {
    console.log(e.detail.error); 
});
```
#### preloadprogress

Progress event contains percentage value of loaded files.

``` javascript
document.addEventListener('preloadprogress', e => {
    console.log(`Loaded ${e.detail.value}%`); 
});
```

---

## Methods and Properties

Start preloader

```javascript 
preloader.preload();
```

---

Triggering custom event on target with additional details

Acceptable properties eventName type is string, details type is object
 
```javascript
const
    eventName = 'customEvent', 
    details = {
        number:1
    };
preloader.triggerEvent(eventName, details); 
```

---

Hiding DOM element stored in preloader.

```javascript
preloader.hidePreloader();
``` 

---

Show DOM element stored in preloader if it was hidden with 'hidePreloader()'.

```javascript
preloader.showPreloader();
``` 

---

Update progress elements stored in progress.

```javascript
preloader.updateProgress();
``` 

### Getters and setters

Set and get options parameters. 

*See [options](#options) section for details.*

```javascript
preloader.files = ['path/to/file1.ext', 'path/to/file2.ext'];
const filesList = preloader.files;

preloader.preloader = '#preloaderSelector'; 
const preloaderElement = preloader.preloader; //Get DOM element even if selector string stored to options  

preloader.progress = '#progressSelector'; 
const progressElement = preloader.progress; //Get DOM element even if selector string stored to options

preloader.writePercentsAttr = 'attribute';
const progressAttrTxt = preloader.writePercentsAttr; 

const defaultOptions = preloader.defaultOptions; //Get options object used by default
```

```javascript
// main callback
preloader.cbParams = [1, 'a'];
const cbParams = preloader.cbParams;
    
preloader.callback = (a, b) => {
    console.log(a); //expected output – 1 
    console.log(b); //expected output – 'a'
};
const callback = preloader.callback; 
```

```javascript
//error callback
preloader.ifErrorParams = [1, 'a'];
const ifErrorParams = preloader.ifErrorParams;
    
preloader.ifError = (error, a, b) => {
    console.log(error); //expected output – Error object
    console.log(a);     //expected output – 1 
    console.log(b);     //expected output – 'a'
};
const ifError = preloader.ifError; 
```

```javascript
//percents changing callback
preloader.onProgressParams = [1, 'a'];
const onProgressParams = preloader.onProgressParams;
    
preloader.onProgress = (progress, a, b) => {
    console.log(progress);  //expected output – integer number from 0 to 100
    console.log(a);         //expected output – 1 
    console.log(b);         //expected output – 'a'
};
const onProgress = preloader.onProgress; 
``` 

### Properties

preloader.error - Last error object

preloader.fileSizes - Array of sile sizes and loaded status

preloader.loaded - Number of successfully loaded files

preloader.noAccess - Number of loading failed files

preloader.options - Object contains current options

preloader.percents - Number from 0 to 100 how much is loaded

## Without bundler usage  
If you want to use it as separate file without bundler you need to copy 'SimpleResourcePreloader.js' or 'SimpleResourcePreloader.min.js' to your project folder and add type="module" attribute to your script file.  
**Be careful [some browsers](https://caniuse.com/es6-module-dynamic-import) still can't import files, so you still need a bundler or transpiler to support those browsers or use [ES5 version](#es5-usage).**

```html
<script type="module" src="./js/script.js"></script>
```
To import it you can use code like this in you script
``` javascript
import SRPreloader from './lib/SimpleResourcePreloader.min.js';
```

To init preloader you need to create new object

``` javascript
const preloader = new SRPreloader({
    files: ['./video/intro.mp4', './video/background.mp4']
});
```

to execute preloader you need to run .preload() method

``` javascript
preloader.preload();
```
Go back to [options section](#options)

---

## ES5 Usage   

You need to connect plugin script 'SimpleResourcePreloader.es5.js' or 'SimpleResourcePreloader.es5.min.js' before your main script

```html
<!--script src="./js/SimpleResourcePreloader.es5.js"></script-->
<!-- or minified version -->
<script src="./js/SimpleResourcePreloader.es5.min.js"></script>
<script src="./js/script.js"></script>
```

To init preloader you need to create new object

```javascript
const preloader = new SimpleResourcePreloader({
    files: ['./video/intro.mp4', './video/background.mp4']
});
```

to execute preloader you need to run .preload() method

``` javascript
preloader.preload();
```

Go back to [options section](#options)

---

## License 
[MIT](/blob/master/LICENSE)