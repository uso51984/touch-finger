import {
  getLen, getRotateAngle,
  getMovingDirection,
  getDirectionEventName
} from './utils'

class TouchFinger {
  constructor(el, options) {
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

  triggerEvent = (name, ...args) => {
    const callback = this.options[name];
    if (typeof callback === 'function') {
      callback(...args);
    }
  }

  handleTouchStart = (e) => {
    if (!e.touches) {
      return;
    }
    this.triggerEvent('touchStart', e, this.element);

    this.gestureStatus.startTime = Date.now();
    this.gestureStatus.x1 = e.touches[0].pageX;
    this.gestureStatus.y1 = e.touches[0].pageY;
    this.gestureStatus.delta = this.gestureStatus.startTime - (this.gestureStatus.lastTime || this.gestureStatus.startTime);
    this.gestureStatus.lastTime = this.gestureStatus.startTime;

    if (this.gestureStatus.preTapPosition.x !== null) {
      this.gestureStatus.isDoubleTap = (
        this.gestureStatus.delta > 0 &&
        this.gestureStatus.delta <= 250 &&
        Math.abs(this.gestureStatus.preTapPosition.x - this.gestureStatus.x1) < 30 &&
        Math.abs(this.gestureStatus.preTapPosition.y - this.gestureStatus.y1) < 30
      )
      if (this.gestureStatus.isDoubleTap) {
        clearTimeout(this.singleTapTimeout);
      }
    }
    this.gestureStatus.preTapPosition.x = this.gestureStatus.x1;
    this.gestureStatus.preTapPosition.y = this.gestureStatus.y1;
    const preV = this.gestureStatus.preV;

    const len = e.touches.length;
    if (len > 1) {
      this._cancelLongTap();
      this._cancelSingleTap();
      const v = {
        x: e.touches[1].pageX - this.gestureStatus.x1,
        y: e.touches[1].pageY - this.gestureStatus.y1
      }
      preV.x = v.x;
      preV.y = v.y;

      this.gestureStatus.pinchStartLen = getLen(preV);
      this.triggerEvent('multipointStart', e, this.element);
    }

    this.gestureStatus._preventTap = false;
    this.longTapTimeout = setTimeout(() => {
      this.triggerEvent('longTap', e, this.element);
      this.gestureStatus._preventTap = true;
    }, 750)
  }

  handleTouchMove = (e) => {
    if (!e.touches) {
      return;
    }
    this.triggerEvent('touchMove', e, this.element);
    this._cancelLongTap();
    this.gestureStatus.isDoubleTap = false;

    const preV = this.gestureStatus.preV;
    const len = e.touches.length;
    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].pageY;

    if (len > 1) {
      const sCurrentX = e.touches[1].pageX;
      const sCurrentY = e.touches[1].pageY;
      const v = {
        x: e.touches[1].pageX - currentX,
        y: e.touches[1].pageY - currentY
      }

      if (preV.x !== null) {
        if (this.gestureStatus.pinchStartLen > 0) {
          e.zoom = getLen(v) / this.gestureStatus.pinchStartLen;
          this.triggerEvent('pinch', e, this.element);
        }
        e.angle = getRotateAngle(v, preV);
        this.triggerEvent('rotate', e, this.element);
      }

      preV.x = v.x;
      preV.y = v.y;

      if (this.gestureStatus.x2 !== null && this.sx2 !== null) {
        e.deltaX = (currentX - this.gestureStatus.x2 + sCurrentX - this.sx2) / 2;
        e.deltaY = (currentY - this.gestureStatus.y2 + sCurrentY - this.sy2) / 2;
      } else {
        e.deltaX = 0;
        e.deltaY = 0;
      }

      this.triggerEvent('twoFingerPressMove', e, this.element);
      this.sx2 = sCurrentX;
      this.sy2 = sCurrentY;
    } else {
      if (this.gestureStatus.x2 !== null) {
        e.deltaX = currentX - this.gestureStatus.x2;
        e.deltaY = currentY - this.gestureStatus.y2;

        //move事件中添加对当前触摸点到初始触摸点的判断，
        //如果曾经大于过某个距离(比如10),就认为是移动到某个地方又移回来，应该不再触发tap事件才对。
        const movedX = Math.abs(this.gestureStatus.x1 - this.gestureStatus.x2);
        const movedY = Math.abs(this.gestureStatus.y1 - this.gestureStatus.y2);

        if (movedX > 10 || movedY > 10) {
          this.gestureStatus._preventTap = true;
        }
      } else {
        e.deltaX = 0;
        e.deltaY = 0;
      }
      const direction = getMovingDirection(e.deltaX, e.deltaY);
      e.pressMoveDirection = getDirectionEventName(direction);
      this.triggerEvent('pressMove', e, this.element);
    }

    this.gestureStatus.x2 = currentX;
    this.gestureStatus.y2 = currentY;

    if (len > 1) {
      e.preventDefault();
    }
  }

