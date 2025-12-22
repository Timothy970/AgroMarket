import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import CartItem from "@/components/CartItem";
import { Link, useLocation } from "wouter";
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";
import lettuceImg from "@assets/generated_images/Sample_product_lettuce_e8e9e93a.png";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { cartApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: cartResponse, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getItems(token!),
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity, token }: { id: string; quantity: number; token: string }) =>
      cartApi.updateQuantity(id, quantity, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Success",
        description: "Quantity updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => cartApi.removeItem(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please log in to view your cart.",
      variant: "destructive",
    });
    setTimeout(() => {
      setLocation("/login");
    }, 2000);
    return null;
  }

  const cartData = cartResponse?.data;
  const items = cartData?.items || [];

  const updateQuantity = (productId: string, quantity: number) => {
    if (!token) return;
    updateQuantityMutation.mutate({ id: productId, quantity, token });
  };

  const removeItem = (id: string) => {
    if (!token) return;
    removeItemMutation.mutate({ id, token });
  };

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

        {cartLoading ? (
          <div className="text-center py-12">Loading cart...</div>
        ) : items.length === 0 ? (
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
                  id={item.id}
                  image={item.product.images[0]}
                  name={item.product.name}
                  mode={item.purchaseMode}
                  price={Number(item.purchaseMode === 'bulk' ? item.product.bulkPrice : item.product.smallPrice)}
                  unit={item.purchaseMode === 'bulk' ? item.product.bulkUnit || 'unit' : item.product.smallUnit}
                  quantity={item.quantity}
                  onQuantityChange={(quantity) => updateQuantity(item.productId, quantity)}
                  onRemove={() => removeItem(item.productId)}
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
                      KES {cartData?.sub_total?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax (16%)</span>
                    <span className="font-semibold">
                      KES {cartData?.estimated_tax?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">KES {cartData?.delivery_charge?.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl" data-testid="text-total">
                      KES {cartData?.total?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => console.log('Proceeding to checkout')}
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
