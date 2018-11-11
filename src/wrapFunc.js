class HandlerAdmin {
  constructor(el) {
    this.el = el;

    this.handlers = [];
  }

  add(handler) {
    this.handlers.push(handler);
  }

  del(handler) {
    if (!handler) {
      this.handlers = []
    };

    for(let i = this.handlers.length; i >= 0; i--) {
      if(this.handlers[i] === handler) {
          this.handlers.splice(i, 1);
      }
    }
  }

  dispatch() {
    for(var i = 0, len = this.handlers.length; i < len; i++) {
      var handler = this.handlers[i];
      if (typeof handler === 'function') {
        handler.apply(this.el, arguments)
      };
    }
  }
}

const wrapFunc = (el, handler) => {
  const handlerAdmin = new HandlerAdmin(el);
  handlerAdmin.add(handler);

  return handlerAdmin
}

export default wrapFunc;