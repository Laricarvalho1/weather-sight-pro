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
import { LeafletMap } from "@/components/LeafletMap";
import { getRecommendations } from "@/lib/recommendations";
import { MapModal } from "@/components/MapModal"; 

// --- HELPER FUNCTIONS ---
const calculateAdverseProbabilities = (weather) => {
  if (!weather) return [];
  const { temperature, wind, rainfall } = weather;
  const hotThresholds = { min: 25, max: 40 };
  const coldThresholds = { min: 18, max: 5 };
  const windyThresholds = { min: 15, max: 60 };
  const scaleValue = (value, min, max) => {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return Math.round(((value - min) / (max - min)) * 100);
  };
  const hotProb = scaleValue(temperature, hotThresholds.min, hotThresholds.max);
  const coldProb = scaleValue(coldThresholds.min - temperature, 0, coldThresholds.min - coldThresholds.max);
  const windProb = scaleValue(wind, windyThresholds.min, windyThresholds.max);
  const rainProb = rainfall || 0;
  return [
    { label: "Probability of a Hot Day", value: hotProb, type: "danger" },
    { label: "Probability of Heavy Rain", value: rainProb, type: "info" },
    { label: "Probability of Strong Wind", value: windProb, type: "info" },
    { label: "Probability of a Cold Day", value: coldProb, type: "info" },
  ];
};

const calculateComfortLevel = (weather, probs) => {
  if (!weather || !probs) return null;
  let score = 100;
  const hotProb = probs.find(p => p.label.includes("Hot"))?.value || 0;
  const coldProb = probs.find(p => p.label.includes("Cold"))?.value || 0;
  const rainProb = probs.find(p => p.label.includes("Rain"))?.value || 0;
  const windProb = probs.find(p => p.label.includes("Wind"))?.value || 0;
  score -= hotProb * 1.2;
  score -= coldProb * 1.0;
  score -= rainProb * 0.6;
  score -= windProb * 0.5;
  if (weather.humidity > 75) {
    score -= (weather.humidity - 75) * 0.5;
  }
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
  const [historicalTrendsData, setHistoricalTrendsData] = useState(null);
  const [locationCoords, setLocationCoords] = useState(null);
  const [mapDate, setMapDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
   // --- 1. ESTADOS PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalYear, setModalYear] = useState(null);

  const handleYearClick = (year) => {
    console.log('🎯 handleYearClick chamado com ano:', year);
    if (!date) {
      console.log('❌ Data não disponível');
      return;
    }
    const originalDate = new Date(date);
    const newMapDate = new Date(originalDate.setFullYear(year));
    setMapDate(newMapDate);
    setModalYear(year);
    setIsModalOpen(true);
    console.log('✅ Modal configurado para abrir com ano:', year);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalYear(null);
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (!location || !date) {
      setError("Invalid search data. Please go back and try again.");
      setIsLoading(false);
      return;
    }

    const callAPI = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- STEP 1: GATHER ALL DATA FIRST ---

        // A) Fetch coordinates from location name
        console.log(`Fetching coordinates for: ${location}`);
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, { signal });
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
          throw new Error(`Could not find coordinates for "${location}".`);
        }
        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);
        // Hold onto the coords, but don't set state yet
        const coords = { lat, lon };
        console.log("Coordinates found:", coords);
        
        // B) Fetch main backend data
        const backendUrl = 'https://weather-sight-back.onrender.com/analyze';
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const requestData = { location, date: formattedDate, latitude: lat, longitude: lon };
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
          signal: signal
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `A server error occurred.`);
        }
        const data = await response.json();
        
        // --- STEP 2: PROCESS AND SET ALL STATES AT ONCE ---
        
        const analysis = data.weather_analysis;

        const newWeatherData = {
          temperature: analysis.average_temperature_celsius,
          humidity: analysis.average_humidity_percent,
          rainfall: analysis.chance_of_any_rain_percent,
          wind: analysis.average_wind_speed_kmh,
          condition: (analysis.chance_of_any_rain_percent || 0) > 40 ? "rainy" : (analysis.average_temperature_celsius > 28 ? "sunny" : "cloudy"),
        };
        const newProbabilities = calculateAdverseProbabilities(newWeatherData);
        
        // Now, update all states together at the end
        setWeatherData(newWeatherData);
        setProbabilities(newProbabilities);
        setLocationCoords(coords); // Set coordinates here
        setNasaUrl(data.nasa_satellite_view_url);
        setHistoricalTrendsData(analysis.historical_trends);
        setMapDate(new Date(date)); // Initialize map date here
        setComfortLevel(calculateComfortLevel(newWeatherData, newProbabilities));
        setRecommendations(getRecommendations(newWeatherData, newProbabilities, 3));

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted by cleanup');
        } else {
          console.error("Error during data fetching:", err);
          setError(err.message || "Could not load data. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    callAPI();

    return () => {
      controller.abort();
    };
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
    <>
    <div className="min-h-screen w-full bg-background flex flex-col items-center p-4 md:p-8 relative">
      <div className="w-full max-w-7xl">
        <Button onClick={() => navigate('/')} variant="outline" className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Search
        </Button>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-24">
        
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col items-center space-y-8">
          <WeatherAnimation condition={weatherData?.condition} />
          
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="weather-card text-center"><Thermometer className="h-8 w-8 text-destructive mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.temperature.toFixed(1)}°C</p><p className="text-sm text-muted-foreground">Average Temperature</p></div>
            <div className="weather-card text-center"><Droplets className="h-8 w-8 text-info mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.humidity.toFixed(1)}%</p><p className="text-sm text-muted-foreground">Average Humidity</p></div>
            <div className="weather-card text-center"><Droplets className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.rainfall}%</p><p className="text-sm text-muted-foreground">Chance of Rain</p></div>
            <div className="weather-card text-center"><Wind className="h-8 w-8 text-accent mx-auto mb-2" /><p className="text-3xl font-bold text-foreground">{weatherData?.wind.toFixed(1)} km/h</p><p className="text-sm text-muted-foreground">Average Wind</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:mt-16 relative z-10">
           {historicalTrendsData && (
              // --- 3. CONECTANDO O GRÁFICO ---
              <div className="relative z-20 pointer-events-auto">
                <TrendsChart 
                  historicalTrends={historicalTrendsData} 
                  onYearClick={handleYearClick} // AQUI! Passamos a função que abre o modal
                />
              </div>
            )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-8 lg:mt-8">
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
     {locationCoords && (
        <MapModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          year={modalYear}
          latitude={locationCoords.lat}
          longitude={locationCoords.lon}
        />
      )}
    </>
  );
};

export default Results;