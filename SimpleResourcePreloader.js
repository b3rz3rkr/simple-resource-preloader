/*
    __methods will be switched to #methods when private class fields support will be added to webpack
 */
export default class SimpleResourcePreloader {
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
                this.__log('run default callback');
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
                this.__log('run default error callback');
                this.hidePreloader();
            },
            ifErrorParams: [],
            onProgress: () => {
                this.__log('run default progress callback');
                this.updateProgress();
            },
            onProgressParams: [],
            preloader: document.querySelector('#preloader'),
            progress: document.querySelectorAll('#preloader [progress]'),
            writePercentsAttr: 'txt-progress',
            styleVar: '--preloader-progress',
            speedTimeout: 500
        };
    }

    preload() {
        this.__log('start preload');
        if (this.__validate()) {
            this.files.forEach(uri => this.__load(uri));
        }
    }

    __validate() {
        this.__log('validate');
        if (this.__count) {
            return true;
        } else {
            this.error = new Error('No files to preload');
            this.__runError();
            this.__exitPreloader();
            return false;
        }
    }

    __load(uri) {
        this.__log(`load ${uri}`);
        const xhr = new XMLHttpRequest();
        xhr.onprogress = e => {
            this.fileSizes.updated = this.fileSizes.updated ?? Date.now();
            this.oldSizes = this.oldSizes ?? {...this.fileSizes};
            const timeDiff = Date.now() - this.fileSizes.updated;
            if (this.__needSpeedUpdate(timeDiff)) {
                this.__updateSizes(e, uri);
                this.__updateSpeed(timeDiff);
                this.oldSizes = {...this.fileSizes};
            } else {
                this.__updateSizes(e, uri);
            }

            const percents = this.__percentageCalc();
            if (percents !== this.percents) {
                const speed = this.fileSizes.speed,
                    details = this.__getDetails({value: percents, speed});
                this.percents = percents;
                this.triggerEvent(this.options.eventProgress, details);
                if (typeof this.onProgress === 'function') {
                    this.onProgress(percents, ...this.onProgressParams, speed); //toDo move speed param to second position on major update
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
                this.__runError();
            }
            if (this.loaded + this.noAccess === this.__count) {
                const details = this.__getDetails();
                this.triggerEvent(this.options.eventEnd, details);
                this.__exitPreloader();
            }
        };

        xhr.ontimeout = () => {
            this.error = new Error(`timeout error`);
            this.__runError();
        };

        xhr.open('GET', uri, true);
        xhr.send();
    }

    __updateSizes(e, uri) {
        this.fileSizes[uri] = {
            size: e.total,
            loaded: e.loaded
        };
        this.__log('Updated files sizes is:');
        this.__log(this.fileSizes);
    }

    __updateSpeed(time) {
        this.fileSizes.updated = Date.now();
        this.fileSizes.speed = this.__speedCalc(time, this.oldSizes);
        this.__log('Updated speed is:');
        this.__log(this.fileSizes.speed);
    }

    __needSpeedUpdate(timeDiff) {
        return timeDiff >= this.speedTimeout || typeof this.fileSizes.speed === 'undefined';
    }

    __percentageCalc() {

        const
            keys = Object.keys(this.fileSizes),
            keysToRemove = ['updated', 'speed'],
            links = keys.filter(key => !keysToRemove.includes(key)),
            count = this.options.files.length;
        if (links.length === count) {
            this.__log('calc percents');
            const
                totalLoaded = this.totalLoaded(),
                total = totalLoaded.total,
                loaded = totalLoaded.loaded;

            if (total > 0) {
                return Math.round(loaded / total * 100);
            }
        }

        return 0;
    }

    __speedCalc(time, oldSizes) {

        const
            loadedOld = this.totalLoaded(oldSizes).loaded,
            loadedNew = this.totalLoaded().loaded,
            diff = loadedNew - loadedOld,
            timeDiff = time / 1000,
            getSpeed = (value, time) => {
                const speed = {
                        bytesSpeed: 0,
                        value: 0,
                        units: 'Bytes/s'
                    },
                    units = ['Bytes/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
                if (value > 0 && time > 0) {
                    this.__log('calc speed');

                    speed.bytesSpeed = Math.round(value / time);

                    let count = Math.floor(Math.log(speed.bytesSpeed) / Math.log(1024));

                    speed.value = Math.round(speed.bytesSpeed / Math.pow(1024, count) * 100) / 100;
                    speed.units = units[count];
                }
                return speed;
            };
        return getSpeed(diff, timeDiff);
    }

    totalLoaded(sizes = this.fileSizes, keys = Object.keys(sizes)) {

        let total = 0,
            loaded = 0;

        keys.forEach(key => {
            const file = sizes[key];
            if (file.size > 0) {
                total += file.size;
                loaded += file.loaded ?? 0;
            }
        });
        return {total, loaded};
    }

    __exitPreloader() {
        this.__log(`exit preloader ${this.error ? 'with error' : 'without errors'}`);
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

    __getElement(element, all) {
        this.__log(`getting element type is ${typeof element}`);
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
    }

    __getDetails(details) {
        const common = {
            loaded: this.loaded,
            failed: this.noAccess
        };
        return {...common, ...details};
    }

    triggerEvent(eventName, details) {
        if (this.options.events === true || this.options.events === 'true') {
            const
                eventDetails = details || {},
                event = new CustomEvent(eventName, {detail: eventDetails}),
                target = this.__getElement(this.options.eventsTarget);
            if (target) {
                this.__log(`trigger event ${eventName}`);
                target.dispatchEvent(event);
            }
        }
    }

    hidePreloader() {
        if (this.preloader) {
            this.__log('hide preloader');
            this.preloader.style.display = 'none';
        }
    }

    showPreloader() {
        if (this.preloader) {
            this.__log('show preloader');
            this.preloader.style.display = '';
        }
    }

    updateProgress() {
        if (this.progress) {
            this.__log('updateProgress');
            this.progress.forEach(node => {
                if (node.hasAttribute(this.writePercentsAttr)) {
                    node.textContent = `${this.percents}%`;
                    node.setAttribute(this.writePercentsAttr, `${this.percents}%`);
                }
                node.setAttribute('progress', this.percents);
                node.setAttribute('style', `${this.styleVar}: ${this.percents}%`);
            });

        }
    }

    get preloader() {
        this.__log('get preloader element');
        return this.__getElement(this.options.preloader);
    }

    set preloader(element) {
        this.__log('set preloader element');
        this.options.preloader = element;
    }

    get progress() {
        this.__log('get progress element');
        return this.__getElement(this.options.progress, true);
    }

    set progress(element) {
        this.__log('set progress element');
        this.options.progress = element;
    }

    get writePercentsAttr() {
        this.__log('get attribute to show progress');
        return this.options.writePercentsAttr;
    }

    set writePercentsAttr(attr) {
        this.__log('set attribute to show progress');
        this.options.writePercentsAttr = attr;
    }

    get styleVar() {
        this.__log('get css variable name');
        return this.options.styleVar;
    }

    set styleVar(variable) {
        this.__log('set css variable name');
        this.options.styleVar = variable;
    }

    get files() {
        this.__log('get files');
        return this.options.files;
    }

    set files(files) {
        this.__log('set files');
        this.options.files = files;
    }

    get speedTimeout() {
        if (typeof Number(this.options.speedTimeout) === 'number') {
            return Number(this.options.speedTimeout);
        }
        return this.defaultOptions.speedTimeout;
    }

    set speedTimeout(timeout) {
        this.options.speedTimeout = timeout;
    }

    __runError() {
        console.log(`%c${this.error.message}`, 'color: __bb5577');
        const details = this.__getDetails({error: this.error.message});
        this.triggerEvent(this.options.eventError, details);
    }

    __log(message) {
        if (this.options.debug === true || this.options.debug === 'true') {
            console.log(message);
        }
    }

    get __count() {
        this.__log('get total');
        return this.options.files.length;
    }

    //callbacks
    get callback() {
        this.__log('get callback');
        return this.options.callback;
    }

    set callback(callback) {
        this.__log('set callback');
        this.options.callback = callback;
    }

    get cbParams() {
        this.__log('get cbParams');
        return this.options.cbParams;
    }

    set cbParams(params) {
        this.__log('set cbParams');
        this.options.cbParams = params;
    }

    //error callback
    get ifError() {
        this.__log('get error callback');
        return this.options.ifError;
    }

    set ifError(ifError) {
        this.__log('set error callback');
        this.options.ifError = ifError;
    }

    get ifErrorParams() {
        this.__log('get error cbParams');
        return this.options.ifErrorParams;
    }

    set ifErrorParams(params) {
        this.__log('set error cbParams');
        this.options.ifErrorParams = params;
    }

    //percents changing callback
    get onProgress() {
        this.__log('get progress callback');
        return this.options.onProgress;
    }

    set onProgress(onProgress) {
        this.__log('set progress callback');
        this.options.onProgress = onProgress;
    }

    get onProgressParams() {
        this.__log('get progress cbParams');
        return this.options.onProgressParams;
    }

    set onProgressParams(params) {
        this.__log('set progress cbParams');
        this.options.onProgressParams = params;
    }

}