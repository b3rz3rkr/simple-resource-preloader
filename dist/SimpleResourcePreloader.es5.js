;
var SimpleResourcePreloader = function SimpleResourcePreloader(options) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.loaded = 0;
    this.noAccess = 0;
    this.fileSizes = [];
    this.percents = 0;
};

var prototypeAccessors = { defaultOptions: { configurable: true },preloader: { configurable: true },progress: { configurable: true },writePercentsAttr: { configurable: true },files: { configurable: true },__count: { configurable: true },callback: { configurable: true },cbParams: { configurable: true },ifError: { configurable: true },ifErrorParams: { configurable: true },onProgress: { configurable: true },onProgressParams: { configurable: true } };

prototypeAccessors.defaultOptions.get = function () {
    var this$1 = this;

    return {
        callback: function () {
            this$1.__log('run default callback');
            this$1.hidePreloader();
        },
        cbParams: [],
        debug: false,
        eventEnd: 'preloadend',
        eventError: 'preloaderror',
        eventProgress: 'preloadprogress',
        events: true,
        eventsTarget: document,
        files: [],
        ifError: function () {
            this$1.__log('run default error callback');
            this$1.hidePreloader();
        },
        ifErrorParams: [],
        onProgress: function () {
            this$1.__log('run default progress callback');
            this$1.updateProgress();
        },
        onProgressParams: [],
        preloader: document.querySelector('#preloader'),
        progress: document.querySelectorAll('#preloader [progress]'),
        writePercentsAttr: 'txt-progress'
    };
};

SimpleResourcePreloader.prototype.preload = function preload () {
    var this$1 = this;

    this.__log('start preload');
    if (this.__validate()) {
        this.files.forEach(function (uri) { return this$1.__load(uri); });
    }
};

SimpleResourcePreloader.prototype.__validate = function __validate () {
    this.__log('validate');
    if (this.__count) {
        return true;
    } else {
        this.error = new Error('No files to preload');
        this.__runError();
        this.__exitPreloader();
        return false;
    }
};

SimpleResourcePreloader.prototype.__load = function __load (uri) {
    var this$1 = this;

    this.__log(("load " + uri));
    var xhr = new XMLHttpRequest();
    xhr.onprogress = function (e) {
        var ref;

        this$1.__updateSizes(e, uri);
        var percents = this$1.__percentageCalc();
        if (percents !== this$1.percents) {
            var details = this$1.__getDetails({value: percents});
            this$1.percents = percents;
            this$1.triggerEvent(this$1.options.eventProgress, details);
            if (typeof this$1.onProgress === 'function') {
                (ref = this$1).onProgress.apply(ref, [ percents ].concat( this$1.onProgressParams ));
            }
        }
    };

    xhr.onloadend = function (e) {
        var target = e.target;
        if (target.status === 200) {
            this$1.loaded++;
        } else {
            this$1.noAccess++;
            this$1.error = new Error(("Can't Access \"" + uri + "\". Status code " + (target.status)));
            this$1.__runError();
        }
        if (this$1.loaded + this$1.noAccess === this$1.__count) {
            var details = this$1.__getDetails();
            this$1.triggerEvent(this$1.options.eventEnd, details);
            this$1.__exitPreloader();
        }
    };

    xhr.ontimeout = function () {
        this$1.error = new Error("timeout error");
        this$1.__runError();
    };

    xhr.open('GET', uri, true);
    xhr.send();
};

SimpleResourcePreloader.prototype.__updateSizes = function __updateSizes (e, uri) {
    this.fileSizes[uri] = {
        size: e.total,
        loaded: e.loaded
    };
};

SimpleResourcePreloader.prototype.__percentageCalc = function __percentageCalc () {
    var this$1 = this;

    var keys = Object.keys(this.fileSizes),
        count = this.options.files.length;

    if (keys.length === count) {
        this.__log('calc percents');
        var total = 0,
            loaded = 0;

        keys.forEach(function (key) {
            var file = this$1.fileSizes[key];

            if (file.loaded > 0) {
                loaded += file.loaded;
            }

            if (file.size > 0) {
                total += file.size;
            }
        });

        if (total > 0) {
            return Math.round(loaded / total * 100);
        }
    }

    return 0;
};

SimpleResourcePreloader.prototype.__exitPreloader = function __exitPreloader () {
    this.__log(("exit preloader " + (this.error ? 'with error' : 'without errors')));
    var callback, cbParams;

    if (this.error) {
        callback = this.ifError;
        cbParams = this.ifErrorParams;
    } else {
        callback = this.callback;
        cbParams = this.cbParams;
    }

    if (typeof callback === 'function') {
        if (this.error) {
            callback.apply(void 0, [ this.error ].concat( cbParams ));
        } else {
            callback.apply(void 0, cbParams);
        }

    }
};

