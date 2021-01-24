---
layout: post
title: 简单做个模块加载器吧*_*
categories: [webpack]
description: es6模块被 babel 转义后，提示缺少 reqire 函数。探索之...
keywords: babel, require
---

以下 ES6 module 语法，经 babel 转义后，代码变化较大，值得仔细分析下。另外代码执行时会提示缺少 require 函数，为什么会这样呢，又应该怎么处理呢？

#### 源代码
代码定义如下：
```js
// math.js
export default {
    sum(a,b){
        return a + b
    }
}

// index.js
import math from './math.js'
console.log('start');
var sum = math.sum(1,2)
console.log('sum: ', sum);
console.log('end');
```
以上代码无法在浏览器环境下执行，需要代码转义。我们看下转义结果

#### 转义
转义后：
```js
// math.js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  sum(a, b) {
    return a + b;
  }

};
exports.default = _default;
```

```js
// index.js
"use strict";

var _math = _interopRequireDefault(require("./math.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('start');

var sum = _math.default.sum(1, 2);

console.log('sum: ', sum);
console.log('end');
```

#### 代码前后变化较大， 我们首先分析 math.js

```js
// 为 exports 对象创建 __esModule 属性，表明其模块的身份
Object.defineProperty(exports, "__esModule", {
  value: true
});

// 初始化 default 默认值
exports.default = void 0;

// 模块代码
var _default = {
  sum(a, b) {
    return a + b;
  }
};

// 将模块代码传递给 default 
exports.default = _default;
```
以上代码关键点在于需要给模块传递 exports 对象，便可以通过此对象将内部代码导出到外部。

#### index.js
```js
// index.js

// 通过 require 函数导入 math.js 模块
var _math = _interopRequireDefault(require("./math.js"));

// 此函数用来格式化对象
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 最终使用的是 math 模块的 default 对象
var sum = _math.default.sum(1, 2);

```
以上代码需要关注如下要点：
- require 函数

全局并没有 require ，提示我们需要自己实现之

- 模块的 default 对象

本文暂时只做 export default 的分析，其他导出方式暂不关注

- 总结

模块需要注入 require, exports 以导入和导出模块

#### 代码生成

只需要将模块代码包裹在一个函数中即可，此函数接收 require , exports 作为参数

```js
// node 环境下读取代码
const originCode = fs.readFileSync(file)

// 代码生成
const genCode = `(function(exports, require){${code}})`
```

#### exports 
exports 对象需要与模块一一对应。因此我们创建 codeMap 对象，以模块名为键值保存其代码

```js
const codeMap = {
    // [moduleId]: {
    //     exports: {},
    //     code: genCode  // 通过模块代码生成的代码
    // }
}
```

#### require(moduleId)
此函数通过模块名获取到模块对象。而我们模块相关代码以字符串函数的形式保存，并且模块代码需要传入 exports, require。

```js
function _require(id){
    // 从 codeMap 取到模块相关代码
    const {exports, code} = codeMap[id]
    // 通过 eval 生成函数
    var foo = eval(code)
    // 执行函数，运行模块代码，传入 exports, require。
    // exports 将保存对应模块信息
    foo(exports, _require)
    // require 函数需返回模块
    return exports
}
```

#### 整体代码
```js
const fs = require('fs')
const glob = require('glob') // 读取符合预期的文件名
const files = glob.sync('./*.js') // 此文件夹下的代码都经过了 babel 转义

const codeMap = {}

files.forEach(file=>{
    const code = fs.readFileSync(file)
    codeMap[file] = {
        exports: {
            // default: // 保存模块导出
        },
        code: `(function(exports, require){${code}})` // 代码生成
    }
})

function _require(id){
    const {exports, code} = codeMap[id]
    var foo = eval(code)
    foo(exports, _require)
    return exports
}

const entry = './index.js' // 入口代码

_require(entry) // 从入口处执行模块

// output:

// start
// sum: 3
// end
```

以上所做事情虽然简单，仅仅考虑了一种单一情况，但也许能加深对模块的理解。
