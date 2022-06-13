import type { InlineConfig } from 'vite';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

interface Env {
    TARGET: 'test' | 'prod' | undefined
    RENDER: 'ssr' | 'csr' | undefined
}

const env = process
 .argv
 .slice(2)
 .reduce((a, b) => {
    const [key, value] = b.slice(2).split('=');
    return { ...a, [key]: value };
 }, {}) as Env;
const DEFAULT_TARGET = 'prod';
const DEFAULT_RENDER = 'csr'; 
const { TARGET = DEFAULT_TARGET, RENDER = DEFAULT_RENDER } = env;
const IS_SSR = RENDER === 'ssr';
console.log(`当前传入的环境变量: ${JSON.stringify(env, null, 4)}`);
console.log(`输出目标 ${TARGET}`);
console.log(`构建目标 ${RENDER}`);

const configs: InlineConfig[] = [];

const cacheDir = `node_modules/.vite/${RENDER}`;
const outDir = `dist/${RENDER}`;
configs.push({
    mode: RENDER,
    cacheDir,
    build: {
        target: 'es2015',
        outDir,
        emptyOutDir: true,
        ssrManifest: IS_SSR,
    },
    plugins: [
        svelte(),
    ],
});

configs.forEach(config => build(config));
