import fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { SimulationEngine } from './simulation/engine';
import { PrismaClient } from '@prisma/client';

const server = fastify({ logger: true });
const prisma = new PrismaClient();

server.register(cors);
server.register(websocket);

const engine = new SimulationEngine();

server.get('/', async (request, reply) => {
    return { status: 'ok', tick: engine.currentTick };
});

server.register(async function (fastify) {
    fastify.get('/realtime', { websocket: true }, (connection: any, req: any) => {
        console.log('WebSocket connection received. Keys:', Object.keys(connection));
        if (!connection.socket) {
            console.error('Connection.socket is undefined!');
            return;
        }
        engine.addClient(connection);
        connection.socket.on('close', () => {
            engine.removeClient(connection);
        });
    });
});

// API Routes
server.get('/shops', async (request, reply) => {
    const shops = await prisma.shop.findMany();
    return shops;
});

server.post('/shops', async (request, reply) => {
    const body = request.body as any;
    const shop = await prisma.shop.create({
        data: {
            name: body.name,
            type: body.type,
            x: body.position.x,
            y: body.position.y,
            balance: body.balance || 1000,
            inventory: {
                create: {
                    itemId: 'bread',
                    quantity: 50,
                    price: 50
                }
            }
        },
        include: {
            inventory: true
        }
    });

    // Notify engine of new shop
    engine.addShop(shop);

    return shop;
});

server.get('/agents', async (request, reply) => {
    const agents = await prisma.agent.findMany();
    return agents;
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Server running on http://localhost:3001');
        await engine.start();
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
