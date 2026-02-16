import { useState, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { TapeMeasure } from './components/TapeMeasure';
import type {
  UnitSystem,
  ImperialUnit,
  MetricUnit,
} from './utils/conversions';
import {
  inchesToMm,
  mmToInches,
} from './utils/conversions';
import { formatFraction, formatDecimal } from './utils/fractions';
import { safeEvaluate } from './utils/mathEval';
import {
  Ruler,
  History,
  Calculator,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  value: number; // Base value in inches or mm
  system: UnitSystem;
  unit: string;
  displayValue: string;
  timestamp: number;
}

function App() {
  const [system, setSystem] = useState<UnitSystem>('imperial');
  const [imperialUnit, setImperialUnit] = useState<ImperialUnit>('inches');
  const [metricUnit, setMetricUnit] = useState<MetricUnit>('mm');
  const [precision, setPrecision] = useState(128); // Max denominator
  const [inputValue, setInputValue] = useState('0');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [zoom, setZoom] = useState(1); // Zoom level: 0.5 to 4

  const currentUnit = system === 'imperial' ? imperialUnit : metricUnit;

  // Calculate the numeric value from input
  const numericValue = useMemo(() => {
    const evaluated = safeEvaluate(inputValue);
    return evaluated !== null ? evaluated : 0;
  }, [inputValue]);

  // Convert to base units (inches for imperial, mm for metric)
  const baseValue = useMemo(() => {
    if (system === 'imperial') {
      if (imperialUnit === 'feet') {
        return numericValue * 12; // Convert feet to inches
      }
      return numericValue;
    } else {
      if (metricUnit === 'cm') {
        return numericValue * 10; // Convert cm to mm
      } else if (metricUnit === 'm') {
        return numericValue * 1000; // Convert m to mm
      }
      return numericValue;
    }
  }, [numericValue, system, imperialUnit, metricUnit]);

  // Format the primary display value
  const displayValue = useMemo(() => {
    if (system === 'imperial') {
      const inchValue = imperialUnit === 'feet' ? baseValue / 12 : baseValue;
      return imperialUnit === 'feet'
        ? formatDecimal(inchValue / 12, 'ft', 3)
        : formatFraction(inchValue, precision);
    } else {
      const mmValue =
        metricUnit === 'cm'
          ? baseValue / 10
          : metricUnit === 'm'
          ? baseValue / 1000
          : baseValue;
      return formatDecimal(mmValue, metricUnit);
    }
  }, [baseValue, system, imperialUnit, metricUnit, precision]);

  // Format the equivalent value in the opposite system
  const equivalentValue = useMemo(() => {
    if (system === 'imperial') {
      const mm = inchesToMm(baseValue);
      return formatDecimal(mm, 'mm', 2);
    } else {
      const inches = mmToInches(baseValue);
      return formatFraction(inches, precision);
    }
  }, [baseValue, system, precision]);

  const handleSaveToHistory = () => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      value: baseValue,
      system,
      unit: currentUnit,
      displayValue,
      timestamp: Date.now(),
    };
    setHistory([entry, ...history].slice(0, 50)); // Keep last 50
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveToHistory();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const step = system === 'imperial' ? 1 / precision : 1;
      const newValue = numericValue + step;
      setInputValue(newValue.toString());
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const step = system === 'imperial' ? 1 / precision : 1;
      const newValue = Math.max(0, numericValue - step);
      setInputValue(newValue.toString());
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(displayValue);
  };

  const handlePreset = (value: number) => {
    setInputValue(value.toString());
  };

  const handleHistoryClick = (entry: HistoryEntry) => {
    setSystem(entry.system);
    if (entry.system === 'imperial') {
      setImperialUnit(entry.unit as ImperialUnit);
    } else {
      setMetricUnit(entry.unit as MetricUnit);
    }
    
    // Convert value back to the appropriate unit
    const baseInches = entry.system === 'imperial' ? entry.value : mmToInches(entry.value);
    const baseMm = entry.system === 'metric' ? entry.value : inchesToMm(entry.value);
    
    if (entry.system === 'imperial') {
      if (entry.unit === 'feet') {
        setInputValue((baseInches / 12).toString());
      } else {
        setInputValue(baseInches.toString());
      }
    } else {
      if (entry.unit === 'cm') {
        setInputValue((baseMm / 10).toString());
      } else if (entry.unit === 'm') {
        setInputValue((baseMm / 1000).toString());
      } else {
        setInputValue(baseMm.toString());
      }
    }
  };

  const toggleSystem = () => {
    const newSystem = system === 'imperial' ? 'metric' : 'imperial';
    setSystem(newSystem);
    
    // Convert current value to new system
    if (newSystem === 'metric') {
      const mm = inchesToMm(baseValue);
      setInputValue((mm / (metricUnit === 'cm' ? 10 : metricUnit === 'm' ? 1000 : 1)).toString());
    } else {
      const inches = mmToInches(baseValue);
      setInputValue((imperialUnit === 'feet' ? inches / 12 : inches).toString());
    }
  };

  const precisionOptions = [16, 32, 64, 128];
  const imperialPresets = [1/16, 1/8, 1/4, 1/2, 1, 2, 6, 12];
  const metricPresets = metricUnit === 'mm' ? [1, 5, 10, 25, 50, 100] :
                        metricUnit === 'cm' ? [1, 5, 10, 25, 50, 100] :
                        [0.1, 0.5, 1, 2, 5, 10];

  const accentColor = system === 'imperial' ? 'lime' : 'cyan';
  const accentClass = system === 'imperial' ? 'text-lime-400 border-lime-400' : 'text-cyan-400 border-cyan-400';
  const bgAccentClass = system === 'imperial' ? 'bg-lime-400/10 hover:bg-lime-400/20' : 'bg-cyan-400/10 hover:bg-cyan-400/20';

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border border-neutral-800 bg-neutral-950 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className={`w-6 h-6 ${accentClass}`} />
              <h1 className="text-2xl font-bold tracking-tight">PRECISION TAPE MEASURE</h1>
            </div>
            <button
              onClick={toggleSystem}
              className={`flex items-center gap-2 px-4 py-2 border ${accentClass} ${bgAccentClass} transition-colors`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {system === 'imperial' ? 'IMPERIAL' : 'METRIC'}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Input Section */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <div className="space-y-4">
                {/* Math Input */}
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block flex items-center gap-2">
                    <Calculator className="w-3 h-3" />
                    EXPRESSION INPUT
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-black border ${accentClass} px-4 py-3 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-${accentColor}-400`}
                    placeholder="5 + 3/8"
                  />
                  <div className="mt-1 text-xs text-neutral-600">
                    Supports: +, -, *, /, ( ) | Press Enter to save | ↑↓ to nudge
                  </div>
                </div>

                {/* Unit Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {system === 'imperial' ? (
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">UNIT</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setImperialUnit('inches')}
                          className={`px-3 py-2 border text-sm ${
                            imperialUnit === 'inches'
                              ? `${accentClass} ${bgAccentClass}`
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          INCHES
                        </button>
                        <button
                          onClick={() => setImperialUnit('feet')}
                          className={`px-3 py-2 border text-sm ${
                            imperialUnit === 'feet'
                              ? `${accentClass} ${bgAccentClass}`
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          FEET
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">UNIT</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setMetricUnit('mm')}
                          className={`px-3 py-2 border text-sm ${
                            metricUnit === 'mm'
                              ? `${accentClass} ${bgAccentClass}`
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          MM
                        </button>
                        <button
                          onClick={() => setMetricUnit('cm')}
                          className={`px-3 py-2 border text-sm ${
                            metricUnit === 'cm'
                              ? `${accentClass} ${bgAccentClass}`
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          CM
                        </button>
                        <button
                          onClick={() => setMetricUnit('m')}
                          className={`px-3 py-2 border text-sm ${
                            metricUnit === 'm'
                              ? `${accentClass} ${bgAccentClass}`
                              : 'border-neutral-700 hover:border-neutral-600'
                          }`}
                        >
                          M
                        </button>
                      </div>
                    </div>
                  )}

                  {system === 'imperial' && imperialUnit === 'inches' && (
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">PRECISION</label>
                      <div className="grid grid-cols-4 gap-2">
                        {precisionOptions.map((p) => (
                          <button
                            key={p}
                            onClick={() => setPrecision(p)}
                            className={`px-2 py-2 border text-xs ${
                              precision === p
                                ? `${accentClass} ${bgAccentClass}`
                                : 'border-neutral-700 hover:border-neutral-600'
                            }`}
                          >
                            1/{p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Values */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">PRIMARY</label>
                    <div className={`text-3xl font-bold ${accentClass}`}>
                      {displayValue}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">EQUIVALENT</label>
                    <div className="text-2xl font-semibold text-neutral-400">
                      {equivalentValue}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToHistory}
                    className={`flex items-center gap-2 px-4 py-2 border ${accentClass} ${bgAccentClass} transition-colors`}
                  >
                    <History className="w-4 h-4" />
                    SAVE
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2 border ${accentClass} ${bgAccentClass} transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                    COPY
                  </button>
                  <button
                    onClick={() => setInputValue((numericValue + (system === 'imperial' ? 1/precision : 1)).toString())}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-700 hover:border-neutral-600 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setInputValue(Math.max(0, numericValue - (system === 'imperial' ? 1/precision : 1)).toString())}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-700 hover:border-neutral-600 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Resolution Control */}
            {system === 'imperial' && imperialUnit === 'inches' && (
              <div className="border border-neutral-800 bg-neutral-950 p-6">
                <label className="text-xs text-neutral-500 mb-3 block">TAPE RESOLUTION</label>
                <div className="grid grid-cols-4 gap-3">
                  {precisionOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrecision(p)}
                      className={`px-4 py-3 border text-lg font-semibold ${
                        precision === p
                          ? `${accentClass} ${bgAccentClass}`
                          : 'border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      1/{p}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tape Measure Visualizer */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-neutral-500">VISUAL RULER</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">ZOOM: {zoom.toFixed(1)}x</span>
                  <button
                    onClick={() => setZoom(1)}
                    className="text-xs px-2 py-1 border border-neutral-700 hover:border-neutral-600"
                  >
                    RESET
                  </button>
                </div>
              </div>
              <div className="text-xs text-neutral-600 mb-2">
                PC: Mouse wheel to zoom | Mobile: Pinch to zoom
              </div>
              <TapeMeasure
                value={system === 'imperial' ? baseValue : baseValue}
                system={system}
                unit={currentUnit}
                precision={precision}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </div>

            {/* Presets */}
            <div className="border border-neutral-800 bg-neutral-950 p-6">
              <label className="text-xs text-neutral-500 mb-3 block">QUICK PRESETS</label>
              <div className="grid grid-cols-8 gap-2">
                {(system === 'imperial' ? imperialPresets : metricPresets).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className={`px-3 py-2 border border-neutral-700 hover:border-neutral-600 text-sm transition-colors`}
                  >
                    {system === 'imperial' && preset < 1
                      ? `${preset * (preset === 1/16 ? 16 : preset === 1/8 ? 8 : preset === 1/4 ? 4 : 2)}/${preset === 1/16 ? 16 : preset === 1/8 ? 8 : preset === 1/4 ? 4 : 2}"`
                      : `${preset}${system === 'imperial' ? '"' : metricUnit}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4" />
                HISTORY
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                {showHistory ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-2 max-h-[800px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-xs text-neutral-600 text-center py-8">
                    No entries yet
                  </div>
                ) : (
                  history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleHistoryClick(entry)}
                      className="w-full text-left px-3 py-2 border border-neutral-800 hover:border-neutral-600 transition-colors"
                    >
                      <div className="text-sm font-semibold">{entry.displayValue}</div>
                      <div className="text-xs text-neutral-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
