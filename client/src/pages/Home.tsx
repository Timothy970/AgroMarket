import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import heroImg from "@assets/generated_images/Farm_market_hero_image_da8fd8a9.png";
import fruitsIcon from "@assets/generated_images/Fruits_category_icon_53db4367.png";
import vegetablesIcon from "@assets/generated_images/Vegetables_category_icon_831a17de.png";
import grainsIcon from "@assets/generated_images/Grains_category_icon_66506445.png";
import dairyIcon from "@assets/generated_images/Dairy_category_icon_08e6529b.png";
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";
import lettuceImg from "@assets/generated_images/Sample_product_lettuce_e8e9e93a.png";
import mangoesImg from "@assets/generated_images/Sample_product_mangoes_7f0ae531.png";

export default function Home() {
  const categories = [
    { icon: fruitsIcon, name: "Fruits", count: 24 },
    { icon: vegetablesIcon, name: "Vegetables", count: 32 },
    { icon: grainsIcon, name: "Grains", count: 18 },
    { icon: dairyIcon, name: "Dairy", count: 12 },
  ];

  const featuredProducts = [
    {
      id: "1",
      image: tomatoesImg,
      name: "Organic Tomatoes",
      seller: "John's Farm",
      location: "Nairobi, Kenya",
      smallPrice: 200,
      smallUnit: "kg",
      bulkPrice: 4500,
      bulkUnit: "25kg sack",
      approved: true,
    },
    {
      id: "2",
      image: lettuceImg,
      name: "Fresh Lettuce",
      seller: "Green Valley Farm",
      location: "Nakuru, Kenya",
      smallPrice: 150,
      smallUnit: "kg",
      bulkPrice: 3200,
      bulkUnit: "20kg crate",
      approved: true,
    },
    {
      id: "3",
      image: mangoesImg,
      name: "Sweet Mangoes",
      seller: "Tropical Farms",
      location: "Mombasa, Kenya",
      smallPrice: 180,
      smallUnit: "kg",
      bulkPrice: 8500,
      bulkUnit: "50kg box",
      approved: true,
    },
    {
      id: "4",
      image: tomatoesImg,
      name: "Cherry Tomatoes",
      seller: "Urban Gardens",
      location: "Kiambu, Kenya",
      smallPrice: 300,
      smallUnit: "kg",
      approved: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={0} />

      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
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
              Buy small or bulk quantities directly from verified farmers. 
              Fresh, affordable, and delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white/95 backdrop-blur-md text-foreground hover:bg-white border border-white/50"
                data-testid="button-browse-products"
              >
                Browse Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20"
                data-testid="button-sell-produce"
              >
                Sell Your Produce
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Featured Products
            </h2>
            <Button variant="ghost" className="hidden md:inline-flex" data-testid="button-view-all">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-display font-bold text-2xl md:text-4xl mb-4">
              Are you a farmer?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of farmers selling directly to buyers. 
              Set your prices, manage your inventory, and grow your business.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              data-testid="button-start-selling"
            >
              Start Selling Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <MobileNav cartCount={0} />
    </div>
  );
}
