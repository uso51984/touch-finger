(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["touchFinger"] = factory();
	else
		root["touchFinger"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__wrapFunc__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var getTouchesCoords = function getTouchesCoords(e) {
  return Array.prototype.slice.call(e.touches).map(function (item) {
    return {
      x: item.screenX,
      y: item.screenY
    };
  });
};

var TouchFinger = function () {
  function TouchFinger(el, option) {
    var _this = this;

    _classCallCheck(this, TouchFinger);

    this.triggerEvent = function (name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var callback = _this.option[name];
      if (typeof callback === 'function') {
        // always give user gesture object as first params first
        callback.apply(undefined, [_this.getGestureState()].concat(args));
      }
    };

    this.triggerCombineEvent = function (mainEventName, eventStatus) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      _this.triggerEvent.apply(_this, [mainEventName].concat(args));
      _this.triggerSubEvent.apply(_this, [mainEventName, eventStatus].concat(args));
    };

    this.triggerSubEvent = function (mainEventName, eventStatus) {
      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      if (eventStatus) {
        var subEventName = getEventName(mainEventName, eventStatus);
        _this.triggerEvent.apply(_this, [subEventName].concat(args));
      }
    };

    this.handleTouchStart = function (e) {
      if (!e.touches) {
        return;
      }
      _this.touchStart.dispatch(e, _this.element);
      _this.initGestureStatus(e);

      _this.startTime = Date.now();
      _this.x1 = e.touches[0].pageX;
      _this.y1 = e.touches[0].pageY;
      _this.delta = _this.startTime - (_this.lastTime || _this.startTime);
      _this.lastTime = _this.startTime;

      if (_this.preTapPosition.x !== null) {
        _this.isDoubleTap = _this.delta > 0 && _this.delta <= 250 && Math.abs(_this.preTapPosition.x - _this.x1) < 30 && Math.abs(_this.preTapPosition.y - _this.y1) < 30;
        if (_this.isDoubleTap) {
          clearTimeout(_this.singleTapTimeout);
        }
      }
      _this.preTapPosition.x = _this.x1;
      _this.preTapPosition.y = _this.y1;
      var preV = _this.preV;

      var len = e.touches.length;
      if (len > 1) {
        _this._cancelLongTap();
        _this._cancelSingleTap();
        var v = {
          x: e.touches[1].pageX - _this.x1,
          y: e.touches[1].pageY - _this.y1
        };
        preV.x = v.x;
        preV.y = v.y;

        _this.pinchStartLen = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getLen */])(preV);
        _this.multipointStart.dispatch(e, _this.element);
      }

      _this._preventTap = false;
      _this.longTapTimeout = setTimeout(function () {
        _this.longTap.dispatch(e, _this.element);
        _this._preventTap = true;
      }, 750);
    };

    this.handleTouchMove = function (e) {
      if (!e.touches) {
        return;
      }
      _this.touchMove.dispatch(e, _this.element);
      _this.updateGestureStatus(e);
      _this._cancelLongTap();
      _this.isDoubleTap = false;

      var preV = _this.preV;
      var len = e.touches.length;
      var currentX = e.touches[0].pageX;
      var currentY = e.touches[0].pageY;

      if (len > 1) {
        var sCurrentX = e.touches[1].pageX;
        var sCurrentY = e.touches[1].pageY;
        var v = {
          x: e.touches[1].pageX - currentX,
          y: e.touches[1].pageY - currentY
        };

        if (preV.x !== null) {
          if (_this.pinchStartLen > 0) {
            e.zoom = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getLen */])(v) / _this.pinchStartLen;
            _this.pinch.dispatch(e, _this.element);
          }
          e.angle = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["c" /* getRotateAngle */])(v, preV);
          _this.rotate.dispatch(e, _this.element);
        }

        preV.x = v.x;
        preV.y = v.y;

        if (_this.x2 !== null && _this.sx2 !== null) {
          e.deltaX = (currentX - _this.x2 + sCurrentX - _this.sx2) / 2;
          e.deltaY = (currentY - _this.y2 + sCurrentY - _this.sy2) / 2;
        } else {
          e.deltaX = 0;
          e.deltaY = 0;
        }
        _this.twoFingerPressMove.dispatch(e, _this.element);
        _this.sx2 = sCurrentX;
        _this.sy2 = sCurrentY;
      } else {
        if (_this.x2 !== null) {
          e.deltaX = currentX - _this.x2;
          e.deltaY = currentY - _this.y2;

          //move事件中添加对当前触摸点到初始触摸点的判断，
          //如果曾经大于过某个距离(比如10),就认为是移动到某个地方又移回来，应该不再触发tap事件才对。
          var movedX = Math.abs(_this.x1 - _this.x2);
          var movedY = Math.abs(_this.y1 - _this.y2);

          if (movedX > 10 || movedY > 10) {
            _this._preventTap = true;
          }
        } else {
          e.deltaX = 0;
          e.deltaY = 0;
        }
        _this.pressMove.dispatch(e, _this.element);
      }

      _this.x2 = currentX;
      _this.y2 = currentY;

      if (len > 1) {
        e.preventDefault();
      }
    };

    this.handleTouchEnd = function (e) {
      if (!e.changedTouches) {
        return;
      }
      _this._cancelLongTap();
      if (e.touches.length < 2) {
        _this.multipointEnd.dispatch(e, _this.element);
        _this.sx2 = _this.sy2 = null;
      }

      if (_this.x2 && Math.abs(_this.x1 - _this.x2) > 30 || _this.y2 && Math.abs(_this.y1 - _this.y2) > 30) {
        e.direction = _this._swipeDirection(_this.x1, _this.x2, _this.y1, _this.y2);
        _this.swipeTimeout = setTimeout(function () {
          _this.swipe.dispatch(e, _this.element);
        }, 0);
      } else {
        _this.tapTimeout = setTimeout(function () {
          if (!_this._preventTap) {
            _this.tap.dispatch(e, _this.element);
          }
          if (_this.isDoubleTap) {
            _this.doubleTap.dispatch(e, _this.element);
            _this.isDoubleTap = false;
          }
        }, 0);

        if (!_this.isDoubleTap) {
          _this.singleTapTimeout = setTimeout(function () {
            _this.singleTap.dispatch(e, _this.element);
          }, 250);
        }
      }
      _this.touchEnd.dispatch(e, _this.element);
      _this.preV.x = 0;
      _this.preV.y = 0;

      _this.zoom = 1;
      _this.pinchStartLen = null;
      _this.x1 = _this.x2 = _this.y1 = _this.y2 = null;
    };

    this.cancelAll = function () {
      _this._preventTap = true;
      clearTimeout(_this.singleTapTimeout);
      clearTimeout(_this.tapTimeout);
      clearTimeout(_this.longTapTimeout);
      clearTimeout(_this.swipeTimeout);
    };

    this.handleTouchCancel = function () {
      _this.cancelAll();
      _this.touchCancel.dispatch(e, _this.element);
    };

    this.setGestureState = function (params) {
      if (!_this.gestureState) {
        _this.gestureState = {};
      }

      if (_this.gestureState.touches) {
        _this.gestureState.preTouches = _this.gestureState.touches;
      }
      _this.gestureState = _extends({}, _this.gestureState, params);
    };

    this.initGestureStatus = function (e) {
      delete _this.gestureState;

      var startTouchesCoords = _this.getTouchesCoords(e);
      var startTime = Date.now();
      // const startMutliFingerStatus = calcMutliFingerStatus(startTouches);
      _this.setGestureState({
        startTime: startTime,
        startTouchesCoords: startTouchesCoords,
        // startMutliFingerStatus,
        /* copy for next time touch move cala convenient*/
        time: startTime,
        touchesCoords: startTouches,
        // mutliFingerStatus: startMutliFingerStatus,
        srcEvent: e
      });
    };

    this.on = function (evt, handler) {
      if (_this[evt]) {
        _this[evt].add(handler);
      }
    };

    this.off = function (evt, handler) {
      if (_this[evt]) {
        _this[evt].del(handler);
      }
    };

    this.element = typeof el === 'string' ? document.querySelector(el) : el;
    this.element.addEventListener('touchstart', this.handleTouchStart, false);
    this.element.addEventListener("touchmove", this.handleTouchMove, false);
    this.element.addEventListener("touchend", this.handleTouchEnd, false);
    this.element.addEventListener("touchcancel", this.handleTouchCancel, false);

    this.option = option;
    this.gestureState = {};

    this.preV = { x: null, y: null };
    this.pinchStartLen = null;
    this.zoom = 1;
    this.isDoubleTap = false;

    this.rotate = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.rotate || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.touchStart = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.touchStart || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.multipointStart = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.multipointStart || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.multipointEnd = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.multipointEnd || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.pinch = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.pinch || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.swipe = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.swipe || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.tap = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.tap || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.doubleTap = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.doubleTap || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.longTap = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.longTap || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.singleTap = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.singleTap || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.pressMove = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.pressMove || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.twoFingerPressMove = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.twoFingerPressMove || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.touchMove = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.touchMove || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.touchEnd = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.touchEnd || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);
    this.touchCancel = Object(__WEBPACK_IMPORTED_MODULE_0__wrapFunc__["a" /* default */])(this.element, option.touchCancel || __WEBPACK_IMPORTED_MODULE_1__utils__["d" /* noop */]);

    this.delta = null;
    this.lastTime = null;
    this.startTime = null;
    this.tapTimeout = null;
    this.singleTapTimeout = null;
    this.longTapTimeout = null;
    this.swipeTimeout = null;
    this.x1 = this.x2 = this.y1 = this.y2 = null;
    this.preTapPosition = { x: null, y: null };
  }

  _createClass(TouchFinger, [{
    key: 'updateGestureStatus',
    value: function updateGestureStatus(e) {
      if (!e.touches || !e.touches.length) {
        return;
      }

      var time = Date.now();

      var _gesture = this.gesture,
          startTime = _gesture.startTime,
          startTouchesCoords = _gesture.startTouchesCoords,
          pinch = _gesture.pinch,
          rotate = _gesture.rotate;

      var touchesCoords = this.getTouchesCoords(e);
      var moveStatus = calcMoveStatus(startTouchesCoords, touchesCoords, time - startTime);
      // let mutliFingerStatus;
      if (pinch || rotate) {
        mutliFingerStatus = calcMutliFingerStatus(touchesCoords);
      }

      this.setGestureState({
        /* update status snapshot */
        time: time,
        touchesCoords: touchesCoords,
        // mutliFingerStatus,
        /* update duration status */
        moveStatus: moveStatus

      });
    }
  }, {
    key: 'checkIfSingleTouchMove',
    value: function checkIfSingleTouchMove(e) {
      var touches = e.touches;

      if (touches.length > 1) {
        this.pan = false;
        return;
      }
      var _gestureState = this.gestureState,
          touchesCoords = _gestureState.touchesCoords,
          moveStatus = _gestureState.moveStatus,
          preTouchesCoords = _gestureState.preTouchesCoords;

      if (moveStatus) {
        var direction = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* getMovingDirection */])(preTouchesCoords[0], touchesCoords[0]);
        this.setGestureState({ direction: direction });
        var eventName = getDirectionEventName(direction);

        if (!pan) {
          this.triggerCombineEvent('onPan', 'start');
          this.setGestureState({
            pan: true
          });
        } else {
          this.triggerCombineEvent('onPan', eventName);
          this.triggerSubEvent('onPan', 'move');
        }
      }
    }
  }, {
    key: '_cancelLongTap',
    value: function _cancelLongTap() {
      clearTimeout(this.longTapTimeout);
    }
  }, {
    key: '_cancelSingleTap',
    value: function _cancelSingleTap() {
      clearTimeout(this.singleTapTimeout);
    }
  }, {
    key: '_swipeDirection',
    value: function _swipeDirection(x1, x2, y1, y2) {
      return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'Left' : 'Right' : y1 - y2 > 0 ? 'Up' : 'Down';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.singleTapTimeout) {
        clearTimeout(this.singleTapTimeout);
      };
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
      };
      if (this.longTapTimeout) {
        clearTimeout(this.longTapTimeout);
      };
      if (this.swipeTimeout) {
        clearTimeout(this.swipeTimeout);
      };

      this.element.removeEventListener("touchstart", this.start);
      this.element.removeEventListener("touchmove", this.move);
      this.element.removeEventListener("touchend", this.end);
      this.element.removeEventListener("touchcancel", this.cancel);

      this.rotate.del();
      this.touchStart.del();
      this.multipointStart.del();
      this.multipointEnd.del();
      this.pinch.del();
      this.swipe.del();
      this.tap.del();
      this.doubleTap.del();
      this.longTap.del();
      this.singleTap.del();
      this.pressMove.del();
      this.twoFingerPressMove.del();
      this.touchMove.del();
      this.touchEnd.del();
      this.touchCancel.del();

      this.preV = null;
      this.pinchStartLen = null;
      this.zoom = null;
      this.isDoubleTap = null;
      this.delta = null;
      this.lastTime = null;
      this.startTime = null;
      this.tapTimeout = null;
      this.singleTapTimeout = null;
      this.longTapTimeout = null;
      this.swipeTimeout = null;
      this.x1 = null;
      this.x2 = null;
      this.y1 = null;
      this.y2 = null;
      this.preTapPosition = null;
      this.rotate = null;
      this.touchStart = null;
      this.multipointStart = null;
      this.multipointEnd = null;
      this.pinch = null;
      this.swipe = null;
      this.tap = null;
      this.doubleTap = null;
      this.longTap = null;
      this.singleTap = null;
      this.pressMove = null;
      this.touchMove = null;
      this.touchEnd = null;
      this.touchCancel = null;
      this.twoFingerPressMove = null;

      return null;
    }
  }]);

  return TouchFinger;
}();

