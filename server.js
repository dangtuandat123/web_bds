const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// MIME types for static files
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

const app = next({
    dev,
    hostname,
    port,
    dir: __dirname
});

const handle = app.getRequestHandler();

console.log('🚀 Starting Next.js server...');
console.log(`   Environment: ${dev ? 'development' : 'production'}`);
console.log(`   Port: ${port}`);
console.log(`   Hostname: ${hostname}`);

// Serve static files from /uploads with proper MIME types
function serveStaticFile(req, res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.end('Not found');
            return;
        }
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
        res.statusCode = 200;
        res.end(data);
    });
}

app.prepare()
    .then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                const pathname = parsedUrl.pathname || '';

                // Handle /uploads/* requests with proper MIME types
                if (pathname.startsWith('/uploads/')) {
                    // SECURITY: Prevent path traversal attacks
                    const uploadsDir = path.join(__dirname, 'public', 'uploads');
                    const relativePath = pathname.replace(/^\/uploads\//, '');
                    const filePath = path.resolve(uploadsDir, relativePath);

                    // Ensure the resolved path is within the uploads directory
                    if (!filePath.startsWith(uploadsDir)) {
                        res.statusCode = 403;
                        res.end('Forbidden');
                        return;
                    }

                    if (fs.existsSync(filePath)) {
                        return serveStaticFile(req, res, filePath);
                    }
                }

                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('❌ Error occurred handling request:', req.url, err);
                res.statusCode = 500;
                res.end('Internal server error');
            }
        }).listen(port, hostname, (err) => {
            if (err) {
                console.error('❌ Failed to start server:', err);
                throw err;
            }
            console.log(`✅ Server ready on http://${hostname}:${port}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to prepare Next.js:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📛 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📛 SIGINT signal received: closing HTTP server');
    process.exit(0);
});
