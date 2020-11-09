var preloader = new SimpleResourcePreloader({
        files: ['https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'],
        callback: function (str) {
            console.log(str);
        },
        cbParams: ['run custom callback'],
        ifError: function (str) {
            console.log(str);
        },
        ifErrorParams: ['Error cb'],
        debug: true
    }),
    progressOldFunction = preloader.onProgress,
    speedContainer = document.querySelector('.speed'),
    speedValueContainer = speedContainer.querySelector('.value'),
    speedUnitsContainer = speedContainer.querySelector('.units');

preloader.onProgress = function (percents, speed) {
    progressOldFunction();
    speedValueContainer.textContent = speed.value;
    speedUnitsContainer.textContent = speed.units;
};
preloader.preload();