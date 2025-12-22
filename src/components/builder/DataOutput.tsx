import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, Download, Trash2, Pause, Play, FileJson, FileSpreadsheet, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DataPoint {
  time: number;
  [key: string]: number;
}

interface DataSeries {
  key: string;
  name: string;
  color: string;
  unit?: string;
}

interface DataOutputProps {
  data: DataPoint[];
  series: DataSeries[];
  isRecording?: boolean;
  onToggleRecording?: () => void;
  onClearData?: () => void;
  maxPoints?: number;
  className?: string;
}

export function DataOutput({
  data,
  series,
  isRecording = true,
  onToggleRecording,
  onClearData,
  maxPoints = 100,
  className = ''
}: DataOutputProps) {
  const [selectedSeries, setSelectedSeries] = useState<string[]>(series.map(s => s.key));
  const chartRef = useRef<HTMLDivElement>(null);

  // Display data limited to maxPoints
  const displayData = data.slice(-maxPoints);

  const toggleSeries = (key: string) => {
    setSelectedSeries(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // Export as CSV
  const exportCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['time', ...series.map(s => s.key)];
    const csvContent = [
      headers.join(','),
      ...data.map(point => 
        headers.map(h => point[h]?.toFixed(4) ?? '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported as CSV');
  };

  // Export as JSON
  const exportJSON = () => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const jsonContent = JSON.stringify({
      series: series.map(s => ({ key: s.key, name: s.name, unit: s.unit })),
      data,
      exportedAt: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported as JSON');
  };

  // Export chart as PNG
  const exportPNG = async () => {
    if (!chartRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, { backgroundColor: '#1a1a2e' });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment-chart-${Date.now()}.png`;
      a.click();
      toast.success('Chart exported as PNG');
    } catch {
      toast.error('Failed to export chart as PNG');
    }
  };

  // Stats calculation
  const calculateStats = (key: string) => {
    const values = data.map(d => d[key]).filter(v => v !== undefined);
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { mean, min, max, count: values.length };
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Output
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant={isRecording ? "default" : "secondary"} className="text-xs">
              {data.length} points
            </Badge>
            {onToggleRecording && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onToggleRecording}
              >
                {isRecording ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
            )}
            {onClearData && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onClearData}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Series toggles */}
        <div className="flex flex-wrap gap-1">
          {series.map(s => (
            <Button
              key={s.key}
              variant={selectedSeries.includes(s.key) ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => toggleSeries(s.key)}
              style={{ 
                backgroundColor: selectedSeries.includes(s.key) ? s.color : undefined,
                borderColor: s.color
              }}
            >
              {s.name}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <div ref={chartRef} className="h-40 bg-muted/30 rounded-md p-2">
          {displayData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {series
                  .filter(s => selectedSeries.includes(s.key))
                  .map(s => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No data recorded yet
            </div>
          )}
        </div>

        {/* Stats table */}
        {displayData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 text-muted-foreground">Series</th>
                  <th className="text-right py-1 text-muted-foreground">Min</th>
                  <th className="text-right py-1 text-muted-foreground">Max</th>
                  <th className="text-right py-1 text-muted-foreground">Mean</th>
                </tr>
              </thead>
              <tbody>
                {series.filter(s => selectedSeries.includes(s.key)).map(s => {
                  const stats = calculateStats(s.key);
                  return stats && (
                    <tr key={s.key} className="border-b border-border/50">
                      <td className="py-1" style={{ color: s.color }}>{s.name}</td>
                      <td className="py-1 text-right font-mono">{stats.min.toFixed(2)}</td>
                      <td className="py-1 text-right font-mono">{stats.max.toFixed(2)}</td>
                      <td className="py-1 text-right font-mono">{stats.mean.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Export buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportCSV}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportJSON}>
            <FileJson className="h-3.5 w-3.5 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={exportPNG}>
            <Image className="h-3.5 w-3.5 mr-1" /> PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
