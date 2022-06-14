# svelte + vite + typescript 实现服务端渲染的模板

## 简略介绍目前流行的同构渲染的实现逻辑

 1. 分别打包出服务端渲染所需要的内容以及客户端渲染所需要的内容
 2. 生成dom(vnode)的代码分别在服务端和客户端各执行一遍, 对比两次生成的dom(vnode)是否一致, 如果一致则客户端接管页面, 否则将拒绝接管页面, 页面进入假死状态, 这一过程称为水合, 进入假死状态则是水合失败

## 同构渲染的优缺点

 1. 对SEO友好
 2. 避免了首屏白屏情况
 3. 服务器压力相对于传统服务端渲染要小, 只有首屏需要进行服务端渲染
 4. 开发成本低 一套代码同时满足同构渲染和客户端渲染
 5. 开发难度大 相比传统服务端渲染或客户端渲染要大, 有坑要踩, 并且无法抹除(指的就是水合过程)
 6. 首屏加载慢 TTFB时间比传统服务端渲染要慢(传统服务端渲染操作的是模板字符串, 同构渲染需要计算), 但服务端采用流式渲染的话问题不大, TTI时间也比传统服务端渲染要慢(无法解决, 因为依旧需要载入客户端渲染所需要的脚本), 估会存在短暂的页面假死状态(看得见摸不着-页面渲染了, 但没办法交互), 而这个假死状态实际只是掩盖了客户端渲染的首屏白屏, 只是掩盖了页面白屏的情况而已 也就是说同构渲染实际上比传统服务端渲染和客户端渲染都慢

## 替代方案或增强功能

 1. 如果你的内容不需要针对不同用户呈现不同的内容, 或没有服务端渲染的需求, 那么使用预渲染方案会更好
 2. 在其他地方提高加载速度, 特别是资源减少, 能带来的收益很大. 或是其他优化方案
 3. 使用离线缓存, 减少二次加载成本的同时提高首屏加载速度, 离线缓存目前在客户端渲染或同构渲染中实现起来非常的方便, 传统服务端渲染实现起来较为麻烦, react18推出的边缘化渲染方案也在设法满足离线缓存需求可以关注, 如果react18边缘化渲染方案能够满足离线缓存, 那么将完全可以替代掉同构渲染.

## 使用pnpm作为包管理器

- 初始化 -> pnpm init (如果没有预先安装pnpm需要先安装pnpm 假如已经有npm则可以直接使用"npm install -g pnpm"来安装 其他安装方式参考: https://pnpm.io/installation)
- 安装包 -> pnpm add \[pkg\]
- 运行脚本 -> pnpm \[cmd\]
- 其他命令参考官网: https://pnpm.io/

## 使用vite作为打包工具

- 安装vite -> pnpm add -D vite
- (可选)安装vite模板生成插件 -> pnpm add -D vite-plugin-html

## 使用typescript作为主要开发语言

- 安装typescript(已包含tsc编译器) -> pnpm add -D typescript
- 初始化typescript配置文件tsconfig.json -> npx tsc --init
- 支持Svelte + typescript  -> pnpm add -D @tsconfig/svelte 同时配置"extends": "@tsconfig/svelte/tsconfig.json" 重启编辑器（vscode）使其安装识别需要安装插件, 避免无法识别svelte文件而报错

## 使用svelte作为主要开发框架

- 安装svelte -> pnpm add svelte
- 安装svelte的vite编译插件 -> pnpm add -D @sveltejs/vite-plugin-svelte
- 使svelte支持typescript语法 纯属个人观念, 使svelte支持typescript语法并不是必须的 个人觉得svelte文件内容应该保持简单 应该通过类型推断即可得出变量类型 而不需要显示声明 如果在意那一点编译速度的话建议就是不要加 只通过编辑器提示去处理语法问题 如果不在意则可以加并且通过esbuild去处理, 避免编译速度收到太大的影响, svelte的预处理官方推荐是使用svelte-preprocess<https://github.com/sveltejs/svelte-preprocess/blob/main/docs/preprocessing.md#typescript>链接介绍的案例是rollup处理, 所以需要额外安装esbuild 而vite内置了esbuild所以无需额外安装 使用vite.transformWithEsbuild即可

## 配置vite

- 客户端渲染 -> 参考vite.build.ts中的代码 客户端渲染的配置很简单, 首先明确的是同构渲染的客户端渲染只是在原来普通客户端渲染的基础上增添了内容而已, 客户端渲染的入口就是根目录的index.html 其余配置也并无二至, 参考vite官网很容易就能配起来, 但同构渲染的客户端渲染需要在入口文件根组件hydratable属性和打包插件svelte.compilerOptions.hydratable属性同时标识为true
- 服务端渲染 -> 首先你需要了解框架的服务端渲染是如何实现的, 然后知道vite的服务端渲染是如何操作的. svelte的服务端渲染是如果使用的是javascript是不需要编译服务端的代码的, 但由于使用了typescript甚至更多的一些预处理内容, 那么就需要编译, vite编译出服务端渲染代码的关键在于vite.createServer其等同于vite.build 一个负责编译出服务端渲染的代码, 一个负责编译出客户端渲染的代码. (await vite.createServer()).ssrLoadModule用于编译服务端代码
- 总结即使用build来编译出客户端渲染的代码 使用vite.createServer来创建服务端渲染服务后用其ssrLoadModule来加载服务端渲染的代码
- 纠正错误: vite.createServer是用来搭建开发环境的, 不是用来实现服务端渲染的, 服务端渲染依旧需要独立打包一次, 服务端渲染的关键配置是build.ssr指向服务端渲染的入口文件 参考命令: "build:server": "vite build --outDir dist/server --ssr src/entry-server.js " 和 https://cn.vitejs.dev/config/#build-ssr --ssr 实际就是配置build.ssr属性为src/entry-server.js

## faq

- 无法使用import.meta 如果你希望使用ts来写vite配置文件, 那么你需要放弃使用import.meta 因为编译器并不支持. node环境下无法运行 而且会发生冲突——假设设置module为esnext那么允许使用import.meta但不能使用import导入 假设设置module为commonjs那么就无法使用import.meta 由于vite配置是使用ts-node去编译执行的, 那么可以通过单独配置ts-node的module为commonjs解决这个问题 源代码内部则使用module为exnext 避免冲突的同时保证两边都能正常运行
- vite 模板文件, 你可以根据官网推荐的方式直接在项目根目录创建一个index.html文件, 但在使用typescript时, 脚本导入script标签的文件必须是主文件.ts而不是主文件.js 主文件.js将报错——无法找到对应的文件 对于这个别扭的设定, 可以使用vite-plugin-html插件来处理 <https://github.com/vbenjs/vite-plugin-html>
- node版本问题 不要在项目本地安装node 如果在本地安装node 如果与全局安装的node版本不对 则会报错 卸载本地安装的node即可

## 参考
 - https://github.com/jiangfengming/svelte-vite-ssr

## todo

- 开发环境实现 ✔
- 路由
- css预处理
- js版实现
