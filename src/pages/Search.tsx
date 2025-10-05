import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, MapPin, Calendar, ChevronLeft, ChevronRight, Zap, CalendarCheck, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, getYear, getMonth, setYear, setMonth, addYears, subYears } from "date-fns";
import { enUS } from "date-fns/locale"; // Changed from ptBR to enUS
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

  // Logic for the calendar's year view
  const startYearOfDecade = getYear(displayDate) - (getYear(displayDate) % 10);
  const years = Array.from({ length: 12 }, (_, i) => startYearOfDecade + i - 1);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Globe Animation & NEW Tip Carousel */}
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Weather View</h1>
            <p className="text-lg text-muted-foreground">Discover weather patterns and receive personalized recommendations</p>
          </div>

          <div className="space-y-6 weather-card">
            {/* Location Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </label>
              <Input
                placeholder="Enter a city or location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date
              </label>
              <Popover open={isCalendarOpen} onOpenChange={(isOpen) => {
                setIsCalendarOpen(isOpen);
                if (!isOpen) setView('days');
              }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-secondary border-border">
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: enUS }) : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {view === 'days' && (
                    <CalendarComponent
                      mode="single" selected={date} onSelect={handleDateSelect}
                      month={displayDate} onMonthChange={setDisplayDate}
                      locale={enUS}
                      components={{
                        Caption: () => (
                          <div className="flex items-center justify-between px-2 py-1.5">
                            <Button variant="ghost" className="hover:bg-accent" onClick={() => setView('months')}>
                              {capitalize(format(displayDate, 'MMMM', { locale: enUS }))}
                            </Button>
                            <Button variant="ghost" className="hover:bg-accent" onClick={() => setView('years')}>
                              {getYear(displayDate)}
                            </Button>
                          </div>
                        ),
                      }}
                    />
                  )}
                  {view === 'months' && (
                    <div className="p-3" style={{ width: '280px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" size="icon" onClick={() => setDisplayDate(subYears(displayDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" className="font-semibold" onClick={() => setView('years')}>{getYear(displayDate)}</Button>
                        <Button variant="ghost" size="icon" onClick={() => setDisplayDate(addYears(displayDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <Button key={i} variant={getMonth(displayDate) === i ? "default" : "ghost"}
                            onClick={() => { setDisplayDate(setMonth(displayDate, i)); setView('days'); }}>
                            {capitalize(format(new Date(2000, i), 'MMM', { locale: enUS }))}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {view === 'years' && (
                    <div className="p-3" style={{ width: '280px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" size="icon" onClick={() => setDisplayDate(subYears(displayDate, 10))}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="font-semibold">{`${years[1]}-${years[10]}`}</span>
                        <Button variant="ghost" size="icon" onClick={() => setDisplayDate(addYears(displayDate, 10))}><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                       <div className="grid grid-cols-3 gap-2">
                         {years.map((year, i) => (
                           <Button key={year} variant={getYear(displayDate) === year ? "default" : "ghost"}
                            className={i === 0 || i === 11 ? 'text-muted-foreground' : ''}
                            onClick={() => { setDisplayDate(setYear(displayDate, year)); setView('months'); }}>
                             {year}
                           </Button>
                         ))}
                       </div>
                    </div>
                  )}
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
              disabled={!locationInput || !date}
              className="w-full gradient-primary text-primary-foreground font-semibold py-6 text-lg"
            >
              <SearchIcon className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Search;