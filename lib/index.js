'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TouchFinger = function () {
  function TouchFinger(el, options) {
    var _this = this;

    _classCallCheck(this, TouchFinger);

    this.triggerEvent = function (name) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var callback = _this.options[name];
      if (typeof callback === 'function') {
        callback.apply(undefined, args);
      }
    };

    this.handleTouchStart = function (e) {
      if (!e.touches) {
        return;
      }
      _this.triggerEvent('touchStart', e, _this.element);

      _this.gestureStatus.startTime = Date.now();
      _this.gestureStatus.x1 = e.touches[0].pageX;
      _this.gestureStatus.y1 = e.touches[0].pageY;
      _this.gestureStatus.delta = _this.gestureStatus.startTime - (_this.gestureStatus.lastTime || _this.gestureStatus.startTime);
      _this.gestureStatus.lastTime = _this.gestureStatus.startTime;

      if (_this.gestureStatus.preTapPosition.x !== null) {
        _this.gestureStatus.isDoubleTap = _this.gestureStatus.delta > 0 && _this.gestureStatus.delta <= 250 && Math.abs(_this.gestureStatus.preTapPosition.x - _this.gestureStatus.x1) < 30 && Math.abs(_this.gestureStatus.preTapPosition.y - _this.gestureStatus.y1) < 30;
        if (_this.gestureStatus.isDoubleTap) {
          clearTimeout(_this.singleTapTimeout);
        }
      }
      _this.gestureStatus.preTapPosition.x = _this.gestureStatus.x1;
      _this.gestureStatus.preTapPosition.y = _this.gestureStatus.y1;
      var preV = _this.gestureStatus.preV;

      var len = e.touches.length;
      if (len > 1) {
        _this._cancelLongTap();
        _this._cancelSingleTap();
        var v = {
          x: e.touches[1].pageX - _this.gestureStatus.x1,
          y: e.touches[1].pageY - _this.gestureStatus.y1
        };
        preV.x = v.x;
        preV.y = v.y;

        _this.gestureStatus.pinchStartLen = (0, _utils.getLen)(preV);
        _this.triggerEvent('multipointStart', e, _this.element);
      }

      _this.gestureStatus._preventTap = false;
      _this.longTapTimeout = setTimeout(function () {
        _this.triggerEvent('longTap', e, _this.element);
        _this.gestureStatus._preventTap = true;
      }, 750);
    };

    this.handleTouchMove = function (e) {
      if (!e.touches) {
        return;
      }
      _this.triggerEvent('touchMove', e, _this.element);
      _this._cancelLongTap();
      _this.gestureStatus.isDoubleTap = false;

      var preV = _this.gestureStatus.preV;
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
          if (_this.gestureStatus.pinchStartLen > 0) {
            e.zoom = (0, _utils.getLen)(v) / _this.gestureStatus.pinchStartLen;
            _this.triggerEvent('pinch', e, _this.element);
          }
          e.angle = (0, _utils.getRotateAngle)(v, preV);
          _this.triggerEvent('rotate', e, _this.element);
        }

        preV.x = v.x;
        preV.y = v.y;

        if (_this.gestureStatus.x2 !== null && _this.sx2 !== null) {
          e.deltaX = (currentX - _this.gestureStatus.x2 + sCurrentX - _this.sx2) / 2;
          e.deltaY = (currentY - _this.gestureStatus.y2 + sCurrentY - _this.sy2) / 2;
        } else {
          e.deltaX = 0;
          e.deltaY = 0;
        }

        _this.triggerEvent('twoFingerPressMove', e, _this.element);
        _this.sx2 = sCurrentX;
        _this.sy2 = sCurrentY;
      } else {
        if (_this.gestureStatus.x2 !== null) {
          e.deltaX = currentX - _this.gestureStatus.x2;
          e.deltaY = currentY - _this.gestureStatus.y2;

          //move事件中添加对当前触摸点到初始触摸点的判断，
          //如果曾经大于过某个距离(比如10),就认为是移动到某个地方又移回来，应该不再触发tap事件才对。
          var movedX = Math.abs(_this.gestureStatus.x1 - _this.gestureStatus.x2);
          var movedY = Math.abs(_this.gestureStatus.y1 - _this.gestureStatus.y2);

          if (movedX > 10 || movedY > 10) {
            _this.gestureStatus._preventTap = true;
          }
        } else {
          e.deltaX = 0;
          e.deltaY = 0;
        }
        var direction = (0, _utils.getMovingDirection)(e.deltaX, e.deltaY);
        e.pressMoveDirection = (0, _utils.getDirectionEventName)(direction);
        _this.triggerEvent('pressMove', e, _this.element);
      }

      _this.gestureStatus.x2 = currentX;
      _this.gestureStatus.y2 = currentY;

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
        _this.triggerEvent('multipointEnd', e, _this.element);
        _this.sx2 = _this.sy2 = null;
      }

      if (_this.gestureStatus.x2 && Math.abs(_this.gestureStatus.x1 - _this.gestureStatus.x2) > 30 || _this.gestureStatus.y2 && Math.abs(_this.gestureStatus.y1 - _this.gestureStatus.y2) > 30) {
        e.direction = _this._swipeDirection(_this.gestureStatus.x1, _this.gestureStatus.x2, _this.gestureStatus.y1, _this.gestureStatus.y2);
        _this.swipeTimeout = setTimeout(function () {
          _this.triggerEvent('swipe', e, _this.element);
        }, 0);
      } else {
        _this.tapTimeout = setTimeout(function () {
          if (!_this.gestureStatus._preventTap) {
            _this.triggerEvent('tap', e, _this.element);
          }
          if (_this.gestureStatus.isDoubleTap) {
            _this.triggerEvent('doubleTap', e, _this.element);
            _this.gestureStatus.isDoubleTap = false;
          }
        }, 0);

        if (!_this.gestureStatus.isDoubleTap) {
          _this.singleTapTimeout = setTimeout(function () {
            _this.triggerEvent('singleTap', e, _this.element);
          }, 250);
        }
      }
      _this.triggerEvent('touchEnd', e, _this.element);
      _this.gestureStatus.preV.x = 0;
      _this.gestureStatus.preV.y = 0;

      _this.gestureStatus.zoom = 1;
      _this.gestureStatus.pinchStartLen = null;
      _this.gestureStatus.x1 = _this.gestureStatus.x2 = _this.gestureStatus.y1 = _this.gestureStatus.y2 = null;
    };

    this.cancelAll = function () {
      _this.gestureStatus._preventTap = true;
      clearTimeout(_this.singleTapTimeout);
      clearTimeout(_this.tapTimeout);
      clearTimeout(_this.longTapTimeout);
      clearTimeout(_this.swipeTimeout);
    };

    this.handleTouchCancel = function (e) {
      _this.cancelAll();
      _this.triggerEvent('touchCancel', e, _this.element);
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

    this.element = el;
    this.element.addEventListener('touchstart', this.handleTouchStart, false);
    this.element.addEventListener("touchmove", this.handleTouchMove, false);
    this.element.addEventListener("touchend", this.handleTouchEnd, false);
    this.element.addEventListener("touchcancel", this.handleTouchCancel, false);
    this.options = options;
    this.gestureStatus = {
      delta: null,
      last: null,
      now: null,
      tapTimeout: null,
      singleTapTimeout: null,
      longTapTimeout: null,
      swipeTimeout: null,
      x1: null,
      x2: null,
      y1: null,
      y2: null,
      preV: { x: null, y: null },
      preTapPosition: { x: null, y: null }
    };
  }

  _createClass(TouchFinger, [{
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

      this.element.removeEventListener("touchstart", this.handleTouchStart);
      this.element.removeEventListener("touchmove", this.handleTouchMove);
      this.element.removeEventListener("touchend", this.handleTouchEnd);
      this.element.removeEventListener("touchcancel", this.handleTouchCancel);

      delete this.gestureStatus;
      this.tapTimeout = null;
      this.singleTapTimeout = null;
      this.longTapTimeout = null;
      this.swipeTimeout = null;

      return null;
    }
  }]);

  return TouchFinger;
}();

exports['default'] = TouchFinger;
module.exports = exports['default'];