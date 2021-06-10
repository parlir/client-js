window["FHIR"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/browser.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/debug/node_modules/ms/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/debug/node_modules/ms/index.js ***!
  \*****************************************************/
/*! all exports used */
/***/ (function(module, exports) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(/*! ./common */ "./node_modules/debug/src/common.js")(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/debug/src/common.js":
/*!******************************************!*\
  !*** ./node_modules/debug/src/common.js ***!
  \******************************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(/*! ms */ "./node_modules/debug/node_modules/ms/index.js");

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! all exports used */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! all exports used */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/browser.ts":
/*!************************!*\
  !*** ./src/browser.ts ***!
  \************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Client_1 = __webpack_require__(/*! ./lib/Client */ "./src/lib/Client.ts");

const util = __webpack_require__(/*! ./util */ "./src/util.ts");

const smart = __webpack_require__(/*! ./lib/smart */ "./src/lib/smart.ts"); // In Browsers we create an adapter, get the SMART api from it and build the
// global FHIR object


const BrowserAdapter_1 = __webpack_require__(/*! ./lib/adapters/BrowserAdapter */ "./src/lib/adapters/BrowserAdapter.ts");

const adapter = new BrowserAdapter_1.default(); // const { options } = adapter.getSmartApi();
// We have two kinds of browser builds - "pure" for new browsers and "legacy"
// for old ones. In pure builds we assume that the browser supports everything
// we need. In legacy mode, the library also acts as a polyfill. Babel will
// automatically polyfill everything except "fetch", which we have to handle
// manually.
// @ts-ignore

if (false) {} // $lab:coverage:off$


const FHIR = {
  Client: Client_1.Client,
  SMART: {
    authorize(options) {
      return smart.authorize(adapter, options);
    },

    ready(onSuccess, onError) {
      return smart.ready(adapter, onSuccess, onError);
    },

    init(options) {
      return smart.init(adapter, options);
    }

  },
  util
};
module.exports = FHIR; // $lab:coverage:on$

/***/ }),

/***/ "./src/lib/Client.ts":
/*!***************************!*\
  !*** ./src/lib/Client.ts ***!
  \***************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = exports.msg = void 0;

const _1 = __webpack_require__(/*! . */ "./src/lib/index.ts");

const util_1 = __webpack_require__(/*! ../util */ "./src/util.ts");

const settings_1 = __webpack_require__(/*! ./settings */ "./src/lib/settings.ts"); // $lab:coverage:off$
// @ts-ignore


const {
  Response
} =  true ? window : undefined; // $lab:coverage:on$

const debug = _1.debug.extend("client");
/**
 * Adds patient context to requestOptions object to be used with [[Client.request]]
 * @param requestOptions Can be a string URL (relative to the serviceUrl), or an
 * object which will be passed to fetch()
 * @param client Current FHIR client object containing patient context
 * @return requestOptions object contextualized to current patient
 */


async function contextualize(requestOptions, client) {
  const base = _1.absolute("/", client.state.serverUrl);

  async function contextualURL(_url) {
    const resourceType = _url.pathname.split("/").pop();

    _1.assert(resourceType, `Invalid url "${_url}"`);

    _1.assert(settings_1.patientCompartment.indexOf(resourceType) > -1, `Cannot filter "${resourceType}" resources by patient`);

    const conformance = await _1.fetchConformanceStatement(client.state.serverUrl);

    const searchParam = _1.getPatientParam(conformance, resourceType);

    _url.searchParams.set(searchParam, client.patient.id);

    return _url.href;
  }

  if (typeof requestOptions == "string" || requestOptions instanceof URL) {
    return {
      url: await contextualURL(new URL(requestOptions + "", base))
    };
  }

  requestOptions.url = await contextualURL(new URL(requestOptions.url + "", base));
  return requestOptions;
}
/**
 * Gets single reference by id. Caches the result.
 * @param refId
 * @param cache A map to store the resolved refs
 * @param client The client instance
 * @param [signal] The `AbortSignal` if any
 * @returns The resolved reference
 * @private
 */


function getRef(refId, cache, client, signal) {
  if (!cache[refId]) {
    // Note that we set cache[refId] immediately! When the promise is
    // settled it will be updated. This is to avoid a ref being fetched
    // twice because some of these requests are executed in parallel.
    cache[refId] = client.request({
      url: refId,
      signal
    }).then(res => {
      cache[refId] = res;
      return res;
    }, error => {
      delete cache[refId];
      throw error;
    });
  }

  return Promise.resolve(cache[refId]);
}
/**
 * Resolves a reference in the given resource.
 * @param obj FHIR Resource
 */


function resolveRef(obj, path, graph, cache, client, signal) {
  const node = _1.getPath(obj, path);

  if (node) {
    const isArray = Array.isArray(node);
    return Promise.all(util_1.makeArray(node).filter(Boolean).map((item, i) => {
      const ref = item.reference;

      if (ref) {
        return getRef(ref, cache, client, signal).then(sub => {
          if (graph) {
            if (isArray) {
              if (path.indexOf("..") > -1) {
                _1.setPath(obj, `${path.replace("..", `.${i}.`)}`, sub);
              } else {
                _1.setPath(obj, `${path}.${i}`, sub);
              }
            } else {
              _1.setPath(obj, path, sub);
            }
          }
        }).catch(ex => {
          /* ignore missing references */
          if (ex.status !== 404) {
            throw ex;
          }
        });
      }
    }));
  }
}
/**
 * Given a resource and a list of ref paths - resolves them all
 * @param obj FHIR Resource
 * @param fhirOptions The fhir options of the initiating request call
 * @param cache A map to store fetched refs
 * @param client The client instance
 * @private
 */


function resolveRefs(obj, fhirOptions, cache, client, signal) {
  // 1. Sanitize paths, remove any invalid ones
  let paths = util_1.makeArray(fhirOptions.resolveReferences).filter(Boolean) // No false, 0, null, undefined or ""
  .map(path => String(path).trim()).filter(Boolean); // No space-only strings
  // 2. Remove duplicates

  paths = paths.filter((p, i) => {
    const index = paths.indexOf(p, i + 1);

    if (index > -1) {
      debug("Duplicated reference path \"%s\"", p);
      return false;
    }

    return true;
  }); // 3. Early exit if no valid paths are found

  if (!paths.length) {
    return Promise.resolve();
  } // 4. Group the paths by depth so that child refs are looked up
  // after their parents!


  const groups = {};
  paths.forEach(path => {
    const len = path.split(".").length;

    if (!groups[len]) {
      groups[len] = [];
    }

    groups[len].push(path);
  }); // 5. Execute groups sequentially! Paths within same group are
  // fetched in parallel!

  let task = Promise.resolve();
  Object.keys(groups).sort().forEach(len => {
    const group = groups[len];
    task = task.then(() => Promise.all(group.map(path => {
      return resolveRef(obj, path, !!fhirOptions.graph, cache, client, signal);
    })));
  });
  return task;
}

exports.msg = {
  noPatientBeforeAuth: "Cannot get the ID of the selected patient before the app is authorized",
  noPatientFromOpenServer: "Cannot get the ID of the selected patient from an open FHIR server",
  noPatientScopes: "Unable to get the ID of the selected patient. Insufficient scopes. 'launch' or 'launch/patient' scope is needed.",
  noPatientAvailable: "The ID of the selected patient is not available. Please check if the server supports that.",
  noEncounterBeforeAuth: "Cannot get the ID of the selected encounter before the app is authorized",
  noEncounterFromOpenServer: "Cannot get the ID of the selected encounter from an open FHIR server",
  noEncounterScopes: "Unable to get the ID of the selected encounter. Insufficient scopes. 'launch' or 'launch/encounter' scope is needed.",
  noEncounterAvailable: "The ID of the selected encounter is not available. Check if this server supports encounter context, and if the selected patient has any recorded encounters.",
  noUserBeforeAuth: "Cannot get the current user before the app is authorized",
  noUserFromOpenServer: "Cannot get the current user from an open FHIR server",
  noUserScopes: "Unable to get the current user. Insufficient scopes. 'openid fhirUser' or 'openid profile' scopes are needed.",
  noUserAvailable: "The current user is not available. Check if this server supports id tokens.",
  requestNeedsArgs: "request requires an url or request options as argument",
  appRequiresSMART: "This app cannot be accessed directly. Please launch it as SMART app!",
  sessionExpiredAndNoRefresh: "Your session has expired and the useRefreshToken option is set to false. Please re-launch the app.",
  sessionExpired: "Session expired! Please re-launch the app.",
  autoRefreshFailed: "Auto-refresh failed! Please re-launch the app.",
  requestGot403: "Permission denied! Please make sure that you have requested the proper scopes.",
  cantRefreshNoToken: "Unable to refresh. No refresh_token found.",
  cantRefreshNoTokenUri: "Unable to refresh. No tokenUri found.",
  cantRefreshNoScopes: "Unable to refresh. No offline_access or online_access scope found.",
  gotNoAccessToken: "No access token received",
  rejectedScopes: "The following scopes were requested but not granted by the auth server: \"%s\"",
  noExpiresAt: "Auto-refresh might fail! The client got an access token but can't reliably determine when it will expire. The client " + "does not know when that access token was issued. Please also provide an 'expiresAt' state parameter."
};
/**
 * This is a FHIR client that is returned to you from the `ready()` call of the
 * **SMART API**. You can also create it yourself if needed:
 *
 * ```js
 * // BROWSER
 * const client = FHIR.client("https://r4.smarthealthit.org");
 *
 * // SERVER
 * const client = new Client("https://r4.smarthealthit.org");
 * ```
 */

