import { PrismaClient } from '@prisma/client';
import seedrandom from 'seedrandom';
import { Agent, AgentState } from './agent';

const TICK_RATE = 500; // ms



export class SimulationEngine {
    public currentTick: number = 0;
    private running: boolean = false;
    private clients: Set<any> = new Set();
    private prisma: PrismaClient;
    private rng: seedrandom.PRNG;
    private agents: Map<string, Agent> = new Map();
    private shops: Map<string, any> = new Map();
    private tickRate: number = 500;
    private baseTickRate: number = 500;

    constructor(seed: string = '12345') {
        this.prisma = new PrismaClient();
        this.rng = seedrandom(seed);
    }

    public setSpeed(speed: number) {
        // Speed 1x = 500ms
        // Speed 2x = 250ms
        // Speed 0.5x = 1000ms
        this.tickRate = this.baseTickRate / speed;
        console.log(`Simulation speed set to ${speed}x (Tick rate: ${this.tickRate}ms)`);
    }

    public async start() {
        if (this.running) return;

        // Load initial state from DB
        await this.loadState();

        this.running = true;
        this.loop().catch(err => console.error('Simulation loop failed:', err));
    }

    public stop() {
        this.running = false;
    }

    public addClient(connection: any) {
        console.log('Adding client. Total clients:', this.clients.size + 1);
        this.clients.add(connection);
        // Send initial state to new client
        this.sendInitialState(connection);
    }

    public removeClient(connection: any) {
        console.log('Removing client. Total clients:', this.clients.size - 1);
        this.clients.delete(connection);
    }

    public addShop(shop: any) {
        this.shops.set(shop.id, shop);
        this.broadcast({ type: 'shop_added', shop });
    }

    private async loadState() {
        // Load agents from DB
        const agentsData = await this.prisma.agent.findMany();
        for (const agentData of agentsData) {
            const agent = new Agent({
                id: agentData.id,
                role: agentData.role as 'worker' | 'consumer',
                x: agentData.x,
                y: agentData.y,
                state: agentData.state as AgentState,
                wallet: agentData.wallet,
                needs: {
                    hunger: agentData.hunger,
                    fatigue: agentData.fatigue,
                }
            });
            this.agents.set(agent.data.id, agent);
        }

        // Load shops from DB with inventory
        const shopsData = await this.prisma.shop.findMany({
            include: { inventory: true }
        });
        for (const shop of shopsData) {
            this.shops.set(shop.id, shop);
        }

        console.log(`Loaded ${this.agents.size} agents and ${this.shops.size} shops`);
    }

    private sendInitialState(connection: any) {
        const state = {
            type: 'initial_state',
            tick: this.currentTick,
            agents: Array.from(this.agents.values()).map(a => a.data),
            shops: Array.from(this.shops.values()),
        };

        if (connection.socket.readyState === 1) {
            connection.socket.send(JSON.stringify(state));
        }
    }

    private async loop() {
        if (!this.running) return;

        const start = Date.now();

        try {
            await this.tick();
        } catch (error) {
            console.error('Error in simulation tick:', error);
        }

        const elapsed = Date.now() - start;
        const delay = Math.max(0, this.tickRate - elapsed);

        setTimeout(() => this.loop(), delay);
    }

    private async tick() {
        this.currentTick++;

        // 1. Update Shops (Auto-restock & Price Dynamics)
        this.updateShops();

        // 2. Update Agents
        const agentUpdates: any[] = [];
        for (const agent of this.agents.values()) {
            agent.update(this.currentTick, this.shops, () => this.rng());
            agentUpdates.push({
                id: agent.data.id,
                x: agent.data.x,
                y: agent.data.y,
                state: agent.data.state,
            });
        }

        // 3. Broadcast State
        this.broadcast({
            type: 'tick',
            tick: this.currentTick,
            agents: agentUpdates,
            shops: Array.from(this.shops.values()), // Broadcast shop updates (inventory/price)
        });
    }

    private updateShops() {
        for (const shop of this.shops.values()) {
            // Check inventory for 'bread'
            let bread = shop.inventory.find((i: any) => i.itemId === 'bread');

            if (!bread) {
                // Initialize if missing (shouldn't happen with seeded data but good for safety)
                bread = { itemId: 'bread', quantity: 0, price: 50 };
                shop.inventory.push(bread);
            }

            // Auto-restock if low
            if (bread.quantity < 10) {
                const restockAmount = 50;
                const cost = restockAmount * 20; // Wholesale cost
                if (shop.balance >= cost) {
                    bread.quantity += restockAmount;
                    shop.balance -= cost;
                    // console.log(`Shop ${shop.name} restocked bread. Balance: ${shop.balance}`);
                }
            }

            // Price Dynamics (Simple Supply/Demand)
            // Base price 50. 
            // If quantity < 20, price increases.
            // If quantity > 80, price decreases.
            const basePrice = 50;
            if (bread.quantity < 20) {
                bread.price = Math.min(100, bread.price + 1);
            } else if (bread.quantity > 80) {
                bread.price = Math.max(10, bread.price - 1);
            } else {
                // Tend towards base price
                if (bread.price > basePrice) bread.price -= 0.5;
                if (bread.price < basePrice) bread.price += 0.5;
            }
        }
    }

    private broadcast(data: any) {
        const msg = JSON.stringify(data);
        if (this.clients.size > 0) {
            // console.log(`Broadcasting to ${this.clients.size} clients`);
        }
        for (const client of this.clients) {
            if (client.socket.readyState === 1) {
                client.socket.send(msg);
            } else {
                console.log(`Client socket not open: ${client.socket.readyState}`);
            }
        }
    }
}
