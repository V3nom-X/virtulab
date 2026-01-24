import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Scatter, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  X,
  Download,
  Image,
  FileText,
  Braces,
  Maximize2,
  Minimize2,
  TrendingUp,
  BarChart3,
  LineChart,
  ScatterChart,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  time: number;
  [key: string]: number;
}

interface DataSeries {
  key: string;
  name: string;
  color: string;
  unit?: string;
  visible?: boolean;
}

interface DataVisualizationPanelProps {
  data: DataPoint[];
  series: DataSeries[];
  isOpen: boolean;
  onClose: () => void;
  simulationType: string;
  className?: string;
}

export function DataVisualizationPanel({
  data,
  series,
  isOpen,
  onClose,
  simulationType,
  className,
}: DataVisualizationPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'line' | 'scatter' | 'bar'>('line');
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(series.map((s) => s.key))
  );

  // Update visible series when series prop changes
  useEffect(() => {
    setVisibleSeries(new Set(series.map((s) => s.key)));
  }, [series]);

  if (!isOpen) return null;

  // Prepare chart data
  const chartData = {
    labels: data.map((d) => d.time.toFixed(2)),
    datasets: series
      .filter((s) => visibleSeries.has(s.key))
      .map((s) => ({
        label: `${s.name}${s.unit ? ` (${s.unit})` : ''}`,
        data: data.map((d) => d[s.key] ?? 0),
        borderColor: s.color,
        backgroundColor:
          chartType === 'line'
            ? `${s.color}20`
            : chartType === 'bar'
            ? `${s.color}80`
            : s.color,
        fill: chartType === 'line',
        tension: 0.3,
        pointRadius: chartType === 'scatter' ? 4 : 1,
        pointHoverRadius: 6,
      })),
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (s)',
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border) / 0.3)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  // Calculate statistics
  const stats = series.map((s) => {
    const values = data.map((d) => d[s.key]).filter((v) => v !== undefined);
    if (values.length === 0)
      return { key: s.key, name: s.name, min: 0, max: 0, mean: 0, current: 0 };
    return {
      key: s.key,
      name: s.name,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      current: values[values.length - 1] || 0,
    };
  });

  // Export functions
  const exportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['time', ...series.map((s) => s.key)].join(',');
    const rows = data.map((d) =>
      [d.time, ...series.map((s) => d[s.key] ?? '')].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulationType}_data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const exportJSON = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    const json = JSON.stringify(
      {
        simulationType,
        exportedAt: new Date().toISOString(),
        series: series.map((s) => ({ key: s.key, name: s.name, unit: s.unit })),
        data,
        statistics: stats,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulationType}_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported!');
  };

  const exportPNG = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${simulationType}_chart_${Date.now()}.png`;
      a.click();
      toast.success('Chart image exported!');
    } catch (error) {
      toast.error('Failed to export image');
    }
  };

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        'fixed z-50 bg-card border border-border rounded-lg shadow-xl transition-all duration-300',
        isExpanded
          ? 'inset-4 sm:inset-8'
          : 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[600px] max-h-[70vh]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Data Visualization</h3>
          <Badge variant="secondary" className="text-xs">
            {data.length} points
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className={cn('p-3', isExpanded ? 'h-[calc(100%-56px)]' : 'max-h-[60vh]')}>
        <div className="space-y-4">
          {/* Chart Type Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <Tabs
              value={chartType}
              onValueChange={(v) => setChartType(v as 'line' | 'scatter' | 'bar')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="line" className="text-xs gap-1 px-2">
                  <LineChart className="w-3 h-3" />
                  <span className="hidden sm:inline">Line</span>
                </TabsTrigger>
                <TabsTrigger value="scatter" className="text-xs gap-1 px-2">
                  <ScatterChart className="w-3 h-3" />
                  <span className="hidden sm:inline">Scatter</span>
                </TabsTrigger>
                <TabsTrigger value="bar" className="text-xs gap-1 px-2">
                  <BarChart3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Bar</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Export Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={exportCSV}
                title="Export CSV"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={exportJSON}
                title="Export JSON"
              >
                <Braces className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={exportPNG}
                title="Export PNG"
              >
                <Image className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Series Toggle */}
          <div className="flex flex-wrap gap-2">
            {series.map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all border',
                  visibleSeries.has(s.key)
                    ? 'border-transparent bg-primary/10'
                    : 'border-border opacity-50'
                )}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div
            ref={chartRef}
            className={cn('bg-muted/30 rounded-lg p-3', isExpanded ? 'h-[400px]' : 'h-[200px]')}
          >
            {data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Run the simulation to see data
              </div>
            ) : chartType === 'line' ? (
              <Line data={chartData} options={chartOptions} />
            ) : chartType === 'scatter' ? (
              <Scatter
                data={{
                  datasets: series
                    .filter((s) => visibleSeries.has(s.key))
                    .map((s) => ({
                      label: s.name,
                      data: data.map((d) => ({ x: d.time, y: d[s.key] ?? 0 })),
                      backgroundColor: s.color,
                      pointRadius: 4,
                    })),
                }}
                options={chartOptions}
              />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Statistics */}
          {data.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats
                .filter((s) => visibleSeries.has(s.key))
                .map((stat) => (
                  <Card key={stat.key} className="p-2">
                    <p className="text-xs text-muted-foreground truncate">{stat.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current:</span>
                        <span>{stat.current.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mean:</span>
                        <span>{stat.mean.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Range:</span>
                        <span>
                          {stat.min.toFixed(1)}–{stat.max.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
