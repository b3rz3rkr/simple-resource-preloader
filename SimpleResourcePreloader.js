module.exports = class SimpleResourcePreloader {
    constructor(options) {
        this.options = {...this.defaultOptions, ...options};
        this.loaded = 0;
        this.noAccess = 0;
        this.fileSizes = [];
        this.percents = 0;
    }

    get defaultOptions() {
        this.log('get default options');
        return {
            callback: () => this.log('run default callback'),
            cbParams: [],
            debug: false,
            eventError: 'preloaderror',
            eventName: 'preloaded',
            eventPercent: 'preloadpercents',
            events: true,
            eventsTarget: document,
            files: [],
            onError: () => this.log('run error callback'),
            onErrorParams: [],
            onPercent: () => this.log('run percent callback'),
            onPercentParams: [],
        };
    }

    load(uri) {
        this.log('load');
        const xhr = new XMLHttpRequest();
        xhr.onprogress = e => {
            this.updateSizes(e, uri);
            const percents = this.percentageCalc();
            if (percents !== this.percents) {
                this.percents = percents;
                if (this.options.events && this.options.events !== 'false') {
                    this.triggerEvent(this.options.eventPercent, {value: percents});
                }
                this.onPercent(percents, ...this.onPercentParams);
            }
        };

        xhr.onloadend = e => {
            const target = e.target;
            if (target.status === 200) {
                this.loaded++;
            } else {
                this.noAccess++;
                this.error = new Error(`Can't Access "${uri}". Status code ${target.status}`);
            }
            if (this.loaded + this.noAccess === this.count) {
                this.resolveEvents();
                this.exitPreloader();
            }
        };


        xhr.ontimeout = () => {
            this.error = new Error(`timeout error`);
            this.resolveEvents();
            this.exitPreloader();
        };


        xhr.open('GET', uri, true);
        xhr.send();
    }

    updateSizes(e, uri) {
        this.fileSizes[uri] = {
            size: e.total,
            loaded: e.loaded
        };
    }

    percentageCalc() {
        const keys = Object.keys(this.fileSizes),
            count = this.options.files.length;

        if (keys.length === count) {
            this.log('calc percents');
            let total = 0,
                loaded = 0;

            keys.forEach(key => {
                const file = this.fileSizes[key];

                if (file.loaded > 0) {
                    loaded += file.loaded;
                }

                if (file.size > 0) {
                    total += file.size;
                }
            });

            if (total > 0) {
                return Math.floor(loaded / total * 100);
            }
        }

        return 0;
    }

    preload() {
        this.log('start preload');
        if (this.validate()) {
            this.files.forEach(uri => this.load(uri));
        }
    }

    validate() {
        this.log('validate');
        if (this.count === 0) {
            this.error = new Error('No files to preload');
            this.resolveEvents();
            this.exitPreloader();
            return false;
        } else {
            return true;
        }
    }

    exitPreloader() {
        this.log('exit preloader');
        let callback, cbParams;

        if (this.error) {
            callback = this.onError;
            cbParams = this.onErrorParams;
        } else {
            callback = this.callback;
            cbParams = this.cbParams;
        }

        if (typeof callback === 'function') {
            if (this.error) {
                callback(this.error, ...cbParams);
            } else {
                callback(...cbParams);
            }

        }
    }

    resolveEvents() {
        this.log('resolve events');
        if (this.options.events && this.options.events !== 'false') {
            if (this.error) {
                console.log(`%c${this.error.message}`, 'color: #bb5577');
                this.triggerEvent(this.options.eventError);
            } else {
                this.triggerEvent(this.options.eventName);
            }
        }
    }

    triggerEvent(eventName, details) {
        this.log('trigger event');
        const
            eventDetails = details || {},
            event = new CustomEvent(eventName, {detail: eventDetails}),
            target = this.options.eventsTarget;
        target.dispatchEvent(event);
    }

    log(message) {
        if (typeof this.options !== 'undefined' && this.options.debug && this.options.debug !== 'false') {
            console.log(message);
        }
    }

    get count() {
        this.log('get total');
        return this.options.files.length;
    }

    get files() {
        this.log('get files');
        return this.options.files;
    }

    set files(files) {
        this.log('set files');
        this.options.files = files;
    }

    //callbacks
    get callback() {
        return this.options.callback;
    }

    set callback(callback) {
        this.log('set callback');
        this.options.callback = callback;
    }

    get cbParams() {
        this.log('get cbParams');
        return this.options.cbParams;
    }

    set cbParams(params) {
        this.log('set cbParams');
        this.options.cbParams = params;
    }

    //error callback
    get onError() {
        return this.options.onError;
    }

    set onError(onError) {
        this.options.onError = onError;
    }

    get onErrorParams() {
        return this.options.onErrorParams;
    }

    set onErrorParams(params) {
        this.options.onErrorParams = params;
    }

    //percents changing callback
    get onPercent() {
        return this.options.onPercent;
    }

    set onPercent(onPercent) {
        this.options.onPercent = onPercent;
    }

    get onPercentParams() {
        return this.options.onPercentParams;
    }

    set onPercentParams(params) {
        this.options.onPercentParams = params;
    }

};