/* harmony default export */ __webpack_exports__["default"] = (TouchFinger);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HandlerAdmin = function () {
  function HandlerAdmin(el) {
    _classCallCheck(this, HandlerAdmin);

    this.el = el;

    this.handlers = [];
  }

  _createClass(HandlerAdmin, [{
    key: 'add',
    value: function add(handler) {
      this.handlers.push(handler);
    }
  }, {
    key: 'del',
    value: function del(handler) {
      var _this = this;

      if (!handler) {
        this.handlers = [];
      };

      this.handlers.forEach(function (func, index) {
        if (func = handler) {
          _this.handlers.splice(index, 1);
        }
      });
    }
  }, {
    key: 'dispatch',
    value: function dispatch() {
      for (var i = 0, len = this.handlers.length; i < len; i++) {
        var handler = this.handlers[i];
        if (typeof handler === 'function') {
          handler.apply(this.el, arguments);
        };
      }
    }
  }]);

  return HandlerAdmin;
}();

var wrapFunc = function wrapFunc(el, handler) {
  var handlerAdmin = new HandlerAdmin(el);
  handlerAdmin.add(handler);

  return handlerAdmin;
};

/* harmony default export */ __webpack_exports__["a"] = (wrapFunc);

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return noop; });
/* unused harmony export DIRECTION_NONE */
/* unused harmony export DIRECTION_LEFT */
/* unused harmony export DIRECTION_RIGHT */
/* unused harmony export DIRECTION_UP */
/* unused harmony export DIRECTION_DOWN */
/* harmony export (immutable) */ __webpack_exports__["b"] = getMovingDirection;
/* unused harmony export getDirectionEventName */
/* unused harmony export getEventName */
/* harmony export (immutable) */ __webpack_exports__["a"] = getLen;
/* harmony export (immutable) */ __webpack_exports__["c"] = getRotateAngle;
var noop = function noop() {};

