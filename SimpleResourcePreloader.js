module.exports = class SimpleResourcePreloader {
    constructor(options) {
        this.options = {...this.defaultOptions, ...options};
        this.loaded = 0;
        this.noAccess = 0;
        this.fileSizes = [];
        this.percents = 0;
    }

    get defaultOptions() {
        return {
            callback: () => {
                this.log('run default callback');
                this.hidePreloader();
            },
            cbParams: [],
            debug: false,
            eventEnd: 'preloadend',
            eventError: 'preloaderror',
            eventProgress: 'preloadprogress',
            events: true,
            eventsTarget: document,
            files: [],
            ifError: () => {
                this.log('run default error callback');
                this.hidePreloader();
            },
            ifErrorParams: [],
            onProgress: () => {
                this.log('run default progress callback');
                this.updateProgress();
            },
            onProgressParams: [],
            preloader: document.querySelector('#preloader'),
            progress: document.querySelectorAll('#preloader [progress]'),
            writePercentsAttr: 'txt-progress'
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
                const details = this.getDetails({value: percents});
                this.percents = percents;
                this.triggerEvent(this.options.eventProgress, details);
                if (typeof this.onProgress === 'function') {
                    this.onProgress(percents, ...this.onProgressParams);
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
                const details = this.getDetails();
                this.triggerEvent(this.options.eventEnd, details);
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
                return Math.round(loaded / total * 100);
            }
        }

        return 0;
    }

    triggerEvent(eventName, details) {
        if (this.options.events === true || this.options.events === 'true') {
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

    exitPreloader() {
        this.log(`exit preloader ${this.error ? 'with error' : 'without errors'}`);
        let callback, cbParams;

        if (this.error) {
            callback = this.ifError;
            cbParams = this.ifErrorParams;
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

    getElement(element, all) {
        this.log(`getting element type is ${typeof element}`);
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
        this.log('element not found');
        this.log(element);
        return false;
    }

    getDetails(details) {
        const common = {
            loaded: this.loaded,
            failed: this.noAccess
        };
        return {...common, ...details};
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
            this.progress.forEach(node => {
                if (node.hasAttribute(this.writePercentsAttr)) {
                    node.textContent = `${this.percents}%`;
                    node.setAttribute(this.writePercentsAttr, `${this.percents}%`);
                }
                node.setAttribute('progress', this.percents);
            });

        }
    }

    runError() {
        console.log(`%c${this.error.message}`, 'color: #bb5577');
        const details = this.getDetails({error: this.error.message});
        this.triggerEvent(this.options.eventError, details);
    }

    log(message) {
        if (this.options.debug === true || this.options.debug === 'true') {
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
        return this.getElement(this.options.progress, true);
    }

    set progress(element) {
        this.log('set progress element');
        this.options.progress = element;
    }

    get writePercentsAttr() {
        this.log('get attribute to show progress');
        return this.options.writePercentsAttr;
    }

    set writePercentsAttr(attr) {
        this.log('set attribute to show progress');
        this.options.writePercentsAttr = attr;
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
        this.log('get callback');
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
    get ifError() {
        this.log('get error callback');
        return this.options.ifError;
    }

    set ifError(ifError) {
        this.log('set error callback');
        this.options.ifError = ifError;
    }

    get ifErrorParams() {
        this.log('get error cbParams');
        return this.options.ifErrorParams;
    }

    set ifErrorParams(params) {
        this.log('set error cbParams');
        this.options.ifErrorParams = params;
    }

    //percents changing callback
    get onProgress() {
        this.log('get progress callback');
        return this.options.onProgress;
    }

    set onProgress(onProgress) {
        this.log('set progress callback');
        this.options.onProgress = onProgress;
    }

    get onProgressParams() {
        this.log('get progress cbParams');
        return this.options.onProgressParams;
    }

    set onProgressParams(params) {
        this.log('set progress cbParams');
        this.options.onProgressParams = params;
    }
};