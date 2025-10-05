import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assumindo que você tem esses componentes

// Componente Tooltip Customizado para Recharts
const CustomTooltip = ({ active, payload, label, currentNasaUrl }) => {
  if (active && payload && payload.length) {
    // A imagem será a mesma para todos os anos, fornecida via 'currentNasaUrl'
    const imageUrl = currentNasaUrl; 

    return (
      <div className="custom-tooltip bg-popover text-popover-foreground p-3 rounded-md shadow-lg border border-border flex flex-col gap-2">
        <p className="label text-md font-semibold">Ano: {label}</p>
        {payload.map((p, index) => (
          <p key={index} className="intro" style={{ color: p.color }}>
            {p.name}: {p.value}{p.unit}
          </p>
        ))}
        {imageUrl && (
          <div className="mt-2">
            <img 
              src={imageUrl} 
              alt={`Satellite view for ${label}`} 
              className="w-48 h-48 object-cover rounded-md border border-muted" 
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">Imagem de Satélite</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};


export const HistoricalChartWithImages = ({ 
  historicalTrends, 
  nasaSatelliteViewUrl, // A URL da imagem principal (será a mesma para todos os anos)
  dataKey = "temperatures", // Chave padrão para o gráfico
  chartTitle = "Historical Temperatures" // Título padrão
}) => {
  if (!historicalTrends || historicalTrends.years.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2 weather-card h-96 flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          No historical data available for charting.
        </CardContent>
      </Card>
    );
  }

  // --- PREPARAÇÃO DOS DADOS PARA O GRÁFICO ---
  const years = historicalTrends.years;
  const values = historicalTrends[dataKey]; // Ex: temperatures, humidities

  // Combina os dados em um formato que Recharts entende
  const chartData = years.map((year, index) => {
    return {
      year: year,
      value: values[index],
    };
  }).sort((a, b) => a.year - b.year); // Garante que os anos estejam em ordem crescente


  // Cor e unidade baseadas no dataKey
  let lineColor = "#FF6384"; // Default: Red
  let unit = "";
  let dataName = ""; // Nome para a legenda do tooltip
  switch(dataKey) {
    case "temperatures":
      lineColor = "hsl(var(--destructive))"; 
      unit = "°C";
      dataName = "Temperature";
      break;
    case "humidities":
      lineColor = "hsl(var(--blue))"; // Assumindo uma variável CSS para azul
      unit = "%";
      dataName = "Humidity";
      break;
    case "rain_chances_percent":
      lineColor = "hsl(var(--primary))"; 
      unit = "%";
      dataName = "Chance of Rain";
      break;
    case "wind_speeds":
      lineColor = "hsl(var(--accent-foreground))"; 
      unit = " km/h";
      dataName = "Wind Speed";
      break;
    default:
      lineColor = "hsl(var(--primary))";
      unit = "";
      dataName = "Value";
  }


  return (
    <Card className="col-span-1 lg:col-span-2 weather-card p-4">
      <CardHeader>
        <CardTitle className="text-xl text-foreground text-center mb-4">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4 h-[400px]">
        {/* Gráfico Recharts */}
        <div className="flex-1 h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" unit={unit} />
              <Tooltip 
                content={<CustomTooltip 
                  currentNasaUrl={nasaSatelliteViewUrl} // Passa a URL única aqui
                  unit={unit} 
                />} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={dataName} 
                stroke={lineColor} 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
      </CardContent>
    </Card>
  );
};