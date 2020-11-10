"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SimpleResourcePreloader = /*#__PURE__*/function () {
  function SimpleResourcePreloader(options) {
    _classCallCheck(this, SimpleResourcePreloader);

    this.options = _objectSpread(_objectSpread({}, this.defaultOptions), options);
    this.loaded = 0;
    this.noAccess = 0;
    this.fileSizes = [];
    this.percents = 0;
  }

  _createClass(SimpleResourcePreloader, [{
    key: "preload",
    value: function preload() {
      var _this = this;

      this.__log('start preload');

      if (this.__validate()) {
        this.files.forEach(function (uri) {
          return _this.__load(uri);
        });
      }
    }
  }, {
    key: "__validate",
    value: function __validate() {
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
  }, {
    key: "__load",
    value: function __load(uri) {
      var _this2 = this;

      this.__log("load ".concat(uri));

      var xhr = new XMLHttpRequest();

      xhr.onprogress = function (e) {
        var _this2$fileSizes$upda, _this2$oldSizes;

        _this2.fileSizes.updated = (_this2$fileSizes$upda = _this2.fileSizes.updated) !== null && _this2$fileSizes$upda !== void 0 ? _this2$fileSizes$upda : Date.now();
        _this2.oldSizes = (_this2$oldSizes = _this2.oldSizes) !== null && _this2$oldSizes !== void 0 ? _this2$oldSizes : _objectSpread({}, _this2.fileSizes);

        var timeDiff = Date.now() - _this2.fileSizes.updated;

        if (_this2.__needSpeedUpdate(timeDiff)) {
          _this2.__updateSizes(e, uri);

          _this2.__updateSpeed(timeDiff);

          _this2.oldSizes = _objectSpread({}, _this2.fileSizes);
        } else {
          _this2.__updateSizes(e, uri);
        }

        var percents = _this2.__percentageCalc();

        if (percents !== _this2.percents) {
          var speed = _this2.fileSizes.speed,
              details = _this2.__getDetails({
            value: percents,
            speed: speed
          });

          _this2.percents = percents;

          _this2.triggerEvent(_this2.options.eventProgress, details);

          if (typeof _this2.onProgress === 'function') {
            _this2.onProgress.apply(_this2, [percents].concat(_toConsumableArray(_this2.onProgressParams), [speed])); //toDo move speed param to second position on major update

          }
        }
      };

      xhr.onloadend = function (e) {
        var target = e.target;

        if (target.status === 200) {
          _this2.loaded++;
        } else {
          _this2.noAccess++;
          _this2.error = new Error("Can't Access \"".concat(uri, "\". Status code ").concat(target.status));

          _this2.__runError();
        }

        if (_this2.loaded + _this2.noAccess === _this2.__count) {
          var details = _this2.__getDetails();

          _this2.triggerEvent(_this2.options.eventEnd, details);

          _this2.__exitPreloader();
        }
      };

      xhr.ontimeout = function () {
        _this2.error = new Error("timeout error");

        _this2.__runError();
      };

      xhr.open('GET', uri, true);
      xhr.send();
    }
  }, {
    key: "__updateSizes",
    value: function __updateSizes(e, uri) {
      this.fileSizes[uri] = {
        size: e.total,
        loaded: e.loaded
      };

      this.__log('Updated files sizes is:');

      this.__log(this.fileSizes);
    }
  }, {
    key: "__updateSpeed",
    value: function __updateSpeed(time) {
      this.fileSizes.updated = Date.now();
      this.fileSizes.speed = this.__speedCalc(time, this.oldSizes);

      this.__log('Updated speed is:');

      this.__log(this.fileSizes.speed);
    }
  }, {
    key: "__needSpeedUpdate",
    value: function __needSpeedUpdate(timeDiff) {
      return timeDiff >= this.speedTimeout || typeof this.fileSizes.speed === 'undefined';
    }
  }, {
    key: "__percentageCalc",
    value: function __percentageCalc() {
      var keys = Object.keys(this.fileSizes),
          keysToRemove = ['updated', 'speed'],
          links = keys.filter(function (key) {
        return !keysToRemove.includes(key);
      }),
          count = this.options.files.length;

      if (links.length === count) {
        this.__log('calc percents');

        var totalLoaded = this.totalLoaded(),
            total = totalLoaded.total,
            loaded = totalLoaded.loaded;

        if (total > 0) {
          return Math.round(loaded / total * 100);
        }
      }

      return 0;
    }
  }, {
    key: "__speedCalc",
    value: function __speedCalc(time, oldSizes) {
      var _this3 = this;

      var loadedOld = this.totalLoaded(oldSizes).loaded,
          loadedNew = this.totalLoaded().loaded,
          diff = loadedNew - loadedOld,
          timeDiff = time / 1000,
          getSpeed = function getSpeed(value, time) {
        var speed = {
          bytesSpeed: 0,
          value: 0,
          units: 'Bytes/s'
        },
            units = ['Bytes/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];

        if (value > 0 && time > 0) {
          _this3.__log('calc speed');

          speed.bytesSpeed = Math.round(value / time);
          var count = Math.floor(Math.log(speed.bytesSpeed) / Math.log(1024));
          speed.value = Math.round(speed.bytesSpeed / Math.pow(1024, count) * 100) / 100;
          speed.units = units[count];
        }

        return speed;
      };

      return getSpeed(diff, timeDiff);
    }
  }, {
    key: "totalLoaded",
    value: function totalLoaded() {
      var sizes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.fileSizes;
      var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.keys(sizes);
      var total = 0,
          loaded = 0;
      keys.forEach(function (key) {
        var file = sizes[key];

        if (file.size > 0) {
          var _file$loaded;

          total += file.size;
          loaded += (_file$loaded = file.loaded) !== null && _file$loaded !== void 0 ? _file$loaded : 0;
        }
      });
      return {
        total: total,
        loaded: loaded
      };
    }
  }, {
    key: "__exitPreloader",
    value: function __exitPreloader() {
      this.__log("exit preloader ".concat(this.error ? 'with error' : 'without errors'));

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
          callback.apply(void 0, [this.error].concat(_toConsumableArray(cbParams)));
        } else {
          callback.apply(void 0, _toConsumableArray(cbParams));
        }
      }
    }
  }, {
    key: "__getElement",
    value: function __getElement(element, all) {
      this.__log("getting element type is ".concat(_typeof(element)));

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
  }, {
    key: "__getDetails",
    value: function __getDetails(details) {
      var common = {
        loaded: this.loaded,
        failed: this.noAccess
      };
      return _objectSpread(_objectSpread({}, common), details);
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventName, details) {
      if (this.options.events === true || this.options.events === 'true') {
        var eventDetails = details || {},
            event = new CustomEvent(eventName, {
          detail: eventDetails
        }),
            target = this.__getElement(this.options.eventsTarget);

        if (target) {
          this.__log("trigger event ".concat(eventName));

          target.dispatchEvent(event);
        }
      }
    }
  }, {
    key: "hidePreloader",
    value: function hidePreloader() {
      if (this.preloader) {
        this.__log('hide preloader');

        this.preloader.style.display = 'none';
      }
    }
  }, {
    key: "showPreloader",
    value: function showPreloader() {
      if (this.preloader) {
        this.__log('show preloader');

        this.preloader.style.display = '';
      }
    }
  }, {
    key: "updateProgress",
    value: function updateProgress() {
      var _this4 = this;

      if (this.progress) {
        this.__log('updateProgress');

        this.progress.forEach(function (node) {
          if (node.hasAttribute(_this4.writePercentsAttr)) {
            node.textContent = "".concat(_this4.percents, "%");
            node.setAttribute(_this4.writePercentsAttr, "".concat(_this4.percents, "%"));
          }

          node.setAttribute('progress', _this4.percents);
          node.setAttribute('style', "".concat(_this4.styleVar, ": ").concat(_this4.percents, "%"));
        });
      }
    }
  }, {
    key: "__runError",
    value: function __runError() {
      console.log("%c".concat(this.error.message), 'color: __bb5577');

      var details = this.__getDetails({
        error: this.error.message
      });

      this.triggerEvent(this.options.eventError, details);
    }
  }, {
    key: "__log",
    value: function __log(message) {
      if (this.options.debug === true || this.options.debug === 'true') {
        console.log(message);
      }
    }
  }, {
    key: "defaultOptions",
    get: function get() {
      var _this5 = this;

      return {
        callback: function callback() {
          _this5.__log('run default callback');

          _this5.hidePreloader();
        },
        cbParams: [],
        debug: false,
        eventEnd: 'preloadend',
        eventError: 'preloaderror',
        eventProgress: 'preloadprogress',
        events: true,
        eventsTarget: document,
        files: [],
        ifError: function ifError() {
          _this5.__log('run default error callback');

          _this5.hidePreloader();
        },
        ifErrorParams: [],
        onProgress: function onProgress() {
          _this5.__log('run default progress callback');

          _this5.updateProgress();
        },
        onProgressParams: [],
        preloader: document.querySelector('#preloader'),
        progress: document.querySelectorAll('#preloader [progress]'),
        writePercentsAttr: 'txt-progress',
        styleVar: '--preloader-progress',
        speedTimeout: 500
      };
    }
  }, {
    key: "preloader",
    get: function get() {
      this.__log('get preloader element');

      return this.__getElement(this.options.preloader);
    },
    set: function set(element) {
      this.__log('set preloader element');

      this.options.preloader = element;
    }
  }, {
    key: "progress",
    get: function get() {
      this.__log('get progress element');

      return this.__getElement(this.options.progress, true);
    },
    set: function set(element) {
      this.__log('set progress element');

      this.options.progress = element;
    }
  }, {
    key: "writePercentsAttr",
    get: function get() {
      this.__log('get attribute to show progress');

      return this.options.writePercentsAttr;
    },
    set: function set(attr) {
      this.__log('set attribute to show progress');

      this.options.writePercentsAttr = attr;
    }
  }, {
    key: "styleVar",
    get: function get() {
      this.__log('get css variable name');

      return this.options.styleVar;
    },
    set: function set(variable) {
      this.__log('set css variable name');

      this.options.styleVar = variable;
    }
  }, {
    key: "files",
    get: function get() {
      this.__log('get files');

      return this.options.files;
    },
    set: function set(files) {
      this.__log('set files');

      this.options.files = files;
    }
  }, {
    key: "speedTimeout",
    get: function get() {
      if (typeof Number(this.options.speedTimeout) === 'number') {
        return Number(this.options.speedTimeout);
      }

      return this.defaultOptions.speedTimeout;
    },
    set: function set(timeout) {
      this.options.speedTimeout = timeout;
    }
  }, {
    key: "__count",
    get: function get() {
      this.__log('get total');

      return this.options.files.length;
    } //callbacks

  }, {
    key: "callback",
    get: function get() {
      this.__log('get callback');

      return this.options.callback;
    },
    set: function set(callback) {
      this.__log('set callback');

      this.options.callback = callback;
    }
  }, {
    key: "cbParams",
    get: function get() {
      this.__log('get cbParams');

      return this.options.cbParams;
    },
    set: function set(params) {
      this.__log('set cbParams');

      this.options.cbParams = params;
    } //error callback

  }, {
    key: "ifError",
    get: function get() {
      this.__log('get error callback');

      return this.options.ifError;
    },
    set: function set(ifError) {
      this.__log('set error callback');

      this.options.ifError = ifError;
    }
  }, {
    key: "ifErrorParams",
    get: function get() {
      this.__log('get error cbParams');

      return this.options.ifErrorParams;
    },
    set: function set(params) {
      this.__log('set error cbParams');

      this.options.ifErrorParams = params;
    } //percents changing callback

  }, {
    key: "onProgress",
    get: function get() {
      this.__log('get progress callback');

      return this.options.onProgress;
    },
    set: function set(onProgress) {
      this.__log('set progress callback');

      this.options.onProgress = onProgress;
    }
  }, {
    key: "onProgressParams",
    get: function get() {
      this.__log('get progress cbParams');

      return this.options.onProgressParams;
    },
    set: function set(params) {
      this.__log('set progress cbParams');

      this.options.onProgressParams = params;
    }
  }]);

  return SimpleResourcePreloader;
}();
