# touchFinger

[demo](https://uso.gitee.io/get-browser-info/)

## 安装
```
npm install get-browser-info
```

## 引入方式

CommonJS 或者 es6引入方式
```js
  import getBrowserInfo from 'get-browser-info';
```

原始引入方式
```html
    <script type="text/javascript" src="getBrowserInfo.js"></script>
```
> getBrowserInfo.[min].js在dist目录

## 使用
```js
    const clientInfo = getBrowserInfo() //返回一个信息对象
```
## clientInfo 说明

| ket | 说明 |
| --- | --- |
| 浏览器 |browser|
| 版本 |browserVersion|
| 内核 |engine|
| 操作系统 |os|
| 设备 |device|
| 语言 |language|
