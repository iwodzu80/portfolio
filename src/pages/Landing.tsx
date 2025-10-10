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
  Zap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import clicklyLogo from "@/assets/clickly-logo-new.png";
import featureCuration from "@/assets/feature-curation.png";
import featureSharing from "@/assets/feature-sharing.png";
import featureAnalytics from "@/assets/feature-analytics.png";
import featureCustomization from "@/assets/feature-customization.png";

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
      description: "Add and showcase your technical projects with detailed descriptions and links",
      image: featureCuration
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Private Sharing Controls",
      description: "Share your portfolio securely with customizable access controls",
      image: featureSharing
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track portfolio engagement and visitor insights with detailed analytics",
      image: featureAnalytics
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Flexible Customization",
      description: "Tailor your portfolio to reflect your unique professional brand",
      image: featureCustomization
    }
  ];

  const benefits = [
    "Quick portfolio setup - minutes, not hours",
    "No coding required - focus on your work, not websites",
    "Clean, structured format for quick candidate evaluation",
    "Privacy-first sharing - control who sees your work",
    "Clear signal-to-noise ratio - showcase what matters",
    "Works across all tech disciplines and roles"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
              clickly.it
            </span>
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
            Professional Portfolios That <span className="text-portfolio-violet">Recruiters Love</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-white border border-border hover:border-portfolio-violet hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-6">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Value Proposition Section */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Built for <span className="text-portfolio-violet">Professionals</span> and <span className="text-portfolio-celadon">Recruiters</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              By focusing on simplicity and user control while embracing a broad definition of demonstrable work, 
              Clickly helps professionals create compelling portfolios quickly while giving hiring managers 
              the clear, structured information they need to evaluate candidates effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Professionals */}
            <div className="bg-white rounded-2xl border border-border p-8 hover:border-portfolio-violet hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-portfolio-violet/10 text-portfolio-violet text-sm font-medium mb-6">
                For Professionals
              </div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Showcase Your Best Work, Fast
              </h3>
              <div className="space-y-4">
                {[
                  "Quick portfolio setup - minutes, not hours",
                  "No coding required - focus on your work, not websites",
                  "Privacy-first sharing - control who sees your work",
                  "Works across all tech disciplines and roles"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-portfolio-violet flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Recruiters */}
            <div className="bg-white rounded-2xl border border-border p-8 hover:border-portfolio-celadon hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-portfolio-celadon/10 text-portfolio-celadon text-sm font-medium mb-6">
                For Recruiters
              </div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Evaluate Candidates Efficiently
              </h3>
              <div className="space-y-4">
                {[
                  "Clean, structured format for quick candidate evaluation",
                  "Clear signal-to-noise ratio - see what matters most",
                  "Consistent presentation across all candidates",
                  "Direct access to project links and demonstrations"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-portfolio-celadon flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 p-16 rounded-3xl bg-portfolio-violet">
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
            <div className="flex items-center gap-2">
              <span className="text-xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
                clickly.it
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