  handleTouchEnd = (e) => {
    if (!e.changedTouches) {
      return;
    }
    this._cancelLongTap();
    if (e.touches.length < 2) {
      this.triggerEvent('multipointEnd', e, this.element);
      this.sx2 = this.sy2 = null;
    }

    if ((this.gestureStatus.x2 && Math.abs(this.gestureStatus.x1 - this.gestureStatus.x2) > 30) ||
      (this.gestureStatus.y2 && Math.abs(this.gestureStatus.y1 - this.gestureStatus.y2) > 30)
    ) {
      e.direction = this._swipeDirection(this.gestureStatus.x1, this.gestureStatus.x2, this.gestureStatus.y1, this.gestureStatus.y2);
      this.swipeTimeout = setTimeout(() => {
        this.triggerEvent('swipe', e, this.element);
      }, 0);
    } else {
      this.tapTimeout = setTimeout(() => {
        if (!this.gestureStatus._preventTap) {
          this.triggerEvent('tap', e, this.element);
        }
        if (this.gestureStatus.isDoubleTap) {
          this.triggerEvent('doubleTap', e, this.element);
          this.gestureStatus.isDoubleTap = false
        }
      }, 0)

      if (!this.gestureStatus.isDoubleTap) {
        this.singleTapTimeout = setTimeout(() => {
          this.triggerEvent('singleTap', e, this.element);
        }, 250)
      }
    }
    this.triggerEvent('touchEnd', e, this.element);
    this.gestureStatus.preV.x = 0;
    this.gestureStatus.preV.y = 0;

    this.gestureStatus.zoom = 1;
    this.gestureStatus.pinchStartLen = null;
    this.gestureStatus.x1 = this.gestureStatus.x2 = this.gestureStatus.y1 = this.gestureStatus.y2 = null;
  }

  cancelAll = () => {
    this.gestureStatus._preventTap = true
    clearTimeout(this.singleTapTimeout);
    clearTimeout(this.tapTimeout);
    clearTimeout(this.longTapTimeout);
    clearTimeout(this.swipeTimeout);
  }

  handleTouchCancel = (e) => {
    this.cancelAll();
    this.triggerEvent('touchCancel', e, this.element);
  }

  _cancelLongTap() {
    clearTimeout(this.longTapTimeout);
  }

  _cancelSingleTap () {
    clearTimeout(this.singleTapTimeout);
  }

  _swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  on = (evt, handler) => {
    if(this[evt]) {
        this[evt].add(handler);
    }
  }

  off = (evt, handler) => {
      if(this[evt]) {
          this[evt].del(handler);
      }
  }

  destroy() {
    if (this.singleTapTimeout) {
      clearTimeout(this.singleTapTimeout)
    };
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout)
    };
    if (this.longTapTimeout) {
      clearTimeout(this.longTapTimeout)
    };
    if (this.swipeTimeout) {
      clearTimeout(this.swipeTimeout)
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
}

export default TouchFinger;