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

const configs: Configs = {
    csr: [
        {
            cacheDir: 'node_modules/.vite/csr',
            build: {
                target: 'es2015',
                outDir: 'dist/csr',
                emptyOutDir: true,
            },
            plugins: [
                svelte(),
            ],
        },
    ],
    ssr: [
        {
            cacheDir: 'node_modules/.vite/ssr/client',
            build: {
                target: 'es2015',
                outDir: 'dist/ssr/client',
                emptyOutDir: true,
            },
            plugins: [
                svelte(),
            ],
        },
        {
            cacheDir: 'node_modules/.vite/ssr/server',
            build: {
                target: 'es2015',
                outDir: 'dist/ssr',
                emptyOutDir: true,
                ssr: 'src/entry.ssr.server.ts',
            },
            plugins: [
                svelte({
                    compilerOptions: {
                        hydratable: true,
                    },
                }),
                ssr(),
            ],
        },
    ],
};

configs[RENDER].forEach(config => build(config));
