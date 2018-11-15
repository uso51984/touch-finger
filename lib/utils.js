'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMovingDirection = getMovingDirection;
exports.getDirectionEventName = getDirectionEventName;
exports.getLen = getLen;
exports.getRotateAngle = getRotateAngle;
var DIRECTION_NONE = 1; // 00001
var DIRECTION_LEFT = 2; // 00010
var DIRECTION_RIGHT = 4; // 00100
var DIRECTION_UP = 8; // 01000
var DIRECTION_DOWN = 16; // 10000

function getMovingDirection(deltaX, deltaY) {
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