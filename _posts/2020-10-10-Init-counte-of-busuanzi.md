---
layout: post
title: 初始化不蒜子计数的方法遐思
categories: Blog
description: 不蒜子本身并没有提供初始化计数的服务，作为前端攻城狮，我们自己动手，丰衣足食。
keywords: 不蒜子, 初始化计数
---

不蒜子是一款简单的网站访问计数服务，但是没有为我们提供初始化计数的服务。本文以一个前端工程师的角度介绍如何实现不蒜子的初始化计数。

1. 不蒜子是如何将计数值写入到我们的页面中的？

    在我们引入的不蒜子脚本中，其会通过 jsonp 的方式向其服务器发送请求。此请求的返回数据中携带着网站的计数值，通过 id 选择器获取到指定元素将数据写入页面。

```js
// request
// http://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback_357485751210

// response
try{BusuanziCallback_357485751210({"site_uv":2836544,"page_pv":9264143,"version":2.4,"site_pv":24925260});}catch(e){}
```

2. 初始化计数的可行方法

    根据上面所述原理，我们可以在请求响应之后，手动修改数据，然后写入指定元素中即可。根据这一思想，我们可以写出以下两种方法。

### 方法一
复制一份不蒜子脚本到我们自己的服务中，修改脚本的源码后引入到页面中即可。
```js
// ...
// part of the source code
texts: function (a) {
      this.bszs.map(function (b) {
        var c = document.getElementById("busuanzi_value_" + b);
        c &&
          (c.innerHTML =
            parseInt(Date.now() * 0.0000049 - 7 * Math.pow(10, 6)) +
            parseInt(a[b])); // 此处修改数据
      });
    }
// ...
```
这种方式简单快捷，具体如何进行数据修改完全由你决定。

### 方法二
在不蒜子脚本向页面中写入数据时通知代码自动修改数据。可通过 Object.defineProperty 实现
```js
// 下面演示基本原理
const ele = document.getElementById('busuanzi_value_site_pv')
Object.defineProperty(ele,'innerHTML',{
    set(newValue){
        // to do something when ele.innerHTML is setting new value
        
        // for example 
        ele.innerText = newValue + 100
    }
})
```
以上代码使得指定元素在设置 innerHTML 时自动执行某操作，我们可以在这时对指定元素重新写入经过修改的数据。

1. 为什么监控 innerHTML

    不蒜子脚本通过 innerHTML 向指定元素中写入数值

2. 为什么通过 innerText 写入修改后的计数值

    经试验，Object.defineProperty 对DOM元素的 innerHTML 属性设置 setter 之后，无法为此属性进行赋值操作。
    因此借用 innerText 达到目的。

> 完整实现代码如下

```js
(function(){
    var eleList = [
        {
            id: 'busuanzi_value_site_pv', 
            ele: null,
            initCount: _getInitCount(1940)
        },
        {
            id: 'busuanzi_value_site_uv',
            ele: null,
            initCount: _getInitCount(932)
        },
        {
            id: 'busuanzi_value_page_pv',
            ele: null,
            initCount: _getInitCount(123)
        },
    ]

    for(var i=0;i<eleList.length;i++){
        var eleObj = eleList[i]
        eleObj.ele = document.getElementById(eleObj.id)
        _defineProperty(eleObj,'innerHTML')
    }

    function _defineProperty(eleObj,key){
        var ele = eleObj.ele
        Object.defineProperty(ele,key,{
            set(originVal){
                // 设置了 setter 之后，无法通过 innerHTML 设置值
                _updateCount(eleObj,originVal)
            }
        })
    }

    function _updateCount(eleObj,originVal){
        var initCount = eleObj.initCount
        var ele = eleObj.ele
        // 通过 innerText 折中实现
        ele.innerText = parseInt(originVal) + initCount
    }

    function _getInitCount(seed){
        var n = 1000 * 3600 * 24
        var dayNum = Date.now() / n 
        var date = new Date(2020,9,3)
        var dateDay = Date.parse(date) / n
        var dis = dayNum - dateDay
        return parseInt(dis * seed)
    }
})()
```
注：此脚本需要在对应 id 元素之后引入。

代码未经优化，若有错误，还望读者指正。若各位有其他想法，欢迎留言讨论。谢谢。


&nbsp;&nbsp;&nbsp;&nbsp;此致 

敬礼！