class Client {
  /**
   * - Validates parameters
   * - Creates an instance
   * - If in browser, tries to connect it to FhirJS, if one is available globally
   * - Initializes the `patient`, `user` and `encounter` APIs
   * - Checks for rejected scopes
   */
  constructor(state, options = {}) {
    this.options = {
      refreshWithCredentials: "same-origin"
    };
    /**
     * Refers to the refresh task while it is being performed.
     * @see [[refresh]]
     */

    this._refreshTask = null;
    /**
     * @category Utility
     */

    this.units = _1.units;

    if (typeof state == "string") {
      state = {
        serverUrl: state
      };
    } // Valid serverUrl is required!


    _1.assert(state.serverUrl && state.serverUrl.match(/https?:\/\/.+/), "A \"serverUrl\" option is required and must begin with \"http(s)\"");

    Object.assign(this.options, options);
    this.state = state;
    const client = this; // patient api ---------------------------------------------------------

    this.patient = {
      get id() {
        return client.getPatientId();
      },

      read: requestOptions => {
        const id = this.patient.id;
        return id ? this.request({ ...requestOptions,
          url: `Patient/${id}`
        }) : Promise.reject(new Error("Patient is not available"));
      },
      request: (requestOptions, fhirOptions = {}) => {
        if (this.patient.id) {
          return (async () => {
            const options = await contextualize(requestOptions, this);
            return this.request(options, fhirOptions);
          })();
        } else {
          return Promise.reject(new Error("Patient is not available"));
        }
      }
    }; // encounter api -------------------------------------------------------

    this.encounter = {
      get id() {
        return client.getEncounterId();
      },

      read: requestOptions => {
        const id = this.encounter.id;
        return id ? this.request({ ...requestOptions,
          url: `Encounter/${id}`
        }) : Promise.reject(new Error("Encounter is not available"));
      }
    }; // user api ------------------------------------------------------------

    this.user = {
      get fhirUser() {
        return client.getFhirUser();
      },

      get id() {
        return client.getUserId();
      },

      get resourceType() {
        return client.getUserType();
      },

      read: requestOptions => {
        const fhirUser = this.user.fhirUser;
        return fhirUser ? this.request({ ...requestOptions,
          url: fhirUser
        }) : Promise.reject(new Error("User is not available"));
      }
    }; // fhir.js api (attached automatically in browser)
    // ---------------------------------------------------------------------

    if (_1.isBrowser()) {
      // @ts-ignore
      this.connect(window.fhir);
    }

    this.checkScopes();

    if (!this.state.expiresAt && this.state.tokenUri && this.state.tokenResponse && this.state.tokenResponse.access_token && this.state.tokenResponse.refresh_token && (this.hasGrantedScope("offline_access") || this.hasGrantedScope("online_access"))) {
      console.warn(exports.msg.noExpiresAt);
    }
  }
  /**
   * This method is used to make the "link" between the `fhirclient` and the
   * `fhir.js`, if one is available.
   * **Note:** This is called by the constructor. If fhir.js is available in
   * the global scope as `fhir`, it will automatically be linked to any [[Client]]
   * instance. You should only use this method to connect to `fhir.js` which
   * is not global.
   */


  connect(fhirJs) {
    if (typeof fhirJs == "function") {
      const options = {
        baseUrl: this.state.serverUrl.replace(/\/$/, "")
      };
      const accessToken = this.getState("tokenResponse.access_token");

      if (accessToken) {
        options.auth = {
          token: accessToken
        };
      } else {
        const {
          username,
          password
        } = this.state;

        if (username && password) {
          options.auth = {
            user: username,
            pass: password
          };
        }
      }

      this.api = fhirJs(options);
      const patientId = this.getState("tokenResponse.patient");

      if (patientId) {
        this.patient.api = fhirJs({ ...options,
          patient: patientId
        });
      }
    }

    return this;
  }
  /**
   * Checks if the given scope has been granted
   */


  hasGrantedScope(scope) {
    var _a;

    const scopes = String(((_a = this.state.tokenResponse) === null || _a === void 0 ? void 0 : _a.scope) || "").trim().split(/\s+/);
    return scopes.indexOf(scope) > -1;
  } // /**
  //  * Checks if the given scope has been requested
  //  */
  // hasRequestedScope(scope: string): boolean
  // {
  //     const scopes = String(this.state.scope || "").trim().split(/\s+/);
  //     return scopes.indexOf(scope) > -1;
  // }

  /**
   * Compares the requested scopes (from `state.scope`) with the granted
   * scopes (from `state.tokenResponse.scope`). Emits a warning if any of
   * the requested scopes was not granted.
   */


  checkScopes() {
    var _a;

    const requestedScopes = String(this.state.scope || "").trim().split(/\s+/).filter(Boolean);
    const grantedScopes = String(((_a = this.state.tokenResponse) === null || _a === void 0 ? void 0 : _a.scope) || "").trim().split(/\s+/);
    const rejectedScopes = [];

    for (const requested of requestedScopes) {
      if (grantedScopes.indexOf(requested) === -1) {
        rejectedScopes.push(requested);
      }
    }

    if (rejectedScopes.length) {
      console.warn(exports.msg.rejectedScopes, rejectedScopes.join('", "'));
    }
  }
  /**
   * Returns the ID of the selected patient or null. You should have requested
   * "launch/patient" scope. Otherwise this will return null.
   */


  getPatientId() {
    const tokenResponse = this.state.tokenResponse;

    if (tokenResponse) {
      if (tokenResponse.patient) {
        return tokenResponse.patient;
      }

      console.warn(this.hasGrantedScope("launch") || this.hasGrantedScope("launch/patient") ? exports.msg.noPatientAvailable : exports.msg.noPatientScopes);
    } else {
      console.warn(this.state.authorizeUri ? exports.msg.noPatientBeforeAuth : exports.msg.noPatientFromOpenServer);
    }

    return null;
  }
  /**
   * Returns the ID of the selected encounter or null. You should have
   * requested "launch/encounter" scope. Otherwise this will return null.
   * Note that not all servers support the "launch/encounter" scope so this
   * will be null if they don't.
   */


  getEncounterId() {
    const tokenResponse = this.state.tokenResponse;

    if (tokenResponse) {
      if (tokenResponse.encounter) {
        return tokenResponse.encounter;
      }

      console.warn(this.hasGrantedScope("launch") || this.hasGrantedScope("launch/encounter") ? exports.msg.noEncounterAvailable : exports.msg.noEncounterScopes);
    } else {
      console.warn(this.state.authorizeUri ? exports.msg.noEncounterBeforeAuth : exports.msg.noEncounterFromOpenServer);
    }

    return null;
  }
  /**
   * Returns the (decoded) id_token if any. You need to request "openid" and
   * "profile" scopes if you need to receive an id_token (if you need to know
   * who the logged-in user is).
   */


  getIdToken() {
    const tokenResponse = this.state.tokenResponse;

    if (tokenResponse) {
      const idToken = tokenResponse.id_token; // We have been authorized against this server but we don't have
      // the id_token. This should be a scope issue.

      if (!idToken) {
        const hasOpenid = this.hasGrantedScope("openid");
        const hasProfile = this.hasGrantedScope("profile");
        const hasFhirUser = this.hasGrantedScope("fhirUser");
        console.warn(hasOpenid && (hasFhirUser || hasProfile) ? exports.msg.noUserAvailable : exports.msg.noUserScopes);
        return null;
      }

      return _1.jwtDecode(idToken);
    }

    console.warn(this.state.authorizeUri ? exports.msg.noUserBeforeAuth : exports.msg.noUserFromOpenServer);
    return null;
  }
  /**
   * Returns the profile of the logged_in user (if any). This is a string
   * having the following shape `"{user type}/{user id}"`. For example:
   * `"Practitioner/abc"` or `"Patient/xyz"`.
   */


  getFhirUser() {
    const idToken = this.getIdToken();

    if (idToken) {
      // Epic may return a full url like
      // @see https://github.com/smart-on-fhir/client-js/issues/105
      if (idToken.fhirUser) {
        return idToken.fhirUser.split("/").slice(-2).join("/");
      }

      return idToken.profile;
    }

    return null;
  }
  /**
   * Returns the user ID or null.
   */


  getUserId() {
    const profile = this.getFhirUser();

    if (profile) {
      return profile.split("/")[1];
    }

    return null;
  }
  /**
   * Returns the type of the logged-in user or null. The result can be
   * "Practitioner", "Patient" or "RelatedPerson".
   */


  getUserType() {
    const profile = this.getFhirUser();

    if (profile) {
      return profile.split("/")[0];
    }

    return null;
  }
  /**
   * Builds and returns the value of the `Authorization` header that can be
   * sent to the FHIR server
   */


  getAuthorizationHeader() {
    const accessToken = this.getState("tokenResponse.access_token");

    if (accessToken) {
      return "Bearer " + accessToken;
    }

    const {
      username,
      password
    } = this.state;

    if (username && password) {
      return "Basic " + _1.btoa(username + ":" + password);
    }

    return null;
  }
  /**
   * Calls the `save` callback option (if one is provided) to persist the instance
   * - In browsers, clients returned by smart.ready or smart.init will persist in
   *   sessionStorage
   * - In servers, clients returned by smart.ready or smart.init will persist in
   *   the request session (unless configured otherwise)
   * - Direct Client instances will not persist anywhere, unless a `save` option
   *   is passed to the constructor
   */


  async saveState() {
    if (this.options.save) {
      await this.options.save(this.state);
    }
  }
  /**
   * Creates a new resource in a server-assigned location
   * @see http://hl7.org/fhir/http.html#create
   * @param resource A FHIR resource to be created
   * @param [requestOptions] Any options to be passed to the fetch call.
   * Note that `method` and `body` will be ignored.
   * @category Request
   */


  create(resource, requestOptions) {
    return this.request({ ...requestOptions,
      url: `${resource.resourceType}`,
      method: "POST",
      body: JSON.stringify(resource),
      headers: {
        // TODO: Do we need to alternate with "application/json+fhir"?
        "Content-Type": "application/json",
        ...(requestOptions || {}).headers
      }
    });
  }
  /**
   * Creates a new current version for an existing resource or creates an
   * initial version if no resource already exists for the given id.
   * @see http://hl7.org/fhir/http.html#update
   * @param resource A FHIR resource to be updated
   * @param requestOptions Any options to be passed to the fetch call.
   * Note that `method` and `body` will be ignored.
   * @category Request
   */


