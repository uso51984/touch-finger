export const noop = () => { };

export const DIRECTION_NONE = 1;     // 00001
export const DIRECTION_LEFT = 2;     // 00010
export const DIRECTION_RIGHT = 4;    // 00100
export const DIRECTION_UP = 8;       // 01000
export const DIRECTION_DOWN = 16;    // 10000

export function getMovingDirection(point1, point2) {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  if (deltaX === 0 && deltaY === 0) {
    return DIRECTION_NONE;
  }
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
  }
  return deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

export function getDirectionEventName(direction) {
  let name;
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

export function getLen(v) {
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

export function getRotateAngle(v1, v2) {
  var angle = getAngle(v1, v2);
  if (cross(v1, v2) > 0) {
      angle *= -1;
  }

  return angle * 180 / Math.PI;
}