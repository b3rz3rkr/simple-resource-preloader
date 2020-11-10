/*
    Import minified or default file for testing.
    Do not use in production because it loads both files.
    Instead of this use simple import needed file
*/

import resolver from './es6+resolver.js';

const SRPreloader = resolver(),
    preloader = new SRPreloader({
        files: ['https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'],
        callback: str => console.log(str),
        cbParams: ['run custom callback'],
        ifError: str => console.log(str),
        ifErrorParams: ['Error cb']
    }),
    progressOldFunction = preloader.onProgress,
    speedContainer = document.querySelector('.speed'),
    speedValueContainer = speedContainer.querySelector('.value'),
    speedUnitsContainer = speedContainer.querySelector('.units');

preloader.onProgress = (percents, speed) => {
    progressOldFunction();
    speedValueContainer.textContent = speed.value;
    speedUnitsContainer.textContent = speed.units;
};
preloader.preload();