# Simulation Engine Design

## Core Loop
The simulation runs on a discrete tick system.
- **Tick Duration**: 500ms (configurable).
- **Determinism**: All random numbers are generated via a seeded PRNG (e.g., `seedrandom`).
- **Execution Order**:
    1. Process System Events (e.g., "Add Shop", "Scenario Event").
    2. Update Agent States (FSM transitions).
    3. Resolve Agent Movements.
    4. Resolve Transactions (Market matching).
    5. Update Shop Logic (Restock, Price adjustment).
    6. Flush State Diffs to Broadcaster.

## Agent FSM
Agents are modeled as Finite State Machines.

| State | Trigger | Next State | Action |
| :--- | :--- | :--- | :--- |
| `IDLE` | `needs > threshold` | `SEARCHING` | Determine need (Food, Rest, Work) |
| `SEARCHING` | `found_shop` | `TRAVELING` | Pathfind to shop |
| `SEARCHING` | `no_shop` | `IDLE` | Wait / Wander |
| `TRAVELING` | `arrived_at_dest` | `BUYING` / `WORKING` | - |
| `BUYING` | `transaction_ok` | `IDLE` / `CONSUMING` | Deduct money, add item |
| `WORKING` | `shift_end` | `IDLE` | Earn money, increase fatigue |
| `RESTING` | `fatigue == 0` | `IDLE` | - |

**Agent Fields**:
- `id`: UUID
- `role`: "worker" | "consumer"
- `wallet`: Float
- `needs`: { `hunger`: 0-100, `fatigue`: 0-100 }
- `location`: { `x`: int, `y`: int }
- `state`: Enum (as above)
- `inventory`: List<Item>

## Market Logic

### Item Model
- `id`: string (e.g., "burger")
- `base_cost`: float
- `base_price`: float
- `components`: List<{itemId, qty}> (for crafting)
- `perishability`: ticks (optional)

### Price Dynamics
Simple elasticity model:
$$ P_{new} = P_{base} \times (1 + \alpha \times \frac{Demand - Supply}{\max(1, Supply)}) $$
- `alpha`: Sensitivity coefficient (e.g., 0.1).
- `Demand`: Sales in last N ticks.
- `Supply`: Current inventory.

### Auto-Restock
If `inventory[item] < reorder_threshold`:
- Create `PurchaseOrder`.
- Qty = $\max(batch\_size, avg\_sales \times lead\_time)$.

## Pathfinding
- **Grid**: The map is a 2D grid.
- **Algorithm**: BFS or A* (Manhattan distance heuristic).
- **Optimization**: Agents only recalculate path if target moves or blocked.
