// Login page — minimal design
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Phone, Lock, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-foreground text-background">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Leaf className="h-5 w-5" />
          <span>AgriAidAI</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Smart Crop Advisory<br />for Modern Farmers
          </h1>
          <p className="text-background/70 text-lg leading-relaxed">
            Harness the power of AI to detect crop diseases instantly,
            get expert treatment plans, and protect your harvest.
          </p>

          <ul className="space-y-2 pt-4">
            {[
              "AI-Powered Disease Detection",
              "Real-time Weather Data",
              "Expert Treatment Recommendations",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-background/80 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-background/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-background/40 text-xs">© 2026 AgriAidAI</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 font-semibold text-lg lg:hidden">
            <Leaf className="h-5 w-5" />
            <span>AgriAidAI</span>
          </div>

          <Card className="border border-border shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to your farming dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                value={isLogin ? "login" : "register"}
                onValueChange={(v) => setIsLogin(v === "login")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                {/* ── Sign In ── */}
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

                  <Link to="/dashboard">
                    <Button className="w-full mt-2" variant="default">
                      Sign In
                    </Button>
                  </Link>

                  <p className="text-center text-sm text-muted-foreground">
                    <Link to="#" className="underline hover:text-foreground">
                      Forgot password?
                    </Link>
                  </p>
                </TabsContent>

                {/* ── Sign Up ── */}
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" className="h-10" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="farmer@example.com"
                        className="pl-9 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        className="pl-9 h-10"
                      />
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

                  <Button className="w-full mt-2" variant="default">
                    Create Account
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/" className="underline hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;