// Dashboard — upgraded with stats, chart, crop breakdown, tips, quick actions
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Cloud, AlertTriangle, TrendingUp, Camera, Thermometer, Droplets,
  Wind, ArrowRight, RefreshCw, Loader2, BarChart3, Leaf,
  CheckCircle, Activity, Zap, Shield, Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const API = "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WeatherData {
  city: string;
  temp: number;
  humidity: number;
  condition?: string;
  wind_speed?: number;
}

interface HistoryEntry {
  timestamp: string;
  crop: string;
  disease: string;
  confidence: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function confidenceColor(pct: number): string {
  if (pct >= 80) return "#22c55e";
  if (pct >= 60) return "#eab308";
  return "#ef4444";
}

function weatherTip(w: WeatherData): { icon: typeof Cloud; text: string; color: string } {
  const h = w.humidity ?? 0;
  const t = w.temp ?? 0;
  const cond = (w.condition ?? "").toLowerCase();
  if (h > 80 || cond.includes("rain"))
    return { icon: AlertTriangle, text: "High humidity detected — conditions favour fungal diseases. Inspect leaves for early blight or mildew.", color: "text-orange-500" };
  if (t > 35)
    return { icon: AlertTriangle, text: "Heat stress alert — water crops early morning and late evening to reduce transpiration loss.", color: "text-red-500" };
  if (cond.includes("clear") && h < 40)
    return { icon: CheckCircle, text: "Low humidity and clear skies — ideal conditions for spraying fungicide preventively.", color: "text-green-600" };
  return { icon: Info, text: "Monitor your crops regularly. Upload a photo if you notice unusual spots or discolouration.", color: "text-blue-500" };
}

// ── Component ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { t } = useLanguage();
  const userName = localStorage.getItem("userName") || "Farmer";

