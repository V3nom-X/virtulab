import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WaveType {
  name: string;
  wavelengthRange: string;
  frequencyRange: string;
  color: string;
  gradient: string;
  applications: string[];
  description: string;
}

const emSpectrum: WaveType[] = [
  {
    name: 'Radio Waves',
    wavelengthRange: '> 1 m',
    frequencyRange: '< 300 MHz',
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-violet-400',
    applications: ['Radio broadcasting', 'TV signals', 'Wireless communication', 'Radar'],
    description: 'Longest wavelength EM waves, used for long-distance communication and broadcasting.'
  },
  {
    name: 'Microwaves',
    wavelengthRange: '1 mm - 1 m',
    frequencyRange: '300 MHz - 300 GHz',
    color: '#6366F1',
    gradient: 'from-indigo-600 to-indigo-400',
    applications: ['Microwave ovens', 'Satellite communication', 'WiFi', '5G networks'],
    description: 'Used for cooking, communication satellites, and wireless networking.'
  },
  {
    name: 'Infrared',
    wavelengthRange: '700 nm - 1 mm',
    frequencyRange: '300 GHz - 430 THz',
    color: '#EF4444',
    gradient: 'from-red-700 to-red-500',
    applications: ['Thermal imaging', 'Remote controls', 'Heat lamps', 'Night vision'],
    description: 'Felt as heat, used in thermal cameras and remote control devices.'
  },
  {
    name: 'Visible Light',
    wavelengthRange: '400 - 700 nm',
    frequencyRange: '430 - 750 THz',
    color: '#22C55E',
    gradient: 'from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500',
    applications: ['Vision', 'Photography', 'Fiber optics', 'Displays'],
    description: 'The only part of the spectrum visible to human eyes, comprising all colors of the rainbow.'
  },
  {
    name: 'Ultraviolet',
    wavelengthRange: '10 - 400 nm',
    frequencyRange: '750 THz - 30 PHz',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-400',
    applications: ['Sterilization', 'Black lights', 'Vitamin D synthesis', 'Forensics'],
    description: 'Higher energy than visible light, causes sunburn but also helps produce vitamin D.'
  },
  {
    name: 'X-Rays',
    wavelengthRange: '0.01 - 10 nm',
    frequencyRange: '30 PHz - 30 EHz',
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-cyan-300',
    applications: ['Medical imaging', 'Security scanners', 'Crystallography', 'CT scans'],
    description: 'High energy waves that can penetrate soft tissue but not bone or metal.'
  },
  {
    name: 'Gamma Rays',
    wavelengthRange: '< 0.01 nm',
    frequencyRange: '> 30 EHz',
    color: '#EC4899',
    gradient: 'from-pink-600 to-pink-400',
    applications: ['Cancer treatment', 'Sterilization', 'Astronomy', 'Nuclear imaging'],
    description: 'Highest energy EM waves, produced by radioactive decay and cosmic events.'
  }
];

export function EMSpectrumVisualization() {
  const [selectedWave, setSelectedWave] = useState<WaveType | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Electromagnetic Spectrum</h2>
          <p className="text-muted-foreground text-sm">
            Click on any wave type to learn more about its properties and applications
          </p>
        </div>

        {/* Spectrum visualization */}
        <div className="relative">
          {/* Wavelength scale */}
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Longer wavelength →</span>
            <span>← Shorter wavelength</span>
          </div>

          {/* Main spectrum bar */}
          <div className="flex h-24 rounded-xl overflow-hidden shadow-lg">
            {emSpectrum.map((wave, index) => (
              <button
                key={wave.name}
                className={`flex-1 relative transition-all duration-300 ${
                  hoveredIndex === index ? 'flex-[1.5]' : ''
                } ${selectedWave?.name === wave.name ? 'ring-2 ring-white ring-inset' : ''}`}
                style={{ 
                  background: wave.name === 'Visible Light' 
                    ? 'linear-gradient(to right, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #8B5CF6)'
                    : wave.color
                }}
                onClick={() => setSelectedWave(wave)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-white font-medium text-xs md:text-sm drop-shadow-md transition-opacity ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-70'
                  }`}>
                    {wave.name.split(' ')[0]}
                  </span>
                </div>
                
                {/* Animated wave overlay */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent ${10 + index * 2}px,
                          rgba(255,255,255,0.3) ${10 + index * 2}px,
                          rgba(255,255,255,0.3) ${12 + index * 2}px
                        )`,
                        animation: 'wave-move 2s linear infinite'
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Frequency scale */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>← Lower frequency</span>
            <span>Higher frequency →</span>
          </div>

          {/* Energy indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Lower Energy</span>
            <div className="h-2 w-48 rounded-full bg-gradient-to-r from-violet-500 via-green-500 to-pink-500" />
            <span className="text-xs text-muted-foreground">Higher Energy</span>
          </div>
        </div>

        {/* Selected wave details */}
        {selectedWave && (
          <Card className="border-2" style={{ borderColor: selectedWave.color }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Wave properties */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: selectedWave.color }}
                    />
                    <h3 className="text-xl font-bold">{selectedWave.name}</h3>
                  </div>
                  
                  <p className="text-muted-foreground">{selectedWave.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Wavelength</div>
                      <div className="font-mono font-medium">{selectedWave.wavelengthRange}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Frequency</div>
                      <div className="font-mono font-medium">{selectedWave.frequencyRange}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Applications */}
                <div className="flex-1">
                  <h4 className="font-medium mb-3">Common Applications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWave.applications.map((app) => (
                      <span 
                        key={app}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ 
                          backgroundColor: `${selectedWave.color}20`,
                          color: selectedWave.color
                        }}
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wave visualization */}
              <div className="mt-6 h-20 relative overflow-hidden rounded-lg bg-muted/30">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`wave-gradient-${selectedWave.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={selectedWave.color} stopOpacity="0.2" />
                      <stop offset="50%" stopColor={selectedWave.color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={selectedWave.color} stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    d={generateWavePath(emSpectrum.indexOf(selectedWave))}
                    fill="none"
                    stroke={`url(#wave-gradient-${selectedWave.name})`}
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick facts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">c = 3×10⁸ m/s</div>
            <div className="text-sm text-muted-foreground">Speed of all EM waves in vacuum</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">c = λf</div>
            <div className="text-sm text-muted-foreground">Wave equation (speed = wavelength × frequency)</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">E = hf</div>
            <div className="text-sm text-muted-foreground">Energy of a photon (Planck's equation)</div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes wave-move {
          from { transform: translateX(0); }
          to { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}

function generateWavePath(index: number): string {
  const width = 800;
  const height = 80;
  const centerY = height / 2;
  const amplitude = 25;
  // More oscillations for higher frequency waves
  const frequency = 3 + index * 2;
  
  let path = `M 0 ${centerY}`;
  
  for (let x = 0; x <= width; x += 2) {
    const y = centerY + amplitude * Math.sin((x / width) * frequency * Math.PI * 2);
    path += ` L ${x} ${y}`;
  }
  
  return path;
}
