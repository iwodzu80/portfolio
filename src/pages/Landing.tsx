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
import clicklyLogo from "@/assets/clickly-logo-new.png";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={clicklyLogo} alt="clickly.it logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-foreground">clickly.it</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-primary">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-portfolio-violet hover:bg-gradient-primary transition-all duration-300 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-portfolio-celadon/30 bg-portfolio-celadon/10 text-portfolio-celadon text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Professional Portfolio Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Showcase Your <span className="text-portfolio-violet">Technical</span> Excellence
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create a professional portfolio that highlights your diverse projects, 
            tracks engagement, and helps you stand out in the tech industry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-lg px-10 h-14 bg-portfolio-violet hover:bg-gradient-primary transition-all duration-300 text-white shadow-lg hover:shadow-xl">
                Start Building Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shared/demo">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-10 h-14 border-2 border-portfolio-violet text-portfolio-violet hover:bg-portfolio-violet hover:text-white transition-all duration-300">
                View Demo Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Everything You Need to <span className="text-portfolio-celadon">Shine</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for tech professionals to 
              curate and share their best work
            </p>
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-fr">
            {/* Large featured card - Manual Curation (LEFT) */}
            <div className="md:col-span-4 lg:col-span-3 md:row-span-2 p-10 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-xl transition-all duration-300 group">
              <div className="h-16 w-16 rounded-xl bg-portfolio-celadon/10 flex items-center justify-center text-portfolio-celadon mb-6 group-hover:bg-portfolio-violet group-hover:text-white transition-all duration-300">
                {features[0].icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">{features[0].title}</h3>
              <p className="text-lg text-muted-foreground">{features[0].description}</p>
            </div>

            {/* Medium card - Drag & Drop */}
            <div className="md:col-span-2 lg:col-span-3 p-8 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-lg transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-portfolio-celadon/10 flex items-center justify-center text-portfolio-celadon mb-4 group-hover:bg-portfolio-violet group-hover:text-white transition-all duration-300">
                {features[1].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{features[1].title}</h3>
              <p className="text-muted-foreground">{features[1].description}</p>
            </div>

            {/* Small card - Customization */}
            <div className="md:col-span-2 lg:col-span-2 p-8 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-lg transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-portfolio-celadon/10 flex items-center justify-center text-portfolio-celadon mb-4 group-hover:bg-portfolio-violet group-hover:text-white transition-all duration-300">
                {features[4].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{features[4].title}</h3>
              <p className="text-muted-foreground">{features[4].description}</p>
            </div>

            {/* Medium card - Privacy */}
            <div className="md:col-span-2 lg:col-span-2 p-8 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-lg transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-portfolio-celadon/10 flex items-center justify-center text-portfolio-celadon mb-4 group-hover:bg-portfolio-violet group-hover:text-white transition-all duration-300">
                {features[5].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{features[5].title}</h3>
              <p className="text-muted-foreground">{features[5].description}</p>
            </div>

            {/* Small card - Private Sharing */}
            <div className="md:col-span-2 lg:col-span-2 p-8 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-lg transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-portfolio-celadon/10 flex items-center justify-center text-portfolio-celadon mb-4 group-hover:bg-portfolio-violet group-hover:text-white transition-all duration-300">
                {features[2].icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{features[2].title}</h3>
              <p className="text-muted-foreground">{features[2].description}</p>
            </div>

            {/* Large featured card - Analytics (RIGHT) */}
            <div className="md:col-span-4 lg:col-span-3 lg:col-start-4 md:row-span-2 p-10 rounded-2xl bg-portfolio-violet text-white hover:shadow-xl transition-all duration-300 group">
              <div className="h-16 w-16 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-portfolio-violet transition-all duration-300">
                {features[3].icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{features[3].title}</h3>
              <p className="text-lg text-white/90">{features[3].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-border p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Why Tech Professionals Choose <span className="text-portfolio-violet">clickly.it</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-portfolio-celadon flex-shrink-0 mt-0.5" />
                <p className="text-lg text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-16 rounded-3xl bg-portfolio-violet">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Build Your Professional Portfolio?
          </h2>
          <p className="text-xl text-white/90">
            Join thousands of tech professionals showcasing their best work
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="gap-2 text-lg px-10 h-14 bg-white text-portfolio-violet hover:bg-portfolio-celadon hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={clicklyLogo} alt="clickly.it" className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground">
                © 2025 clickly.it. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-portfolio-violet transition-colors">
                Privacy Policy
              </Link>
              <Link to="/auth" className="hover:text-portfolio-violet transition-colors">
                Terms of Service
              </Link>
              <Link to="/auth" className="hover:text-portfolio-violet transition-colors">
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
