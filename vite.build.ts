import { InlineConfig, build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import ssr from 'vite-plugin-ssr/plugin';

interface Configs {
    readonly csr: InlineConfig[]
    readonly ssr: InlineConfig[]
}

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
console.log(`当前传入的环境变量: ${JSON.stringify(env, null, 4)}`);
console.log(`输出目标 ${TARGET}`);
console.log(`构建目标 ${RENDER}`);

const COMMON: InlineConfig = {
    build: {
        target: 'es2015',
    },
};

const configs: Configs = {
    csr: [
        {
            cacheDir: 'node_modules/.vite/csr',
            build: COMMON.build,
            plugins: [
                svelte(),
            ],
        },
    ],
    ssr: [
        {
            cacheDir: 'node_modules/.vite/ssr/client',
            build: COMMON.build,
            plugins: [
                svelte(),
            ],
        },
        {
            cacheDir: 'node_modules/.vite/ssr/server',
            build: COMMON.build,
            plugins: [
                svelte(),
                ssr(),
            ],
        },
    ],
};

configs[RENDER].forEach(config => build(config));
