'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
      if (!handler) {
        this.handlers = [];
      };

      for (var i = this.handlers.length; i >= 0; i--) {
        if (this.handlers[i] === handler) {
          this.handlers.splice(i, 1);
        }
      }
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

exports['default'] = wrapFunc;
module.exports = exports['default'];