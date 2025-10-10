import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FolderKanban, 
  Share2, 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Shield,
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import clicklyLogo from "@/assets/clickly-logo.png";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // SEO meta tags
    document.title = "clickly.it - Professional Portfolio Platform for Tech Professionals";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Create stunning portfolios for tech professionals. Curate projects, track engagement, and share your work with advanced analytics and privacy controls.");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Create stunning portfolios for tech professionals. Curate projects, track engagement, and share your work with advanced analytics and privacy controls.";
      document.head.appendChild(meta);
    }
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <FolderKanban className="h-6 w-6" />,
      title: "Manual Project Curation",
      description: "Add and showcase your technical projects with detailed descriptions and links"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Drag & Drop Organization",
      description: "Easily organize your projects with intuitive drag-and-drop functionality"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Private Sharing Controls",
      description: "Share your portfolio securely with customizable access controls"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track portfolio engagement and visitor insights with detailed analytics"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Flexible Customization",
      description: "Tailor your portfolio to reflect your unique professional brand"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy Compliance",
      description: "Strict privacy controls and 99% uptime reliability guarantee"
    }
  ];

  const benefits = [
    "Highlight diverse technical projects",
    "Professional presentation templates",
    "Skill mapping and guidance",
    "Secure portfolio sharing",
    "Real-time engagement tracking",
    "Mobile-responsive design"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={clicklyLogo} alt="clickly.it logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Users className="h-4 w-4" />
            Join 25,000+ Tech Professionals
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Showcase Your Technical Excellence
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create a professional portfolio that highlights your diverse projects, 
            tracks engagement, and helps you stand out in the tech industry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Building Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shared/demo">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                View Demo Portfolio
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">25K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$800K</div>
              <div className="text-sm text-muted-foreground">ARR Target</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Shine
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for tech professionals to 
              curate and share their best work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl my-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Tech Professionals Choose clickly.it
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-primary/5 border-2 border-primary/20">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Build Your Professional Portfolio?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of tech professionals showcasing their best work
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-lg px-8">
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={clicklyLogo} alt="clickly.it" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">
                © 2025 clickly.it. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
