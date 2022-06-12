/// <reference types="vite/client" />

interface ImportMetaEnv {
    // 更多环境变量...
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}
