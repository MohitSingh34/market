'use client';

import { useState } from 'react';

interface AddShopModalProps {
    onClose: () => void;
    onAdd: (shop: any) => void;
}

export default function AddShopModal({ onClose, onAdd }: AddShopModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState('general');
    const [x, setX] = useState(400);
    const [y, setY] = useState(300);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const shopData = {
            name,
            type,
            position: { x, y },
            balance: 5000,
        };

        try {
            const response = await fetch('http://localhost:3001/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shopData),
            });

            const shop = await response.json();
            onAdd(shop);
            onClose();
        } catch (error) {
            console.error('Failed to create shop:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">Add New Shop</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Shop Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Sharma Bhojanalay"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="general">General Store</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="supplier">Supplier</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                X Position
                            </label>
                            <input
                                type="number"
                                value={x}
                                onChange={(e) => setX(parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Y Position
                            </label>
                            <input
                                type="number"
                                value={y}
                                onChange={(e) => setY(parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Add Shop
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