  update(resource, requestOptions) {
    return this.request({ ...requestOptions,
      url: `${resource.resourceType}/${resource.id}`,
      method: "PUT",
      body: JSON.stringify(resource),
      headers: {
        // TODO: Do we need to alternate with "application/json+fhir"?
        "Content-Type": "application/json",
        ...(requestOptions || {}).headers
      }
    });
  }
  /**
   * Removes an existing resource.
   * @see http://hl7.org/fhir/http.html#delete
   * @param url Relative URI of the FHIR resource to be deleted
   * (format: `resourceType/id`)
   * @param requestOptions Any options (except `method` which will be fixed
   * to `DELETE`) to be passed to the fetch call.
   * @category Request
   */


  delete(url, requestOptions = {}) {
    return this.request({ ...requestOptions,
      url,
      method: "DELETE"
    });
  }
  /**
   * @param requestOptions Can be a string URL (relative to the serviceUrl),
   * or an object which will be passed to fetch()
   * @param fhirOptions Additional options to control the behavior
   * @param _resolvedRefs DO NOT USE! Used internally.
   * @category Request
   */


  async request(requestOptions, fhirOptions = {}, _resolvedRefs = {}) {
    var _a;

    const debugRequest = _1.debug.extend("client:request");

    _1.assert(requestOptions, exports.msg.requestNeedsArgs); // url -----------------------------------------------------------------


    let url;

    if (typeof requestOptions == "string" || requestOptions instanceof URL) {
      url = String(requestOptions);
      requestOptions = {};
    } else {
      url = String(requestOptions.url);
    }

    url = _1.absolute(url, this.state.serverUrl);
    const options = {
      graph: fhirOptions.graph !== false,
      flat: !!fhirOptions.flat,
      pageLimit: (_a = fhirOptions.pageLimit) !== null && _a !== void 0 ? _a : 1,
      resolveReferences: fhirOptions.resolveReferences || [],
      useRefreshToken: fhirOptions.useRefreshToken !== false,
      onPage: typeof fhirOptions.onPage == "function" ? fhirOptions.onPage : undefined
    };
    const signal = requestOptions.signal || undefined; // Refresh the access token if needed

    const job = options.useRefreshToken ? this.refreshIfNeeded({
      signal
    }).then(() => requestOptions) : Promise.resolve(requestOptions);
    let response;
    return job // Add the Authorization header now, after the access token might
    // have been updated
    .then(requestOptions => {
      const authHeader = this.getAuthorizationHeader();

      if (authHeader) {
        requestOptions.headers = { ...requestOptions.headers,
          Authorization: authHeader
        };
      }

      return requestOptions;
    }) // Make the request
    .then(requestOptions => {
      debugRequest("%s, options: %O, fhirOptions: %O", url, requestOptions, options);
      return _1.request(url, requestOptions).then(result => {
        if (requestOptions.includeResponse) {
          response = result.response;
          return result.body;
        }

        return result;
      });
    }) // Handle 401 ------------------------------------------------------
    .catch(async error => {
      if (error.status == 401) {
        // !accessToken -> not authorized -> No session. Need to launch.
        if (!this.getState("tokenResponse.access_token")) {
          error.message += "\n" + exports.msg.appRequiresSMART;
          throw error;
        } // auto-refresh not enabled and Session expired.
        // Need to re-launch. Clear state to start over!


        if (!options.useRefreshToken) {
          debugRequest(exports.msg.sessionExpiredAndNoRefresh);
          this.state.tokenResponse = {};
          await this.saveState();
          error.message += "\n" + exports.msg.sessionExpired;
          throw error;
        } // In rare cases we may have a valid access token and a refresh
        // token and the request might still fail with 401 just because
        // the access token has just been revoked.
        // otherwise -> auto-refresh failed. Session expired.
        // Need to re-launch. Clear state to start over!


        debugRequest(exports.msg.autoRefreshFailed);
        this.state.tokenResponse = {};
        await this.saveState();
        error.message += "\n" + exports.msg.sessionExpired;
        throw error;
      }

      throw error;
    }) // Handle 403 ------------------------------------------------------
    .catch(error => {
      if (error.status == 403) {
        debugRequest(exports.msg.requestGot403);
      }

      throw error;
    }).then(data => {
      // At this point we don't know what `data` actually is!
      // We might gen an empty or falsy result. If so return it as is
      if (!data) return data; // Handle raw responses

      if (typeof data == "string" || data instanceof Response) return data; // Resolve References ------------------------------------------

      return (async _data => {
        if (_data.resourceType == "Bundle") {
          await Promise.all((_data.entry || []).map(item => resolveRefs(item.resource, options, _resolvedRefs, this, signal)));
        } else {
          await resolveRefs(_data, options, _resolvedRefs, this, signal);
        }

        return _data;
      })(data) // Pagination ----------------------------------------------
      .then(async _data => {
        if (_data && _data.resourceType == "Bundle") {
          const links = _data.link || [];

          if (options.flat) {
            _data = (_data.entry || []).map(entry => entry.resource);
          }

          if (options.onPage) {
            await options.onPage(_data, { ..._resolvedRefs
            });
          }

          if (--options.pageLimit) {
            const next = links.find(l => l.relation == "next");
            _data = util_1.makeArray(_data);

            if (next && next.url) {
              const nextPage = await this.request({
                url: next.url,
                // Aborting the main request (even after it is complete)
                // must propagate to any child requests and abort them!
                // To do so, just pass the same AbortSignal if one is
                // provided.
                signal
              }, options, _resolvedRefs);

              if (options.onPage) {
                return null;
              }

              if (options.resolveReferences.length) {
                Object.assign(_resolvedRefs, nextPage.references);
                return _data.concat(util_1.makeArray(nextPage.data || nextPage));
              }

              return _data.concat(util_1.makeArray(nextPage));
            }
          }
        }

        return _data;
      }) // Finalize ------------------------------------------------
      .then(_data => {
        if (options.graph) {
          _resolvedRefs = {};
        } else if (!options.onPage && options.resolveReferences.length) {
          return {
            data: _data,
            references: _resolvedRefs
          };
        }

        return _data;
      }).then(_data => {
        if (requestOptions.includeResponse) {
          return {
            body: _data,
            response
          };
        }

        return _data;
      });
    });
  }
  /**
   * Checks if access token and refresh token are present. If they are, and if
   * the access token is expired or is about to expire in the next 10 seconds,
   * calls `this.refresh()` to obtain new access token.
   * @param requestOptions Any options to pass to the fetch call. Most of them
   * will be overridden, bit it might still be useful for passing additional
   * request options or an abort signal.
   * @category Request
   */


  refreshIfNeeded(requestOptions = {}) {
    const accessToken = this.getState("tokenResponse.access_token");
    const refreshToken = this.getState("tokenResponse.refresh_token");
    const expiresAt = this.state.expiresAt || 0;

    if (accessToken && refreshToken && expiresAt - 10 < Date.now() / 1000) {
      return this.refresh(requestOptions);
    }

    return Promise.resolve(this.state);
  }
  /**
   * Use the refresh token to obtain new access token. If the refresh token is
   * expired (or this fails for any other reason) it will be deleted from the
   * state, so that we don't enter into loops trying to re-authorize.
   *
   * This method is typically called internally from [[Client.request]] if
   * certain request fails with 401.
   *
   * @param requestOptions Any options to pass to the fetch call. Most of them
   * will be overridden, bit it might still be useful for passing additional
   * request options or an abort signal.
   * @category Request
   */


