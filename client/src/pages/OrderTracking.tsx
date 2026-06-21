import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";

export default function OrderTracking() {
  const [match, params] = useRoute("/orders/:id");
  const orderId = match ? params.id : null;

  const { data: orderResponse, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  const order = orderResponse?.data || null;

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
        <Header cartCount={0} showSearch={false} />
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
        <MobileNav cartCount={0} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
        <Header cartCount={0} showSearch={false} />
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-muted-foreground">Order not found</p>
        </div>
        <MobileNav cartCount={0} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={0} showSearch={false} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="font-display font-bold text-3xl mb-2" data-testid="text-page-title">
          Track Your Order
        </h1>
        <p className="text-muted-foreground mb-8">Order #{order.id}</p>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-6">Order Status</h2>
            <OrderTrackingTimeline currentStatus={order.status} isBulkOrder={order.items.some((i: any) => i.purchaseMode === 'bulk')} />
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">KES {Number(item.subtotal).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      KES {Number(item.unitPrice).toLocaleString()} / {item.unit}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">KES {Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold">KES {Number(order.deliveryFee).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl" data-testid="text-order-total">
                    KES {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          </Card>
        </div>
      </div>

      <MobileNav cartCount={0} />
    </div>
  );
}
