import { motion } from "framer-motion";

const GlobeAnimation = () => {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, hsl(195 90% 55%), hsl(210 90% 45%))",
          boxShadow: "0 0 60px hsl(195 90% 55% / 0.4), inset 0 0 60px hsl(210 90% 20% / 0.3)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {/* Grid lines for globe effect */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`lat-${i}`}
            className="absolute left-1/2 border-t border-white/20"
            style={{
              top: `${(i + 1) * 12}%`,
              width: `${100 - i * 8}%`,
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`long-${i}`}
            className="absolute left-1/2 top-1/2 h-full border-l border-white/20"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 22.5}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 60%, hsl(195 90% 55% / 0.3))",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default GlobeAnimation;
