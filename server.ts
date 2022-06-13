import fs from 'fs';
import http from 'http';
import path from 'path';

type Types = {
    readonly html: 'text/html'
    readonly css: 'text/css'
    readonly js: 'application/javascript'
    readonly png: 'image/png'
    readonly jpg: 'image/jpg'
    readonly jpeg: 'image/jpeg'
    readonly gif: 'image/gif'
    readonly json: 'application/json'
    readonly xml: 'application/xml'
};

type TypesKey = keyof Types;

const DEBUG = true;
const DEFAULT_FILE_NAME = 'index.html';
const TYPES: Types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    json: 'application/json',
    xml: 'application/xml',
};
const CSR_DIRECTORY = './dist/csr';
const SSR_DIRECTORY = './dist/ssr/client';

createServer(8000, CSR_DIRECTORY, (req, res) => {
    const root = path.normalize(path.resolve(CSR_DIRECTORY));
    const data = fs.readFileSync(path.join(root, DEFAULT_FILE_NAME));
    res.writeHead(200, { 'Content-Type': TYPES.html });
    res.end(data);
});

createServer(8001, SSR_DIRECTORY, (req, res) => {

});

function createServer(port: number, directory: string, listener: http.RequestListener) {
    const PORT = port;
    const DIRECTORY = directory;

    const root = path.normalize(path.resolve(DIRECTORY));

    const server = http.createServer((req, res) => {
        const { method = 'get', url = '/' } = req;

        log(`${method} ${url}`);

        // 内容类型处理 -> 判断扩展名是否有效 无扩展名默认扩展名是html
        const extension = path.extname(url).slice(1) || 'html';
        if (!isType(extension)) {
            send404(res);
            return;
        }
        const type = TYPES[extension];

        // 省略HTML扩展名
        // 示例: “/index”的情况处理方式是把index当作子目录处理即“/index”处理为“/index/index.html” 而不是“/index.html”
        const fileName = url.endsWith(extension) ? url : path.join(url, DEFAULT_FILE_NAME);

        // 处理文件路径 -> 以提供的ROOT路径为根路径查找, 不得再往上查找
        const filePath = path.join(root, fileName);
        const isPathUnderRoot = path.normalize(path.resolve(filePath)).startsWith(root);
        if (!isPathUnderRoot) {
            send404(res);
            return;
        }

        try {
            const data = fs.readFileSync(filePath);
            res.writeHead(200, { 'Content-Type': type });
            res.end(data);
        } catch {
            listener(req, res);
        }
    });

    server.listen(PORT, () => log(`Server is listening on port ${PORT}`));
}

function isType(str: string): str is TypesKey {
    return str in TYPES;
}

function send404(res: http.ServerResponse) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('404: File not found');
}

function log(str: string): void {
    if (!DEBUG) return;
    console.log(str);
}
