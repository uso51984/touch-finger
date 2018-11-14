import wrapFunc from './wrapFunc';
import { noop, getLen, getRotateAngle, getMovingDirection } from './utils'


const getTouchesCoords = (e) => {
  return Array.prototype.slice.call(e.touches).map(item => ({
    x: item.screenX,
    y: item.screenY,
  }));
}

class TouchFinger {
  constructor(el, option) {
    this.element = typeof el === 'string' ? document.querySelector(el) : el;
    this.element.addEventListener('touchstart', this.handleTouchStart, false);
    this.element.addEventListener("touchmove", this.handleTouchMove, false);
    this.element.addEventListener("touchend", this.handleTouchEnd, false);
    this.element.addEventListener("touchcancel", this.handleTouchCancel, false);

    this.gestureState = {};

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
    this.lastTime = null;
    this.startTime = null;
    this.tapTimeout = null;
    this.singleTapTimeout = null;
    this.longTapTimeout = null;
    this.swipeTimeout = null;
    this.x1 = this.x2 = this.y1 = this.y2 = null;
    this.preTapPosition = { x: null, y: null };
  }

  handleTouchStart = (e) => {
    if (!e.touches) {
      return;
    }
    this.touchStart.dispatch(e, this.element);
    this.initGestureStatus(e);


    this.startTime = Date.now();
    this.x1 = e.touches[0].pageX;
    this.y1 = e.touches[0].pageY;
    this.delta = this.startTime - (this.lastTime || this.startTime);
    this.lastTime = this.startTime;

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

  handleTouchMove = (e) => {
    if (!e.touches) {
      return;
    }
    this.touchMove.dispatch(e, this.element);
    this.updateGestureStatus(e);
    this._cancelLongTap();
    this.isDoubleTap = false;

    const preV = this.preV;
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

    this.x2 = currentX;
    this.y2 = currentY;

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
          this.singleTap.dispatch(e, this.element);
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

  handleTouchCancel = () => {
    this.cancelAll();
    this.touchCancel.dispatch(e, this.element);
  }

  setGestureState = (params) => {
    if (!this.gestureState) {
      this.gestureState = {}
    }

    if (this.gestureState.touches) {
      this.gestureState.preTouches = this.gestureState.touches;
    }
    this.gestureState = {
      ...this.gestureState,
      ...params,
    };
  }

  initGestureStatus = (e) => {
    delete this.gestureState;

    const startTouchesCoords = this.getTouchesCoords(e);
    const startTime = Date.now();
    // const startMutliFingerStatus = calcMutliFingerStatus(startTouches);
    this.setGestureState({
      startTime,
      startTouchesCoords,
      // startMutliFingerStatus,
      /* copy for next time touch move cala convenient*/
      time: startTime,
      touchesCoords: startTouches,
      // mutliFingerStatus: startMutliFingerStatus,
      srcEvent: e,
    });
  }

  updateGestureStatus(e) {
    if (!e.touches || !e.touches.length) {
      return;
    }

    const time = Date.now();

    const { startTime, startTouchesCoords, pinch, rotate } = this.gesture;
    const touchesCoords = this.getTouchesCoords(e);
    const moveStatus = calcMoveStatus(startTouchesCoords, touchesCoords, time - startTime);
    // let mutliFingerStatus;
    if (pinch || rotate) {
      mutliFingerStatus = calcMutliFingerStatus(touchesCoords);
    }

    this.setGestureState({
      /* update status snapshot */
      time,
      touchesCoords,
      // mutliFingerStatus,
      /* update duration status */
      moveStatus,

    });
  }

  checkIfSingleTouchMove(e) {
    const { touches } = e;
    if (touches.length > 1) {
      this.pan = false;
      return;
    }
    const { touches, moveStatus, preTouches, touches } = this.gestureState;
    if (moveStatus) {
      const direction = getMovingDirection(preTouches[0], touches[0]);
      const eventName = getDirectionEventName(direction);
    }
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
}

export default TouchFinger;