import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, ContactShadows, RoundedBox, Html } from '@react-three/drei';
import { calculateTax } from './TaxLogic';
import { motion } from 'framer-motion';

const IsometricBar = ({ amount, color, position, label, value }) => {
  // Scale height based on amount, keeping a minimum visual height
  const height = Math.max(amount / 12000, 0.15);

  return (
    <group position={[position[0], 0, position[2]]}>
      <RoundedBox
        args={[1.4, height, 1.4]} // Width, Height, Depth
        radius={0.15}
        smoothness={4}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </RoundedBox>

      {/* Crisp HTML labels floating above the bars */}
      <Html position={[0, height + 0.4, 0]} center zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center pointer-events-none drop-shadow-lg min-w-[120px]">
          <span className="text-sm font-semibold tracking-wide text-slate-300">{label}</span>
          <span className="text-lg font-mono font-bold text-white">${Math.round(value).toLocaleString()}</span>
        </div>
      </Html>
    </group>
  );
};

export default function App() {
  const [income, setIncome] = useState(75000);
  const [province, setProvince] = useState('ON');

  const results = useMemo(() => calculateTax(income, province), [income, province]);

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* UI Panel */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-96 p-8 bg-slate-900 border-r border-slate-800 z-10 flex flex-col gap-8 shadow-2xl"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            TaxViz Canada
          </h1>
          <p className="text-slate-400 text-sm font-medium">Static Isometric Projection</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-300 mb-4">
              <span>Gross Income</span>
              <span className="text-white font-mono">${income.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="20000"
              max="300000"
              step="1000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="flex gap-3 bg-slate-800/50 p-1.5 rounded-lg">
            {['ON', 'BC'].map(p => (
              <button
                key={p}
                onClick={() => setProvince(p)}
                className={`flex-1 py-2.5 rounded-md transition-all text-sm font-bold ${
                  province === p
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {p === 'ON' ? 'Ontario' : 'British Columbia'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-8 border-t border-slate-800/50">
          <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Effective Tax Rate</span>
            <span className="font-mono text-xl text-orange-400 font-bold">{results.marginalRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Total Tax Paid</span>
            <span className="font-mono text-xl text-slate-300 font-bold">${Math.round(results.totalTax).toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* 3D Canvas area - Functions as a static isometric 2.5D visualizer */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-950">
        <Canvas shadows>
          {/* Orthographic Camera creates the isometric "infographic" look */}
          <OrthographicCamera
            makeDefault
            position={[10, 10, 10]}
            zoom={55}
            near={-100}
            far={100}
          />

          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Offset group to center the visualizer */}
          <group position={[0, -1.5, 0]}>
            {/* Net Pay Pillar */}
            <IsometricBar
              amount={results.takeHome}
              color="#10b981" // Emerald
              position={[-2.2, 0, 2.2]}
              label="Net Pay"
              value={results.takeHome}
            />

            {/* Federal Tax Pillar */}
            <IsometricBar
              amount={results.federal}
              color="#6366f1" // Indigo
              position={[0, 0, 0]}
              label="Federal Tax"
              value={results.federal}
            />

            {/* Provincial Tax Pillar */}
            <IsometricBar
              amount={results.provincial}
              color="#a855f7" // Purple
              position={[2.2, 0, -2.2]}
              label="Provincial Tax"
              value={results.provincial}
            />

            {/* Soft ground shadow for grounded infographic feel */}
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.6}
              scale={20}
              blur={2.5}
              far={4}
              color="#000000"
            />
          </group>
        </Canvas>
      </div>
    </div>
  );
}