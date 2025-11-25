'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';
import AddShopModal from './AddShopModal';
import ControlPanel from './ControlPanel';

interface Agent {
    id: string;
    x: number;
    y: number;
    role: string;
    state?: string;
}

interface Shop {
    id: string;
    name: string;
    x: number;
    y: number;
    type: string;
}

export default function MapCanvas() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [tick, setTick] = useState(0);
    const [showAddShop, setShowAddShop] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [speed, setSpeed] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [wsStatus, setWsStatus] = useState('Connecting...');
    const wsRef = useRef<WebSocket | null>(null);

    // Handle window resize
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        // Fetch initial state
        fetch('http://localhost:3001/shops')
            .then(res => res.json())
            .then(data => setShops(data))
            .catch(err => console.error('Failed to fetch shops:', err));

        fetch('http://localhost:3001/agents')
            .then(res => res.json())
            .then(data => setAgents(data))
            .catch(err => console.error('Failed to fetch agents:', err));

        // Connect to WebSocket
        const ws = new WebSocket('ws://localhost:3001/realtime');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setWsStatus('Connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // ... (rest of logic)
            if (data.type === 'initial_state') {
                setTick(data.tick);
                setAgents(data.agents);
                setShops(data.shops);
            } else if (data.type === 'tick') {
                setTick(data.tick);
                if (data.agents) {
                    setAgents(prev => {
                        const updated = [...prev];
                        data.agents.forEach((update: any) => {
                            const idx = updated.findIndex(a => a.id === update.id);
                            if (idx >= 0) {
                                updated[idx] = { ...updated[idx], ...update };
                            }
                        });
                        return updated;
                    });
                }
            } else if (data.type === 'shop_added') {
                setShops(prev => [...prev, data.shop]);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setWsStatus('Error');
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setWsStatus('Disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    const handleAddShop = (shop: Shop) => {
        // Shop will be added via WebSocket broadcast
        console.log('Shop added:', shop);
    };

    const handleTogglePause = () => {
        setIsPaused(!isPaused);
        // TODO: Implement API call for pause/resume
    };

    return (
        <div className="relative w-full h-screen bg-slate-900">
            {/* Header */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-700">
                        <p className="text-white font-mono text-sm">
                            <span className="text-slate-400">Tick:</span> <span className="text-green-400 font-bold">{tick}</span>
                        </p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-700">
                        <p className="text-white font-mono text-sm">
                            <span className="text-slate-400">Agents:</span> <span className="text-blue-400 font-bold">{agents.length}</span>
                        </p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-700">
                        <p className="text-white font-mono text-sm">
                            <span className="text-slate-400">Shops:</span> <span className="text-purple-400 font-bold">{shops.length}</span>
                        </p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-700">
                        <p className="text-white font-mono text-sm">
                            <span className="text-slate-400">WS:</span> <span className={`font-bold ${wsStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>{wsStatus}</span>
                        </p>
                    </div>
                </div>

                {/* Control Panel */}
                <ControlPanel
                    isPaused={isPaused}
                    onTogglePause={handleTogglePause}
                    speed={speed}
                    onSpeedChange={setSpeed}
                />
            </div>

            {/* Add Shop Button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setShowAddShop(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Add Shop
                </button>
            </div>

            {/* Canvas */}
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    {/* Render Shops */}
                    {shops.map(shop => (
                        <React.Fragment key={shop.id}>
                            <Rect
                                x={shop.x}
                                y={shop.y}
                                width={50}
                                height={50}
                                fill="#3b82f6"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                cornerRadius={6}
                                shadowColor="black"
                                shadowBlur={10}
                                shadowOpacity={0.3}
                            />
                            <Text
                                x={shop.x}
                                y={shop.y + 55}
                                text={shop.name}
                                fontSize={12}
                                fill="#ffffff"
                                width={100}
                                align="center"
                                offsetX={25}
                            />
                        </React.Fragment>
                    ))}

                    {/* Render Agents */}
                    {agents.map(agent => (
                        <Circle
                            key={agent.id}
                            x={agent.x}
                            y={agent.y}
                            radius={6}
                            fill={agent.role === 'worker' ? '#10b981' : '#f59e0b'}
                            shadowColor={agent.role === 'worker' ? '#10b981' : '#f59e0b'}
                            shadowBlur={8}
                            shadowOpacity={0.6}
                        />
                    ))}
                </Layer>
            </Stage>

            {/* Add Shop Modal */}
            {showAddShop && (
                <AddShopModal
                    onClose={() => setShowAddShop(false)}
                    onAdd={handleAddShop}
                />
            )}
        </div>
    );
}
