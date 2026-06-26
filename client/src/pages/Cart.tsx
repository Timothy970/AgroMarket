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
import { cartApi, ordersApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "@/lib/axios";

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

  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [mpesaType, setMpesaType] = useState<"till" | "paybill">("till");
  const [payDeposit, setPayDeposit] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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

  const removeItem = (productId: string) => {
    if (!token) return;
    removeItemMutation.mutate({ id: productId, token });
  };

  const handlePlaceOrder = async () => {
    if (!token) return;
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      toast({
        title: "Required Fields",
        description: "Please provide both delivery address and contact phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingOrder(true);
    try {
      let subtotal = 0;
      const mappedItems = items.map((item) => {
        const price = Number(item.purchaseMode === 'bulk' && item.product.bulkPrice
          ? item.product.bulkPrice
          : item.product.smallPrice);
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;

        return {
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          purchaseMode: item.purchaseMode,
          unitPrice: price.toString(),
          unit: item.purchaseMode === 'bulk' ? item.product.bulkUnit || 'unit' : item.product.smallUnit,
          subtotal: itemSubtotal.toString(),
          sellerId: item.product.sellerId,
        };
      });

      const uniqueSellerIds = Array.from(new Set(items.map(item => item.product.sellerId)));
      const orderSellerId = uniqueSellerIds.length === 1 ? uniqueSellerIds[0] : null;

      const deliveryFee = 500;
      const estimatedTax = Math.round(subtotal * 0.16);
      const totalAmount = subtotal + deliveryFee + estimatedTax;

      const isBulkGroup = items.some(i => i.purchaseMode === 'bulk');
      const depositAmount = isBulkGroup && payDeposit ? (totalAmount / 2) : null;
      const remainingBalance = isBulkGroup && payDeposit ? (totalAmount / 2) : null;

      const totalAmountToPay = depositAmount ? Number(depositAmount) : Number(totalAmount);

      const response = await ordersApi.create({
        sellerId: orderSellerId,
        deliveryAddress,
        subtotal: subtotal.toString(),
        deliveryFee: deliveryFee.toString(),
        totalAmount: totalAmount.toString(),
        depositAmount: depositAmount ? depositAmount.toString() : null,
        remainingBalance: remainingBalance ? remainingBalance.toString() : null,
        status: 'placed',
        depositPaid: false,
        balancePaid: false,
        items: mappedItems,
      } as any);

      if (response.status_code !== 200) {
        throw new Error(response.message || "Failed to place order");
      }

      const orderId = response.data?.id;

      await cartApi.clear(token);
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      if (paymentMethod === "stripe") {
        const payRes = await axios.post("/api/payments/stripe/create-checkout-session", {
          orderId,
          amount: totalAmountToPay,
          isDeposit: payDeposit,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: "Redirecting to Stripe",
          description: "Please complete the card payment.",
        });
        
        if (payRes.data?.data?.url) {
          window.location.href = payRes.data.data.url;
          return;
        }
      } else {
        const payRes = await axios.post("/api/payments/mpesa/stkpush", {
          orderId,
          phoneNumber: phoneNumber.trim(),
          amount: totalAmountToPay,
          type: mpesaType,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast({
          title: "M-Pesa STK Push Sent",
          description: "Please enter your PIN on your mobile phone to complete the transaction.",
        });
      }

      setCheckoutDialogOpen(false);
      
      if (orderId) {
        setLocation(`/orders/${orderId}`);
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      console.error("Order submission/payment error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Something went wrong while placing your order.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
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
                  onClick={() => setCheckoutDialogOpen(true)}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>

                <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Complete Your Order</DialogTitle>
                      <DialogDescription>
                        Please enter your delivery details to complete checkout.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Contact Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="e.g., +254 700 000000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Textarea
                          id="address"
                          placeholder="e.g., Apartment 4B, Karen Estate, Nairobi"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="payment">Payment Option</Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={(val: any) => setPaymentMethod(val)}
                        >
                          <SelectTrigger id="payment">
                            <SelectValue placeholder="Select Payment Option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa">Mobile Money (M-Pesa)</SelectItem>
                            <SelectItem value="stripe">Card Payment (Stripe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod === "mpesa" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="mpesa-type">M-Pesa Transaction Channel</Label>
                          <Select
                            value={mpesaType}
                            onValueChange={(val: any) => setMpesaType(val)}
                          >
                            <SelectTrigger id="mpesa-type">
                              <SelectValue placeholder="Select M-Pesa Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="till">Till Number (Buy Goods)</SelectItem>
                              <SelectItem value="paybill">Paybill</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {items.some(i => i.purchaseMode === 'bulk') && (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="pay-deposit"
                            checked={payDeposit}
                            onChange={(e) => setPayDeposit(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <Label htmlFor="pay-deposit" className="text-sm font-medium leading-none cursor-pointer">
                            Pay 50% Deposit upfront (Bulk Order Option)
                          </Label>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCheckoutDialogOpen(false)}
                        disabled={isSubmittingOrder}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isSubmittingOrder}
                      >
                        {isSubmittingOrder ? "Placing Order..." : "Confirm & Place Order"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav cartCount={items.length} />
    </div>
  );
}
