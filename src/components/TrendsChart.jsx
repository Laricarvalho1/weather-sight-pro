// src/components/TrendsChart.jsx

import React, { useState } from 'react'; // 1. Importar o useState
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Componente para o estilo do texto (sem alterações)
const CustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  const year = payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="hsl(var(--muted-foreground))" transform="rotate(-35)" style={{ fontSize: '0.9rem' }} className="hover:fill-primary transition-colors">
        {year}
      </text>
    </g>
  );
};


export const TrendsChart = ({ historicalTrends, onYearClick }) => {
  // 2. Estado para guardar os dados do ponto onde o mouse está
  const [activeData, setActiveData] = useState(null);

  console.log('🔍 TrendsChart renderizado com:', {
    historicalTrends: !!historicalTrends,
    onYearClick: !!onYearClick,
    years: historicalTrends?.years?.length || 0
  });

  // Log quando o componente é montado
  React.useEffect(() => {
    console.log('🚀 TrendsChart montado!');
    return () => {
      console.log('🛑 TrendsChart desmontado!');
    };
  }, []);

  if (!historicalTrends || !historicalTrends.years || historicalTrends.years.length === 0) {
    console.log('❌ Dados históricos ausentes ou incompletos');
    return (<Card className="weather-card h-96 flex items-center justify-center">

        <CardContent className="text-center text-muted-foreground p-4">

          Historical trend data is missing or incomplete.

        </CardContent>

      </Card>);
  }

  const chartData = historicalTrends.years.map((year, index) => ({
    year: year,
    temperature: historicalTrends.temperatures[index],
    humidity: historicalTrends.humidities[index],
    rain: historicalTrends.rain_chances_percent[index],
    wind: historicalTrends.wind_speeds[index],
  })).sort((a, b) => a.year - b.year);

  // 3. Função chamada quando o mouse se move sobre o gráfico
  const handleMouseMove = (state) => {
    console.log('🖱️ handleMouseMove chamado:', {
      isTooltipActive: state.isTooltipActive,
      activePayload: state.activePayload?.length || 0,
      activeData: state.activePayload?.[0]?.payload
    });
    
    // A 'state' vem do Recharts e contém a informação do Tooltip
    if (state.isTooltipActive && state.activePayload && state.activePayload.length > 0) {
      // Guardamos o payload (os dados) do ponto ativo
      const newActiveData = state.activePayload[0].payload;
      console.log('📍 Ponto ativo detectado:', newActiveData);
      setActiveData(newActiveData);
    } else {
      // Se o mouse sair do gráfico, limpamos o estado
      console.log('🚫 Mouse saiu do gráfico, limpando activeData');
      setActiveData(null);
    }
  };

  // 4. Função chamada quando o GRÁFICO INTEIRO é clicado
  const handleChartClick = (event) => {
    console.log('🖱️ handleChartClick chamado!', {
      event: event,
      activeData: activeData,
      onYearClick: !!onYearClick,
      hasActiveData: !!activeData
    });
    
    // Verificamos se há um ponto ativo (guardado pelo onMouseMove)
    if (activeData && onYearClick) {
      console.log('✅ Chamando onYearClick com ano:', activeData.year);
      // Usamos o ano do ponto ativo para chamar a função do pai
      onYearClick(activeData.year);
    } else {
      console.log('❌ Não foi possível clicar:', {
        hasActiveData: !!activeData,
        hasOnYearClick: !!onYearClick
      });
    }
  };

  console.log('📊 Dados do gráfico preparados:', {
    chartDataLength: chartData.length,
    firstDataPoint: chartData[0],
    lastDataPoint: chartData[chartData.length - 1]
  });

  return (
    <Card className="weather-card p-4 w-full">
      <CardHeader>
        <CardTitle className="text-xl text-foreground text-center mb-4">Click a Year to Open Map</CardTitle>
      </CardHeader>
      
      <CardContent style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {/* 5. Adicionar os handlers ao LineChart */}
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
            onMouseMove={handleMouseMove}
            onClick={handleChartClick}
            style={{ cursor: 'pointer' }} // Cursor para o gráfico todo
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            
            {/* O onClick foi REMOVIDO daqui para evitar conflito */}
            <XAxis 
              dataKey="year" 
              tick={<CustomXAxisTick />} 
              interval={0} 
            />
            
            <YAxis yAxisId="left" stroke="hsl(var(--destructive))" domain={['dataMin - 2', 'dataMax + 2']} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" domain={[0, 100]} />
            
            {/* O Tooltip agora tem um papel ativo na lógica */}
            <Tooltip />

            <Legend wrapperStyle={{ bottom: -15 }}/>
            <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="hsl(var(--destructive))" strokeWidth={2} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#4fbf23ff" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="rain" name="Rain Chance (%)" stroke="#38bdf8" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="wind" name="Wind (km/h)" stroke="#a78bfa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};