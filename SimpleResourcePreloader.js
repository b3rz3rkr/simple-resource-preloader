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
            callback: () => {
                this.log('run default callback');
                this.hidePreloader();
            },
            cbParams: [],
            debug: false,
            eventError: 'preloaderror',
            eventName: 'preloadend',
            eventProgress: 'preloadprogress',
            events: true,
            eventsTarget: document,
            files: [],
            onError: () => {
                this.log('run error callback');
                this.hidePreloader();
            },
            onErrorParams: [],
            onPercent: () => {
                this.log('run percent callback');
                this.updateProgress();
            },
            onPercentParams: [],
            preloader: document.querySelector('#preloader'),
            progress: document.querySelector('#preloader .progress'),
            showPercentsAttr: 'update-progress'
        };
    }

    preload() {
        this.log('start preload');
        if (this.validate()) {
            this.files.forEach(uri => this.load(uri));
        }
    }

    validate() {
        this.log('validate');
        if (this.count) {
            return true;
        } else {
            this.error = new Error('No files to preload');
            this.runError();
            this.exitPreloader();
            return false;
        }
    }

    load(uri) {
        this.log(`load ${uri}`);
        const xhr = new XMLHttpRequest();
        xhr.onprogress = e => {
            this.updateSizes(e, uri);
            const percents = this.percentageCalc();
            if (percents !== this.percents) {
                this.percents = percents;
                this.triggerEvent(this.options.eventProgress, {value: percents});
                if (typeof this.onPercent === 'function') {
                    this.onPercent(percents, ...this.onPercentParams);
                }
            }
        };

        xhr.onloadend = e => {
            const target = e.target;
            if (target.status === 200) {
                this.loaded++;
            } else {
                this.noAccess++;
                this.error = new Error(`Can't Access "${uri}". Status code ${target.status}`);
                this.runError();
            }
            if (this.loaded + this.noAccess === this.count) {
                this.triggerEvent(this.options.eventName);
                this.exitPreloader();
            }
        };

        xhr.ontimeout = () => {
            this.error = new Error(`timeout error`);
            this.runError();
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

    triggerEvent(eventName, details) {
        if (this.options.events) {
            if (this.options.events !== 'false') {
                const
                    eventDetails = details || {},
                    event = new CustomEvent(eventName, {detail: eventDetails}),
                    target = this.getElement(this.options.eventsTarget);
                if (target) {
                    this.log(`trigger event ${eventName}`);
                    target.dispatchEvent(event);
                }
            }
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

    getElement(element) {
        this.log('get element');
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element instanceof HTMLElement || element instanceof HTMLDocument) {
            return element;
        }
        return false;
    }

    hidePreloader() {
        if (this.preloader) {
            this.log('hide preloader');
            this.preloader.style.display = 'none';
        }
    }

    showPreloader() {
        if (this.preloader) {
            this.log('show preloader');
            this.preloader.style.display = '';
        }
    }

    updateProgress() {
        if (this.progress) {
            this.log('updateProgress');
            if (this.progress.hasAttribute(this.showPercentsAttr)) {
                this.progress.textContent = `${this.percents}%`;
            }
            this.progress.setAttribute('progress', this.percents);
        }
    }

    runError() {
        console.log(`%c${this.error.message}`, 'color: #bb5577');
        this.triggerEvent(this.options.eventError, {error: this.error.message});
    }

    log(message) {
        if (typeof this.options !== 'undefined' && this.options.debug && this.options.debug !== 'false') {
            console.log(message);
        }
    }

    get preloader() {
        this.log('get preloader element');
        return this.getElement(this.options.preloader);
    }

    set preloader(element) {
        this.log('set preloader element');
        this.options.preloader = element;
    }

    get progress() {
        this.log('get progress element');
        return this.getElement(this.options.progress);
    }

    set progress(element) {
        this.log('set progress element');
        this.options.progress = element;
    }

    get showPercentsAttr() {
        this.log('get attribute to show progress');
        return this.options.showPercentsAttr;
    }

    set showPercentsAttr(attr) {
        this.log('set attribute to show progress');
        this.options.showPercentsAttr = attr;
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