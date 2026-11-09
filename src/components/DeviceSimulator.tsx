import React from 'react';
import { Monitor, Tablet, Smartphone, Maximize2, RotateCw } from 'lucide-react';

export type DeviceMode = 'responsive' | 'tablet' | 'mobile-lg' | 'mobile-sm';

interface DeviceSimulatorProps {
  currentMode: DeviceMode;
  onChangeMode: (mode: DeviceMode) => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  currentMode,
  onChangeMode,
}) => {
  return (
    <div className="bg-[#10131c] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-neutral-300 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-mono font-medium text-neutral-200">DEVICE AUDIT & RESPONSIVE SIMULATOR</span>
      </div>

      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
        <button
          type="button"
          onClick={() => onChangeMode('responsive')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            currentMode === 'responsive'
              ? 'bg-white/20 text-white font-medium shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Fluid 100% full screen"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode('tablet')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            currentMode === 'tablet'
              ? 'bg-white/20 text-white font-medium shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="iPad / Tablet viewport (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablet (768px)</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode('mobile-lg')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
            currentMode === 'mobile-lg'
              ? 'bg-white/20 text-white font-medium shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="iPhone 15 / Modern Mobile (390px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile (390px)</span>
        </button>
      </div>
    </div>
  );
};
