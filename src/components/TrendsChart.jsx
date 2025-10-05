import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// The CustomTooltip component remains the same
const CustomTooltip = ({ active, payload, label, nasaUrl }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-popover text-popover-foreground p-3 rounded-md shadow-lg border border-border flex flex-col gap-2">
        <p className="label text-md font-semibold">Year: {label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.stroke }}>
            {p.name}: {p.value.toFixed(1)}{p.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TrendsChart = ({ historicalTrends, nasaUrl }) => {
  // Data validation and preparation logic remains the same
  if (
    !historicalTrends || !historicalTrends.years || !historicalTrends.temperatures ||
    !historicalTrends.humidities || !historicalTrends.rain_chances_percent ||
    !historicalTrends.wind_speeds || historicalTrends.years.length === 0
  ) {
    return (
      <Card className="weather-card h-96 flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-4">
          Historical trend data is missing or incomplete.
        </CardContent>
      </Card>
    );
  }

  const chartData = historicalTrends.years.map((year, index) => ({
    year: year,
    temperature: historicalTrends.temperatures[index],
    humidity: historicalTrends.humidities[index],
    rain: historicalTrends.rain_chances_percent[index],
    wind: historicalTrends.wind_speeds[index],
  })).sort((a, b) => a.year - b.year);


  return (
    <Card className="weather-card p-4 w-full">
      <CardHeader>
        <CardTitle className="text-xl text-foreground text-center mb-4">Historical Trends (Last 10 Years)</CardTitle>
      </CardHeader>
      
      <CardContent style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="left" stroke="hsl(var(--destructive))" domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip nasaUrl={nasaUrl} />} />
            <Legend wrapperStyle={{ bottom: -10 }}/>

            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp" unit="°C" stroke="hsl(var(--destructive))" strokeWidth={2} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity" unit="%" stroke="#4fbf23ff" strokeWidth={2} /> {/* Teal */}
            <Line yAxisId="right" type="monotone" dataKey="rain" name="Rain Chance" unit="%" stroke="#38bdf8" strokeWidth={2} /> {/* Sky Blue */}
            <Line yAxisId="right" type="monotone" dataKey="wind" name="Wind" unit=" km/h" stroke="#a78bfa" strokeWidth={2} /> {/* Violet */}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};