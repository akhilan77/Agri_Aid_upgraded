// Home page — hero + inline login form
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Leaf, Phone, BarChart3, Camera, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_PASSWORD = "password123#";

const Index = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();

    const handleSignIn = () => {
        if (!email.trim()) { setLoginError("Please enter your email."); return; }
        if (password !== DEFAULT_PASSWORD) { setLoginError("Incorrect password. Hint: password123#"); return; }
        const username = email.includes("@") ? email.split("@")[0] : email;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", username);
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-background">

            {/* Nav */}
            <nav className="border-b border-border bg-background sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Leaf className="h-5 w-5" />
                        AgriAidAI
                    </div>
                    <Link to="/about">
                        <Button variant="ghost" size="sm">About</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero + Form */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left — hero copy */}
                    <div className="space-y-8">
                        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            AI-Powered Crop Intelligence
                        </p>
                        <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                            AI-Powered Crop<br />Intelligence for Farmers
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Identify diseases early, act with confidence, and maximize harvest
                            outcomes using data-driven insights.
                        </p>

                        {/* Feature pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            {[
                                { icon: Zap, label: "Instant Disease Recognition" },
                                { icon: Camera, label: "Live Weather Intelligence" },
                                { icon: Shield, label: "Treatment Recommendations" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="bg-muted p-2 rounded-md">
                                        <Icon className="h-4 w-4 text-foreground" />
                                    </div>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Social proof */}
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-t border-border pt-6">
                            <span>10,000+ Farmers</span>
                            <span>50+ Countries</span>
                            <span>95%+ Accuracy</span>
                        </div>
                    </div>

                    {/* Right — login / signup form */}
                    <div>
                        <Card className="border border-border shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold text-foreground">Get started</CardTitle>
                                <CardDescription>Sign in or create an account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={tab} onValueChange={setTab}>
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger value="login">Sign In</TabsTrigger>
                                        {/* <TabsTrigger value="register">Sign Up</TabsTrigger> */}
                                    </TabsList>

                                    {/* Sign In */}
                                    <TabsContent value="login" className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="farmer@example.com"
                                                    className="pl-9 h-10"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="password">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    className="pl-9 pr-9 h-10"
                                                    value={password}
                                                    onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {loginError && (
                                            <p className="text-xs text-destructive">{loginError}</p>
                                        )}

                                        <Button className="w-full" onClick={handleSignIn}>
                                            Sign In
                                        </Button>

                                        <p className="text-center text-sm text-muted-foreground">
                                            <Link to="#" className="underline hover:text-foreground">Forgot password?</Link>
                                        </p>
                                    </TabsContent>

                                    {/* Sign Up */}
                                    <TabsContent value="register" className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" type="text" placeholder="John Doe" className="h-10" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="reg-email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="reg-email" type="email" placeholder="farmer@example.com" className="pl-9 h-10" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone">Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="phone" type="tel" placeholder="+1234567890" className="pl-9 h-10" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="reg-password">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="reg-password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a strong password"
                                                    className="pl-9 pr-9 h-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button className="w-full" onClick={() => navigate("/dashboard")}>
                                            Create Account
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>

            {/* Features strip */}
            <div className="border-t border-border bg-muted/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: "Instant Disease Recognition", desc: "Upload any crop photo and get a precise disease diagnosis in seconds." },
                            { icon: Camera, title: "Live Weather Intelligence", desc: "Real-time local weather data to help you plan and protect your crops." },
                            { icon: Shield, title: "Actionable Treatment Plans", desc: "Science-backed treatment and prevention recommendations for every detected disease." },
                            { icon: BarChart3, title: "Prediction History & Insights", desc: "Track every scan over time and spot trends across your crop cycles." },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex gap-4">
                                <div className="bg-background border border-border p-3 rounded-md h-fit">
                                    <Icon className="h-5 w-5 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-1">{title}</h3>
                                    <p className="text-sm text-muted-foreground">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Index;
