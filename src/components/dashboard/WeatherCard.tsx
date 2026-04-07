import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Thermometer, Droplets, Wind, Eye, CloudRain, Sun, Cloud, CloudSnow, CloudLightning, Loader2, Search, RefreshCw } from "lucide-react";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  precipitationProbability: number;
  precipitation: number;
  uvIndex: number;
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "পরিষ্কার আকাশ", icon: "☀️" },
  1: { label: "প্রায় পরিষ্কার", icon: "🌤️" },
  2: { label: "আংশিক মেঘলা", icon: "⛅" },
  3: { label: "মেঘলা", icon: "☁️" },
  45: { label: "কুয়াশা", icon: "🌫️" },
  48: { label: "ঘন কুয়াশা", icon: "🌫️" },
  51: { label: "হালকা গুঁড়ি বৃষ্টি", icon: "🌦️" },
  53: { label: "মাঝারি গুঁড়ি বৃষ্টি", icon: "🌦️" },
  55: { label: "ঘন গুঁড়ি বৃষ্টি", icon: "🌧️" },
  61: { label: "হালকা বৃষ্টি", icon: "🌧️" },
  63: { label: "মাঝারি বৃষ্টি", icon: "🌧️" },
  65: { label: "ভারী বৃষ্টি", icon: "🌧️" },
  66: { label: "হিমশীতল বৃষ্টি", icon: "🌨️" },
  67: { label: "ঘন হিমশীতল বৃষ্টি", icon: "🌨️" },
  71: { label: "হালকা তুষারপাত", icon: "❄️" },
  73: { label: "মাঝারি তুষারপাত", icon: "❄️" },
  75: { label: "ভারী তুষারপাত", icon: "❄️" },
  77: { label: "তুষারকণা", icon: "❄️" },
  80: { label: "হালকা বৃষ্টি ঝাপটা", icon: "🌦️" },
  81: { label: "মাঝারি বৃষ্টি ঝাপটা", icon: "🌧️" },
  82: { label: "ভারী বৃষ্টি ঝাপটা", icon: "⛈️" },
  85: { label: "হালকা তুষার ঝাপটা", icon: "🌨️" },
  86: { label: "ভারী তুষার ঝাপটা", icon: "🌨️" },
  95: { label: "বজ্রঝড়", icon: "⛈️" },
  96: { label: "শিলাবৃষ্টিসহ বজ্রঝড়", icon: "⛈️" },
  99: { label: "ভারী শিলাবৃষ্টিসহ বজ্রঝড়", icon: "⛈️" },
};

function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: "অজানা", icon: "🌡️" };
}

