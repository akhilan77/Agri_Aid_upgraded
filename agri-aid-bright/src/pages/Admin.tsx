// Admin dashboard — fetches real stats from /admin/stats
import { useState, useEffect, useCallback } from "react";
import { Users, FileText, TrendingUp, BarChart3, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const API = "http://localhost:8000";

// Last 7 day-of-week labels, oldest → newest
function last7Days(): string[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return days[d.getDay()];
  });
}

interface AdminStats {
  users: number;
  predictions: number;
  avgConfidence: number;
  predictionsPerDay: number[];
}

const Admin = () => {
  const { t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API}/admin/stats`);
      if (!res.ok) throw new Error(`${res.status}`);
      setStats(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const chartConfig = {
    predictions: { label: "Predictions", color: "hsl(var(--foreground))" },
  };

  const chartData = stats
    ? last7Days().map((date, i) => ({
        date,
        predictions: stats.predictionsPerDay[i] ?? 0,
      }))
    : [];

  const statCards = stats
    ? [
        {
          icon: FileText,
          label: t("admin.totalPredictions"),
          value: stats.predictions.toString(),
          sub: "Disease analyses performed",
        },
        {
          icon: TrendingUp,
          label: t("admin.avgConfidence"),
          value: `${(stats.avgConfidence * 100).toFixed(1)}%`,
          sub: "Average model confidence",
        },
        {
          icon: Users,
          label: t("admin.totalUsers"),
          value: stats.users > 0 ? stats.users.toString() : "—",
          sub: stats.users > 0 ? "Registered farmers" : "Auth not yet enabled",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">{t("admin.title")}</h1>
            <p className="text-muted-foreground">{t("admin.description")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-md border border-destructive/30 bg-destructive/5 mb-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">
              Could not reach backend.{" "}
              <button onClick={fetchStats} className="underline text-foreground">Retry</button>
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && !stats && (
          <div className="flex items-center gap-2 py-12 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading stats…</span>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {statCards.map(({ icon: Icon, label, value, sub }) => (
                <Card key={label} className="border border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                    <div className="bg-muted p-2 rounded-md">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <BarChart3 className="h-5 w-5" />
                  {t("admin.predictionsOverTime")}
                </CardTitle>
                <CardDescription>{t("admin.dailyPredictions")} — last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.every((d) => d.predictions === 0) ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No predictions in the last 7 days</p>
                    </div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="predictions"
                          stroke="hsl(var(--foreground))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--foreground))", r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
};

export default Admin;
