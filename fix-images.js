// Script to replace all Next.js Image with standard img tags
const fs = require('fs');
const path = require('path');

const files = [
    'src/components/modules/project-card.tsx',
    'src/components/modules/news-card.tsx',
    'src/components/modules/listing-card.tsx',
    'src/components/modules/detail/image-gallery.tsx',
    'src/components/modules/chat/chat-property-card.tsx',
    'src/components/layout/header.tsx',
    'src/components/layout/footer.tsx',
    'src/components/admin/projects/project-table.tsx',
    'src/components/admin/news/news-table.tsx',
    'src/components/admin/listings/listing-table.tsx',
    'src/components/admin/image-upload.tsx',
    'src/app/(public)/tin-tuc/[slug]/page.tsx',
    'src/app/(auth)/login/page.tsx',
];

let totalFixed = 0;

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skip: ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    let changed = false;

    // Remove Image import
    if (content.includes("import Image from 'next/image'")) {
        content = content.replace(/import Image from ['"]next\/image['"]\r?\n?/g, '');
        changed = true;
    }

    // Replace <Image /> with <img />
    // Pattern 1: Self-closing Image tag with fill prop
    const fillPattern = /<Image\s+([^>]*?)fill([^>]*?)\/>/g;
    content = content.replace(fillPattern, (match, before, after) => {
        changed = true;
        // Remove fill prop, adjust className
        let attrs = (before + after)
            .replace(/\s+priority\s*/g, '')
            .replace(/className="([^"]*?)"/g, (m, classes) => {
                if (!classes.includes('absolute')) {
                    classes = 'absolute inset-0 w-full h-full ' + classes;
                }
                return `className="${classes}"`;
            });
        return `<img ${attrs}/>`;
    });

    // Pattern 2: Regular Image tag
    const regularPattern = /<Image\s+([^>]*?)\/>/g;
    content = content.replace(regularPattern, (match, attrs) => {
        changed = true;
        attrs = attrs.replace(/\s+priority\s*/g, '');
        return `<img ${attrs}/>`;
    });

    if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`✅ Fixed: ${filePath}`);
        totalFixed++;
    } else {
        console.log(`⏭️  Skip: ${filePath} (no changes needed)`);
    }
});

console.log(`\n✨ Done! Fixed ${totalFixed} files.`);
