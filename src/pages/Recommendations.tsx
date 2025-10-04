import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Wind, Thermometer, Sun, Umbrella, Wind as WindIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeatherAnimation from "@/components/WeatherAnimation";
import RecommendationCard from "@/components/RecommendationCard";

const Recommendations = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data - será substituído pela API Python
  const weatherData = {
    condition: "sunny" as const,
    temperature: 32,
    humidity: 65,
    rainfall: 0,
    wind: 15,
  };

  const recommendations = [
    {
      icon: Droplets,
      title: "Hidratação Constante",
      description: "Mantenha-se hidratado. Beba água regularmente ao longo do dia, mesmo sem sede.",
    },
    {
      icon: Sun,
      title: "Roupas Leves",
      description: "Use roupas claras e leves. Tecidos naturais como algodão ajudam na ventilação.",
    },
    {
      icon: Umbrella,
      title: "Proteção Solar",
      description: "Use protetor solar FPS 50+ e reaplique a cada 2 horas. Chapéu e óculos são recomendados.",
    },
    {
      icon: AlertTriangle,
      title: "Atenção ao Desconforto",
      description: "Evite atividades físicas intensas nas horas mais quentes (11h-16h).",
    },
    {
      icon: WindIcon,
      title: "Procure Sombra",
      description: "Permaneça em locais frescos e ventilados sempre que possível.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Weather Animation & Summary */}
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

        {/* Right Side - Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Recomendações
            </h1>
            <p className="text-lg text-muted-foreground">
              Dicas personalizadas para o clima atual
            </p>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <RecommendationCard
                  icon={rec.icon}
                  title={rec.title}
                  description={rec.description}
                />
              </motion.div>
            ))}
          </div>

          <Button
            onClick={() => navigate("/results", { state: location.state })}
            variant="outline"
            className="w-full font-semibold py-6 text-lg border-primary text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;
