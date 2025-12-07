import { PrismaClient } from '@prisma/client';
import { VectorStore } from '../src/lib/ai/vector-store';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('--- STARTING DIAGNOSTIC ---');

    // 1. Check Environment Variables
    console.log('\n1. Checking Environment Variables...');
    const requiredVars = ['DATABASE_URL', 'OPENROUTER_API_KEY'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
        console.error('❌ Missing Environment Variables:', missingVars.join(', '));
    } else {
        console.log('✅ All required environment variables present.');
        console.log('   OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY?.slice(0, 10) + '...');
    }

    // 2. Check Prisma (MySQL) Connection
    console.log('\n2. Checking Prisma (MySQL) Connection...');
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully.');
        const userCount = await prisma.user.count();
        console.log(`   Database has ${userCount} users.`);
    } catch (error) {
        console.error('❌ Prisma connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }

    // 3. Check Vector Store (SQLite)
    console.log('\n3. Checking Vector Store (SQLite)...');
    try {
        const vectorStore = new VectorStore();
        const results = await vectorStore.similaritySearch('test', 1);
        console.log('✅ Vector Store queried successfully.');
        console.log('   Query result count:', results.length);
    } catch (error) {
        console.error('❌ Vector Store query failed:', error);
    }

    console.log('\n--- DIAGNOSTIC COMPLETE ---');
}

main().catch(console.error);
