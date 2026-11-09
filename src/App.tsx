import React, { useState } from 'react';
import { DeviceSimulator, DeviceMode } from './components/DeviceSimulator';
import { Header } from './components/Header';
import { WorkshopsSection } from './components/WorkshopsSection';
import { InnovationSection } from './components/InnovationSection';
import { Footer } from './components/Footer';

export default function App() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('responsive');

  // Container sizing based on device simulation mode
  const getDeviceContainerStyle = () => {
    switch (deviceMode) {
      case 'tablet':
        return 'max-w-[768px] mx-auto my-6 border border-neutral-700/60 rounded-3xl shadow-2xl overflow-hidden ring-12 ring-neutral-900/80';
      case 'mobile-lg':
        return 'max-w-[390px] mx-auto my-6 border border-neutral-700/60 rounded-[38px] shadow-2xl overflow-hidden ring-12 ring-neutral-900/80';
      case 'mobile-sm':
        return 'max-w-[360px] mx-auto my-6 border border-neutral-700/60 rounded-[32px] shadow-2xl overflow-hidden ring-10 ring-neutral-900/80';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-white flex flex-col font-sans selection:bg-neutral-200 selection:text-black">
      {/* Top Device Simulator bar for rapid testing across all mobile & tablet viewports */}
      <DeviceSimulator currentMode={deviceMode} onChangeMode={setDeviceMode} />

      {/* Main Viewport Container (fluid or simulated device wrapper) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${getDeviceContainerStyle()}`}>
        {/* Device Header notch simulation if in mobile mode */}
        {deviceMode !== 'responsive' && (
          <div className="bg-[#11131a] py-2 px-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-white/10 select-none">
            <span className="font-semibold text-white">
              {deviceMode === 'tablet' ? 'iPad Air (768 × 1024)' : 'iPhone 15 Pro (390 × 844)'}
            </span>
            <span className="text-emerald-400">&bull; Active Viewport Test</span>
          </div>
        )}

        <Header />

        <main className="flex-1 w-full flex flex-col">
          {/* S.03 WORKSHOPS SECTION: Exact functionality and design from the video */}
          <WorkshopsSection />

          {/* S.02 INNOVATION & SECTORS: Exact functionality from image_9b0a86a8.png with same-line labels */}
          <InnovationSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