var DIRECTION_NONE = 1; // 00001
var DIRECTION_LEFT = 2; // 00010
var DIRECTION_RIGHT = 4; // 00100
var DIRECTION_UP = 8; // 01000
var DIRECTION_DOWN = 16; // 10000

function getMovingDirection(point1, point2) {
  var x1 = point1.x,
      y1 = point1.y;
  var x2 = point2.x,
      y2 = point2.y;

  var deltaX = x2 - x1;
  var deltaY = y2 - y1;
  if (deltaX === 0 && deltaY === 0) {
    return DIRECTION_NONE;
  }
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
  }
  return deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

function getDirectionEventName(direction) {
  var name = void 0;
  switch (direction) {
    case DIRECTION_NONE:
      break;
    case DIRECTION_LEFT:
      name = 'left';
      break;
    case DIRECTION_RIGHT:
      name = 'right';
      break;
    case DIRECTION_UP:
      name = 'up';
      break;
    case DIRECTION_DOWN:
      name = 'down';
      break;
    default:
  }
  return name;
}

function getEventName(prefix, status) {
  return prefix + status[0].toUpperCase() + status.slice(1);
}

function getLen(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function getAngle(v1, v2) {
  var mr = getLen(v1) * getLen(v2);
  if (mr === 0) return 0;
  var r = dot(v1, v2) / mr;
  if (r > 1) r = 1;
  return Math.acos(r);
}

function cross(v1, v2) {
  return v1.x * v2.y - v2.x * v1.y;
}

function getRotateAngle(v1, v2) {
  var angle = getAngle(v1, v2);
  if (cross(v1, v2) > 0) {
    angle *= -1;
  }

  return angle * 180 / Math.PI;
}

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=touchFinger.js.map