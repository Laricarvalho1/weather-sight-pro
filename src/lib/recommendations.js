import { Droplets, Sun, Umbrella, Wind, AlertTriangle, Snowflake, Cloudy, Shirt, Home } from 'lucide-react';

// Our complete "database" of all possible recommendations.
const ALL_RECOMMENDATIONS = [
  // --- Recommendations for HOT weather ---
  {
    id: 'hot_hydration',
    icon: Droplets,
    title: "Constant Hydration",
    description: "Drink water regularly, even if you don't feel thirsty. The heat increases the body's fluid loss.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Hot"))?.value > 60 || weather.temperature > 30,
  },
  {
    id: 'hot_sunscreen',
    icon: Umbrella,
    title: "Use Sunscreen",
    description: "Apply sunscreen with a high SPF, especially between 10 AM and 4 PM. A hat and sunglasses are recommended.",
    condition: (weather) => weather.condition === 'sunny' && weather.temperature > 25,
  },
  {
    id: 'hot_light_clothes',
    icon: Shirt,
    title: "Light and Light-Colored Clothing",
    description: "Opt for natural fabrics like cotton and light colors that reflect sunlight and help keep your body cool.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Hot"))?.value > 50,
  },
  {
    id: 'hot_avoid_peak',
    icon: AlertTriangle,
    title: "Avoid Peak Hours",
    description: "Reduce strenuous physical activities outdoors during the hottest hours of the day, typically between 11 AM and 4 PM.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Hot"))?.value > 80,
  },

  // --- Recommendations for COLD weather ---
  {
    id: 'cold_layers',
    icon: Shirt,
    title: "Dress in Layers",
    description: "Wearing multiple layers of clothing helps create thermal insulation and allows you to adapt to different environments.",
    condition: (weather) => weather.temperature < 15,
  },
  {
    id: 'cold_extremities',
    icon: Snowflake,
    title: "Protect Your Extremities",
    description: "Hands, feet, and your head lose heat quickly. Wear gloves, thick socks, and a hat if necessary.",
    condition: (weather) => weather.temperature < 10,
  },
  {
    id: 'cold_warm_drinks',
    icon: Home,
    title: "Warm Beverages",
    description: "Teas, hot chocolate, or soups help keep the body warm from the inside out.",
    condition: (weather) => weather.temperature < 12,
  },

  // --- Recommendations for RAIN ---
  {
    id: 'rain_umbrella',
    icon: Umbrella,
    title: "Bring an Umbrella",
    description: "An umbrella or a raincoat is essential to stay dry and avoid catching a cold.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Rain"))?.value > 40,
  },
  {
    id: 'rain_drive_careful',
    icon: AlertTriangle,
    title: "Drive Carefully",
    description: "Wet roads increase the risk of accidents. Reduce your speed and maintain a safe distance from the vehicle in front of you.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Rain"))?.value > 60,
  },

  // --- Recommendations for WIND ---
  {
    id: 'wind_secure_objects',
    icon: Wind,
    title: "Secure Loose Objects",
    description: "Strong winds can knock over objects in outdoor areas. Secure or store items that could be blown away.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Wind"))?.value > 50,
  },
  {
    id: 'wind_allergies',
    icon: Cloudy,
    title: "Allergy Alert",
    description: "The wind can spread pollen and dust, intensifying respiratory allergies. Keep windows closed if necessary.",
    condition: (weather, probs) => probs.find(p => p.label.includes("Wind"))?.value > 40,
  },

  // --- GENERAL Recommendations ---
  {
    id: 'general_good_day',
    icon: Sun,
    title: "Pleasant Day for Activities",
    description: "The temperature is mild and conditions are favorable for outdoor activities. Enjoy it!",
    condition: (weather, probs) => weather.temperature > 18 && weather.temperature < 26 && probs.every(p => p.value < 40),
  },
];

/**
 * Generates a list of personalized recommendations based on the weather data.
 * @param {object} weatherData - The object containing average weather data.
 * @param {array} probabilities - The array containing probabilities of adverse conditions.
 * @param {number} count - The number of recommendations to return.
 * @returns {array} A randomly selected list of recommendations.
 */
export const getRecommendations = (weatherData, probabilities, count = 4) => {
  if (!weatherData || !probabilities) {
    return [];
  }

  // 1. Filter all possible recommendations based on the conditions.
  const validRecommendations = ALL_RECOMMENDATIONS.filter(rec => rec.condition(weatherData, probabilities));

  // 2. Shuffle the list of valid recommendations to ensure variety.
  const shuffled = validRecommendations.sort(() => 0.5 - Math.random());

  // 3. Return the desired number of recommendations.
  return shuffled.slice(0, count);
};