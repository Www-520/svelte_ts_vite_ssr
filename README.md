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
 - 安装vite服务端渲染插件 -> pnpm add -D vite-plugin-ssr
 - (可选)安装vite模板生成插件 -> pnpm add -D vite-plugin-html

## 使用typescript作为主要开发语言
 - 安装typescript(已包含tsc编译器) -> pnpm add -D typescript
 - 初始化typescript配置文件tsconfig.json -> npx tsc --init
 - 支持Svelte + typescript  -> pnpm add -D @tsconfig/svelte 同时配置"extends": "@tsconfig/svelte/tsconfig.json" 重启编辑器（vscode）使其安装识别需要安装插件, 避免无法识别svelte文件而报错

## 使用svelte作为主要开发框架
 - 安装svelte -> pnpm add svelte
 - 安装svelte的vite编译插件 -> pnpm add -D @sveltejs/vite-plugin-svelte

## 配置vite
 - 参考vite.build.ts中的代码

## faq
 - 无法使用import.meta 如果你希望使用ts来写vite配置文件, 那么你需要放弃使用import.meta 因为编译器并不支持. node环境下无法运行 而且会发生冲突——假设设置module为esnext那么允许使用import.meta但不能使用import导入 假设设置module为commonjs那么就无法使用import.meta 这两者之前我选择了后者
 - vite 模板文件, 你可以根据官网推荐的方式直接在项目根目录创建一个index.html文件, 但在使用typescript时, 脚本导入script标签的文件必须是主文件.ts而不是主文件.js 主文件.js将报错——无法找到对应的文件 对于这个别扭的设定, 推荐使用vite-plugin-html插件来处理 https://github.com/vbenjs/vite-plugin-html
 - node版本问题 不要在项目本地安装node 如果在本地安装node 如果与全局安装的node版本不对 则会报错 卸载本地安装的node即可

## 参考
 - https://github.com/jiangfengming/svelte-vite-ssr
