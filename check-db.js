const { PrismaClient } = require('@prisma/client');

async function checkDB() {
    const prisma = new PrismaClient();

    try {
        // Check projects
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                status: true,
                slug: true
            }
        });

        console.log('=== DATABASE CHECK ===');
        console.log(`Total Projects: ${projects.length}\n`);

        projects.forEach(p => {
            console.log(`- ID ${p.id}: ${p.name} (${p.type}, ${p.status})`);
            console.log(`  Slug: ${p.slug}`);
        });

        // Check listings
        const listings = await prisma.listing.findMany({
            select: {
                id: true,
                title: true,
                type: true,
                status: true
            }
        });

        console.log(`\nTotal Listings: ${listings.length}\n`);

        listings.slice(0, 5).forEach(l => {
            console.log(`- ID ${l.id}: ${l.title} (${l.type}, ${l.status})`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDB();
