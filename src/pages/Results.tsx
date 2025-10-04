import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, Wind, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeatherAnimation from "@/components/WeatherAnimation";
import ProbabilityCard from "@/components/ProbabilityCard";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: city, date } = location.state || {};

  // Mock data - será substituído pela API Python
  const weatherData = {
    condition: "sunny" as const,
    temperature: 32,
    humidity: 65,
    rainfall: 0,
    wind: 15,
  };

  const probabilities = [
    { label: "Muito Quente", value: 85, type: "danger" as const },
    { label: "Muita Chuva", value: 20, type: "info" as const },
    { label: "Muito Vento", value: 35, type: "info" as const },
    { label: "Muito Desconfortável", value: 70, type: "danger" as const },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Weather Animation & Data */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <WeatherAnimation condition={weatherData.condition} />
          
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="weather-card text-center">
              <Thermometer className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{weatherData.temperature}°C</p>
              <p className="text-sm text-muted-foreground">Temperatura</p>
            </div>

            <div className="weather-card text-center">
              <Droplets className="h-8 w-8 text-info mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{weatherData.humidity}%</p>
              <p className="text-sm text-muted-foreground">Umidade</p>
            </div>

            <div className="weather-card text-center">
              <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{weatherData.rainfall}mm</p>
              <p className="text-sm text-muted-foreground">Chuva</p>
            </div>

            <div className="weather-card text-center">
              <Wind className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{weatherData.wind} km/h</p>
              <p className="text-sm text-muted-foreground">Vento</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Probabilities */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Análise de Condições
            </h1>
            <p className="text-lg text-muted-foreground">
              {city} - {date ? new Date(date).toLocaleDateString('pt-BR') : ''}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Probabilidade de Condições Adversas
            </h2>
            
            {probabilities.map((prob, index) => (
              <motion.div
                key={prob.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ProbabilityCard
                  label={prob.label}
                  value={prob.value}
                  type={prob.type}
                />
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => navigate("/recommendations", { state: location.state })}
            className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
          >
            Ver Recomendações
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
