# touchFinger

[demo](https://uso.gitee.io/touch-finger/)

## 安装
```
npm install touch-finger
```

## 引入方式

CommonJS 或者 es6引入方式
```js
  import touchFinger from 'touch-finger';
```

原始引入方式
```html
    <script type="text/javascript" src="touchFinger.js"></script>
```
> touchFinger.[min].js在dist目录

## 使用
```js
const fingerInstance = new touchFinger(element, {
  touchStart () { },
  touchMove () { },
  touchEnd:  function () { },
  touchCancel () { },
  multipointStart () { },
  multipointEnd () { },
  tap () { },
  doubleTap () { },
  longTap () { },
  singleTap () { },
  rotate (evt) {
    console.log(evt.angle);
  },
  pinch (evt) {
    console.log(evt.zoom);
  },
  pressMove (evt) {
    console.log(evt.deltaX);
    console.log(evt.deltaY);
  },
  swipe (evt) {
    console.log("swipe" + evt.direction);
  }
});

const onTap = function() {};

fingerInstance.on('tap', onTap);
fingerInstance.on('touchStart', function() {});
fingerInstance.off('tap', onTap);

fingerInstance.destroy();
```

## 联系

Email: usocjb@163.com
weixin: chenjianbin519846538