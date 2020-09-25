---
layout: post
title: 不蒜子 - 网站访问计数器
categories: Blog
description: 满足静态网站的访问量统计需求
keywords: busuanzi, 不蒜子, 网站统计
---

不少网站都有访问浏览统计计数的需求，[不蒜子][1]以简单快捷的方式帮助我们实现此需求。

#### 1. 它是什么？
    不蒜子是一个简易网站计数服务，可以统计和展示网站总访问量与某个页面访问量。

#### 2. 如何使用？
- <h6>两步操作：引脚本 + 写标签</h6>

```html
<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

<span id="busuanzi_container_site_pv">
    本站总访问量: <span id="busuanzi_value_site_pv"></span>次
</span>
```

- <h6>具体用法</h6>

```html
<!-- 网站总访问量 -->
<span id="busuanzi_container_site_pv">
    本站总访问量: <span id="busuanzi_value_site_pv"><!-- number will be auto injected here by busuanzi --></span>次
</span>
<!-- or -->
<span id="busuanzi_container_site_uv">
    本站总访问量: <span id="busuanzi_value_site_uv"><!-- number will be auto injected here by busuanzi --></span>次
</span>

<!-- 某页面访问量 -->
<span id="busuanzi_container_page_pv">
  本页访问量：<span id="busuanzi_value_page_pv"><!-- number will be auto injected here by busuanzi --></span>次
</span>
<!-- or -->
<span id="busuanzi_container_page_uv">
  本页访问量：<span id="busuanzi_value_page_uv"><!-- number will be auto injected here by busuanzi --></span>次
</span>
```

- <h6>pv 与 uv 的区别</h6>
1. pv: 单个用户连续点击n篇文章，记录n次访问量。
2. uv: 单个用户连续点击n篇文章，只记录1次访客数。

#### 3. 基本原理
1. 加载 busuanzi.pure.mini.js 文件时，其将构建一个 jsonp 的请求:

```html
<script src='http://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback_77382268718></script> 
```

2. 此次请求中做了两件事：
    1. 不蒜子服务器取到此次请求中的某些特征值(如：RequestHeader 的 Referer )，为此站点记录一次访问数；
    2. 返回此站点的当前访问数(jsop的方式)

3. 客户端接收到响应，相关逻辑会执行响应结果，通过DOM操作修改当前站点访问数据。

#### 4. 常见问题
1. 怎么初始化访问数据？
    1. 不蒜子暂时没有设置初始数据的功能，有兴趣的同学可以在我的这篇博文中查看方法。

#### 5. 小结
    首先，在此表达对不蒜子及其作者的感谢。他们的无私帮助了包括我在内的许多人，感谢！
    其次，也希望能够通过自己不断的分享，提升自己。倘若能够给他人带来帮助，那将是对我最大的奖励。
    

&nbsp;&nbsp;&nbsp;&nbsp;此致 

敬礼！

[1]: http://ibruce.info/2015/04/04/busuanzi/