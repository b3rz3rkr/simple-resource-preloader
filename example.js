//This file shows all possible options, check documentation for default values
const
    SRPreloader = require('simple-resource-preloader'),
    preloader = new SRPreloader({
        debug: true, //use to track functions order inside class
        events: true, //triggering events during caching
        eventsTarget: document, //any DOM element to listen events
        eventEnd: 'preloaderDone', //triggering this even if all files cached successfully
        eventError: 'preloaderError', //triggering this even if we have an errors
        eventProgress: 'preloaderPercents', //triggering this even on percentage changes
        files: ['./video/intro.mp4', './video/background.mp4'], //files for caching
        callback: str => console.log(str), //callback function to execute when files cached
        cbParams: ['run custom callback'], //params for callback function
        ifError: (error, str) => console.log(str + ' ' + error), //callback function to execute if we have errors
        ifErrorParams: ['Something went wrong.'], //params for errors callback function
        onProgress: (value, str1, str2) => console.log(`${str1} ${str2} ${value}%`),  //callback function to execute on percentage changes
        onProgressParams: ['Custom percent callback.', 'Loaded '], //params for percentage callback function
        preloader: '#myPreloader', //this preloader can be hidden with default callbacks and methods
        progress: '#myPreloader [progressbars]', //updates of progress attribute during loading
        writePercentsAttr: 'progressbars' //updates inner text during loading for all progress elements with this attribute
    });
preloader.preload();