SimpleResourcePreloader.prototype.__getElement = function __getElement (element, all) {
    this.__log(("getting element type is " + (typeof element)));
    if (typeof element === 'string') {
        if (all) {
            element = document.querySelectorAll(element);
        } else {
            element = document.querySelector(element);
        }
    }
    if (element instanceof HTMLElement || element instanceof HTMLDocument || element instanceof NodeList) {
        return element;
    }
    this.__log('element not found');
    this.__log(element);
    return false;
};

SimpleResourcePreloader.prototype.__getDetails = function __getDetails (details) {
    var common = {
        loaded: this.loaded,
        failed: this.noAccess
    };
    return Object.assign({}, common, details);
};

SimpleResourcePreloader.prototype.triggerEvent = function triggerEvent (eventName, details) {
    if (this.options.events === true || this.options.events === 'true') {
        var
            eventDetails = details || {},
            event = new CustomEvent(eventName, {detail: eventDetails}),
            target = this.__getElement(this.options.eventsTarget);
        if (target) {
            this.__log(("trigger event " + eventName));
            target.dispatchEvent(event);
        }
    }
};

SimpleResourcePreloader.prototype.hidePreloader = function hidePreloader () {
    if (this.preloader) {
        this.__log('hide preloader');
        this.preloader.style.display = 'none';
    }
};

SimpleResourcePreloader.prototype.showPreloader = function showPreloader () {
    if (this.preloader) {
        this.__log('show preloader');
        this.preloader.style.display = '';
    }
};

SimpleResourcePreloader.prototype.updateProgress = function updateProgress () {
    var this$1 = this;

    if (this.progress) {
        this.__log('updateProgress');
        this.progress.forEach(function (node) {
            if (node.hasAttribute(this$1.writePercentsAttr)) {
                node.textContent = (this$1.percents) + "%";
                node.setAttribute(this$1.writePercentsAttr, ((this$1.percents) + "%"));
            }
            node.setAttribute('progress', this$1.percents);
        });

    }
};

prototypeAccessors.preloader.get = function () {
    this.__log('get preloader element');
    return this.__getElement(this.options.preloader);
};

prototypeAccessors.preloader.set = function (element) {
    this.__log('set preloader element');
    this.options.preloader = element;
};

prototypeAccessors.progress.get = function () {
    this.__log('get progress element');
    return this.__getElement(this.options.progress, true);
};

prototypeAccessors.progress.set = function (element) {
    this.__log('set progress element');
    this.options.progress = element;
};

prototypeAccessors.writePercentsAttr.get = function () {
    this.__log('get attribute to show progress');
    return this.options.writePercentsAttr;
};

prototypeAccessors.writePercentsAttr.set = function (attr) {
    this.__log('set attribute to show progress');
    this.options.writePercentsAttr = attr;
};

prototypeAccessors.files.get = function () {
    this.__log('get files');
    return this.options.files;
};

prototypeAccessors.files.set = function (files) {
    this.__log('set files');
    this.options.files = files;
};

SimpleResourcePreloader.prototype.__runError = function __runError () {
    console.log(("%c" + (this.error.message)), 'color: __bb5577');
    var details = this.__getDetails({error: this.error.message});
    this.triggerEvent(this.options.eventError, details);
};

SimpleResourcePreloader.prototype.__log = function __log (message) {
    if (this.options.debug === true || this.options.debug === 'true') {
        console.log(message);
    }
};

prototypeAccessors.__count.get = function () {
    this.__log('get total');
    return this.options.files.length;
};

//callbacks
prototypeAccessors.callback.get = function () {
    this.__log('get callback');
    return this.options.callback;
};

prototypeAccessors.callback.set = function (callback) {
    this.__log('set callback');
    this.options.callback = callback;
};

prototypeAccessors.cbParams.get = function () {
    this.__log('get cbParams');
    return this.options.cbParams;
};

prototypeAccessors.cbParams.set = function (params) {
    this.__log('set cbParams');
    this.options.cbParams = params;
};

//error callback
prototypeAccessors.ifError.get = function () {
    this.__log('get error callback');
    return this.options.ifError;
};

prototypeAccessors.ifError.set = function (ifError) {
    this.__log('set error callback');
    this.options.ifError = ifError;
};

prototypeAccessors.ifErrorParams.get = function () {
    this.__log('get error cbParams');
    return this.options.ifErrorParams;
};

prototypeAccessors.ifErrorParams.set = function (params) {
    this.__log('set error cbParams');
    this.options.ifErrorParams = params;
};

//percents changing callback
prototypeAccessors.onProgress.get = function () {
    this.__log('get progress callback');
    return this.options.onProgress;
};

prototypeAccessors.onProgress.set = function (onProgress) {
    this.__log('set progress callback');
    this.options.onProgress = onProgress;
};

prototypeAccessors.onProgressParams.get = function () {
    this.__log('get progress cbParams');
    return this.options.onProgressParams;
};

prototypeAccessors.onProgressParams.set = function (params) {
    this.__log('set progress cbParams');
    this.options.onProgressParams = params;
};

Object.defineProperties( SimpleResourcePreloader.prototype, prototypeAccessors );