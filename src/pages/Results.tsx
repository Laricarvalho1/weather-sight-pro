  import { useState, useEffect } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  import { motion } from "framer-motion";
  import { 
    ArrowLeft, 
    Loader2, 
    AlertTriangle, 
    Satellite,
    Thermometer,
    Droplets,
    Wind 
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import WeatherAnimation from "@/components/WeatherAnimation";
  import ProbabilityCard from "@/components/ProbabilityCard";
  import RecommendationCard from "@/components/RecommendationCard";
  import { TrendsChart } from "@/components/TrendsChart";
  import { getRecommendations } from "@/lib/recommendations";

  // --- HELPER FUNCTIONS (No changes here) ---
  const calculateAdverseProbabilities = (weather) => { /* ... */ };
  const calculateComfortLevel = (weather, probs) => { /* ... */ };

  const Results = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { location, date } = state || {};

    // --- STATES and useEffect LOGIC (No changes here) ---
    const [weatherData, setWeatherData] = useState(null);
    const [probabilities, setProbabilities] = useState([]);
    const [comfortLevel, setComfortLevel] = useState(null);
    const [nasaUrl, setNasaUrl] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [historicalTrendsData, setHistoricalTrendsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      // ... (The entire useEffect hook remains the same)
    }, [location, date]);

    // --- LOADING and ERROR SCREENS (No changes here) ---
    if (isLoading) { /* ... */ }
    if (error) { /* ... */ }

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center p-4 md:p-8 relative">
        <div className="w-full max-w-7xl">
          <Button onClick={() => navigate('/')} variant="outline" className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </div>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-24">
          
          {/* --- TOP-LEFT CELL (No changes) --- */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col items-center space-y-8">
            <WeatherAnimation condition={weatherData?.condition} />
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="weather-card text-center"><Thermometer className="h-8 w-8 text-destructive mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.temperature.toFixed(1)}°C</p><p className="text-sm text-muted-foreground">Average Temperature</p></div>
              <div className="weather-card text-center"><Droplets className="h-8 w-8 text-info mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.humidity.toFixed(1)}%</p><p className="text-sm text-muted-foreground">Average Humidity</p></div>
              <div className="weather-card text-center"><Droplets className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.rainfall}%</p><p className="text-sm text-muted-foreground">Chance of Rain</p></div>
              <div className="weather-card text-center"><Wind className="h-8 w-8 text-accent mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.wind.toFixed(1)} km/h</p><p className="text-sm text-muted-foreground">Average Wind</p></div>
            </div>
          </motion.div>

        {/* --- TOP-RIGHT CELL (Aligned) --- */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:mt-16" // ADDED: Pushes the component down on large screens
        >
          {historicalTrendsData && (
            <TrendsChart 
              historicalTrends={historicalTrendsData} 
              nasaUrl={nasaUrl} 
            />
          )}
        </motion.div>

          {/* --- BOTTOM-LEFT CELL: Analysis Title & Probabilities --- */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-8 lg:mt-8">
            {/* Analysis Title Block */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">Conditions Analysis</h1>
              </div>
            </div>
            
            {/* MOVED HERE: Adverse Condition Probabilities */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Adverse Condition Probabilities</h2>
              <div className="grid grid-cols-2 gap-4">
                {probabilities.map((prob, index) => (
                  <motion.div key={prob.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + (0.1 * index) }}>
                    <ProbabilityCard label={prob.label} value={prob.value} type={prob.type} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* --- BOTTOM-RIGHT CELL: Comfort & Recommendations --- */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col space-y-8 lg:mt-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Comfort Level</h2>
                {comfortLevel && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <div className="weather-card flex flex-col items-center justify-center p-6 text-center rounded-lg">
                      <span className="text-6xl mb-2">{comfortLevel.emoji}</span>
                      <p className="text-2xl font-bold text-foreground">{comfortLevel.level}</p>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-semibold text-foreground">Recommendations for Your Day</h2>
                {recommendations.map((rec, index) => (
                  <motion.div key={rec.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + (0.1 * index) }}>
                    <RecommendationCard icon={rec.icon} title={rec.title} description={rec.description} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  export default Results;