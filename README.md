# Simple Resources Preloader
Load any resources using vanilla JS with triggering events and/or callbacks.  

## Installation
``` 
npm install simple-resources-preloader
```

## Basic Usage
If you are using Webpack or another bundler you can just import it
``` javascript
import SRPreloader from 'simple-resources-preloader';
```
or you can use require function. 
``` javascript
const SRPreloader = require('simple-resources-preloader');
```
Then you need to create a new preloader object, only "files" is required property, but you can set it later.  
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
| Key              | Default value                     | Examples of other values | Type                    | Description                                                                                                             |
|:-----------------|:----------------------------------|:-------------------------|:------------------------|:------------------------------------------------------------------------------------------------------------------------|
| callback         | hide preloader function           | function(a, b){}         | function/any            | This function will run after preload complete without errors<!--sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup-->  |
| cbParams         | []                                | [1, 'any string', true]  | array                   | Array of parameters for function stored in callback key                                                                 |
| debug            | false                             | true/'true'              | boolean/string          | You can enable additional messages in console<!--sup id="fnref2"><a href="#fn2" rel="footnote">2</a></sup-->                 |
| eventEnd         | 'preloadend'                      | 'anyString'              | string                  | Event name that will be triggered on end of preloading                                                                  |
| eventError       | 'preloaderror'                    | 'anyString'              | string                  | Event name that will be triggered on errors                                                                             |
| eventProgress    | 'preloadprogress'                 | 'anyString'              | string                  | Event name that will be triggered on progress changes                                                                   |
| events           | true                              | false/'true'             | boolean/string          | You can disable all events triggering with the plugin<!--sup id="fnref2"><a href="#fn2" rel="footnote">2</a></sup-->         |
| eventsTarget     | document                          | '#selector'/DOM          | string/DOM object       | All events will trigger on this DOM element or document<!--sup id="fnref3"><a href="#fn3" rel="footnote">3</a></sup-->       |
| files            | []                                | ['path/file', 'file2']   | array of stings         | Files list to preload                                                                                                   |
| ifError          | hide preloader function           | e => console.log(e)      | function/any            | This function will run after preload complete with errors<!--sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup-->     |
| ifErrorParams    | []                                | [1, 'any string', true]  | array                   | Array of parameters for function stored in ifError key<!--sup id="fnref4"><a href="#fn4" rel="footnote">4</a></sup-->        |
| onProgress       | update percents function          | e => console.log(e)      | function/any            | this function will be executed on every percents change<!--sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup-->       |
| onProgressParams | []                                | [1, 'any string', true]  | array                   | Array of parameters for function stored in onProgress key<!--sup id="fnref5"><a href="#fn5" rel="footnote">5</a></sup-->     |
| preloader        | DOM '#preloader'                  | '#selector'/DOM          | string/DOM object       | Hide this DOM element after preload with default functions<!--sup id="fnref3"><a href="#fn3" rel="footnote">3</a></sup-->    |
| progress         | Node List '#preloader [progress]' | '.selector'/node list    | string/NodeList object  | This DOM elements will receive updates of progress attribute<!--sup id="fnref6"><a href="#fn6" rel="footnote">6</a></sup-->  |
| writePercentsAttr| 'txt-progress'                    | 'attribute-name'         | 'string'                | Progress elements with this attribute will get updates of text<!--sup id="fnref7"><a href="#fn7" rel="footnote">7</a></sup-->|

##Events
All events have event.detail.loaded and event.detail.failed properties, types is number.
``` javascript
document.addEventListener('preloadend', e => {
    console.log('total loaded =' + e.detail.loaded); 
    console.log('total fails =' + e.detail.failed); 
});
```

Error event have event.detail.error property, which contains last Error object.
``` javascript
document.addEventListener('preloaderror', e => {
    console.log(e.detail.error); 
});
```

Progress event contains percentage value of loaded files.
``` javascript
document.addEventListener('preloadprogress', e => {
    console.log(`Loaded ${e.detail.value}%`); 
});
```
##Methods
WIP

##Footnotes

<li id="fn1">
    <p>
        If type of this value is not a function this key will be ignored.&nbsp;
        <a href="#fnref1" rev="footnote">↩</a>
    </p>
</li>
<li id="fn2">
    <p>
        This value can be true or 'true' any other values is false.&nbsp;
        <a href="#fnref2" rev="footnote">↩</a>
    </p>
</li>
<li id="fn3">
    <p>
        Only first DOM Element, if no DOM elements found or value is invalid it will be ignored.&nbsp;
        <a href="#fnref3" rev="footnote">↩</a>
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
