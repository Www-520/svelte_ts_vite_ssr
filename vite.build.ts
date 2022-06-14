import {
    type InlineConfig,
    build,
    createServer,
    transformWithEsbuild,
    mergeConfig,
} from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import connect from 'connect';
import http from 'http';
import fs from 'fs';
import path from 'path';

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
const IS_PROD = TARGET === 'prod';
const IS_SSR = RENDER === 'ssr';
console.log(`当前传入的环境变量: ${JSON.stringify(env, null, 4)}`);
console.log(`输出目标 ${TARGET}`);
console.log(`构建目标 ${RENDER}`);

const preprocess = sveltePreprocess({
    async typescript({ content }) {
        const { code, map } = await transformWithEsbuild(content, '', {
            loader: 'ts',
        });
        return { code, map };
    },
});

const commonConfig: InlineConfig = {
    mode: RENDER,
    cacheDir: `node_modules/.vite/${RENDER}`,
    build: {
        target: 'es2015',
        outDir: `dist/${RENDER}`,
    },
};

const csrConfig: InlineConfig = mergeConfig(commonConfig, {
    build: {
        emptyOutDir: true,
    },
    server: {
        hmr: !IS_PROD,
    },
    plugins: [
        svelte({
            preprocess,
            compilerOptions: {
                hydratable: IS_SSR,
            }, 
        }),
    ],
} as InlineConfig);

const ssrConfig: InlineConfig = mergeConfig(commonConfig, {
    build: {
        ssr: 'src/entry.ssr.ts',
    },
    plugins: [
        svelte({
            preprocess,
        }),
    ],
} as InlineConfig);

if (IS_PROD) {
    build(csrConfig);
    IS_SSR && build(ssrConfig);
} else {
    IS_SSR
        ? (async () => {
            const app = connect();
            const config = mergeConfig(csrConfig, {
                server: { middlewareMode: 'ssr' },
            });
            const vite = await createServer(config);
            app.use(vite.middlewares);
            app.use('/', async (req, res) => {
                const { url = '/' } = req;

                console.log(url);

                try {
                    const templatePath = path.resolve(__dirname, 'index.html');
                    const templateFile = fs.readFileSync(templatePath).toString('utf-8');
                    const templateVite = await vite.transformIndexHtml(url, templateFile);
                    const render = await vite.ssrLoadModule('/src/entry.ssr.ts');
                    const html = templateVite.replace('<!--ssr-outlet-->', render.default());
                    res.writeHead(200, { 'Content-Type': 'text/html' }).end(html);
                } catch (e: any) {
                    vite.ssrFixStacktrace(e);
                }
            });
            http.createServer(app).listen(3000, () => 'Server is listening on port 3000');
        })()
        : createServer(csrConfig).then(server => server.listen(3000))
}