  const [weather, setWeather]             = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError]   = useState(false);

  const [history, setHistory]             = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError]   = useState(false);

  // ── derived stats from history ─────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!history.length) return null;
    const total   = history.length;
    const avgConf = Math.round((history.reduce((s, e) => s + e.confidence, 0) / total) * 100);

    // disease frequency
    const diseaseCount: Record<string, number> = {};
    const cropCount:    Record<string, { count: number; diseases: Record<string, number> }> = {};
    history.forEach((e) => {
      diseaseCount[e.disease] = (diseaseCount[e.disease] ?? 0) + 1;
      if (!cropCount[e.crop]) cropCount[e.crop] = { count: 0, diseases: {} };
      cropCount[e.crop].count++;
      cropCount[e.crop].diseases[e.disease] = (cropCount[e.crop].diseases[e.disease] ?? 0) + 1;
    });

    const topDisease = Object.entries(diseaseCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topDiseaseCount = diseaseCount[topDisease] ?? 0;

    // top 6 diseases for chart
    const chartData = Object.entries(diseaseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name: name.replace(/_/g, " "), count, pct: Math.round((count / total) * 100) }));

    // crop breakdown (top 4)
    const cropBreakdown = Object.entries(cropCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([crop, data]) => ({
        crop,
        count: data.count,
        topDisease: Object.entries(data.diseases).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
      }));

    return { total, avgConf, topDisease, topDiseaseCount, chartData, cropBreakdown };
  }, [history]);

  // ── fetch functions ────────────────────────────────────────────────────────
  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(false);
    try {
      let weatherUrl = `${API}/weather?city=Coimbatore`; // final fallback

      // 1️⃣ Try browser GPS (needs permission)
      const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          ()    => resolve(null),
          { timeout: 4000 }
        );
      });

      if (coords) {
        // GPS granted → use lat/lon directly
        weatherUrl = `${API}/weather?lat=${coords.latitude}&lon=${coords.longitude}`;
      } else {
        // 2️⃣ GPS denied/unavailable → IP-based geolocation (no permission needed)
        try {
          const ipRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            const city = ipData.city || ipData.region || "Coimbatore";
            weatherUrl = `${API}/weather?city=${encodeURIComponent(city)}`;
          }
        } catch {
          // ipapi.co failed → stick with hardcoded fallback
        }
      }

      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error(`${res.status}`);
      setWeather(await res.json());
    } catch { setWeatherError(true); }
    finally  { setWeatherLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(false);
    try {
      const res = await fetch(`${API}/history`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setHistory(data.predictions ?? []);
    } catch { setHistoryError(true); }
    finally  { setHistoryLoading(false); }
  }, []);

  useEffect(() => { fetchWeather(); fetchHistory(); }, [fetchWeather, fetchHistory]);
  useEffect(() => {
    const id = setInterval(fetchHistory, 30_000);
    return () => clearInterval(id);
  }, [fetchHistory]);

  const tip = weather ? weatherTip(weather) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground capitalize">
              Welcome back, {userName} 🌾
            </h1>
            <p className="text-muted-foreground mt-1">Here's your crop intelligence overview</p>
          </div>
          <Link to="/predict">
            <Button size="lg" className="gap-2">
              <Camera className="h-5 w-5" /> Analyse a Crop
            </Button>
          </Link>
        </div>

        {/* ── Quick stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Activity,    label: "Total Scans",        value: stats?.total        ?? "—" },
            { icon: TrendingUp,  label: "Avg Confidence",     value: stats ? `${stats.avgConf}%` : "—" },
            { icon: AlertTriangle, label: "Most Detected",    value: stats?.topDisease.split("___")[1]?.replace(/_/g, " ") ?? stats?.topDisease ?? "—" },
            { icon: CheckCircle, label: "Healthy Crops",      value: stats ? `${history.filter(e => e.disease.toLowerCase().includes("healthy")).length}` : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-muted p-2.5 rounded-md shrink-0">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Weather + Tip row ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Weather card — spans 2 cols */}
          <Card className="md:col-span-2 border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  {t("dashboard.currentWeather")}
                  {weather && (
                    <span className="font-normal text-sm text-muted-foreground">— {weather.city}</span>
                  )}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchWeather} disabled={weatherLoading}>
                  <RefreshCw className={`h-4 w-4 ${weatherLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading weather…
                </div>
              ) : weatherError ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Backend unavailable.{" "}
                  <button onClick={fetchWeather} className="underline text-foreground">Retry</button>
                </div>
              ) : weather ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Thermometer, value: `${weather.temp}°C`,             label: "Temperature" },
                    { icon: Droplets,    value: `${weather.humidity}%`,           label: "Humidity" },
                    { icon: Wind,        value: `${weather.wind_speed ?? "—"} km/h`, label: "Wind" },
                    { icon: Cloud,       value: weather.condition ?? "N/A",       label: "Condition" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="bg-muted p-2.5 rounded-md">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base leading-tight">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Seasonal tip */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-4 w-4" /> Advisory Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tip ? (
                <div className="flex gap-3">
                  <tip.icon className={`h-5 w-5 shrink-0 mt-0.5 ${tip.color}`} />
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Weather data needed to generate tips.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Disease breakdown + Crop summary row ─────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Disease frequency chart */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Disease Frequency
              </CardTitle>
              <CardDescription>Top diseases detected in your scans</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats || stats.chartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No scan data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.chartData.map(({ name, count, pct }) => (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium truncate max-w-[180px]">{name}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{count}× ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crop health summary */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-4 w-4" /> Crop Summary
              </CardTitle>
              <CardDescription>Most scanned crops and their main risk</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats || stats.cropBreakdown.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Scan crops to see a breakdown</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.cropBreakdown.map(({ crop, count, topDisease }) => {
                    const diseaseName = topDisease.includes("___")
                      ? topDisease.split("___")[1].replace(/_/g, " ")
                      : topDisease;
                    const isHealthy = diseaseName.toLowerCase().includes("healthy");
                    return (
                      <div key={crop} className="flex items-center justify-between px-3 py-2 rounded-md border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">{crop}</p>
                          <p className="text-xs text-muted-foreground">{diseaseName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{count} scans</Badge>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: isHealthy ? "#22c55e" : "#ef4444" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Recent Predictions ────────────────────────────────────────── */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> {t("dashboard.recentPredictions")}
                </CardTitle>
                <CardDescription>{t("dashboard.recentPredictionsDesc")}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={fetchHistory} disabled={historyLoading}>
                <RefreshCw className={`h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading history…
              </div>
            ) : historyError ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Could not load history.{" "}
                <button onClick={fetchHistory} className="underline text-foreground">Retry</button>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No predictions yet — scan a crop to get started.</p>
                <Link to="/predict">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Camera className="h-4 w-4 mr-2" /> Start Scanning
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 8).map((entry, idx) => {
                  const pct = Math.round(entry.confidence * 100);
                  const disease = entry.disease.includes("___")
                    ? entry.disease.split("___")[1].replace(/_/g, " ")
                    : entry.disease;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 px-4 py-3 rounded-md border border-border hover:bg-accent/40 transition-colors"
                    >
                      {/* Confidence indicator */}
                      <div
                        className="w-1.5 h-10 rounded-full shrink-0"
                        style={{ background: confidenceColor(pct) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground capitalize">{entry.crop}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">{disease}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(entry.timestamp)}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0"
                        style={{ color: confidenceColor(pct), borderColor: confidenceColor(pct) + "60" }}
                      >
                        {pct}%
                      </Badge>
                    </div>
                  );
                })}
                <div className="pt-3">
                  <Link to="/predict">
                    <Button variant="outline" className="w-full gap-2">
                      <Camera className="h-4 w-4" /> {t("dashboard.newPrediction")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap,      title: "New Detection",     desc: "Upload a crop photo for AI analysis", to: "/predict",   cta: "Start" },
            { icon: Shield,   title: "Admin Panel",       desc: "View real usage stats & charts",      to: "/admin",     cta: "Open" },
            { icon: Info,     title: "Learn More",        desc: "About AgriAidAI and how it works",    to: "/about",     cta: "Read" },
          ].map(({ icon: Icon, title, desc, to, cta }) => (
            <Card key={to} className="border border-border hover:bg-accent/30 transition-colors">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="bg-muted p-3 rounded-md shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-0.5">{title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                  <Link to={to}>
                    <Button size="sm" variant="outline" className="gap-1">
                      {cta} <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;