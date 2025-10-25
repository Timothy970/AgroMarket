import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, CheckCircle2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import heroImg from "@assets/generated_images/Farm_market_hero_image_da8fd8a9.png";
import fruitsIcon from "@assets/generated_images/Fruits_category_icon_53db4367.png";
import vegetablesIcon from "@assets/generated_images/Vegetables_category_icon_831a17de.png";
import grainsIcon from "@assets/generated_images/Grains_category_icon_66506445.png";
import dairyIcon from "@assets/generated_images/Dairy_category_icon_08e6529b.png";

export default function Landing() {
  const features = [
    {
      icon: fruitsIcon,
      title: "Fresh from Farm",
      description: "Connect directly with local farmers for the freshest produce",
    },
    {
      icon: vegetablesIcon,
      title: "Flexible Purchasing",
      description: "Buy small quantities or bulk orders to suit your needs",
    },
    {
      icon: grainsIcon,
      title: "Verified Sellers",
      description: "All farmers are verified by our admin team for quality assurance",
    },
    {
      icon: dairyIcon,
      title: "Fair Pricing",
      description: "Direct pricing from farmers means better value for you",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                A
              </div>
              <span className="font-display font-bold text-xl">
                AgroMarket
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-sign-in"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${heroImg})`,
          }}
        />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Farm Fresh Direct to You</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-4 leading-tight">
              Fresh Produce from Local Farmers
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Join AgroMarket to buy fresh agricultural products directly from verified farmers. 
              Support local agriculture while getting the best prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white/95 backdrop-blur-md text-foreground hover:bg-white border border-white/50"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20"
                onClick={() => window.location.href = "/api/login"}
              >
                I'm a Farmer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Why Choose AgroMarket?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building a marketplace that benefits both farmers and buyers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <img src={feature.icon} alt={feature.title} className="w-12 h-12 object-contain" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
                For Buyers
              </h2>
              <div className="space-y-4">
                {[
                  "Access fresh produce directly from local farmers",
                  "Choose between small or bulk purchase options",
                  "Secure payment with multiple options",
                  "Track your orders in real-time",
                  "Support local agriculture",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
                For Farmers
              </h2>
              <div className="space-y-4">
                {[
                  "Reach more customers without middlemen",
                  "Set your own prices and manage inventory",
                  "Flexible payout options (Mobile Money, Bank, PayPal)",
                  "Admin support and quality verification",
                  "Grow your agricultural business",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of buyers and farmers on AgroMarket today
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-join-now"
            >
              Join AgroMarket Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AgroMarket. Connecting farmers with buyers.</p>
        </div>
      </footer>
    </div>
  );
}
