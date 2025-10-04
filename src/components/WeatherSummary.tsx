import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { motion } from "framer-motion";

const WeatherSummary = () => {
  const weatherItems = [
    { icon: Sun, label: "Ensolarado", value: "28°C" },
    { icon: Cloud, label: "Parcialmente Nublado", value: "60%" },
    { icon: CloudRain, label: "Chuva", value: "10mm" },
    { icon: Wind, label: "Vento", value: "12 km/h" },
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      {weatherItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="weather-card flex flex-col items-center text-center"
        >
          <item.icon className="h-8 w-8 text-primary mb-2" />
          <p className="text-lg font-semibold text-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default WeatherSummary;
