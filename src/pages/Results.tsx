import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, Wind, Thermometer, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeatherAnimation from "@/components/WeatherAnimation";
import ProbabilityCard from "@/components/ProbabilityCard";
import ComfortPanel from "@/components/ComfortPanel";
import ExportButton from "@/components/ExportButton";
import ShareButton from "@/components/ShareButton";
import UnitsModal from "@/components/UnitsModal";
import HistoricalChart from "@/components/HistoricalChart";
import { useState } from "react";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: city, date } = location.state || {};
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // Mock data - será substituído pela API Python
  const weatherData = {
    condition: "sunny" as const,
    temperature: 32,
    humidity: 65,
    rainfall: 0,
    wind: 15,
  };

  const probabilities = [
    { label: "Muito Quente", value: 85, type: "danger" as const },
    { label: "Muita Chuva", value: 20, type: "info" as const },
    { label: "Muito Vento", value: 35, type: "info" as const },
    { label: "Muito Desconfortável", value: 70, type: "danger" as const },
  ];

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <ExportButton data={weatherData} location={city || "Localização"} />
          <ShareButton location={city || "Localização"} />
          <UnitsModal />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Weather Animation & Data */}
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

        {/* Right Side - Comfort & Probabilities */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center space-y-8"
        >
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

          {/* Comfort Panel */}
          <ComfortPanel temperature={weatherData.temperature} humidity={weatherData.humidity} />

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Probabilidade de Condições Adversas
            </h2>
            
            {probabilities.map((prob, index) => (
              <motion.div
                key={prob.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ProbabilityCard
                  label={prob.label}
                  value={prob.value}
                  type={prob.type}
                />
              </motion.div>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setShowMoreInfo(!showMoreInfo)}
              variant="outline"
              className="font-semibold py-6 text-lg border-primary text-primary hover:bg-primary/10"
            >
              <Info className="mr-2 h-5 w-5" />
              {showMoreInfo ? "Menos Info" : "Mais Info"}
            </Button>
            <Button
              onClick={() => navigate("/recommendations", { state: location.state })}
              className="gradient-primary text-primary-foreground font-semibold py-6 text-lg"
            >
              Ver Recomendações
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Historical Chart - Expandable Section */}
      {showMoreInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-7xl mx-auto mt-8"
        >
          <HistoricalChart />
        </motion.div>
      )}
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