  refresh(requestOptions = {}) {
    var _a, _b;

    const debugRefresh = _1.debug.extend("client:refresh");

    debugRefresh("Attempting to refresh with refresh_token...");
    const refreshToken = (_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.tokenResponse) === null || _b === void 0 ? void 0 : _b.refresh_token;

    if (!refreshToken) {
      return Promise.reject(new Error(exports.msg.cantRefreshNoToken));
    }

    const tokenUri = this.state.tokenUri;

    if (!tokenUri) {
      return Promise.reject(new Error(exports.msg.cantRefreshNoTokenUri));
    }

    const hasOfflineAccess = this.hasGrantedScope("offline_access");
    const hasOnlineAccess = this.hasGrantedScope("online_access");

    if (!hasOfflineAccess && !hasOnlineAccess) {
      return Promise.reject(new Error(exports.msg.cantRefreshNoScopes));
    }

    const refreshRequestOptions = {
      credentials: this.options.refreshWithCredentials,
      ...requestOptions,
      method: "POST",
      mode: "cors",
      headers: { ...(requestOptions.headers || {}),
        "content-type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`
    }; // custom authorization header can be passed on manual calls

    if (!("authorization" in refreshRequestOptions.headers)) {
      const {
        clientSecret,
        clientId
      } = this.state;

      if (clientSecret) {
        // @ts-ignore
        refreshRequestOptions.headers.authorization = "Basic " + _1.btoa(clientId + ":" + clientSecret);
      }
    } // This method is typically called internally from `request` if certain
    // request fails with 401. However, clients will often run multiple
    // requests in parallel which may result in multiple refresh calls.
    // To avoid that, we keep a reference to the current refresh task (if any).


    if (!this._refreshTask) {
      this._refreshTask = _1.request(tokenUri, refreshRequestOptions).then(data => {
        _1.assert(data.access_token, exports.msg.gotNoAccessToken);

        debugRefresh("Received new access token response %O", data);
        Object.assign(this.state.tokenResponse, data);
        this.state.expiresAt = _1.getAccessTokenExpiration(data);
        this.checkScopes();
        return this.state;
      }).catch(error => {
        var _a, _b;

        if ((_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a.tokenResponse) === null || _b === void 0 ? void 0 : _b.refresh_token) {
          debugRefresh("Deleting the expired or invalid refresh token.");
          delete this.state.tokenResponse.refresh_token;
        }

        throw error;
      }).finally(() => {
        this._refreshTask = null;
        return this.saveState().catch(e => debugRefresh(e.message)).then(() => this.state);
      });
    }

    return this._refreshTask;
  } // utils -------------------------------------------------------------------

  /**
   * Groups the observations by code. Returns a map that will look like:
   * ```js
   * const map = client.byCodes(observations, "code");
   * // map = {
   * //     "55284-4": [ observation1, observation2 ],
   * //     "6082-2": [ observation3 ]
   * // }
   * ```
   * @param observations Array of observations
   * @param property The name of a CodeableConcept property to group by
   * @todo This should be deprecated and moved elsewhere. One should not have
   * to obtain an instance of [[Client]] just to use utility functions like this.
   * @deprecated
   * @category Utility
   */


  byCode(observations, property) {
    return util_1.byCode(observations, property);
  }
  /**
   * First groups the observations by code using `byCode`. Then returns a function
   * that accepts codes as arguments and will return a flat array of observations
   * having that codes. Example:
   * ```js
   * const filter = client.byCodes(observations, "category");
   * filter("laboratory") // => [ observation1, observation2 ]
   * filter("vital-signs") // => [ observation3 ]
   * filter("laboratory", "vital-signs") // => [ observation1, observation2, observation3 ]
   * ```
   * @param observations Array of observations
   * @param property The name of a CodeableConcept property to group by
   * @todo This should be deprecated and moved elsewhere. One should not have
   * to obtain an instance of [[Client]] just to use utility functions like this.
   * @deprecated
   * @category Utility
   */


  byCodes(observations, property) {
    return util_1.byCodes(observations, property);
  }
  /**
   * Walks through an object (or array) and returns the value found at the
   * provided path. This function is very simple so it intentionally does not
   * support any argument polymorphism, meaning that the path can only be a
   * dot-separated string. If the path is invalid returns undefined.
   * @param obj The object (or Array) to walk through
   * @param path The path (eg. "a.b.4.c")
   * @returns {*} Whatever is found in the path or undefined
   * @todo This should be deprecated and moved elsewhere. One should not have
   * to obtain an instance of [[Client]] just to use utility functions like this.
   * @deprecated
   * @category Utility
   */


  getPath(obj, path = "") {
    return _1.getPath(obj, path);
  }
  /**
   * Returns a copy of the client state. Accepts a dot-separated path argument
   * (same as for `getPath`) to allow for selecting specific properties.
   * Examples:
   * ```js
   * client.getState(); // -> the entire state object
   * client.getState("serverUrl"); // -> the URL we are connected to
   * client.getState("tokenResponse.patient"); // -> The selected patient ID (if any)
   * ```
   * @param path The path (eg. "a.b.4.c")
   * @returns {*} Whatever is found in the path or undefined
   */


  getState(path = "") {
    return _1.getPath({ ...this.state
    }, path);
  }
  /**
   * Returns a promise that will be resolved with the fhir version as defined
   * in the CapabilityStatement.
   */


  getFhirVersion() {
    return _1.fetchConformanceStatement(this.state.serverUrl).then(metadata => metadata.fhirVersion);
  }
  /**
   * Returns a promise that will be resolved with the numeric fhir version
   * - 2 for DSTU2
   * - 3 for STU3
   * - 4 for R4
   * - 0 if the version is not known
   */


  getFhirRelease() {
    return this.getFhirVersion().then(v => settings_1.fhirVersions[v] || 0);
  }

}

exports.Client = Client;

/***/ }),

/***/ "./src/lib/HttpError.ts":
/*!******************************!*\
  !*** ./src/lib/HttpError.ts ***!
  \******************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

class HttpError extends Error {
  constructor(response) {
    super(`${response.status} ${response.statusText}\nURL: ${response.url}`);
    this.name = "HttpError";
    this.response = response;
    this.statusCode = response.status;
    this.status = response.status;
    this.statusText = response.statusText;
  }

  async parse() {
    if (!this.response.bodyUsed) {
      try {
        const type = this.response.headers.get("Content-Type") || "text/plain";

        if (type.match(/\bjson\b/i)) {
          this.body = await this.response.json();

          if (this.body.error) {
            this.message += "\n" + this.body.error;

            if (this.body.error_description) {
              this.message += ": " + this.body.error_description;
            }
          } else {
            this.message += "\n\n" + JSON.stringify(this.body, null, 4);
          }
        } else if (type.match(/^text\//i)) {
          this.body = await this.response.text();

          if (this.body) {
            this.message += "\n\n" + this.body;
          }
        }
      } catch {// ignore
      }
    }

    return this;
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      status: this.status,
      statusText: this.statusText,
      message: this.message
    };
  }

}

exports.default = HttpError;

/***/ }),

/***/ "./src/lib/adapters/BrowserAdapter.ts":
/*!********************************************!*\
  !*** ./src/lib/adapters/BrowserAdapter.ts ***!
  \********************************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const BrowserStorage_1 = __webpack_require__(/*! ../storage/BrowserStorage */ "./src/lib/storage/BrowserStorage.ts");
/**
 * Browser Adapter
 */


class BrowserAdapter {
  /**
   * @param options Environment-specific options
   */
  constructor(options = {}) {
    /**
     * Stores the URL instance associated with this adapter
     */
    this._url = null;
    /**
     * Holds the Storage instance associated with this instance
     */

    this._storage = null;
    this.options = {
      // Replaces the browser's current URL
      // using window.history.replaceState API or by reloading.
      replaceBrowserHistory: true,
      // Do we want to send cookies while making a request to the token
      // endpoint in order to obtain new access token using existing
      // refresh token. In rare cases the auth server might require the
      // client to send cookies along with those requests. In this case
      // developers will have to change this before initializing the app
      // like so:
      // `FHIR.oauth2.settings.refreshTokenWithCredentials = "include";`
      // or
      // `FHIR.oauth2.settings.refreshTokenWithCredentials = "same-origin";`
      // Can be one of:
      // "include"     - always send cookies
      // "same-origin" - only send cookies if we are on the same domain (default)
      // "omit"        - do not send cookies
      refreshTokenWithCredentials: "same-origin",
      ...options
    };
  }
  /**
   * Given a relative path, returns an absolute url using the instance base URL
   */


  relative(path) {
    return new URL(path, this.getUrl().href).href;
  }
  /**
   * In browsers we need to be able to (dynamically) check if fhir.js is
   * included in the page. If it is, it should have created a "fhir" variable
   * in the global scope.
   */


  get fhir() {
    // @ts-ignore
    return typeof fhir === "function" ? fhir : null;
  }
  /**
   * Given the current environment, this method must return the current url
   * as URL instance
   */


  getUrl() {
    if (!this._url) {
      this._url = new URL(location + "");
    }

    return this._url;
  }
  /**
   * Given the current environment, this method must redirect to the given
   * path
   */


  redirect(to) {
    location.href = to;
  }
  /**
   * Returns a BrowserStorage object which is just a wrapper around
   * sessionStorage
   */


  getStorage() {
    if (!this._storage) {
      this._storage = new BrowserStorage_1.default();
    }

    return this._storage;
  }
  /**
   * Returns a reference to the AbortController constructor. In browsers,
   * AbortController will always be available as global (native or polyfilled)
   */


  getAbortController() {
    return AbortController;
  }

}

exports.default = BrowserAdapter;

/***/ }),

/***/ "./src/lib/index.ts":
/*!**************************!*\
  !*** ./src/lib/index.ts ***!
  \**************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/*
 * This file contains some shared functions. They are used by other modules, but
 * are defined here so that tests can import this library and test them.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = exports.getTargetWindow = exports.getPatientParam = exports.getAccessTokenExpiration = exports.jwtDecode = exports.btoa = exports.atob = exports.isBrowser = exports.randomString = exports.absolute = exports.setPath = exports.getPath = exports.fetchConformanceStatement = exports.getAndCache = exports.request = exports.responseToJSON = exports.checkResponse = exports.units = exports.debug = void 0;

const HttpError_1 = __webpack_require__(/*! ./HttpError */ "./src/lib/HttpError.ts");

const settings_1 = __webpack_require__(/*! ./settings */ "./src/lib/settings.ts");

const debug = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js"); // $lab:coverage:off$
// @ts-ignore


const {
  fetch
} =  true ? window : undefined; // $lab:coverage:on$

const _debug = debug("FHIR");

exports.debug = _debug;
/**
 * The cache for the `getAndCache` function
 */

const cache = {};
/**
 * A namespace with functions for converting between different measurement units
 */

exports.units = {
  cm({
    code,
    value
  }) {
    ensureNumerical({
      code,
      value
    });
    if (code == "cm") return value;
    if (code == "m") return value * 100;
    if (code == "in") return value * 2.54;
    if (code == "[in_us]") return value * 2.54;
    if (code == "[in_i]") return value * 2.54;
    if (code == "ft") return value * 30.48;
    if (code == "[ft_us]") return value * 30.48;
    throw new Error("Unrecognized length unit: " + code);
  },

  kg({
    code,
    value
  }) {
    ensureNumerical({
      code,
      value
    });
    if (code == "kg") return value;
    if (code == "g") return value / 1000;
    if (code.match(/lb/)) return value / 2.20462;
    if (code.match(/oz/)) return value / 35.274;
    throw new Error("Unrecognized weight unit: " + code);
  },

  any(pq) {
    ensureNumerical(pq);
    return pq.value;
  }

};
/**
 * Assertion function to guard arguments for `units` functions
 */

function ensureNumerical({
  value,
  code
}) {
  if (typeof value !== "number") {
    throw new Error("Found a non-numerical unit: " + value + " " + code);
  }
}
/**
 * Used in fetch Promise chains to reject if the "ok" property is not true
 */


async function checkResponse(resp) {
  if (!resp.ok) {
    const error = new HttpError_1.default(resp);
    await error.parse();
    throw error;
  }

  return resp;
}

exports.checkResponse = checkResponse;
/**
 * Used in fetch Promise chains to return the JSON version of the response.
 * Note that `resp.json()` will throw on empty body so we use resp.text()
 * instead.
 */

