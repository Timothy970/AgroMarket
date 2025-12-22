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
  const stats = [
    { label: "Total Earnings", value: "KES 45,600", icon: DollarSign, color: "text-primary" },
    { label: "Pending Orders", value: "12", icon: Clock, color: "text-chart-2" },
    { label: "Active Products", value: "8", icon: Package, color: "text-chart-4" },
    { label: "Total Sales", value: "156", icon: ShoppingBag, color: "text-chart-1" },
  ];

  const products = [
    {
      id: "1",
      name: "Organic Tomatoes",
      status: "approved" as const,
      price: 200,
      stock: 500,
    },
    {
      id: "2",
      name: "Fresh Lettuce",
      status: "pending" as const,
      price: 150,
      stock: 300,
    },
    {
      id: "3",
      name: "Sweet Mangoes",
      status: "rejected" as const,
      price: 180,
      stock: 0,
      feedback: "Images need to be clearer. Please provide high-quality product photos.",
    },
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
                  {products.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Stock: {product.stock} kg</div>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                  ))}
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
              {products.map((product) => (
                <Card key={product.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Price: KES {product.price}/kg</span>
                        <span>Stock: {product.stock} kg</span>
                      </div>
                      {product.feedback && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive-foreground">
                            <span className="font-semibold">Feedback:</span> {product.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {product.status === "approved" && (
                        <Button variant="ghost" size="sm">Deactivate</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeView === "orders" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
              <div className="text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                <p className="text-muted-foreground">When you receive orders, they will appear here.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
