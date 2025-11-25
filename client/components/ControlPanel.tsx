'use client';

import { useState } from 'react';

interface ControlPanelProps {
    isPaused: boolean;
    onTogglePause: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
}

export default function ControlPanel({ isPaused, onTogglePause, speed, onSpeedChange }: ControlPanelProps) {
    return (
        <div className="bg-slate-800 px-6 py-4 rounded-lg shadow-lg border border-slate-700">
            <h3 className="text-white font-semibold mb-3 text-sm">Simulation Controls</h3>

            <div className="flex flex-col gap-3">
                {/* Play/Pause */}
                <button
                    onClick={onTogglePause}
                    className={`px-4 py-2 rounded-md font-medium transition ${isPaused
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                >
                    {isPaused ? '▶ Play' : '⏸ Pause'}
                </button>

                {/* Speed Control */}
                <div>
                    <label className="text-slate-300 text-xs mb-1 block">
                        Speed: {speed}x
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="4"
                        step="0.5"
                        value={speed}
                        onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            onSpeedChange(newSpeed);
                            // Call API
                            fetch('http://localhost:3001/simulation/speed', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ speed: newSpeed }),
                            }).catch(err => console.error('Failed to set speed:', err));
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0.5x</span>
                        <span>4x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
