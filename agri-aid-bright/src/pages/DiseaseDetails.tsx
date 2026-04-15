// Disease details page
import { useLocation, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Stethoscope,
  Camera,
  TrendingUp,
  Calendar,
  Leaf
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

const DiseaseDetails = () => {
  const location = useLocation();
  const prediction = location.state?.prediction;

  // Fallback data if no prediction is passed
  const defaultPrediction = {
    disease: "Early Blight",
    confidence: 92,
    crop: "tomato",
    image: null,
    symptoms: [
      "Dark brown spots with concentric rings on leaves",
      "Yellowing of lower leaves",
      "Premature leaf drop",
      "V-shaped lesions extending from leaf margin"
    ],
    treatments: [
      "Apply copper-based fungicides every 7-14 days",
      "Remove infected plant debris",
      "Improve air circulation around plants",
      "Water at soil level to avoid wetting leaves"
    ],
    prevention: [
      "Use resistant varieties when available",
      "Practice crop rotation with non-host plants",
      "Apply preventive fungicide sprays",
      "Ensure proper plant spacing for air circulation"
    ]
  };

  const data = prediction || defaultPrediction;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "default";
    if (confidence >= 75) return "secondary";
    if (confidence >= 60) return "outline";
    return "destructive";
  };

  const getSeverityLevel = (confidence: number) => {
    if (confidence >= 90) return "High Confidence";
    if (confidence >= 75) return "Medium Confidence";
    if (confidence >= 60) return "Low Confidence";
    return "Very Low Confidence";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/predict">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Predict</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Disease Analysis Results</h1>
            <p className="text-muted-foreground">AI-powered diagnosis and treatment recommendations</p>
          </div>
        </div>

        {/* Main Results Card */}
        <Card className="mb-8 shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-primary p-4 rounded-2xl">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-foreground mb-2">
                    {data.disease}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Detected in {data.crop} crop
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getConfidenceColor(data.confidence)} className="mb-2 text-base px-3 py-1">
                  {data.confidence}% Confidence
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {getSeverityLevel(data.confidence)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          {data.image && (
            <CardContent className="pt-0 pb-6">
              <div className="bg-accent/30 rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Analyzed Image</span>
                </h3>
                <img 
                  src={data.image} 
                  alt="Analyzed crop" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-soft"
                />
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Symptoms */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-secondary" />
                <span>Symptoms</span>
              </CardTitle>
              <CardDescription>
                Key indicators of this disease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="bg-secondary/20 p-1.5 rounded-full shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">{symptom}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Treatment */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Treatment</span>
              </CardTitle>
              <CardDescription>
                Recommended immediate actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.treatments.map((treatment, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="bg-primary/20 p-1.5 rounded-full shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">{treatment}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prevention */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Prevention</span>
              </CardTitle>
              <CardDescription>
                Future prevention strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.prevention.map((measure, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="bg-primary/20 p-1.5 rounded-full shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground leading-relaxed">{measure}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/predict">
            <Button size="lg" variant="hero" className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Analyze Another Image</span>
            </Button>
          </Link>
          
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>View Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Additional Information */}
        <Card className="mt-8 shadow-soft">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <span>Disease Information</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Early Blight is a common fungal disease that affects tomatoes and other solanaceous crops. 
                  It typically occurs during warm, humid conditions and can significantly reduce yield if left untreated. 
                  Early detection and proper management are crucial for maintaining healthy crops.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  <span>Next Steps</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">1.</span>
                    <span>Implement immediate treatment measures</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">2.</span>
                    <span>Monitor crop health closely over the next 7-14 days</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">3.</span>
                    <span>Consider professional consultation if symptoms persist</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary">4.</span>
                    <span>Document progress for future reference</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseDetails;