import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthDialog from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BarChart3,
  Megaphone,
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

export default function ForBusinesses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      // If already logged in, redirect to dashboard
      navigate("/business/dashboard");
    } else {
      // Open auth dialog with business role pre-selected
      setAuthDialogOpen(true);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Onboarding",
      description: "Set up your business in minutes with AI assistance. Just describe your business and we'll handle the rest.",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track revenue, popular services, peak booking times, and customer trends with detailed insights.",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: Megaphone,
      title: "AI Marketing Tools",
      description: "Automated marketing campaigns, customer retention, and promotional content generation.",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: MessageSquare,
      title: "AI Customer Service",
      description: "Automated customer communication, booking confirmations, and smart responses to inquiries.",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      icon: Calendar,
      title: "Smart Booking System",
      description: "24/7 online bookings with automatic reminders, buffer times, and conflict prevention.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Complete customer history, preferences, booking patterns, and review management.",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
  ];

  const benefits = [
    "No setup fees or hidden costs",
    "Cancel anytime, no long-term contracts",
    "24/7 customer support",
    "Mobile-friendly dashboard",
    "Secure payment processing",
    "SEO-optimized business pages",
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up Free",
      description: "Create your account in 2 minutes. No credit card required for the first month.",
    },
    {
      step: 2,
      title: "AI-Powered Setup",
      description: "Describe your business and let AI set up your profile, services, and hours automatically.",
    },
    {
      step: 3,
      title: "Start Receiving Bookings",
      description: "Customers find and book you instantly. Manage everything from your dashboard.",
    },
    {
      step: 4,
      title: "Grow Your Business",
      description: "Use analytics and AI tools to optimize your services and grow your customer base.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        preSelectedRole="business"
      />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-3 w-3 mr-2" />
              AI-Powered Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Grow Your Beauty & Wellness Business
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
              Join thousands of businesses using AI to manage appointments, customers, and growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-lg px-8 py-6"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ 1 month free trial • ✓ No credit card required • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features for Your Business</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and grow your beauty & wellness business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes, not days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Start free, then just $15.99/month. No hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center pb-8">
                <Badge className="mb-4" variant="secondary">
                  Most Popular
                </Badge>
                <CardTitle className="text-4xl mb-2">Pro Plan</CardTitle>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">$15.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-lg mt-2">
                  After 1 month free trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-base">{benefit}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-base">
                      <strong>All AI Features:</strong> Onboarding, Analytics, Marketing, Customer Service
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full text-lg py-6"
                  onClick={handleGetStarted}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Businesses</h2>
            <p className="text-lg text-muted-foreground">
              Join the growing community of beauty & wellness professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base mb-4 italic">
                  "The AI onboarding saved me hours of setup time. My business was live in minutes!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">Hair Salon Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base mb-4 italic">
                  "Analytics helped me understand my peak times and optimize my schedule. Revenue increased 30%!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Mike T.</p>
                    <p className="text-sm text-muted-foreground">Barbershop Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base mb-4 italic">
                  "AI marketing tools brought in new customers automatically. Best investment I've made!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Lisa K.</p>
                    <p className="text-sm text-muted-foreground">Spa Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-sm text-muted-foreground">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Bookings Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses using AI to manage and grow their beauty & wellness services
            </p>
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ 1 month free • ✓ No credit card required • ✓ Set up in minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

