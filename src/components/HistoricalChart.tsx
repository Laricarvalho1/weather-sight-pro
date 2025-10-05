import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

// Mock data - será substituído pela API Python
const generateHistoricalData = (years: number) => {
  const data = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = years; i >= 0; i--) {
    data.push({
      year: currentYear - i,
      temperature: 28 + Math.random() * 8 - 4,
      rainfall: 80 + Math.random() * 60 - 30,
      humidity: 60 + Math.random() * 20 - 10,
      wind: 10 + Math.random() * 10,
    });
  }
  
  return data;
};

const HistoricalChart = () => {
  const [years, setYears] = useState(5);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const data = generateHistoricalData(years);

  const toggleLine = (dataKey: string) => {
    setHiddenLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const lines = [
    { key: "temperature", name: "Temperatura (°C)", color: "hsl(var(--destructive))" },
    { key: "rainfall", name: "Chuva (mm)", color: "hsl(var(--primary))" },
    { key: "humidity", name: "Umidade (%)", color: "hsl(var(--info))" },
    { key: "wind", name: "Vento (km/h)", color: "hsl(var(--accent))" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="weather-card space-y-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Histórico Climático</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Período:</span>
          <div className="flex-1 max-w-xs">
            <Slider
              min={10}
              max={20}
              step={1}
              value={[years]}
              onValueChange={(value) => setYears(value[0])}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium text-foreground">{years} anos</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="year" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend
            onClick={(e) => toggleLine(e.dataKey as string)}
            wrapperStyle={{ cursor: "pointer", paddingTop: "20px" }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              hide={hiddenLines.has(line.key)}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground text-center">
        Clique nas legendas para ocultar/mostrar variáveis
      </p>
    </motion.div>
  );
};

export default HistoricalChart;
