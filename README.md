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
| Key              | Default value                      | Examples of other values | Type                    | Description                                                               |
|:-----------------|:-----------------------------------|:-------------------------|:------------------------|:--------------------------------------------------------------------------|
| callback         | hide preloader function            | function\(a, b\)\{\}     | function\any            | This function will run after preload complete without errors              |
| cbParams         | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in callback key                   |
| debug            | false                              | true\'true'              | boolean\string          | You can enable additional messages in console                             |
| eventEnd         | 'preloadend'                       | 'anyString'              | string                  | Event name that will be triggered on end of preloading                    |
| eventError       | 'preloaderror'                     | 'anyString'              | string                  | Event name that will be triggered on errors                               |
| eventProgress    | 'preloadprogress'                  | 'anyString'              | string                  | Event name that will be triggered on progress changes                     |
| events           | true                               | false\'true'             | boolean\string          | You can disable all events triggering with the plugin                     |
| eventsTarget     | document                           | '\#selector'\DOM         | string\DOM object       | All events will trigger on this DOM element or document                   |
| files            | \[\]                               | \['path\file', 'file2'\] | array of stings         | Files list to preload                                                     |
| ifError          | hide preloader function            | e => console\.log\(e\)   | function\any            | This function will run after preload complete with errors                |
| ifErrorParams    | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in ifError key                    |
| onProgress       | update percents function           | e => console\.log\(e\)   | function\any            | this function will be executed on every percents change                  |
| onProgressParams | \[\]                               | \[1, 'any string', true\]| array                   | Array of parameters for function stored in onProgress key                 |
| preloader        | DOM '\#preloader'                  | '\#selector'\DOM         | string\DOM object       | Hide this DOM element after preload with default functions                |
| progress         | NodeList '\#preloader \[progress\]'| '\.selector'\node list   | string\NodeList object  | This DOM elements will receive updates of progress attribute            |
| writePercentsAttr| 'txt\-progress'                    | 'attribute\-name'        | 'string'                | Progress elements with this attribute will get updates of text          |

 If type of this value is not a function this key will be ignored.
 This value can be true or 'true' any other values is false.
 Only first DOM Element, if no DOM elements found or value is invalid it will be ignored.
 First parameter of the executed function will be the error object, parameters from this array will be added after it.
 First parameter of the executed function will be the loading percentage (integer number), parameters from this array will be added after it.
 All DOM Elements selected with this selector will get updates of progress attribute during loading. It's also can be outside preloader or/and event target.
 All progress DOM Elements with this attribute wil get inner text updates during loading.
 
## Events
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
## Methods
WIP