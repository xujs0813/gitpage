---
layout: post
title: svg 的基本概念与应用
categories: [svg]
description: 工作中大量应用到 svg ，应该做个全面的学习与总结
keywords: svg
---

### svg 基本概念

### viewbox 视口
```html
<svg width="400" height="200" viewbox="0 0 2000 1000"></svg>
```
viewport 视口，也是 svg 元素在文档中的大小,由 width 和 height 确定。单位默认为 px, 也可以有其他单位

viewbox  视口，可以认为是 svg 内部的坐标系统。
由 min-x, min-y, width, height 四个参数表示
min-x, min-y 这两个属性一般为 0，暂时不去深究。
width, height 设置适口的宽，高。无单位属性，理解为用户自定义单位，或者 svg 内部坐标系统单位。

那么 svg 内部元素最终绘制的尺寸如何计算呢？答案如下：
viewbox 的坐标系统中，width = 2000(unit) 对应 svg 宽度 400px, 那么宽度方向上每单位与 px 的换算如下[1]：
1(unit) = 400px / 2000 = 0.2px

相同地，长度方向上也是如此
1(unit) = 200px / 1000 = 0.2px

```html
<svg width="400" height="200" viewbox="0 0 2000 1000">
    <rect x="20" y="10" width="200" height="100" style="fill: blue"></rect>
</svg>
```
以上 svg 内接矩形所定义的数据，都可以通过 * 0.2px 转换单位获得 px 尺寸。 

1. svg 与 viewbox
viewbox 默认与 svg 大小相同。
当 svg 会将 viewbox 完整地显示在视口内，因此会对 viewbox 进行缩放。当 svg 视口与 viewbox 长宽比相同时，viewbox 将完整显示。

2. preserveAspectRatio[2]
当 svg 与 viewbox 长宽比不同时，

### preserveAspectRatio
此值声明了 viewbox 的显示如何确定。
默认：xMidYMid meet   // x,y 轴居中对齐，保持长宽比并完整展示于画布中，
第一个参数共九种选项：
```js
xMinYMin,
xMinYMid,
xMinYMax,
xMidYMin,
xMidYMid,
xMidYMax,
xMaxYMin,
xMaxYMid,
xMaxYMax
```
x, y 表示对齐轴线
Min, Max, Mid 表示对齐方式。分别表示向坐标减小的方向，居中，向坐标增大的方向对齐。

第二个参数有两种对齐方式：
meet , slice 
meet: 自动调整 svg 保持长宽比在画布中完整显示。类似 css background-size: contain

slice: 自动调整 svg 铺满整个画布。类似 css background-size: cover


[1]: https://stackoverflow.com/questions/15335926/how-to-use-the-svg-viewbox-attribute?
[2]: https://segmentfault.com/a/1190000009226427?utm_source=tag-newest
