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
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, ordersApi } from "@/lib/api";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [, setLocation] = useLocation();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user, token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  
  const queryClient = useQueryClient();

  const { data: pendingProductsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: () => productsApi.getAll({ status: 'pending' }),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const pendingProducts = pendingProductsResponse?.data || [];

  const { data: ordersResponse } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: () => ordersApi.getAll(),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allOrders = ordersResponse?.data || [];

  const { data: usersResponse } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => api.get('/api/admin/users').then(res => res.data),
    enabled: isAuthenticated && user?.role === 'admin',
  });
  const allUsers = usersResponse?.data || [];

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/admin/products/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      toast({
        title: "Approved",
        description: "Product approved successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to approve product",
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/admin/products/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      toast({
        title: "Rejected",
        description: "Product rejected successfully",
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedProductId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to reject product",
        variant: "destructive",
      });
    }
  });

  const totalSalesAmount = allOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const newSellersCount = allUsers.filter((u: any) => u.role === 'seller').length;

  const stats = [
    { label: "Total Sales", value: `KES ${totalSalesAmount.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "New Sellers", value: newSellersCount.toString(), icon: Users, color: "text-chart-1" },
    { label: "Pending Approvals", value: pendingProducts.length.toString(), icon: Clock, color: "text-chart-2" },
    { label: "Total Orders", value: allOrders.length.toString(), icon: ShoppingBag, color: "text-chart-4" },
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
                  {productsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading pending products...</p>
                  ) : pendingProducts.length > 0 ? (
                    pendingProducts.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">Seller: {product.sellerId.slice(0, 8)}</div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No pending approvals</p>
                  )}
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
              {productsLoading ? (
                <p className="text-muted-foreground">Loading pending crop requests...</p>
              ) : pendingProducts.length > 0 ? (
                pendingProducts.map((product) => {
                  const isExpanded = expandedProduct === product.id;
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">
                                {product.name}
                              </h3>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span>Seller ID: {product.sellerId.slice(0, 8)}</span>
                                <span>Submitted: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span>
                              </div>
                              <div className="flex gap-3 mt-2">
                                <Badge variant="secondary">Small: KES {Number(product.smallPrice)}/{product.smallUnit}</Badge>
                                {product.bulkPrice && (
                                  <Badge variant="secondary">Bulk: KES {Number(product.bulkPrice)}/{product.bulkUnit}</Badge>
                                )}
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
                                  <span className="font-medium">{product.availableQuantity} kg</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Small Price:</span>
                                  <span className="font-medium">KES {Number(product.smallPrice)}/{product.smallUnit}</span>
                                </div>
                                {product.bulkPrice && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bulk Price:</span>
                                    <span className="font-medium">KES {Number(product.bulkPrice)}/{product.bulkUnit}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                approveMutation.mutate(product.id);
                              }}
                              disabled={approveMutation.isPending}
                            >
                              {approveMutation.isPending && approveMutation.variables === product.id ? "Approving..." : "Approve"}
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProductId(product.id);
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
                })
              ) : (
                <p className="text-muted-foreground">No pending product approvals.</p>
              )}
            </div>
          </>
        )}

        {activeView === "users" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight mb-4">Users</h1>
            {allUsers && allUsers.length > 0 ? (
              <div className="border rounded-lg overflow-hidden bg-card">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {allUsers.map((u: any) => (
                        <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">
                            {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "N/A"}
                          </td>
                          <td className="p-4 align-middle">{u.email}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'seller' ? 'default' : 'secondary'}>
                              {u.role.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No users registered</h3>
                </div>
              </div>
            )}
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
                if (selectedProductId) {
                  rejectMutation.mutate({ id: selectedProductId, reason: rejectionReason });
                }
              }}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Confirming..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
