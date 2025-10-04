import { motion } from "framer-motion";

interface ProbabilityCardProps {
  label: string;
  value: number;
  type: "danger" | "info";
}

const ProbabilityCard = ({ label, value, type }: ProbabilityCardProps) => {
  const getColor = () => {
    if (type === "danger") return "text-destructive";
    return "text-info";
  };

  const getGradient = () => {
    if (type === "danger") return "gradient-danger";
    return "from-info/20 to-info/10";
  };

  return (
    <div className="weather-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <span className={`text-3xl font-bold ${getColor()}`}>{value}%</span>
      </div>

      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getGradient()}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Background decoration */}
      <motion.div
        className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${getGradient()} opacity-10`}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default ProbabilityCard;
