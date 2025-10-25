import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import CartItem from "@/components/CartItem";
import { Link } from "wouter";
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";
import lettuceImg from "@assets/generated_images/Sample_product_lettuce_e8e9e93a.png";

export default function Cart() {
  const [items, setItems] = useState([
    {
      id: "1",
      image: tomatoesImg,
      name: "Organic Tomatoes",
      mode: "small" as const,
      price: 200,
      unit: "kg",
      quantity: 2,
    },
    {
      id: "2",
      image: lettuceImg,
      name: "Fresh Lettuce",
      mode: "bulk" as const,
      price: 3200,
      unit: "20kg crate",
      quantity: 5,
    },
  ]);

  const updateQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 500;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={items.length} showSearch={false} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="font-display font-bold text-3xl mb-6" data-testid="text-page-title">
          Shopping Cart ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/">
              <Button data-testid="button-browse">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-20 p-6 rounded-xl border border-border bg-card space-y-4">
                <h2 className="font-semibold text-lg">Order Summary</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold" data-testid="text-subtotal">
                      KES {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">KES {delivery.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl" data-testid="text-total">
                      KES {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => console.log('Proceeding to checkout with items:', items)}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav cartCount={items.length} />
    </div>
  );
}
