'use client';

import dynamic from 'next/dynamic';

const MapCanvas = dynamic(() => import('@/components/MapCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">Loading Market Simulation...</div>
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <MapCanvas />
    </main>
  );
}
