# 青山

### Something should to know
1. 域名。

   如果你需要绑定自己的域名，那么修改 CNAME 文件的内容；如果不需要绑定自己的域名，那么删掉 CNAME 文件。

2. 修改配置。

   网站的配置基本都集中在 \_config.yml 文件中。

   **评论模块：** 目前支持 disqus、gitment 和 gitalk，选用其中一种就可以了，推荐使用 [gitalk][3]。它们各自的配置指南链接在 \_config.yml 文件的 Comments 一节里都贴出来了。

3. 目录结构
   * \_posts 已发布的博客文章。
   * \_drafts 尚未发布的博客文章。
   * \_wiki 已发布的 wiki 页面。
   * images 的文章和页面里使用的图片。

4. 本地预览
   1. [Setting up your Pages site locally with Jekyll][2]   
   2. bundle exec jekyll serve

5. 排版
   [中文文案排版指北（简体中文版）][1]

## 致谢

本博客基于 [mzlogin](https://github.com/mzlogin/mzlogin.github.io) 定制，感谢！


[1]: https://github.com/mzlogin/chinese-copywriting-guidelines
[2]: https://help.github.com/articles/setting-up-your-pages-site-locally-with-jekyll/
[3]: https://github.com/gitalk/gitalk