function getAdvice(temp: number, humidity: number, weatherCode: number, precipProb: number, windSpeed: number): string[] {
  const tips: string[] = [];

  // Temperature advice
  if (temp >= 40) {
    tips.push("🔥 অত্যন্ত গরম! ঘরের বাইরে যাওয়া এড়িয়ে চলুন। প্রচুর পানি পান করুন।");
    tips.push("🧴 সানস্ক্রিন ব্যবহার করুন এবং ছায়ায় থাকুন।");
  } else if (temp >= 35) {
    tips.push("☀️ খুব গরম! হালকা রঙের ঢিলেঢালা পোশাক পরুন।");
    tips.push("💧 নিয়মিত পানি পান করুন, ডিহাইড্রেশন এড়িয়ে চলুন।");
  } else if (temp >= 30) {
    tips.push("🌡️ গরম আবহাওয়া। পর্যাপ্ত পানি পান করুন।");
  } else if (temp >= 25) {
    tips.push("😊 আরামদায়ক আবহাওয়া। বাইরে হাঁটাহাঁটি করতে পারেন।");
  } else if (temp >= 20) {
    tips.push("🍃 মনোরম আবহাওয়া! বাইরের কাজকর্মের জন্য উপযুক্ত।");
  } else if (temp >= 15) {
    tips.push("🧥 হালকা ঠান্ডা। একটি হালকা জ্যাকেট রাখুন।");
  } else if (temp >= 10) {
    tips.push("🧣 ঠান্ডা আবহাওয়া। উষ্ণ পোশাক পরুন।");
  } else if (temp >= 5) {
    tips.push("❄️ বেশ ঠান্ডা! গরম কাপড় পরুন এবং গরম পানীয় পান করুন।");
  } else {
    tips.push("🥶 অত্যন্ত ঠান্ডা! বাইরে বের হলে ভালোভাবে গরম কাপড় পরুন।");
    tips.push("🔥 ঘরে হিটার বা কম্বল ব্যবহার করুন।");
  }

  // Rain/Storm
  if (precipProb >= 70) {
    tips.push("🌧️ বৃষ্টির সম্ভাবনা অনেক বেশি! ছাতা সাথে রাখুন।");
  } else if (precipProb >= 40) {
    tips.push("🌦️ বৃষ্টি হতে পারে। ছাতা রাখা ভালো হবে।");
  }

  if (weatherCode >= 95) {
    tips.push("⚡ বজ্রঝড়ের সম্ভাবনা! বাইরে না যাওয়াই ভালো।");
  }

  // Wind
  if (windSpeed >= 50) {
    tips.push("💨 ঝড়ো হাওয়া! সাবধানে থাকুন, ভারী জিনিস সরিয়ে রাখুন।");
  } else if (windSpeed >= 30) {
    tips.push("🌬️ তীব্র বাতাস বইছে। হালকা জিনিস উড়ে যেতে পারে।");
  }

  // Humidity
  if (humidity >= 85) {
    tips.push("💦 আর্দ্রতা অনেক বেশি। ঘাম বেশি হবে, পানি বেশি পান করুন।");
  }

  return tips;
}

interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

