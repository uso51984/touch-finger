import wrapFunc from './wrapFunc';

const noop = () => { };

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

class MobileFinger {
  constructor(el, option) {
    this.element = typeof el === 'string' ? document.querySelector(el) : el;
    this.element.addEventListener('touchstart', this.start, false);
    this.element.addEventListener("touchmove", this.move, false);
    this.element.addEventListener("touchend", this.end, false);
    this.element.addEventListener("touchcancel", this.cancel, false);


    this.preV = { x: null, y: null };
    this.pinchStartLen = null;
    this.zoom = 1;
    this.isDoubleTap = false;


    this.rotate = wrapFunc(this.element, option.rotate || noop);
    this.touchStart = wrapFunc(this.element, option.touchStart || noop);
    this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
    this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
    this.pinch = wrapFunc(this.element, option.pinch || noop);
    this.swipe = wrapFunc(this.element, option.swipe || noop);
    this.tap = wrapFunc(this.element, option.tap || noop);
    this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
    this.longTap = wrapFunc(this.element, option.longTap || noop);
    this.singleTap = wrapFunc(this.element, option.singleTap || noop);
    this.pressMove = wrapFunc(this.element, option.pressMove || noop);
    this.twoFingerPressMove = wrapFunc(this.element, option.twoFingerPressMove || noop);
    this.touchMove = wrapFunc(this.element, option.touchMove || noop);
    this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
    this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);

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

  start = (e) => {
    if (!e.touches) {
      return;
    }
    this.now = Date.now();
    this.x1 = e.touches[0].pageX;
    this.y1 = e.touches[0].pageY;
    this.delta = this.now - (this.last || this.now);
    this.touchStart.dispatch(e, this.element);

    if (this.preTapPosition.x !== null) {
      this.isDoubleTap = (
        this.delta > 0 &&
        this.delta <= 250 &&
        Math.abs(this.preTapPosition.x - this.x1) < 30 &&
        Math.abs(this.preTapPosition.y - this.y1) < 30
      )

      if (this.isDoubleTap) {
        clearTimeout(this.singleTapTimeout);
      }
    }

    this.preTapPosition.x = this.x1;
    this.preTapPosition.y = this.y1;
    this.last = this.now;
    const preV = this.preV;
    const len = e.touches.length;
    if (len > 1) {
      this._cancelLongTap();
      this._cancelSingleTap();
      const v = {
        x: e.touches[1].pageX - this.x1,
        y: e.touches[1].pageY - this.y1
      }
      preV.x = v.x;
      preV.y = v.y;
      this.pinchStartLen = getLen(preV);
      this.multipointStart.dispatch(e, this.element);
    }

    this._preventTap = false;
    this.longTapTimeout = setTimeout(() => {
      this.longTap.dispatch(e, this.element);
      this._preventTap = true;
    }, 750)
  }

  move = (e) => {
    if (!e.touches) {
      return;
    }
    const preV = this.preV;
    const len = e.touches.length;
    const currentX = e.touches[0].pageX;
    const currentY = e.touches[0].pageY;
    this.isDoubleTap = false;

    if (len > 1) {
      const sCurrentX = e.touches[1].pageX;
      const sCurrentY = e.touches[1].pageY;
      const v = {
        x: e.touches[1].pageX - currentX,
        y: e.touches[1].pageY - currentY
      }

      if (preV.x !== null) {
        if (this.pinchStartLen > 0) {
          e.zoom = getLen(v) / this.pinchStartLen;
          this.pinch.dispatch(e, this.element);
        }
        e.angle = getRotateAngle(v, preV);
        this.rotate.dispatch(e, this.element);
      }

      preV.x = v.x;
      preV.y = v.y;

      if (this.x2 !== null && this.sx2 !== null) {
        e.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
        e.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
      } else {
        e.deltaX = 0;
        e.deltaY = 0;
      }
      this.twoFingerPressMove.dispatch(e, this.element);
      this.sx2 = sCurrentX;
      this.sy2 = sCurrentY;
    } else {
      if (this.x2 !== null) {
        e.deltaX = currentX - this.x2;
        e.deltaY = currentY - this.y2;

        //move事件中添加对当前触摸点到初始触摸点的判断，
        //如果曾经大于过某个距离(比如10),就认为是移动到某个地方又移回来，应该不再触发tap事件才对。
        const movedX = Math.abs(this.x1 - this.x2);
        const movedY = Math.abs(this.y1 - this.y2);

        if (movedX > 10 || movedY > 10) {
          this._preventTap = true;
        }
      } else {
        e.deltaX = 0;
        e.deltaY = 0;
      }

      this.pressMove.dispatch(e, this.element);
    }
    this.touchMove.dispatch(e, this.element);

    this._cancelLongTap();
    this.x2 = currentX;
    this.y2 = currentY;

    if (len > 1) {
      e.preventDefault();
    }
  }

  end = (e) => {
    if (!e.changedTouches) {
      return;
    }
    this._cancelLongTap();
    if (e.touches.length < 2) {
      this.multipointEnd.dispatch(e, this.element);
      this.sx2 = this.sy2 = null;
    }

    if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
      (this.y2 && Math.abs(this.y1 - this.y2) > 30)
    ) {
      e.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
      this.swipeTimeout = setTimeout(() => {
        this.swipe.dispatch(e, this.element);
      }, 0);
    } else {
      this.tapTimeout = setTimeout(() => {
        if (!this._preventTap) {
          this.tap.dispatch(e, this.element);
        }
        if (this.isDoubleTap) {
          this.doubleTap.dispatch(e, this.element);
          this.isDoubleTap = false
        }
      }, 0)

      if (!this.isDoubleTap) {
        this.singleTapTimeout = setTimeout(() => {
          this.singleTap.dispatch(e, self.element);
        }, 250)
      }
    }
    this.touchEnd.dispatch(e, this.element);
    this.preV.x = 0;
    this.preV.y = 0;
    this.zoom = 1;
    this.pinchStartLen = null;
    this.x1 = this.x2 = this.y1 = this.y2 = null;
  }

  cancelAll = () => {
    this._preventTap = true
    clearTimeout(this.singleTapTimeout);
    clearTimeout(this.tapTimeout);
    clearTimeout(this.longTapTimeout);
    clearTimeout(this.swipeTimeout);
  }

  cancel = () => {
    this.cancelAll();
    this.touchCancel.dispatch(e, this.element);
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
    this.twoFingerPressMove.del()
    this.touchMove.del();
    this.touchEnd.del();
    this.touchCancel.del();

    this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = this.twoFingerPressMove = null;

    return null;
  }
}

export default MobileFinger;