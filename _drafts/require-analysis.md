---
layout: post
title: babel 转义后缺乏 require ...
categories: [require]
description: es6模块被 babel 转义后，提示缺少 reqire 函数。探索之...
keywords: babel, require
---

以下 ES6 module 语法，经 babel 转义后，代码变化较大，值得仔细分析下。另外代码执行时会提示缺少 require 函数，为什么会这样呢，又应该怎么处理呢？
```js
import * from ''
export
export default 
```

