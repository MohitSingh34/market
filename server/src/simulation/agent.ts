export enum AgentState {
    IDLE = 'IDLE',
    WANDERING = 'WANDERING',
    SEARCHING = 'SEARCHING',
    TRAVELING = 'TRAVELING',
    BUYING = 'BUYING',
    WORKING = 'WORKING',
    RESTING = 'RESTING'
}

export interface AgentData {
    id: string;
    role: 'worker' | 'consumer';
    x: number;
    y: number;
    state: AgentState;
    wallet: number;
    needs: {
        hunger: number;
        fatigue: number;
    };
    targetX?: number;
    targetY?: number;
    targetShopId?: string;
}

export class Agent {
    public data: AgentData;

    constructor(data: AgentData) {
        this.data = data;
    }

    public update(tick: number, shops: Map<string, any>, rng: () => number) {
        // Increase needs over time
        this.data.needs.hunger = Math.min(100, this.data.needs.hunger + 0.5);
        this.data.needs.fatigue = Math.min(100, this.data.needs.fatigue + 0.3);

        // FSM Logic
        switch (this.data.state) {
            case AgentState.IDLE:
                // Default to wandering now
                this.data.state = AgentState.WANDERING;
                break;
            case AgentState.WANDERING:
                this.handleWandering(tick, shops, rng);
                break;
            case AgentState.SEARCHING:
                this.handleSearching(shops, rng);
                break;
            case AgentState.TRAVELING:
                this.handleTraveling();
                break;
            case AgentState.BUYING:
                this.handleBuying(shops);
                break;
            case AgentState.WORKING:
                this.handleWorking();
                break;
            case AgentState.RESTING:
                this.handleResting();
                break;
        }
    }

    private handleWandering(tick: number, shops: Map<string, any>, rng: () => number) {
        // Change direction every 20 ticks (approx 10s at 1x speed)
        if (tick % 20 === 0 || !this.data.targetX) {
            this.data.targetX = Math.floor(rng() * 800);
            this.data.targetY = Math.floor(rng() * 600);
        }

        // Move towards target
        if (this.data.targetX && this.data.targetY) {
            const dx = this.data.targetX - this.data.x;
            const dy = this.data.targetY - this.data.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 5) {
                const speed = 2;
                this.data.x += (dx / dist) * speed;
                this.data.y += (dy / dist) * speed;
            }
        }

        // Check for nearby shops
        for (const shop of shops.values()) {
            const dist = Math.hypot(shop.x - this.data.x, shop.y - this.data.y);
            if (dist < 50) {
                // Encountered a shop!
                this.data.targetShopId = shop.id;
                this.data.targetX = shop.x;
                this.data.targetY = shop.y;
                this.data.state = AgentState.TRAVELING; // Go to center
                // console.log(`Agent ${this.data.id} encountered shop ${shop.name}`);
                break;
            }
        }
    }

    private handleIdle(shops: Map<string, any>, rng: () => number) {
        // Check if needs are high
        if (this.data.needs.hunger > 60) {
            this.data.state = AgentState.SEARCHING;
        } else if (this.data.needs.fatigue > 80) {
            this.data.state = AgentState.RESTING;
        } else {
            // Random wandering
            if (rng() > 0.95) {
                this.data.targetX = Math.floor(rng() * 800);
                this.data.targetY = Math.floor(rng() * 600);
                this.data.state = AgentState.TRAVELING;
            }
        }
    }

    private handleSearching(shops: Map<string, any>, rng: () => number) {
        // Find nearest shop
        let nearestShop: any = null;
        let minDist = Infinity;

        for (const shop of shops.values()) {
            const dist = Math.hypot(shop.x - this.data.x, shop.y - this.data.y);
            if (dist < minDist) {
                minDist = dist;
                nearestShop = shop;
            }
        }

        if (nearestShop) {
            this.data.targetX = nearestShop.x;
            this.data.targetY = nearestShop.y;
            this.data.targetShopId = nearestShop.id;
            this.data.state = AgentState.TRAVELING;
        } else {
            this.data.state = AgentState.IDLE;
        }
    }

    private handleTraveling() {
        if (!this.data.targetX || !this.data.targetY) {
            this.data.state = AgentState.IDLE;
            return;
        }

        const dx = this.data.targetX - this.data.x;
        const dy = this.data.targetY - this.data.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
            // Arrived
            this.data.x = this.data.targetX;
            this.data.y = this.data.targetY;

            if (this.data.targetShopId) {
                this.data.state = AgentState.BUYING;
            } else {
                this.data.state = AgentState.IDLE;
            }
        } else {
            // Move towards target
            const speed = 2;
            this.data.x += (dx / dist) * speed;
            this.data.y += (dy / dist) * speed;
        }
    }

    private handleBuying(shops: Map<string, any>) {
        if (!this.data.targetShopId) {
            this.data.state = AgentState.IDLE;
            return;
        }

        const shop = shops.get(this.data.targetShopId);
        if (!shop) {
            this.data.state = AgentState.IDLE;
            return;
        }

        // Find 'bread'
        const bread = shop.inventory.find((i: any) => i.itemId === 'bread');

        if (bread && bread.quantity > 0 && this.data.wallet >= bread.price) {
            // Buy
            bread.quantity--;
            shop.balance += bread.price;
            this.data.wallet -= bread.price;
            this.data.needs.hunger = Math.max(0, this.data.needs.hunger - 30);

            console.log(`Agent ${this.data.id} bought bread from ${shop.name} for ${bread.price}`);
        } else {
            // Failed to buy (out of stock or too expensive)
            console.log(`Agent ${this.data.id} failed to buy from ${shop.name}`);
        }

        this.data.targetShopId = undefined;
        this.data.state = AgentState.IDLE;
    }

    private handleWorking() {
        // Simulate working
        this.data.wallet += 5;
        this.data.needs.fatigue += 2;

        if (this.data.needs.fatigue > 90) {
            this.data.state = AgentState.RESTING;
        }
    }

    private handleResting() {
        this.data.needs.fatigue = Math.max(0, this.data.needs.fatigue - 5);

        if (this.data.needs.fatigue < 20) {
            this.data.state = AgentState.IDLE;
        }
    }
}