const WeatherCard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Load saved location
  useEffect(() => {
    const saved = localStorage.getItem("lifeos_weather_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCoords({ lat: parsed.lat, lon: parsed.lon });
      setLocationName(parsed.name);
    } else {
      // Default: Dhaka
      setCoords({ lat: 23.8103, lon: 90.4125 });
      setLocationName("ঢাকা");
    }
  }, []);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day,uv_index&hourly=precipitation_probability&timezone=auto&forecast_days=1`
      );
      const json = await res.json();
      const c = json.current;
      // Get current hour's precipitation probability
      const now = new Date();
      const hourIndex = now.getHours();
      const precipProb = json.hourly?.precipitation_probability?.[hourIndex] ?? 0;

      setWeather({
        temperature: c.temperature_2m,
        feelsLike: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m,
        weatherCode: c.weather_code,
        isDay: c.is_day === 1,
        precipitationProbability: precipProb,
        precipitation: c.precipitation,
        uvIndex: c.uv_index,
      });
      setLastUpdate(new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      console.error("Weather fetch failed");
    }
    setLoading(false);
  }, []);

  // Fetch weather when coords change
  useEffect(() => {
    if (coords) {
      fetchWeather(coords.lat, coords.lon);
    }
  }, [coords, fetchWeather]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => fetchWeather(coords.lat, coords.lon), 600000);
    return () => clearInterval(interval);
  }, [coords, fetchWeather]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=bn&format=json`
      );
      const json = await res.json();
      setSearchResults(json.results || []);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const selectLocation = (geo: GeoResult) => {
    const name = geo.admin1 ? `${geo.name}, ${geo.admin1}` : geo.name;
    setCoords({ lat: geo.latitude, lon: geo.longitude });
    setLocationName(name);
    localStorage.setItem("lifeos_weather_location", JSON.stringify({ lat: geo.latitude, lon: geo.longitude, name }));
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;
  const advice = weather ? getAdvice(weather.temperature, weather.humidity, weather.weatherCode, weather.precipitationProbability, weather.windSpeed) : [];

  // Temperature color gradient
  const getTempColor = (temp: number) => {
    if (temp >= 40) return "text-red-600";
    if (temp >= 35) return "text-orange-500";
    if (temp >= 30) return "text-amber-500";
    if (temp >= 25) return "text-yellow-500";
    if (temp >= 20) return "text-green-500";
    if (temp >= 15) return "text-teal-500";
    if (temp >= 10) return "text-cyan-500";
    return "text-blue-500";
  };

  const getTempBg = (temp: number) => {
    if (temp >= 35) return "from-red-500/20 to-orange-500/10";
    if (temp >= 28) return "from-amber-500/20 to-yellow-500/10";
    if (temp >= 20) return "from-green-500/15 to-emerald-500/10";
    if (temp >= 10) return "from-cyan-500/15 to-blue-500/10";
    return "from-blue-500/20 to-indigo-500/10";
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${weather ? getTempBg(weather.temperature) : "from-primary/10 to-primary/5"} p-4 pb-3`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center">
              <span className="text-lg">{weatherInfo?.icon || "🌤️"}</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">আবহাওয়া</h3>
              <p className="text-[10px] text-muted-foreground">{weatherInfo?.label || "লোড হচ্ছে..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 rounded-full hover:bg-background/50 transition-colors"
              title="লোকেশন পরিবর্তন"
            >
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => coords && fetchWeather(coords.lat, coords.lon)}
              className="p-1.5 rounded-full hover:bg-background/50 transition-colors"
              disabled={loading}
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Location name */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-10">
          <MapPin className="w-3 h-3" />
          <span>{locationName}</span>
          {lastUpdate && <span className="ml-auto text-[10px] opacity-70">আপডেট: {lastUpdate}</span>}
        </div>
      </div>

      <CardContent className="p-3 space-y-3">
        {/* Search */}
        {showSearch && (
          <div className="space-y-2 animate-fade-in-up">
            <div className="flex gap-1.5">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="শহর বা এলাকা খুঁজুন..."
                className="h-8 text-xs"
                onKeyDown={e => e.key === "Enter" && searchLocation()}
              />
              <Button size="sm" onClick={searchLocation} disabled={searching} className="h-8 px-2.5">
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-lg overflow-hidden divide-y divide-border">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(r)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">
                      {r.name}{r.admin1 ? `, ${r.admin1}` : ""} — {r.country}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && !weather ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : weather ? (
          <>
            {/* Main temperature */}
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-1">
                <span className={`text-4xl font-black tracking-tight ${getTempColor(weather.temperature)}`}>
                  {Math.round(weather.temperature)}°
                </span>
                <span className="text-xs text-muted-foreground mb-1.5">সে.</span>
              </div>
              <div className="text-right space-y-0.5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                  <Thermometer className="w-3 h-3" />
                  <span>অনুভূত {Math.round(weather.feelsLike)}°</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                  <Droplets className="w-3 h-3" />
                  <span>আর্দ্রতা {weather.humidity}%</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/40 rounded-lg p-2 text-center">
                <Wind className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted-foreground" />
                <p className="text-xs font-semibold">{Math.round(weather.windSpeed)} km/h</p>
                <p className="text-[10px] text-muted-foreground">বাতাস</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2 text-center">
                <CloudRain className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted-foreground" />
                <p className="text-xs font-semibold">{weather.precipitationProbability}%</p>
                <p className="text-[10px] text-muted-foreground">বৃষ্টি</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2 text-center">
                <Sun className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted-foreground" />
                <p className="text-xs font-semibold">{weather.uvIndex.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">UV সূচক</p>
              </div>
            </div>

            {/* Advice */}
            {advice.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">পরামর্শ</p>
                <div className="space-y-1">
                  {advice.map((tip, i) => (
                    <div key={i} className="bg-muted/30 rounded-md px-2.5 py-1.5 text-xs leading-relaxed">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
