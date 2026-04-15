// Unified Predict + Results page — split screen layout with PDF export
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Camera, Leaf, Loader2, CheckCircle, AlertTriangle,
  Shield, Stethoscope, FileDown, RotateCcw, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE_URL = "http://localhost:8000";

interface PredictionResult {
  disease: string;
  confidence: number; // 0–1
  crop: string;
  image: string | null;
  symptoms: string[];
  treatments: string[];
  prevention: string[];
}

const cropTypes = [
  { value: "tomato",     label: "🍅 Tomato" },
  { value: "corn",       label: "🌽 Corn" },
  { value: "wheat",      label: "🌾 Wheat" },
  { value: "rice",       label: "🌾 Rice" },
  { value: "potato",     label: "🥔 Potato" },
  { value: "apple",      label: "🍎 Apple" },
  { value: "grape",      label: "🍇 Grape" },
  { value: "pepper",     label: "🫑 Pepper" },
  { value: "strawberry", label: "🍓 Strawberry" },
  { value: "peach",      label: "🍑 Peach" },
];

// Confidence → colour tokens (Tailwind inline styles for print compat)
function confidenceMeta(pct: number) {
  if (pct >= 80) return { label: "High Confidence",   bg: "#d1fae5", text: "#065f46", bar: "#10b981" };
  if (pct >= 60) return { label: "Medium Confidence", bg: "#fef9c3", text: "#713f12", bar: "#eab308" };
  return            { label: "Low Confidence",        bg: "#fee2e2", text: "#991b1b", bar: "#ef4444" };
}

const Predict = () => {
  const { t } = useLanguage();
  const resultRef = useRef<HTMLDivElement>(null);

  const [selectedCrop, setSelectedCrop] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── image handling ──────────────────────────────────────────────────────────
  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadImage(file);
  };

  // ── prediction ──────────────────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!selectedCrop || !uploadedImage) return;
    setIsPredicting(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("crop", selectedCrop);
      formData.append("file", uploadedImage);

      const res = await fetch(`${API_BASE_URL}/predict`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      // Save to history (fire-and-forget)
      fetch(`${API_BASE_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: data.crop, disease: data.disease, confidence: data.confidence }),
      }).catch(() => {});

      setResult({
        disease:    data.disease,
        confidence: data.confidence,
        crop:       data.crop,
        image:      imagePreview,
        symptoms:   data.symptoms   ?? [],
        treatments: data.treatments ?? [],
        prevention: data.preventiveTips ?? [],
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to backend.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setSelectedCrop("");
    setResult(null);
    setErrorMsg(null);
  };

  // ── PDF export via browser print ────────────────────────────────────────────
  const handleExportPDF = () => window.print();

  // ── derived display values ──────────────────────────────────────────────────
  const pct  = result ? Math.round(result.confidence * 100) : 0;
  const meta = result ? confidenceMeta(pct) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Print-only header */}
      <div className="hidden print:block px-8 py-4 border-b mb-6">
        <h1 className="text-2xl font-bold">AgriAidAI — Disease Analysis Report</h1>
        <p className="text-sm text-gray-500">Generated {new Date().toLocaleString()}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("predict.title")}</h1>
          <p className="text-muted-foreground">{t("predict.description")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Upload panel ────────────────────────────────────────── */}
          <div className="space-y-5 print:hidden">
            {/* Crop selector */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-4 w-4" /> {t("predict.chooseCrop")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="crop-select" className="text-sm mb-1.5 block">Crop Type</Label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger id="crop-select" className="h-10">
                    <SelectValue placeholder="Select a crop…" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Image upload */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Upload Crop Image
                </CardTitle>
                <CardDescription>Drag & drop or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  htmlFor="image-upload"
                  className="block cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative rounded-md overflow-hidden border border-border">
                      <img src={imagePreview} alt="Preview" className="w-full max-h-56 object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                    </div>
                  ) : (
                    <div className="h-44 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click or drag an image here</span>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }}
                  />
                </label>
              </CardContent>
            </Card>

            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-md border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handlePredict}
                disabled={!selectedCrop || !uploadedImage || isPredicting}
              >
                {isPredicting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</>
                ) : (
                  <><Camera className="h-4 w-4 mr-2" /> Analyze Crop</>
                )}
              </Button>
              {result && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Results panel ─────────────────────────────────────── */}
          <div ref={resultRef}>
            {!result && !isPredicting && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground gap-3 print:hidden">
                <Stethoscope className="h-10 w-10 opacity-20" />
                <p className="text-sm">Results will appear here after analysis</p>
              </div>
            )}

            {isPredicting && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-muted-foreground print:hidden">
                <Loader2 className="h-10 w-10 animate-spin opacity-50" />
                <p className="text-sm">Running AI analysis…</p>
              </div>
            )}

            {result && meta && (
              <div className="space-y-4">

                {/* Disease header card */}
                <div
                  className="rounded-xl p-5 border"
                  style={{ background: meta.bg, borderColor: meta.bar + "60" }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                         style={{ color: meta.text }}>
                        Detected Disease
                      </p>
                      <h2 className="text-2xl font-bold" style={{ color: meta.text }}>
                        {result.disease}
                      </h2>
                      <p className="text-sm mt-1" style={{ color: meta.text + "cc" }}>
                        in {result.crop.charAt(0).toUpperCase() + result.crop.slice(1)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-bold" style={{ color: meta.text }}>{pct}%</div>
                      <p className="text-xs mt-0.5" style={{ color: meta.text }}>{meta.label}</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-4 h-2 rounded-full bg-black/10">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.bar }}
                    />
                  </div>
                </div>

                {/* Analyzed image */}
                {result.image && (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <img src={result.image} alt="Analyzed" className="w-full max-h-48 object-cover" />
                  </div>
                )}

                {/* Symptoms */}
                <Card className="border-l-4" style={{ borderLeftColor: "#f97316" }}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: "#c2410c" }}>
                      <AlertTriangle className="h-4 w-4" /> Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-1.5">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Treatment */}
                <Card className="border-l-4" style={{ borderLeftColor: "#22c55e" }}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: "#15803d" }}>
                      <CheckCircle className="h-4 w-4" /> Treatment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-1.5">
                      {result.treatments.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Prevention */}
                <Card className="border-l-4" style={{ borderLeftColor: "#6366f1" }}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: "#4338ca" }}>
                      <Shield className="h-4 w-4" /> Prevention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="space-y-1.5">
                      {result.prevention.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Export + navigation */}
                <div className="flex gap-3 flex-wrap print:hidden">
                  <Button onClick={handleExportPDF} variant="default" className="flex-1">
                    <FileDown className="h-4 w-4 mr-2" /> Export PDF
                  </Button>
                  <Link to="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" /> Dashboard
                    </Button>
                  </Link>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default Predict;