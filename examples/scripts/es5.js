var preloader = new SimpleResourcePreloader({
    files: ['https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'],
    callback: function (str) {console.log(str)},
    cbParams: ['run custom callback'],
    ifError: function (str) {console.log(str)},
    ifErrorParams:['Error cb'],
    debug: true
});
preloader.preload();