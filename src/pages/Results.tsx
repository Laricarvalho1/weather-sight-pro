import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Droplets, 
  Wind, 
  Thermometer, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  Satellite 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WeatherAnimation from "@/components/WeatherAnimation";
import ProbabilityCard from "@/components/ProbabilityCard";
import RecommendationCard from "@/components/RecommendationCard";
import { getRecommendations } from "@/lib/recommendations";

// Helper function to calculate the comfort level
const calculateComfortLevel = (weather, probs) => {
  if (!weather || !probs) return null;

  let score = 100;

  const hotProb = probs.find(p => p.label.includes("Hot"))?.value || 0;
  const coldProb = probs.find(p => p.label.includes("Cold"))?.value || 0;
  const rainProb = probs.find(p => p.label.includes("Rain"))?.value || 0;
  const windProb = probs.find(p => p.label.includes("Wind"))?.value || 0;

  // Subtract points based on probabilities
  score -= hotProb * 1.2;
  score -= coldProb * 1.0;
  score -= rainProb * 0.6;
  score -= windProb * 0.5;

  // Subtract points for high humidity
  if (weather.humidity > 75) {
    score -= (weather.humidity - 75) * 0.5;
  }
  
  // Return the level and emoji based on the final score
  if (score >= 80) return { level: 'Very Comfortable', emoji: '😊' };
  if (score >= 60) return { level: 'Comfortable', emoji: '🙂' };
  if (score >= 40) return { level: 'Uncomfortable', emoji: '😕' };
  return { level: 'Very Uncomfortable', emoji: '😫' };
};

const Results = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { location, date } = state || {};

  const [weatherData, setWeatherData] = useState(null);
  const [probabilities, setProbabilities] = useState([]);
  const [comfortLevel, setComfortLevel] = useState(null);
  const [nasaUrl, setNasaUrl] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location || !date) {
      setError("Invalid search data. Please go back and try again.");
      setIsLoading(false);
      return;
    }

    const callBackendAPI = async () => {
      try {
        const backendUrl = 'https://isotropic-geratologic-cali.ngrok-free.dev/analyze';
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const requestData = { location: location, date: formattedDate };

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `A server error occurred.`);
        }

        const data = await response.json();
        const analysis = data.weather_analysis;

        const newWeatherData = {
          temperature: analysis.average_temperature_celsius,
          humidity: analysis.average_humidity_percent,
          rainfall: analysis.chance_of_any_rain_percent,
          wind: analysis.average_wind_speed_kmh,
          condition: analysis.chance_of_rainy_day_percent > 30 ? "rainy" : (analysis.average_temperature_celsius > 28 ? "sunny" : "cloudy"),
        };

        const newProbabilities = [
          { label: "Probability of a Hot Day", value: analysis.chance_of_hot_day_percent, type: "danger" },
          { label: "Probability of Heavy Rain", value: analysis.chance_of_rainy_day_percent, type: "info" },
          { label: "Probability of Strong Wind", value: analysis.chance_of_windy_day_percent, type: "info" },
          { label: "Probability of a Cold Day", value: analysis.chance_of_cold_day_percent, type: "info" },
        ];
        
        setWeatherData(newWeatherData);
        setProbabilities(newProbabilities);
        setNasaUrl(data.nasa_satellite_view_url);
        
        setComfortLevel(calculateComfortLevel(newWeatherData, newProbabilities));
        setRecommendations(getRecommendations(newWeatherData, newProbabilities, 3));

      } catch (err) {
        console.error("Failed to connect to the backend:", err);
        setError(err.message || "Could not load data. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    callBackendAPI();
  }, [location, date]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Analyzing 20 years of historical climate data...</p>
        <p className="text-sm text-muted-foreground">(This may take a few seconds)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Search
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-start justify-center p-4 md:p-8 relative">
      <Button onClick={() => navigate('/')} variant="outline" className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <ArrowLeft className="mr-2 h-4 w-4" />
        New Search
      </Button>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-24">
        {/* Left Side */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center space-y-8">
          {weatherData && <WeatherAnimation condition={weatherData.condition} />}
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="weather-card text-center"><Thermometer className="h-8 w-8 text-destructive mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.temperature.toFixed(1)}°C</p><p className="text-sm text-muted-foreground">Average Temperature</p></div>
            <div className="weather-card text-center"><Droplets className="h-8 w-8 text-info mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.humidity.toFixed(1)}%</p><p className="text-sm text-muted-foreground">Average Humidity</p></div>
            <div className="weather-card text-center"><Droplets className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.rainfall}%</p><p className="text-sm text-muted-foreground">Chance of Rain</p></div>
            <div className="weather-card text-center"><Wind className="h-8 w-8 text-accent mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.wind.toFixed(1)} km/h</p><p className="text-sm text-muted-foreground">Average Wind</p></div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col space-y-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Conditions Analysis</h1>
              {nasaUrl && (
                <Button asChild variant="outline" size="icon" className="shrink-0">
                  <a href={nasaUrl} target="_blank" rel="noopener noreferrer" title="View NASA satellite image for this date">
                    <Satellite className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{location || 'Location not provided'} - {date ? new Date(date).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}</p>
          </div>

          <div className="space-y-6">
            {/* Probabilities Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Adverse Condition Probabilities</h2>
              <div className="grid grid-cols-2 gap-4">
                {probabilities.map((prob, index) => (
                  <motion.div key={prob.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                    <ProbabilityCard label={prob.label} value={prob.value} type={prob.type} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Comfort Level Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-semibold text-foreground">Comfort Level</h2>
              {comfortLevel && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="weather-card flex flex-col items-center justify-center p-6 text-center rounded-lg">
                    <span className="text-6xl mb-2">{comfortLevel.emoji}</span>
                    <p className="text-2xl font-bold text-foreground">{comfortLevel.level}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recommendations Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-semibold text-foreground">Recommendations for Your Day</h2>
              {recommendations.map((rec, index) => (
                <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (0.1 * index) }}>
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