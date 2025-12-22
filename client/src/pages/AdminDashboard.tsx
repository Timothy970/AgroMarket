import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Users,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  CheckSquare,
  Settings,
  LogOut,
  ShieldCheck,
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
import tomatoesImg from "@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png";
import lettuceImg from "@assets/generated_images/Sample_product_lettuce_e8e9e93a.png";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [, setLocation] = useLocation();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { user, token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const stats = [
    { label: "Total Sales", value: "KES 1.2M", icon: DollarSign, color: "text-primary" },
    { label: "New Sellers", value: "24", icon: Users, color: "text-chart-1" },
    { label: "Pending Approvals", value: "8", icon: Clock, color: "text-chart-2" },
    { label: "Total Orders", value: "456", icon: ShoppingBag, color: "text-chart-4" },
  ];

  const pendingProducts = [
    {
      id: "1",
      name: "Organic Tomatoes",
      seller: "John's Farm",
      category: "Vegetables",
      smallPrice: 200,
      bulkPrice: 4500,
      submittedDate: "2024-10-22",
      images: [tomatoesImg],
      description: "Fresh organic tomatoes grown with care. Perfect for salads and cooking.",
      quantity: 500,
    },
    {
      id: "2",
      name: "Fresh Lettuce",
      seller: "Green Valley Farm",
      category: "Vegetables",
      smallPrice: 150,
      bulkPrice: 3200,
      submittedDate: "2024-10-23",
      images: [lettuceImg],
      description: "Crisp and fresh lettuce, harvested daily.",
      quantity: 300,
    },
  ];

  if (!isAuthenticated || user?.role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You must be an admin to access the admin dashboard.",
      variant: "destructive",
    });
    setTimeout(() => {
      setLocation("/");
    }, 2000);
    return null;
  }


  const AdminSidebar = (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <div className="font-semibold">AgroMarket Admin</div>
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
                  isActive={activeView === "approvals"}
                  onClick={() => setActiveView("approvals")}
                >
                  <CheckSquare />
                  <span>Approvals</span>
                  {pendingProducts.length > 0 && (
                    <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {pendingProducts.length}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "users"}
                  onClick={() => setActiveView("users")}
                >
                  <Users />
                  <span>Users</span>
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
      sidebar={AdminSidebar}
      breadcrumbs={[
        { label: "Admin Dashboard", href: "#" },
        { label: activeView.charAt(0).toUpperCase() + activeView.slice(1) },
      ]}
    >
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {activeView === "overview" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
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
                  <h2 className="text-lg font-semibold">Pending Approvals</h2>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("approvals")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {pendingProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Seller: {product.seller}</div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeView === "approvals" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Product Approvals</h1>
              <Badge variant="secondary">
                {pendingProducts.length} pending
              </Badge>
            </div>
            <div className="space-y-4">
              {pendingProducts.map((product) => {
                const isExpanded = expandedProduct === product.id;
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <div
                      className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">
                              {product.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span>By: {product.seller}</span>
                              <span>Category: {product.category}</span>
                              <span>Submitted: {product.submittedDate}</span>
                            </div>
                            <div className="flex gap-3 mt-2">
                              <Badge variant="secondary">Small: KES {product.smallPrice}/kg</Badge>
                              <Badge variant="secondary">Bulk: KES {product.bulkPrice}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4 border-t pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Available Quantity:</span>
                                <span className="font-medium">{product.quantity} kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Small Price:</span>
                                <span className="font-medium">KES {product.smallPrice}/kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bulk Price:</span>
                                <span className="font-medium">KES {product.bulkPrice}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Approved product: ${product.name}`);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectDialogOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {activeView === "users" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
              <div className="text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">User Management</h3>
                <p className="text-muted-foreground">User management features coming soon.</p>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Images need to be clearer. Please provide high-quality product photos."
                className="mt-1.5 min-h-32"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {rejectionReason.length} characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                console.log('Product rejected with reason:', rejectionReason);
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
