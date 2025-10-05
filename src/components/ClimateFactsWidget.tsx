import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const climateFacts = [
  "🌦 A cidade de Aracaju tem média anual de 89% de umidade.",
  "☀️ O deserto do Saara pode atingir temperaturas de até 58°C durante o dia.",
  "❄️ A temperatura mais baixa já registrada foi -89.2°C na Antártida.",
  "🌍 O oceano absorve cerca de 30% do CO2 produzido pela humanidade.",
  "⛈️ Um raio pode atingir temperaturas de até 30.000°C.",
  "🌪️ Tornados podem ter ventos de até 480 km/h.",
  "🌧️ A região mais chuvosa do mundo é Mawsynram, na Índia, com 11.871mm/ano.",
];

const ClimateFactsWidget = () => {
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % climateFacts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-card">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Curiosidades Climáticas</h3>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentFact}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-muted-foreground text-sm leading-relaxed"
        >
          {climateFacts[currentFact]}
        </motion.p>
      </AnimatePresence>
      <div className="flex gap-1 mt-3">
        {climateFacts.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index === currentFact ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ClimateFactsWidget;
