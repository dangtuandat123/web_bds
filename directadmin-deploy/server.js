const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

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

app.prepare()
    .then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
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
