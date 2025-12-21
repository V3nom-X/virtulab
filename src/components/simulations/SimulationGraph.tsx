import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DataPoint {
  time: number;
  [key: string]: number;
}

interface GraphLine {
  dataKey: string;
  name: string;
  color: string;
  unit?: string;
}

interface SimulationGraphProps {
  title: string;
  lines: GraphLine[];
  maxDataPoints?: number;
  className?: string;
}

export function SimulationGraph({ 
  title, 
  lines, 
  maxDataPoints = 100,
  className = ''
}: SimulationGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const dataRef = useRef<DataPoint[]>([]);

  const addDataPoint = (point: DataPoint) => {
    dataRef.current = [...dataRef.current, point];
    if (dataRef.current.length > maxDataPoints) {
      dataRef.current = dataRef.current.slice(-maxDataPoints);
    }
    setData([...dataRef.current]);
  };

  const clearData = () => {
    dataRef.current = [];
    setData([]);
  };

  // Expose methods via a custom hook pattern
  useEffect(() => {
    (window as any).__graphAddData = addDataPoint;
    (window as any).__graphClearData = clearData;
    return () => {
      delete (window as any).__graphAddData;
      delete (window as any).__graphClearData;
    };
  }, []);

  return (
    <Card className={`${className}`}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearData}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(v) => `Time: ${Number(v).toFixed(2)}s`}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for using the graph
export function useSimulationGraph() {
  const addDataPoint = (point: DataPoint) => {
    (window as any).__graphAddData?.(point);
  };

  const clearData = () => {
    (window as any).__graphClearData?.();
  };

  return { addDataPoint, clearData };
}
