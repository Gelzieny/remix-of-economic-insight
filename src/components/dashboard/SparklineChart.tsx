import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: { date: string; value: number }[];
  trend: 'up' | 'down' | 'stable';
  inverted?: boolean;
}

export function SparklineChart({ data, trend, inverted = false }: SparklineChartProps) {
  const getColor = () => {
    if (trend === 'stable') return 'hsl(var(--muted-foreground))';
    const isPositive = inverted ? trend === 'down' : trend === 'up';
    return isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
  };

  const color = getColor();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${trend}-${inverted}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#gradient-${trend}-${inverted})`}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
