import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GlobeAnimation from "@/components/GlobeAnimation";
import WeatherSummary from "@/components/WeatherSummary";
import MapSelector from "@/components/MapSelector";
import ClimateFactsWidget from "@/components/ClimateFactsWidget";

const Search = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [mapPosition, setMapPosition] = useState<[number, number]>([-10.9472, -37.0731]); // Aracaju default

  const handleSearch = () => {
    if (location && date) {
      navigate("/results", { 
        state: { 
          location, 
          date: date.toISOString(),
          coordinates: mapPosition 
        } 
      });
    }
  };

  const handleMapPositionChange = async (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    
    // Reverse geocoding to get location name
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county;
      if (city) {
        setLocation(city);
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Globe Animation & Weather Summary */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <GlobeAnimation />
          <WeatherSummary />
          <ClimateFactsWidget />
        </motion.div>

        {/* Right Side - Search Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Análise Climática
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubra as condições climáticas e receba recomendações personalizadas
            </p>
          </div>

          <div className="space-y-6 weather-card">
            {/* Location Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Localização
              </label>
              <Input
                placeholder="Digite a cidade ou arraste o pin no mapa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-secondary border-border"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Map Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Selecione no mapa ou arraste o marcador
              </label>
              <MapSelector position={mapPosition} onPositionChange={handleMapPositionChange} />
              <p className="text-xs text-muted-foreground">
                Coordenadas: {mapPosition[0].toFixed(4)}, {mapPosition[1].toFixed(4)}
              </p>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={!location || !date}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
            >
              <SearchIcon className="mr-2 h-5 w-5" />
              Pesquisar
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Search;
