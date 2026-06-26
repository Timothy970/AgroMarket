import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, ordersApi, payoutsApi, type SupplierPayout } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SellerDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || user?.role !== "seller") {
    toast({
      title: "Access Denied",
      description: "You must be a seller to access the seller dashboard.",
      variant: "destructive",
    });
    //add a timeout to allow the toast to show before redirecting
    setTimeout(() => {
      setLocation("/register");
    }, 2000);
    return null;
  }
  const queryClient = useQueryClient();

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: () => productsApi.getAll({ sellerId: user?.id }),
    enabled: !!user?.id,
  });
  const products = productsResponse?.data || [];

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: () => ordersApi.getAll('seller'),
    enabled: !!user?.id,
  });
  const orders = ordersResponse?.data || [];

  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>("all");

  const { data: payoutsResponse, isLoading: payoutsLoading } = useQuery({
    queryKey: ['seller-payouts', user?.id, payoutStatusFilter],
    queryFn: () => payoutsApi.getSellerPayouts(payoutStatusFilter === "all" ? undefined : payoutStatusFilter),
    enabled: !!user?.id,
  });
  const payouts = payoutsResponse?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: any }) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  const totalEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const pendingOrders = orders.filter(o => ['placed', 'approved', 'packed', 'shipped'].includes(o.status)).length;
  const activeProductsCount = products.filter(p => p.status === 'approved').length;
  const totalSales = orders.length;

  const stats = [
    { label: "Total Earnings", value: `KES ${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: Clock, color: "text-chart-2" },
    { label: "Active Products", value: activeProductsCount.toString(), icon: Package, color: "text-chart-4" },
    { label: "Total Sales", value: totalSales.toString(), icon: ShoppingBag, color: "text-chart-1" },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: { variant: "default" as const, icon: CheckCircle2, label: "Approved" },
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected" },
    };
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const SellerSidebar = (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          <div className="font-semibold">AgroMarket Seller</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "overview"}
                  onClick={() => setActiveView("overview")}
                >
                  <LayoutDashboard />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "products"}
                  onClick={() => setActiveView("products")}
                >
                  <Package />
                  <span>Products</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "orders"}
                  onClick={() => setActiveView("orders")}
                >
                  <ShoppingBag />
                  <span>Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "payments"}
                  onClick={() => setActiveView("payments")}
                >
                  <DollarSign />
                  <span>Payments</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setLocation("/")}>
              <LogOut />
              <span>Back to Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );

  return (
    <DashboardLayout
      sidebar={SellerSidebar}
      breadcrumbs={[
        { label: "Seller Dashboard", href: "#" },
        { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) },
      ]}
    >
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {activeView === "overview" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
              <Button onClick={() => setLocation("/seller/add-product")}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Products</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("products")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {productsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading products...</p>
                  ) : products.length > 0 ? (
                    products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">Stock: {product.availableQuantity} {product.smallUnit}</div>
                        </div>
                        {getStatusBadge(product.status)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No products added yet</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeView === "products" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              <Button onClick={() => setLocation("/seller/add-product")}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            <div className="grid gap-4">
              {productsLoading ? (
                <p className="text-muted-foreground">Loading products...</p>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Price: KES {Number(product.smallPrice)}/{product.smallUnit}</span>
                          <span>Stock: {product.availableQuantity} {product.smallUnit}</span>
                          {product.bulkPrice && (
                            <span>Bulk Price: KES {Number(product.bulkPrice)}/{product.bulkUnit}</span>
                          )}
                        </div>
                        {product.rejectionReason && (
                          <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive-foreground">
                              <span className="font-semibold">Feedback:</span> {product.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/seller/edit-product/${product.id}`)} disabled>Edit</Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">You haven't listed any crops yet.</p>
              )}
            </div>
          </>
        )}

        {activeView === "orders" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            {ordersLoading ? (
              <p className="text-muted-foreground">Loading orders...</p>
            ) : orders.length > 0 ? (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                          <Badge>{order.status.toUpperCase()}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><span className="font-medium text-foreground">Delivery Address:</span> {order.deliveryAddress}</p>
                          <p><span className="font-medium text-foreground">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="font-semibold text-foreground mb-1">Items:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <li key={idx}>
                                  {item.productName} - {item.quantity} {item.unit} (KES {Number(item.subtotal).toLocaleString()})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start md:items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Payout</div>
                          <div className="font-bold text-lg text-primary">KES {Number(order.totalAmount).toLocaleString()}</div>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Select
                            value={order.status}
                            onValueChange={(val: any) => updateStatusMutation.mutate({ orderId: order.id, status: val })}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="placed">Placed</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="packed">Packed</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                  <p className="text-muted-foreground">When you receive orders, they will appear here.</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "payments" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Payments Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your earnings, payout status, and transaction history</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Status Filter:</span>
                <Select
                  value={payoutStatusFilter}
                  onValueChange={(val) => setPayoutStatusFilter(val)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {payoutsLoading ? (
              <p className="text-muted-foreground">Loading payments history...</p>
            ) : payouts && payouts.length > 0 ? (
              <div className="grid gap-4 mt-2">
                {payouts.map((payout: any) => {
                  let statusLabel = "Pending Approval";
                  let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                  
                  if (payout.status === 'approved') {
                    statusLabel = "Approved (Processing)";
                    statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                  } else if (payout.status === 'paid') {
                    statusLabel = "Paid via Mobile Money";
                    statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
                  }

                  return (
                    <Card key={payout.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-lg">Payout Reference #{payout.id.slice(0, 8)}</h3>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p><span className="font-medium text-foreground">Order Ref:</span> #{payout.orderId.slice(0, 8)}</p>
                            <p><span className="font-medium text-foreground">Payment Phone:</span> {payout.paymentPhone}</p>
                            <p><span className="font-medium text-foreground">Created:</span> {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-8 items-center">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Sales Subtotal</div>
                            <div className="font-semibold text-sm">KES {Number(payout.totalAmount).toLocaleString()}</div>
                          </div>
                          <div className="text-right border-l pl-8">
                            <div className="text-xs text-muted-foreground font-semibold">Net Payout</div>
                            <div className="font-bold text-xl text-primary">
                              {payout.payoutAmount ? `KES ${Number(payout.payoutAmount).toLocaleString()}` : "Pending Admin"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <DollarSign className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No payouts found</h3>
                  <p className="text-muted-foreground mt-1">When your orders are paid by buyers, payout requests will appear here.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