function responseToJSON(resp) {
  return resp.text().then(text => text.length ? JSON.parse(text) : "");
}

exports.responseToJSON = responseToJSON;
/**
 * This is our built-in request function. It does a few things by default
 * (unless told otherwise):
 * - Makes CORS requests
 * - Sets accept header to "application/json"
 * - Handles errors
 * - If the response is json return the json object
 * - If the response is text return the result text
 * - Otherwise return the response object on which we call stuff like `.blob()`
 */

function request(url, requestOptions = {}) {
  const {
    includeResponse,
    ...options
  } = requestOptions;
  return fetch(url, {
    mode: "cors",
    ...options,
    headers: {
      accept: "application/json",
      ...options.headers
    }
  }).then(checkResponse).then(res => {
    const type = res.headers.get("Content-Type") + "";

    if (type.match(/\bjson\b/i)) {
      return responseToJSON(res).then(body => ({
        res,
        body
      }));
    }

    if (type.match(/^text\//i)) {
      return res.text().then(body => ({
        res,
        body
      }));
    }

    return {
      res
    };
  }).then(({
    res,
    body
  }) => {
    // Some servers will reply after CREATE with json content type but with
    // empty body. In this case check if a location header is received and
    // fetch that to use it as the final result.
    if (!body && res.status == 201) {
      const location = res.headers.get("location");

      if (location) {
        return request(location, { ...options,
          method: "GET",
          body: null,
          includeResponse
        });
      }
    }

    if (includeResponse) {
      return {
        body,
        response: res
      };
    } // For any non-text and non-json response return the Response object.
    // This to let users decide if they want to call text(), blob() or
    // something else on it


    if (body === undefined) {
      return res;
    } // Otherwise just return the parsed body (can also be "" or null)


    return body;
  });
}

exports.request = request;
/**
 * Makes a request using `fetch` and stores the result in internal memory cache.
 * The cache is cleared when the page is unloaded.
 * @param url The URL to request
 * @param requestOptions Request options
 * @param force If true, reload from source and update the cache, even if it has
 * already been cached.
 */

function getAndCache(url, requestOptions, force = "development" === "test") {
  if (force || !cache[url]) {
    cache[url] = request(url, requestOptions);
    return cache[url];
  }

  return Promise.resolve(cache[url]);
}

exports.getAndCache = getAndCache;
/**
 * Fetches the conformance statement from the given base URL.
 * Note that the result is cached in memory (until the page is reloaded in the
 * browser) because it might have to be re-used by the client
 * @param baseUrl The base URL of the FHIR server
 * @param [requestOptions] Any options passed to the fetch call
 */

function fetchConformanceStatement(baseUrl = "/", requestOptions) {
  const url = String(baseUrl).replace(/\/*$/, "/") + "metadata";
  return getAndCache(url, requestOptions).catch(ex => {
    throw new Error(`Failed to fetch the conformance statement from "${url}". ${ex}`);
  });
}

exports.fetchConformanceStatement = fetchConformanceStatement;
/**
 * Walks through an object (or array) and returns the value found at the
 * provided path. This function is very simple so it intentionally does not
 * support any argument polymorphism, meaning that the path can only be a
 * dot-separated string. If the path is invalid returns undefined.
 * @param obj The object (or Array) to walk through
 * @param path The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */

function getPath(obj, path = "") {
  path = path.trim();

  if (!path) {
    return obj;
  }

  let segments = path.split(".");
  let result = obj;

  while (result && segments.length) {
    const key = segments.shift();

    if (!key && Array.isArray(result)) {
      return result.map(o => getPath(o, segments.join(".")));
    } else {
      result = result[key];
    }
  }

  return result;
}

exports.getPath = getPath;
/**
 * Like getPath, but if the node is found, its value is set to @value
 * @param obj The object (or Array) to walk through
 * @param path The path (eg. "a.b.4.c")
 * @param value The value to set
 * @param createEmpty If true, create missing intermediate objects or arrays
 * @returns The modified object
 */

function setPath(obj, path, value, createEmpty = false) {
  path.trim().split(".").reduce((out, key, idx, arr) => {
    if (out && idx === arr.length - 1) {
      out[key] = value;
    } else {
      if (out && out[key] === undefined && createEmpty) {
        out[key] = arr[idx + 1].match(/^[0-9]+$/) ? [] : {};
      }

      return out ? out[key] : undefined;
    }
  }, obj);
  return obj;
}

exports.setPath = setPath;
/**
 * Given a path, converts it to absolute url based on the `baseUrl`. If baseUrl
 * is not provided, the result would be a rooted path (one that starts with `/`).
 * @param path The path to convert
 * @param baseUrl The base URL
 */

function absolute(path, baseUrl) {
  if (path.match(/^http/)) return path;
  if (path.match(/^urn/)) return path;
  return String(baseUrl || "").replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

exports.absolute = absolute;
/**
 * Generates random strings. By default this returns random 8 characters long
 * alphanumeric strings.
 * @param strLength The length of the output string. Defaults to 8.
 * @param charSet A string containing all the possible characters.
 *     Defaults to all the upper and lower-case letters plus digits.
 * @category Utility
 */

function randomString(strLength = 8, charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
  const result = [];
  const len = charSet.length;

  while (strLength--) {
    result.push(charSet.charAt(Math.floor(Math.random() * len)));
  }

  return result.join("");
}

exports.randomString = randomString;

function isBrowser() {
  return typeof window === "object";
}

exports.isBrowser = isBrowser;
/**
 * Base64 to ASCII
 */

function atob(str) {
  return isBrowser() ? // Browsers have global atob method
  window.atob(str) : // "global." helps Webpack understand that it doesn't have to
  // include the Buffer code in the bundle
  global.Buffer.from(str, "base64").toString("ascii");
}

exports.atob = atob;
/**
 * ASCII to Base64
 */

function btoa(str) {
  return isBrowser() ? // Browsers have global btoa method
  window.btoa(str) : // "global." helps Webpack understand that it doesn't have to
  // include the Buffer code in the bundle
  global.Buffer.from(str).toString("base64");
}

exports.btoa = btoa;
/**
 * Decodes a JWT token and returns it's body.
 * @param token The token to read
 * @param env An `Adapter` or any other object that has an `atob` method
 * @category Utility
 */

function jwtDecode(token) {
  const payload = token.split(".")[1];
  return payload ? JSON.parse(atob(payload)) : null;
}

exports.jwtDecode = jwtDecode;
/**
 * Given a token response, computes and returns the expiresAt timestamp.
 * Note that this should only be used immediately after an access token is
 * received, otherwise the computed timestamp will be incorrect.
 * @param tokenResponse
 * @param env
 */

function getAccessTokenExpiration(tokenResponse) {
  const now = Math.floor(Date.now() / 1000); // Option 1 - using the expires_in property of the token response

  if (tokenResponse.expires_in) {
    return now + tokenResponse.expires_in;
  } // Option 2 - using the exp property of JWT tokens (must not assume JWT!)


  if (tokenResponse.access_token) {
    let tokenBody = jwtDecode(tokenResponse.access_token);

    if (tokenBody && tokenBody.exp) {
      return tokenBody.exp;
    }
  } // Option 3 - if none of the above worked set this to 5 minutes after now


  return now + 300;
}

exports.getAccessTokenExpiration = getAccessTokenExpiration;
/**
 * Given a conformance statement and a resource type, returns the name of the
 * URL parameter that can be used to scope the resource type by patient ID.
 */

function getPatientParam(conformance, resourceType) {
  // Find what resources are supported by this server
  const resources = getPath(conformance, "rest.0.resource") || []; // Check if this resource is supported

  const meta = resources.find(r => r.type === resourceType);

  if (!meta) {
    throw new Error(`Resource "${resourceType}" is not supported by this FHIR server`);
  } // Check if any search parameters are available for this resource


  if (!Array.isArray(meta.searchParam)) {
    throw new Error(`No search parameters supported for "${resourceType}" on this FHIR server`);
  } // This is a rare case but could happen in generic workflows


  if (resourceType == "Patient" && meta.searchParam.find(x => x.name == "_id")) {
    return "_id";
  } // Now find the first possible parameter name


  const out = settings_1.patientParams.find(p => meta.searchParam.find(x => x.name == p)); // If there is no match

  if (!out) {
    throw new Error("I don't know what param to use for " + resourceType);
  }

  return out;
}

exports.getPatientParam = getPatientParam;
/**
 * Resolves a reference to target window. It may also open new window or tab if
 * the `target = "popup"` or `target = "_blank"`.
 * @param target
 * @param width Only used when `target = "popup"`
 * @param height Only used when `target = "popup"`
 */

async function getTargetWindow(target, width = 800, height = 720) {
  // The target can be a function that returns the target. This can be
  // used to open a layer pop-up with an iframe and then return a reference
  // to that iframe (or its name)
  if (typeof target == "function") {
    target = await target();
  } // The target can be a window reference


  if (target && typeof target == "object") {
    return target;
  } // At this point target must be a string


  if (typeof target != "string") {
    _debug("Invalid target type '%s'. Failing back to '_self'.", typeof target);

    return self;
  } // Current window


  if (target == "_self") {
    return self;
  } // The parent frame


  if (target == "_parent") {
    return parent;
  } // The top window


  if (target == "_top") {
    return top;
  } // New tab or window


  if (target == "_blank") {
    let error,
        targetWindow = null;

    try {
      targetWindow = window.open("", "SMARTAuthPopup");

      if (!targetWindow) {
        throw new Error("Perhaps window.open was blocked");
      }
    } catch (e) {
      error = e;
    }

    if (!targetWindow) {
      _debug("Cannot open window. Failing back to '_self'. %s", error);

      return self;
    } else {
      return targetWindow;
    }
  } // Popup window


  if (target == "popup") {
    let error,
        targetWindow = null; // if (!targetWindow || targetWindow.closed) {

    try {
      targetWindow = window.open("", "SMARTAuthPopup", ["height=" + height, "width=" + width, "menubar=0", "resizable=1", "status=0", "top=" + (screen.height - height) / 2, "left=" + (screen.width - width) / 2].join(","));

      if (!targetWindow) {
        throw new Error("Perhaps the popup window was blocked");
      }
    } catch (e) {
      error = e;
    }

    if (!targetWindow) {
      _debug("Cannot open window. Failing back to '_self'. %s", error);

      return self;
    } else {
      return targetWindow;
    }
  } // Frame or window by name


  const winOrFrame = frames[target];

  if (winOrFrame) {
    return winOrFrame;
  }

  _debug("Unknown target '%s'. Failing back to '_self'.", target);

  return self;
}

exports.getTargetWindow = getTargetWindow;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

exports.assert = assert;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/lib/settings.ts":
/*!*****************************!*\
  !*** ./src/lib/settings.ts ***!
  \*****************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SMART_KEY = exports.patientParams = exports.fhirVersions = exports.patientCompartment = void 0;
/**
 * Combined list of FHIR resource types accepting patient parameter in FHIR R2-R4
 */

exports.patientCompartment = ["Account", "AdverseEvent", "AllergyIntolerance", "Appointment", "AppointmentResponse", "AuditEvent", "Basic", "BodySite", "BodyStructure", "CarePlan", "CareTeam", "ChargeItem", "Claim", "ClaimResponse", "ClinicalImpression", "Communication", "CommunicationRequest", "Composition", "Condition", "Consent", "Coverage", "CoverageEligibilityRequest", "CoverageEligibilityResponse", "DetectedIssue", "DeviceRequest", "DeviceUseRequest", "DeviceUseStatement", "DiagnosticOrder", "DiagnosticReport", "DocumentManifest", "DocumentReference", "EligibilityRequest", "Encounter", "EnrollmentRequest", "EpisodeOfCare", "ExplanationOfBenefit", "FamilyMemberHistory", "Flag", "Goal", "Group", "ImagingManifest", "ImagingObjectSelection", "ImagingStudy", "Immunization", "ImmunizationEvaluation", "ImmunizationRecommendation", "Invoice", "List", "MeasureReport", "Media", "MedicationAdministration", "MedicationDispense", "MedicationOrder", "MedicationRequest", "MedicationStatement", "MolecularSequence", "NutritionOrder", "Observation", "Order", "Patient", "Person", "Procedure", "ProcedureRequest", "Provenance", "QuestionnaireResponse", "ReferralRequest", "RelatedPerson", "RequestGroup", "ResearchSubject", "RiskAssessment", "Schedule", "ServiceRequest", "Specimen", "SupplyDelivery", "SupplyRequest", "VisionPrescription"];
/**
 * Map of FHIR releases and their abstract version as number
 */

exports.fhirVersions = {
  "0.4.0": 2,
  "0.5.0": 2,
  "1.0.0": 2,
  "1.0.1": 2,
  "1.0.2": 2,
  "1.1.0": 3,
  "1.4.0": 3,
  "1.6.0": 3,
  "1.8.0": 3,
  "3.0.0": 3,
  "3.0.1": 3,
  "3.3.0": 4,
  "3.5.0": 4,
  "4.0.0": 4,
  "4.0.1": 4
};
/**
 * Combined (FHIR R2-R4) list of search parameters that can be used to scope
 * a request by patient ID.
 */

exports.patientParams = ["patient", "subject", "requester", "member", "actor", "beneficiary"];
/**
 * The name of the sessionStorage entry that contains the current key
 */

exports.SMART_KEY = "SMART_KEY";

/***/ }),

/***/ "./src/lib/smart.ts":
/*!**************************!*\
  !*** ./src/lib/smart.ts ***!
  \**************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = exports.ready = exports.getClient = exports.buildTokenRequest = exports.completeAuth = exports.onMessage = exports.isInPopUp = exports.isInFrame = exports.authorize = exports.getSecurityExtensions = exports.fetchWellKnownJson = exports.KEY = void 0;
/* global window */

const _1 = __webpack_require__(/*! . */ "./src/lib/index.ts");

const Client_1 = __webpack_require__(/*! ./Client */ "./src/lib/Client.ts");

const settings_1 = __webpack_require__(/*! ./settings */ "./src/lib/settings.ts");

Object.defineProperty(exports, "KEY", {
  enumerable: true,
  get: function () {
    return settings_1.SMART_KEY;
  }
});

const debug = _1.debug.extend("oauth2");
/**
 * Fetches the well-known json file from the given base URL.
 * Note that the result is cached in memory (until the page is reloaded in the
 * browser) because it might have to be re-used by the client
 * @param baseUrl The base URL of the FHIR server
 */


function fetchWellKnownJson(baseUrl = "/", requestOptions) {
  const url = String(baseUrl).replace(/\/*$/, "/") + ".well-known/smart-configuration";
  return _1.getAndCache(url, requestOptions).catch(ex => {
    throw new Error(`Failed to fetch the well-known json "${url}". ${ex.message}`);
  });
}

exports.fetchWellKnownJson = fetchWellKnownJson;
/**
 * Fetch a "WellKnownJson" and extract the SMART endpoints from it
 */

function getSecurityExtensionsFromWellKnownJson(baseUrl = "/", requestOptions) {
  return fetchWellKnownJson(baseUrl, requestOptions).then(meta => {
    _1.assert(meta.authorization_endpoint && meta.token_endpoint, "Invalid wellKnownJson");

    return {
      registrationUri: meta.registration_endpoint || "",
      authorizeUri: meta.authorization_endpoint,
      tokenUri: meta.token_endpoint
    };
  });
}
/**
 * Fetch a `CapabilityStatement` and extract the SMART endpoints from it
 */


function getSecurityExtensionsFromConformanceStatement(baseUrl = "/", requestOptions) {
  return _1.fetchConformanceStatement(baseUrl, requestOptions).then(meta => {
    const nsUri = "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris";
    const extensions = (_1.getPath(meta || {}, "rest.0.security.extension") || []).filter(e => e.url === nsUri).map(o => o.extension)[0];
    const out = {
      registrationUri: "",
      authorizeUri: "",
      tokenUri: ""
    };

    if (extensions) {
      extensions.forEach(ext => {
        if (ext.url === "register") {
          out.registrationUri = ext.valueUri;
        }

        if (ext.url === "authorize") {
          out.authorizeUri = ext.valueUri;
        }

        if (ext.url === "token") {
          out.tokenUri = ext.valueUri;
        }
      });
    }

    return out;
  });
}
/**
 * This works similarly to `Promise.any()`. The tasks are objects containing a
 * request promise and it's AbortController. Returns a promise that will be
 * resolved with the return value of the first successful request, or rejected
 * with an aggregate error if all tasks fail. Any requests, other than the first
 * one that succeeds will be aborted.
 */


function any(tasks) {
  const len = tasks.length;
  const errors = [];
  let resolved = false;
  return new Promise((resolve, reject) => {
    function onSuccess(task, result) {
      task.complete = true;

      if (!resolved) {
        resolved = true;
        tasks.forEach(t => {
          if (!t.complete) {
            t.controller.abort();
          }
        });
        resolve(result);
      }
    }

    function onError(error) {
      if (errors.push(error) === len) {
        reject(new Error(errors.map(e => e.message).join("; ")));
      }
    }

    tasks.forEach(t => {
      t.promise.then(result => onSuccess(t, result), onError);
    });
  });
}
/**
 * Given a FHIR server, returns an object with it's Oauth security endpoints
 * that we are interested in. This will try to find the info in both the
 * `CapabilityStatement` and the `.well-known/smart-configuration`. Whatever
 * Arrives first will be used and the other request will be aborted.
 * @param [baseUrl] Fhir server base URL
 * @param [env] The Adapter
 */


function getSecurityExtensions(env, baseUrl = "/") {
  const AbortController = env.getAbortController();
  const abortController1 = new AbortController();
  const abortController2 = new AbortController();
  return any([{
    controller: abortController1,
    promise: getSecurityExtensionsFromWellKnownJson(baseUrl, {
      signal: abortController1.signal
    })
  }, {
    controller: abortController2,
    promise: getSecurityExtensionsFromConformanceStatement(baseUrl, {
      signal: abortController2.signal
    })
  }]);
}

exports.getSecurityExtensions = getSecurityExtensions;
/**
 * Starts the SMART Launch Sequence.
 * > **IMPORTANT**:
 *   `authorize()` will end up redirecting you to the authorization server.
 *    This means that you should not add anything to the returned promise chain.
 *    Any code written directly after the authorize() call might not be executed
 *    due to that redirect!
 * @param env
 * @param [params]
 */

async function authorize(env, params = {}) {
  const url = env.getUrl(); // Multiple config for EHR launches ---------------------------------------

  if (Array.isArray(params)) {
    const urlISS = url.searchParams.get("iss") || url.searchParams.get("fhirServiceUrl");

    _1.assert(urlISS, 'Passing in an "iss" url parameter is required if authorize uses multiple configurations'); // pick the right config


    const cfg = params.find(x => {
      if (x.issMatch) {
        if (typeof x.issMatch === "function") {
          return !!x.issMatch(urlISS);
        }

        if (typeof x.issMatch === "string") {
          return x.issMatch === urlISS;
        }

        if (x.issMatch instanceof RegExp) {
          return x.issMatch.test(urlISS);
        }
      }

      return false;
    });

    _1.assert(cfg, `No configuration found matching the current "iss" parameter "${urlISS}"`);

    return await authorize(env, cfg);
  } // ------------------------------------------------------------------------
  // Obtain input


  const {
    clientSecret,
    fakeTokenResponse,
    patientId,
    encounterId,
    noRedirect,
    target,
    width,
    height,
    multiple
  } = params;
  let {
    iss,
    launch,
    fhirServiceUrl,
    redirectUri,
    scope = "",
    clientId,
    completeInTarget
  } = params;
  const storage = env.getStorage(); // For these three an url param takes precedence over inline option

  iss = url.searchParams.get("iss") || iss;
  fhirServiceUrl = url.searchParams.get("fhirServiceUrl") || fhirServiceUrl;
  launch = url.searchParams.get("launch") || launch;

  if (!redirectUri) {
    redirectUri = env.relative(".");
  } else if (!redirectUri.match(/^https?\:\/\//)) {
    redirectUri = env.relative(redirectUri);
  }

  const serverUrl = String(iss || fhirServiceUrl || ""); // Validate input

  _1.assert(serverUrl, 'No server url found. It must be specified as "iss" or as "fhirServiceUrl" parameter');

  if (iss) {
    debug("Making %s launch...", launch ? "EHR" : "standalone");
  } // append launch scope if needed


  if (launch && !scope.match(/launch/)) {
    scope = scope ? scope + " launch" : "launch";
  }

  if (_1.isBrowser()) {
    const inFrame = isInFrame();
    const inPopUp = isInPopUp();

    if ((inFrame || inPopUp) && completeInTarget !== true && completeInTarget !== false) {
      // completeInTarget will default to true if authorize is called from
      // within an iframe. This is to avoid issues when the entire app
      // happens to be rendered in an iframe (including in some EHRs),
      // even though that was not how the app developer's intention.
      completeInTarget = inFrame; // In this case we can't always make the best decision so ask devs
      // to be explicit in their configuration.

      console.warn('Your app is being authorized from within an iframe or popup ' + 'window. Please be explicit and provide a "completeInTarget" ' + 'option. Use "true" to complete the authorization in the ' + 'same window, or "false" to try to complete it in the parent ' + 'or the opener window. See http://docs.smarthealthit.org/client-js/api.html');
    }
  } // If `authorize` is called, make sure we clear any previous state (in case
  // this is a re-authorize)
  // const oldKey = await storage.get(SMART_KEY);
  // await storage.unset(oldKey);
  // create initial state


  const stateKey = _1.randomString(16);

  const state = {
    clientId,
    scope,
    redirectUri,
    serverUrl,
    clientSecret,
    tokenResponse: {},
    // key: stateKey,
    multiple,
    completeInTarget
  };

  if (!multiple) {
    await storage.set(settings_1.SMART_KEY, stateKey);
  } // fakeTokenResponse to override stuff (useful in development)


  if (fakeTokenResponse) {
    Object.assign(state.tokenResponse, fakeTokenResponse);
  } // Fixed patientId (useful in development)


  if (patientId) {
    Object.assign(state.tokenResponse, {
      patient: patientId
    });
  } // Fixed encounterId (useful in development)


  if (encounterId) {
    Object.assign(state.tokenResponse, {
      encounter: encounterId
    });
  }

  let redirectUrl = redirectUri + "?state=" + encodeURIComponent(stateKey); // bypass oauth if fhirServiceUrl is used (but iss takes precedence)

  if (fhirServiceUrl && !iss) {
    console.log("Making fake launch...");
    await storage.set(stateKey, state);

    if (noRedirect) {
      return redirectUrl;
    }

    return await env.redirect(redirectUrl);
  } // Get oauth endpoints and add them to the state


  const extensions = await getSecurityExtensions(env, serverUrl);
  Object.assign(state, extensions);
  await storage.set(stateKey, state); // If this happens to be an open server and there is no authorizeUri

  if (!state.authorizeUri) {
    if (noRedirect) {
      return redirectUrl;
    }

    return await env.redirect(redirectUrl);
  } // build the redirect uri


  const redirectParams = ["response_type=code", "client_id=" + encodeURIComponent(clientId || ""), "scope=" + encodeURIComponent(scope), "redirect_uri=" + encodeURIComponent(redirectUri), "aud=" + encodeURIComponent(serverUrl), "state=" + encodeURIComponent(stateKey)]; // also pass this in case of EHR launch

  if (launch) {
    redirectParams.push("launch=" + encodeURIComponent(launch));
  }

  redirectUrl = state.authorizeUri + "?" + redirectParams.join("&");

  if (noRedirect) {
    return redirectUrl;
  }

  if (target && _1.isBrowser()) {
    let win;
    win = await _1.getTargetWindow(target, width, height);

    if (win !== self) {
      try {
        // Also remove any old state from the target window and then
        // transfer the current state there
        // win.sessionStorage.removeItem(oldKey);
        win.sessionStorage.setItem(stateKey, JSON.stringify(state));
      } catch (ex) {
        _1.debug(`Failed to modify window.sessionStorage. Perhaps it is from different origin?. Failing back to "_self". %s`, ex);

        win = self;
      }
    }

    if (win !== self) {
      try {
        win.location.href = redirectUrl;
        self.addEventListener("message", onMessage);
      } catch (ex) {
        _1.debug(`Failed to modify window.location. Perhaps it is from different origin?. Failing back to "_self". %s`, ex);

        self.location.href = redirectUrl;
      }
    } else {
      self.location.href = redirectUrl;
    }

    return;
  } else {
    return await env.redirect(redirectUrl);
  }
}

exports.authorize = authorize;
/**
 * Checks if called within a frame. Only works in browsers!
 * If the current window has a `parent` or `top` properties that refer to
 * another window, returns true. If trying to access `top` or `parent` throws an
 * error, returns true. Otherwise returns `false`.
 */

function isInFrame() {
  try {
    return self !== top && parent !== self;
  } catch (e) {
    return true;
  }
}

exports.isInFrame = isInFrame;
/**
 * Checks if called within another window (popup or tab). Only works in browsers!
 * To consider itself called in a new window, this function verifies that:
 * 1. `self === top` (not in frame)
 * 2. `!!opener && opener !== self` The window has an opener
 * 3. `!!window.name` The window has a `name` set
 */

function isInPopUp() {
  try {
    return self === top && !!opener && opener !== self && !!window.name;
  } catch (e) {
    return false;
  }
}

exports.isInPopUp = isInPopUp;
/**
 * Another window can send a "completeAuth" message to this one, making it to
 * navigate to e.data.url
 * @param e The message event
 */

function onMessage(e) {
  if (e.data.type == "completeAuth" && e.origin === new URL(self.location.href).origin) {
    window.removeEventListener("message", onMessage);
    window.location.href = e.data.url;
  }
}

exports.onMessage = onMessage;

async function cleanUpUrl(adapter) {
  const url = adapter.getUrl();
  const storage = adapter.getStorage();
  const params = url.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const from = url.href; // `code` is the flag that tells us to request an access token. We have to
  // remove it, otherwise the page will authorize on every load!

  if (code) {
    params.delete("code");
    debug("Removed code parameter from the url.");
  } // Unless we are in "multiple" mode, we no longer need the `state` key. It
  // will be stored to a well known location at `sessionStorage[SMART_KEY]`.


  if (state) {
    const stored = await storage.get(state);

    if (!stored.multiple) {
      await storage.set(settings_1.SMART_KEY, state);
      params.delete("state");
      debug("Removed state parameter from the url.");
    }
  } // If the browser does not support the replaceState method for the History
  // Web API, the "code" parameter cannot be removed. As a consequence, the
  // page will (re)authorize on every load. The workaround is to reload the
  // page to new location without those parameters (as we do for servers).


  if (_1.isBrowser() && window.history.replaceState) {
    window.history.replaceState({}, "", url.href);
  } else {
    // console.log("redirect from", from, "to", url.href)
    return adapter.redirect(url.href);
  }
}

async function getAccessToken(adapter, code, state) {
  _1.assert(code, "'code' parameter is required");

  _1.assert(state, "'state' parameter is required");

  const storage = adapter.getStorage();
  let stored = await storage.get(state);
  debug("Preparing to exchange the code for access token...");
  const requestOptions = buildTokenRequest(code, stored);
  debug("Token request options: %O", requestOptions);

  _1.assert(stored.tokenUri, "No tokenUri found for this server"); // @ts-ignore The EHR authorization server SHALL return a JSON
  // structure that includes an access token or a message indicating
  // that the authorization request has been denied.


  const tokenResponse = await _1.request(stored.tokenUri, requestOptions);
  debug("Token response: %O", tokenResponse);

  _1.assert(tokenResponse.access_token, "Failed to obtain access token.");

  return tokenResponse;
}
/**
 * The completeAuth function should only be called on the page that represents
 * the redirectUri. We typically land there after a redirect from the
 * authorization server..
 */


async function completeAuth(env) {
  var _a, _b;

  const url = env.getUrl();
  const Storage = env.getStorage();
  const params = url.searchParams;
  const code = params.get("code");
  const authError = params.get("error");
  const authErrorDescription = params.get("error_description");
  const key = params.get("state"); // Start by checking the url for `error` and `error_description` parameters.
  // This happens when the auth server rejects our authorization attempt. In
  // this case it has no other way to tell us what the error was, other than
  // appending these parameters to the redirect url.
  // From client's point of view, this is not very reliable (because we can't
  // know how we have landed on this page - was it a redirect or was it loaded
  // manually). However, if `completeAuth()` is being called, we can assume
  // that the url comes from the auth server (otherwise the app won't work
  // anyway).

  _1.assert(!(authError || authErrorDescription), [authError, authErrorDescription].filter(Boolean).join(": "));

  debug("key: %s, code: %s", key, code); // key is coming from the page url so it might be empty or missing

  _1.assert(key, "No 'state' parameter found. Please launch this as SMART app."); // Check if we have a previous state


  let state = await Storage.get(key); // console.log(state)
  // If we are in a popup window or an iframe and the authorization is
  // complete, send the location back to our opener and exit.

  if (_1.isBrowser() && state && !state.completeInTarget) {
    const inFrame = isInFrame();
    const inPopUp = isInPopUp(); // we are about to return to the opener/parent where completeAuth will
    // be called again. In rare cases the opener or parent might also be
    // a frame or popup. Then inFrame or inPopUp will be true but we still
    // have to stop going up the chain. To guard against that weird form of
    // recursion we pass one additional parameter to the url which we later
    // remove.

    if ((inFrame || inPopUp) && !url.searchParams.get("complete")) {
      url.searchParams.set("complete", "1");
      const {
        href,
        origin
      } = url;

      if (inFrame) {
        parent.postMessage({
          type: "completeAuth",
          url: href
        }, origin);
      }

      if (inPopUp) {
        opener.postMessage({
          type: "completeAuth",
          url: href
        }, origin);
        window.close();
      }

      return new Promise(() => {});
    }
  }

  url.searchParams.delete("complete"); // If the state does not exist, it means the page has been loaded directly.

  _1.assert(state, "No state found! Please (re)launch the app."); // Assume the client has already completed a token exchange when
  // there is no code (but we have a state) or access token is found in state


  const authorized = !code || ((_a = state.tokenResponse) === null || _a === void 0 ? void 0 : _a.access_token); // If we are authorized already, then this is just a reload.
  // Otherwise, we have to complete the code flow

  if (!authorized && state.tokenUri) {
    _1.assert(code, "'code' url parameter is required");

    const tokenResponse = await getAccessToken(env, code, key); // Now we need to determine when is this authorization going to expire

    state.expiresAt = _1.getAccessTokenExpiration(tokenResponse); // save the tokenResponse so that we don't have to re-authorize on
    // every page reload

    state = { ...state,
      tokenResponse
    };
    await Storage.set(key, state);
    debug("Authorization successful!");
  } else {
    debug(((_b = state.tokenResponse) === null || _b === void 0 ? void 0 : _b.access_token) ? "Already authorized" : "No authorization needed");
  }

  await cleanUpUrl(env);
  return getClient(env, key);
}

exports.completeAuth = completeAuth;
/**
 * Builds the token request options. Does not make the request, just
 * creates it's configuration and returns it in a Promise.
 */

function buildTokenRequest(code, state) {
  const {
    redirectUri,
    clientSecret,
    tokenUri,
    clientId
  } = state;

  _1.assert(redirectUri, "Missing state.redirectUri");

  _1.assert(tokenUri, "Missing state.tokenUri");

  _1.assert(clientId, "Missing state.clientId");

  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: `code=${code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}`
  }; // For public apps, authentication is not possible (and thus not required),
  // since a client with no secret cannot prove its identity when it issues a
  // call. (The end-to-end system can still be secure because the client comes
  // from a known, https protected endpoint specified and enforced by the
  // redirect uri.) For confidential apps, an Authorization header using HTTP
  // Basic authentication is required, where the username is the app’s
  // client_id and the password is the app’s client_secret (see example).

  if (clientSecret) {
    requestOptions.headers.authorization = "Basic " + _1.btoa(clientId + ":" + clientSecret);
    debug("Using state.clientSecret to construct the authorization header: %s", requestOptions.headers.Authorization);
  } else {
    debug("No clientSecret found in state. Adding the clientId to the POST body");
    requestOptions.body += `&client_id=${encodeURIComponent(clientId)}`;
  }

  return requestOptions;
}

exports.buildTokenRequest = buildTokenRequest;

async function getClient(adapter, key) {
  const storage = adapter.getStorage();
  const stored = await storage.get(key);

  _1.assert(stored, "No state found in storage. Please (re)launch the SMART app");

  return new Client_1.Client(stored, {
    save: state => storage.set(key, state)
  });
}

exports.getClient = getClient;

async function ready(env, onSuccess, onError) {
  let task;
  const url = env.getUrl();
  const params = url.searchParams;
  const code = params.get("code");
  const state = params.get("state"); // Coming back from the auth server. Must complete the auth flow

  if (code) {
    task = completeAuth(env);
  } // Revive an app in multiple mode
  else if (state) {
      task = getClient(env, state);
    } // Revive singular app
    else {
        const key = await env.getStorage().get(settings_1.SMART_KEY);

        if (!key) {// console.log(env.getStorage())
        }

        task = getClient(env, key);
      }

  if (onSuccess) {
    task = task.then(onSuccess);
  }

  if (onError) {
    task = task.catch(onError);
  }

  return task;
}

exports.ready = ready;
/**
 * This function can be used when you want to handle everything in one page
 * (no launch endpoint needed). You can think of it as if it does:
 * ```js
 * authorize(options).then(ready)
 * ```
 *
 * **Be careful with init()!** There are some details you need to be aware of:
 *
 * 1. It will only work if your launch_uri is the same as your redirect_uri.
 *    While this should be valid, we can’t promise that every EHR will allow you
 *    to register client with such settings.
 * 2. Internally, `init()` will be called twice. First it will redirect to the
 *    EHR, then the EHR will redirect back to the page where init() will be
 *    called again to complete the authorization. This is generally fine,
 *    because the returned promise will only be resolved once, after the second
 *    execution, but please also consider the following:
 *    - You should wrap all your app’s code in a function that is only executed
 *      after `init()` resolves!
 *    - Since the page will be loaded twice, you must be careful if your code
 *      has global side effects that can persist between page reloads
 *      (for example writing to localStorage).
 * 3. For standalone launch, only use init in combination with offline_access
 *    scope. Once the access_token expires, if you don’t have a refresh_token
 *    there is no way to re-authorize properly. We detect that and delete the
 *    expired access token, but it still means that the user will have to
 *    refresh the page twice to re-authorize.
 * @param env The adapter
 * @param options The authorize options
 */

async function init(env, options) {
  const url = env.getUrl();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // if `code` and `state` params are present we need to complete the auth flow

  if (code && state) {
    return completeAuth(env);
  } // Check for existing client state. If state is found, it means a client
  // instance have already been created in this session and we should try to
  // "revive" it.


  const storage = env.getStorage();
  const key = state || (await storage.get(settings_1.SMART_KEY));
  const cached = await storage.get(key);

  if (cached) {
    return new Client_1.Client(cached, {
      save: state => storage.set(key, state)
    });
  } // Otherwise try to launch


  return authorize(env, options).then(() => {
    // `init` promises a Client but that cannot happen in this case. The
    // browser will be redirected (unload the page and be redirected back
    // to it later and the same init function will be called again). On
    // success, authorize will resolve with the redirect url but we don't
    // want to return that from this promise chain because it is not a
    // Client instance. At the same time, if authorize fails, we do want to
    // pass the error to those waiting for a client instance.
    return new Promise(() => {});
  });
}

exports.init = init;

/***/ }),

/***/ "./src/lib/storage/BrowserStorage.ts":
/*!*******************************************!*\
  !*** ./src/lib/storage/BrowserStorage.ts ***!
  \*******************************************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

class Storage {
  /**
   * Gets the value at `key`. Returns a promise that will be resolved
   * with that value (or undefined for missing keys).
   */
  async get(key) {
    const value = sessionStorage[key];

    if (value) {
      return JSON.parse(value);
    }

    return undefined;
  }
  /**
   * Sets the `value` on `key` and returns a promise that will be resolved
   * with the value that was set.
   */


  async set(key, value) {
    sessionStorage[key] = JSON.stringify(value);
    return value;
  }
  /**
   * Deletes the value at `key`. Returns a promise that will be resolved
   * with true if the key was deleted or with false if it was not (eg. if
   * did not exist).
   */


  async unset(key) {
    if (key in sessionStorage) {
      delete sessionStorage[key];
      return true;
    }

    return false;
  }

  async clear() {
    return sessionStorage.clear();
  }

  async save(data) {
    for (const key of Object.keys(data)) {
      await this.set(key, data[key]);
    }

    return data;
  }

}

exports.default = Storage;

/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeArray = exports.byCodes = exports.byCode = void 0;

var lib_1 = __webpack_require__(/*! ./lib */ "./src/lib/index.ts");

Object.defineProperty(exports, "getPath", {
  enumerable: true,
  get: function () {
    return lib_1.getPath;
  }
});
Object.defineProperty(exports, "setPath", {
  enumerable: true,
  get: function () {
    return lib_1.setPath;
  }
});
/**
 * Groups the observations by code. Returns a map that will look like:
 * ```js
 * const map = client.byCodes(observations, "code");
 * // map = {
 * //     "55284-4": [ observation1, observation2 ],
 * //     "6082-2": [ observation3 ]
 * // }
 * ```
 * @param observations Array of observations
 * @param property The name of a CodeableConcept property to group by
 */

function byCode(observations, property) {
  const ret = {};

  function handleCodeableConcept(concept, observation) {
    if (concept && Array.isArray(concept.coding)) {
      concept.coding.forEach(({
        code
      }) => {
        if (code) {
          ret[code] = ret[code] || [];
          ret[code].push(observation);
        }
      });
    }
  }

  makeArray(observations).forEach(o => {
    if (o.resourceType === "Observation" && o[property]) {
      if (Array.isArray(o[property])) {
        o[property].forEach(concept => handleCodeableConcept(concept, o));
      } else {
        handleCodeableConcept(o[property], o);
      }
    }
  });
  return ret;
}

exports.byCode = byCode;
/**
 * First groups the observations by code using `byCode`. Then returns a function
 * that accepts codes as arguments and will return a flat array of observations
 * having that codes. Example:
 * ```js
 * const filter = client.byCodes(observations, "category");
 * filter("laboratory") // => [ observation1, observation2 ]
 * filter("vital-signs") // => [ observation3 ]
 * filter("laboratory", "vital-signs") // => [ observation1, observation2, observation3 ]
 * ```
 * @param observations Array of observations
 * @param property The name of a CodeableConcept property to group by
 */

function byCodes(observations, property) {
  const bank = byCode(observations, property);
  return (...codes) => codes.filter(code => code + "" in bank).reduce((prev, code) => prev.concat(bank[code + ""]), []);
}

exports.byCodes = byCodes;
/**
 * If the argument is an array returns it as is. Otherwise puts it in an array
 * (`[arg]`) and returns the result
 * @param arg The element to test and possibly convert to array
 * @category Utility
 */

function makeArray(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }

  return [arg];
}

exports.makeArray = makeArray;

/***/ })

/******/ });
//# sourceMappingURL=fhir-client.pure.js.map