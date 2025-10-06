import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, Moon, Loader } from "lucide-react"; // Import a loading icon

// The interface can now accept null or undefined, or any string
interface WeatherAnimationProps {
  condition?: "sunny" | "cloudy" | "rainy" | "night" | string;
}

const WeatherAnimation = ({ condition }: WeatherAnimationProps) => {
  const animations = {
    sunny: {
      icon: Sun,
      gradient: "from-yellow-400 to-orange-500",
      glow: "hsl(38 92% 50% / 0.4)",
    },
    cloudy: {
      icon: Cloud,
      gradient: "from-gray-400 to-gray-600",
      glow: "hsl(220 20% 50% / 0.3)",
    },
    rainy: {
      icon: CloudRain,
      gradient: "from-blue-400 to-blue-600",
      glow: "hsl(210 90% 50% / 0.4)",
    },
    night: {
      icon: Moon,
      gradient: "from-indigo-400 to-purple-600",
      glow: "hsl(240 50% 50% / 0.4)",
    },
    // --- FIX START ---
    // Add a default case to handle loading states or unknown conditions
    default: {
      icon: Loader, // A neutral loading icon
      gradient: "from-gray-500 to-gray-700",
      glow: "hsl(220 10% 40% / 0.2)",
    },
    // --- FIX END ---
  };

  // --- FIX START ---
  // If the provided condition exists in animations, use it. Otherwise, use the default.
  // This prevents the code from ever trying to destructure 'undefined'.
  const animationData = (condition && animations[condition as keyof typeof animations]) ? animations[condition as keyof typeof animations] : animations.default;
  const { icon: Icon, gradient, glow } = animationData;
  // --- FIX END ---


  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient}`}
        style={{
          boxShadow: `0 0 80px ${glow}`,
        }}
        animate={{
          scale: [1, 1.05, 1], // Made the pulse a bit smaller for subtlety
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        // Apply a spinning animation only to the loading icon
        animate={{
          rotate: condition === "sunny" || !condition ? [0, 360] : 0,
          y: condition === "rainy" ? [0, 10, 0] : 0,
        }}
        transition={{
          rotate: {
            duration: condition ? 20 : 2, // Spin faster when loading
            repeat: Infinity,
            ease: "linear",
          },
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <Icon className="w-32 h-32 text-white relative z-10" />
      </motion.div>

      {condition === "rainy" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-6 bg-blue-300 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: "60%",
              }}
              animate={{
                y: [0, 100],
                opacity: [1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "linear",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default WeatherAnimation;