import { Thermometer, Droplets } from "lucide-react";
import { motion } from "framer-motion";

interface ComfortPanelProps {
  temperature: number;
  humidity: number;
}

const ComfortPanel = ({ temperature, humidity }: ComfortPanelProps) => {
  const getComfortLevel = () => {
    if (temperature > 30 || humidity > 80) {
      return { label: "Crítico", color: "bg-destructive", textColor: "text-destructive-foreground" };
    } else if (temperature > 26 || humidity > 70) {
      return { label: "Moderado", color: "bg-warning", textColor: "text-warning-foreground" };
    } else {
      return { label: "Confortável", color: "bg-success", textColor: "text-success-foreground" };
    }
  };

  const comfort = getComfortLevel();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${comfort.color} ${comfort.textColor} rounded-lg p-6 space-y-4`}
    >
      <div className="text-center">
        <h3 className="text-sm font-medium opacity-90 mb-1">Nível de Conforto Térmico</h3>
        <p className="text-3xl font-bold">{comfort.label}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/10 rounded-lg p-4 text-center">
          <Thermometer className="h-6 w-6 mx-auto mb-2" />
          <p className="text-2xl font-bold">{temperature}°C</p>
          <p className="text-xs opacity-80">Temperatura</p>
        </div>
        <div className="bg-black/10 rounded-lg p-4 text-center">
          <Droplets className="h-6 w-6 mx-auto mb-2" />
          <p className="text-2xl font-bold">{humidity}%</p>
          <p className="text-xs opacity-80">Umidade</p>
        </div>
      </div>

      <div className="bg-black/10 rounded-lg p-3">
        <p className="text-sm font-medium">Recomendação Rápida:</p>
        <p className="text-xs opacity-90 mt-1">
          {comfort.label === "Crítico" && "Use roupas leves e mantenha-se hidratado. Evite exposição prolongada ao sol."}
          {comfort.label === "Moderado" && "Condições razoáveis. Use protetor solar e mantenha hidratação regular."}
          {comfort.label === "Confortável" && "Condições ideais para atividades ao ar livre. Aproveite!"}
        </p>
      </div>
    </motion.div>
  );
};

export default ComfortPanel;
