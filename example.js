const
    SimpleResourcesPreloader = require('./SimpleResourcePreloader'),
    preloader = new SimpleResourcesPreloader({
        debug: true, //use to track functions order inside class
        events: true, //triggering events during caching
        eventsTarget: document, //any DOM element to listen events
        eventName: 'preloaderDone', //triggering this even if all files cached successfully
        eventError: 'preloaderError', //triggering this even if we have an errors
        eventPercent: 'preloaderPercents', //triggering this even on percentage changes
        files: ['./video/intro.mp4', './video/background.mp4'], //files for caching
        callback: str => console.log(str), //callback function to execute when files cached
        cbParams: ['run custom callback'], //params for callback function
        onError: (error, str) => console.log(str + ' ' + error), //callback function to execute if we have errors
        onErrorParams: ['Something went wrong.'], //params for errors callback function
        onPercent: (value, str1, str2) => console.log(`${str1} ${str2} ${value}%`),  //callback function to execute on percentage changes
        onPercentParams: ['Custom percent callback.', 'Loaded '], //params for percentage callback function
    });
preloader.preload();