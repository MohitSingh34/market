import { PrismaClient } from '@prisma/client';
import seedrandom from 'seedrandom';
import { parseArgs } from 'node:util';

const prisma = new PrismaClient();

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2),
        options: {
            seed: { type: 'string', default: '12345' },
            agents: { type: 'string', default: '200' },
            shops: { type: 'string', default: '10' },
        },
    });

    const seed = values.seed!;
    const numAgents = parseInt(values.agents!);
    const numShops = parseInt(values.shops!);

    console.log(`Seeding with seed: ${seed}, Agents: ${numAgents}, Shops: ${numShops}`);

    const rng = seedrandom(seed);

    // Clear DB
    await prisma.transaction.deleteMany();
    await prisma.shopItem.deleteMany();
    await prisma.agentItem.deleteMany();
    await prisma.itemComponent.deleteMany();
    await prisma.item.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.shop.deleteMany();

    // 1. Create Items
    const items = [
        { id: 'wheat', name: 'Wheat', baseCost: 5, basePrice: 10 },
        { id: 'flour', name: 'Flour', baseCost: 15, basePrice: 25, components: { wheat: 2 } },
        { id: 'bread', name: 'Bread', baseCost: 30, basePrice: 50, components: { flour: 1 } },
    ];

    for (const item of items) {
        await prisma.item.create({
            data: {
                id: item.id,
                name: item.name,
                baseCost: item.baseCost,
                basePrice: item.basePrice,
            }
        });
    }

    // 2. Create Shops
    for (let i = 0; i < numShops; i++) {
        await prisma.shop.create({
            data: {
                name: `Shop ${i + 1}`,
                type: 'general',
                x: Math.floor(rng() * 800),
                y: Math.floor(rng() * 600),
                balance: 1000,
            }
        });
    }

    // 3. Create Agents
    for (let i = 0; i < numAgents; i++) {
        await prisma.agent.create({
            data: {
                role: rng() > 0.5 ? 'worker' : 'consumer',
                x: Math.floor(rng() * 800),
                y: Math.floor(rng() * 600),
                wallet: 100,
                hunger: Math.floor(rng() * 50),
                fatigue: Math.floor(rng() * 50),
            }
        });
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
