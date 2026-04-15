// About page — clean, detailed, minimal design
import {
  Leaf, Users, Target, Award, Phone, Mail, MessageCircle,
  Globe, Smartphone, Brain, Shield, Zap, CheckCircle,
  Cpu, Database, CloudSun, TrendingUp, ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 text-xs tracking-widest uppercase">
              About AgriAidAI
            </Badge>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              AI-Powered Crop Intelligence<br />
              <span className="text-muted-foreground font-normal">Built for Farmers</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              AgriAidAI is an open-source agricultural intelligence platform that uses
              computer vision and machine learning to detect crop diseases instantly,
              provide expert treatment plans, and help farmers protect their harvests
              with data-driven confidence.
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/predict">
                <Button variant="default" size="lg">
                  Try Disease Detection <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">View Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "38",    label: "Crop Disease Classes" },
              { value: "95%+",  label: "Detection Accuracy" },
              { value: "< 3s",  label: "Inference Time" },
              { value: "Free",  label: "No API Key Needed" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">From photo to prescription in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Smartphone,
                title: "Upload a Crop Photo",
                desc: "Take a clear photo of the affected leaves, fruit, or stem and upload it — any common image format works.",
              },
              {
                step: "02",
                icon: Cpu,
                title: "AI Analyses the Image",
                desc: "Our MobileNetV2 model classifies the image across 38 PlantVillage disease classes in under 3 seconds.",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Get Actionable Results",
                desc: "Receive the disease name, confidence score, symptoms, treatment plan, and prevention tips instantly.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-muted/30 select-none absolute -top-2 -left-1">
                  {step}
                </div>
                <div className="pt-8">
                  <div className="bg-muted p-3 rounded-lg w-fit mb-4">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology stack ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Built on proven open-source technologies — no proprietary lock-in,
                fully self-hostable, and designed to improve as more predictions are made.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Brain,     label: "ML Model",   detail: "MobileNetV2 — lightweight, fast, 38-class PlantVillage classifier" },
                  { icon: Cpu,       label: "Backend",    detail: "Python · FastAPI · TensorFlow / Keras" },
                  { icon: Globe,     label: "Frontend",   detail: "React · TypeScript · Tailwind CSS" },
                  { icon: CloudSun,  label: "Weather",    detail: "Open-Meteo API (free, no key) + browser geolocation" },
                  { icon: Database,  label: "History",    detail: "In-memory store — SQLite/Postgres integration planned" },
                ].map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="bg-background border border-border p-2 rounded-md shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{label} — </span>
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border border-border">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Supported Crops
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Tomato", "Corn", "Potato", "Wheat", "Rice", "Apple",
                      "Grape", "Peach", "Cherry", "Strawberry", "Pepper",
                      "Soybean", "Squash", "Orange", "Blueberry", "Raspberry",
                    ].map((crop) => (
                      <Badge key={crop} variant="secondary" className="text-xs">{crop}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> What the AI Detects
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {[
                      "Early & Late Blight", "Leaf spots & rust",
                      "Powdery mildew", "Scab & rot diseases",
                      "Bacterial infections", "Healthy (no disease) classification",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold mb-12">Why We Built This</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Accessible to All Farmers",
                desc: "Smallholder farmers shouldn't need expensive consultants to diagnose a disease. AgriAidAI gives everyone the same analytical power.",
              },
              {
                icon: Target,
                title: "Early Detection = Less Loss",
                desc: "Crop diseases can wipe out an entire harvest in days. Early, accurate detection allows farmers to act before losses compound.",
              },
              {
                icon: Award,
                title: "Open & Trustworthy",
                desc: "No black-box decisions. Every prediction comes with a confidence score, symptoms, and traceable agronomic guidance.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="bg-muted border border-border p-3 rounded-lg h-fit shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain,      title: "AI Detection",       desc: "MobileNetV2 classifier trained on PlantVillage dataset — 38 disease classes." },
              { icon: Zap,        title: "Instant Results",    desc: "Full analysis in under 3 seconds. No waiting for cloud upload queues." },
              { icon: CloudSun,   title: "Live Weather",       desc: "Real-time weather via Open-Meteo using your device's GPS location." },
              { icon: Smartphone, title: "Any Device",         desc: "Responsive across mobile, tablet, and desktop. No app install needed." },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border border-border">
                <CardContent className="p-5">
                  <div className="bg-muted p-2.5 rounded-md w-fit mb-4">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Support ─────────────────────────────────────────────── */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Have a question about AgriAidAI, found a bug, or want to contribute?
                We'd love to hear from you.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Mail,          title: "Email",        contact: "support@agriaidai.com",  hours: "24/7 response" },
                  { icon: Phone,         title: "Phone",        contact: "+1 (555) 123-4567",       hours: "Mon–Fri, 8 AM–6 PM" },
                  { icon: MessageCircle, title: "Live Chat",    contact: "Available in-app",        hours: "Mon–Fri, 9 AM–5 PM" },
                  { icon: Globe,         title: "Knowledge Base", contact: "agriaidai.com/help",   hours: "Always available" },
                ].map(({ icon: Icon, title, contact, hours }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="bg-muted border border-border p-2 rounded-md shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{contact}</p>
                      <p className="text-xs text-muted-foreground">{hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-8 space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "Start Disease Detection",  to: "/predict" },
                  { label: "View Dashboard",           to: "/dashboard" },
                  { label: "Admin Statistics",         to: "/admin" },
                ].map(({ label, to }) => (
                  <Link key={to} to={to}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-background hover:bg-accent transition-colors group">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  AgriAidAI is open-source software built with ❤️ for the farming community.
                  Weather data powered by{" "}
                  <a href="https://open-meteo.com" target="_blank" rel="noreferrer"
                     className="underline hover:text-foreground">Open-Meteo</a>.
                  Disease model trained on{" "}
                  <a href="https://plantvillage.psu.edu" target="_blank" rel="noreferrer"
                     className="underline hover:text-foreground">PlantVillage</a> dataset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;