---
layout: post
title: minipack 分析
categories: [webpack]
description: 根据上周学习的内容，学习下 webpack 打包的基本原理
keywords: webpack, minipack
---

前面在学习关于 babel 转义 ESModule 的解析时，自己动手简单做了下 require 的实现。由此简单地做了个打包器。既然如此，那么我们接着分析下 [minipack][1] 的实现吧。

### minipack
这是个简单的 demo, 用来解释 webpack 的打包原理。源码很短，非常适合解读。

总结下，minipack 将打包分成了三个部分：

1. createAsset
2. createGraph
3. bundle

### createAsset

```js
// @params filename: string    path of file
/*
@return Asset{
    id: number       
    filename: string
    code: string                // 经 babel 转义后的代码
    dependencies: moduleName[]  // 本模块内引入的模块名
}
*/
function createAsset(filename) {}
```

此函数目的为两个：
1. babel 代码转义为 ES5 
2. 获取某模块所依赖的所有模块名

通过以下3步实现：

1.将代码解析为 ast

```js
const ast = babylon.parse(content, {
  sourceType: "module",
});
```

2.解析出本模块中的依赖

```js
traverse(ast, {
  ImportDeclaration: ({ node }) => {
    dependencies.push(node.source.value);
  },
});
```

3.将 ast 转义为 ES5 代码

```js
const { code } = transformFromAst(ast, null, {
  presets: ["env"],
});
```

完整代码如下：

```js
function createAsset(filename) {
  const content = fs.readFileSync(filename, "utf-8");
  const ast = babylon.parse(content, {
    sourceType: "module",
  });

  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });

  const id = ID++;

  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });

  return {
    id,
    filename,
    dependencies,
    code,
  };
}
```

### createGraph
一个项目中的模块间的引用关系是非常复杂的，为了将不同模块的代码打包到一起，就需要理清这种关系。从入口模块开始，将所有被引入的模块一一整理出来。

```js
// @params entry: string    // 模块入口
// @return GAasset[]
/*
GAsset: {
    id: number       
    filename: string
    code: string                // 经 babel 转义后的代码
    dependencies: moduleName[]  // 本模块内引入的所有模块名
    mapping: {
        [relativePath]: id      // 保存着本模块所引用的所有模块的相对路径及其模块 id
    }
}
*/
function createGraph(entry){}
```

通过此函数的处理，整个项目的所有模块都被保存在一个数组中。并且每个模块中都保存这所引用模块的信息，以待打包时使用。

完整函数如下：

```javascript
function createGraph(entry) {
  const mainAsset = createAsset(entry);
  const queue = [mainAsset];

  for (const asset of queue) {
    asset.mapping = {};
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);
      const child = createAsset(absolutePath);
      asset.mapping[relativePath] = child.id;
      // 保存引用模块，等待下次循环解析。做的是深度优先遍历。
      queue.push(child);
    });
  }
```

### bundle
前面我们就可以拿到所以模块信息了，那么如何才能够将所以模块打包为一个文件呢。

```js
// @params graph: return of createGraph
// @return code: string  // IIFE 可以直接在浏览器中运行
function bundle(graph){}
```

接下来分析比较精彩的部分：

```js
// modules 最终是一个对象，键为模块 id, 值是一个数组，有两个元素
// 虽然看起来 modules 是一个字符串，但因为后面将这些字符串会生成为一个 js 文件，
// 所以上他们最终都是 js 对象
var modules = ''

graph.forEach(mod => {    
    modules += `${mod.id}: [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],`
  });
```

我们看下数组第一个元素

```js
`function (require, module, exports) {
        ${mod.code}
},`
// 实际上就是将模块代码包裹在一个函数之内！

// 这么做的原因是因为模块代码应当是一个独立的作用域，以免影响全局作用域或者模块间相互影响。

// 这个函数遵从 CommonJS 模块规范，接受 require, module, exports 作为参数。
function (require, module, exports) {
    // ${mod.code}  // module code 被置于函数内部
}
```

第二个元素就简单了，是当前模块所引用的模块的集合。

最终的生成代码如下：

```js
const result = `
(function(modules) {
    function require(id) {
    const [fn, mapping] = modules[id];

    function localRequire(name) {
        return require(mapping[name]);
    }

    const module = { exports : {} };

    fn(localRequire, module, module.exports);

    return module.exports;
    }

    require(0);
})({${modules}})
`
// 将其写成函数形式：
(function(modules) {
    // modules 就是上一步生成的模块集合对象

    // require 函数需要着重分析下
    function require(id) {
        const [fn, mapping] = modules[id]; // 参见上一步的分析

        function localRequire(name) {
            return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
    }

    require(0); // 从入口开始

})(modules)
```
### require
```js
// 描述：传入模块 ID ，返回对应模块的数据
// @params id: moduleId
// @return module.exports  // 返回对应模块的导出数据
function require(id) {
    const [fn, mapping] = modules[id]; // 参见上一步的分析

    // CommonJS require 函数的实现，传入模块名，返回对应模块数据！
    function localRequire(name) {
        // mapping 用来辅助转换模块名与模块 ID
        return require(mapping[name]);
    }

    // module, module.exports 保存模块导出的数据。遵从 CommonJS 模块的实现
    const module = { exports : {} };

    // 模块内部通过 module.exports / export 进行导出。
    // 那么经过 fn 函数的执行，导出的数据将挂载到模块外部的 exports 对象中！
    fn(localRequire, module, module.exports);

    // module.exports 最终将模块内部数据返回
    return module.exports;
}
```

### 代码生成实例

```js
(function(modules) {
  function require(id) {
    const [fn, mapping] = modules[id];

    function localRequire(name) {
      return require(mapping[name]);
    }

    const module = { exports: {} };

    fn(localRequire, module, module.exports);

    return module.exports;
  }

  require(0);
})({
  0: [
    function(require, module, exports) {
      "use strict";

      var _message = require("./message.js");

      var _message2 = _interopRequireDefault(_message);

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      console.log(_message2.default);
    },
    { "./message.js": 1 },
  ],
  1: [
    function(require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });

      var _name = require("./name.js");

      exports.default = "hello " + _name.name + "!";
    },
    { "./name.js": 2 },
  ],
  2: [
    function(require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      var name = (exports.name = "world");
    },
    {},
  ],
})();
```

虽然以上代码都比较精炼，没有考虑到复杂的情况，但是这反而对我们了解打包过程更有帮助。希望对你也是如此。

以上。


[1]: https://github.com/ronami/minipack
