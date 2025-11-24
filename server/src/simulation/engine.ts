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

    constructor(seed: string = '12345') {
        this.prisma = new PrismaClient();
        this.rng = seedrandom(seed);
    }

    public async start() {
        if (this.running) return;

        // Load initial state from DB
        await this.loadState();

        this.running = true;
        this.loop();
    }

    public stop() {
        this.running = false;
    }

    public addClient(connection: any) {
        this.clients.add(connection);
        // Send initial state to new client
        this.sendInitialState(connection);
    }

    public removeClient(connection: any) {
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

        // Load shops from DB
        const shopsData = await this.prisma.shop.findMany();
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

        await this.tick();

        const elapsed = Date.now() - start;
        const delay = Math.max(0, TICK_RATE - elapsed);

        setTimeout(() => this.loop(), delay);
    }

    private async tick() {
        this.currentTick++;

        // 1. Update Agents
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

        // 2. Broadcast State
        this.broadcast({
            type: 'tick',
            tick: this.currentTick,
            agents: agentUpdates,
        });
    }

    private broadcast(data: any) {
        const msg = JSON.stringify(data);
        for (const client of this.clients) {
            if (client.socket.readyState === 1) {
                client.socket.send(msg);
            }
        }
    }
}
