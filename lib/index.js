'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wrapFunc = require('./wrapFunc');

var _wrapFunc2 = _interopRequireDefault(_wrapFunc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noop = function noop() {};

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

var TouchFinger = function () {
  function TouchFinger(el, option) {
    var _this = this;

    _classCallCheck(this, TouchFinger);

    this.start = function (e) {
      if (!e.touches) {
        return;
      }
      _this.now = Date.now();
      _this.x1 = e.touches[0].pageX;
      _this.y1 = e.touches[0].pageY;
      _this.delta = _this.now - (_this.last || _this.now);
      _this.touchStart.dispatch(e, _this.element);

      if (_this.preTapPosition.x !== null) {
        _this.isDoubleTap = _this.delta > 0 && _this.delta <= 250 && Math.abs(_this.preTapPosition.x - _this.x1) < 30 && Math.abs(_this.preTapPosition.y - _this.y1) < 30;

        if (_this.isDoubleTap) {
          clearTimeout(_this.singleTapTimeout);
        }
      }

      _this.preTapPosition.x = _this.x1;
      _this.preTapPosition.y = _this.y1;
      _this.last = _this.now;
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
        _this.pinchStartLen = getLen(preV);
        _this.multipointStart.dispatch(e, _this.element);
      }

      _this._preventTap = false;
      _this.longTapTimeout = setTimeout(function () {
        _this.longTap.dispatch(e, _this.element);
        _this._preventTap = true;
      }, 750);
    };

    this.move = function (e) {
      if (!e.touches) {
        return;
      }
      var preV = _this.preV;
      var len = e.touches.length;
      var currentX = e.touches[0].pageX;
      var currentY = e.touches[0].pageY;
      _this.isDoubleTap = false;

      if (len > 1) {
        var sCurrentX = e.touches[1].pageX;
        var sCurrentY = e.touches[1].pageY;
        var v = {
          x: e.touches[1].pageX - currentX,
          y: e.touches[1].pageY - currentY
        };

        if (preV.x !== null) {
          if (_this.pinchStartLen > 0) {
            e.zoom = getLen(v) / _this.pinchStartLen;
            _this.pinch.dispatch(e, _this.element);
          }
          e.angle = getRotateAngle(v, preV);
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
      _this.touchMove.dispatch(e, _this.element);

      _this._cancelLongTap();
      _this.x2 = currentX;
      _this.y2 = currentY;

      if (len > 1) {
        e.preventDefault();
      }
    };

    this.end = function (e) {
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

    this.cancel = function () {
      _this.cancelAll();
      _this.touchCancel.dispatch(e, _this.element);
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
    this.element.addEventListener('touchstart', this.start, false);
    this.element.addEventListener("touchmove", this.move, false);
    this.element.addEventListener("touchend", this.end, false);
    this.element.addEventListener("touchcancel", this.cancel, false);

    this.preV = { x: null, y: null };
    this.pinchStartLen = null;
    this.zoom = 1;
    this.isDoubleTap = false;

    this.rotate = (0, _wrapFunc2['default'])(this.element, option.rotate || noop);
    this.touchStart = (0, _wrapFunc2['default'])(this.element, option.touchStart || noop);
    this.multipointStart = (0, _wrapFunc2['default'])(this.element, option.multipointStart || noop);
    this.multipointEnd = (0, _wrapFunc2['default'])(this.element, option.multipointEnd || noop);
    this.pinch = (0, _wrapFunc2['default'])(this.element, option.pinch || noop);
    this.swipe = (0, _wrapFunc2['default'])(this.element, option.swipe || noop);
    this.tap = (0, _wrapFunc2['default'])(this.element, option.tap || noop);
    this.doubleTap = (0, _wrapFunc2['default'])(this.element, option.doubleTap || noop);
    this.longTap = (0, _wrapFunc2['default'])(this.element, option.longTap || noop);
    this.singleTap = (0, _wrapFunc2['default'])(this.element, option.singleTap || noop);
    this.pressMove = (0, _wrapFunc2['default'])(this.element, option.pressMove || noop);
    this.twoFingerPressMove = (0, _wrapFunc2['default'])(this.element, option.twoFingerPressMove || noop);
    this.touchMove = (0, _wrapFunc2['default'])(this.element, option.touchMove || noop);
    this.touchEnd = (0, _wrapFunc2['default'])(this.element, option.touchEnd || noop);
    this.touchCancel = (0, _wrapFunc2['default'])(this.element, option.touchCancel || noop);

    this.delta = null;
    this.last = null;
    this.now = null;
    this.tapTimeout = null;
    this.singleTapTimeout = null;
    this.longTapTimeout = null;
    this.swipeTimeout = null;
    this.x1 = this.x2 = this.y1 = this.y2 = null;
    this.preTapPosition = { x: null, y: null };
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
      this.last = null;
      this.now = null;
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

exports['default'] = TouchFinger;
module.exports = exports['default'];