import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import MobileNav from "@/components/MobileNav";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";

export default function Settings() {
  const { user, token, login } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [role, setRole] = useState(user?.role || "buyer");
  const [payoutMethod, setPayoutMethod] = useState<"mobile_money" | "bank_transfer" | "paypal">(
    (user as any)?.payoutMethod || "mobile_money"
  );
  
  const [mobileNumber, setMobileNumber] = useState((user as any)?.mobileNumber || "");
  const [bankName, setBankName] = useState((user as any)?.bankName || "");
  const [bankAccount, setBankAccount] = useState((user as any)?.bankAccount || "");
  const [paypalEmail, setPaypalEmail] = useState((user as any)?.paypalEmail || "");
  const [shippingAddress, setShippingAddress] = useState(""); // local dummy/mock field or can map from profile

  const updateRoleMutation = useMutation({
    mutationFn: (newRole: "buyer" | "seller") => userApi.updateRole(newRole),
    onSuccess: (res) => {
      if (res.status_code === 200 && token) {
        login(res.data as any, token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast({
          title: "Role Updated",
          description: `You are now logged in as a ${res.data.role}.`,
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const updatePayoutMutation = useMutation({
    mutationFn: (data: {
      payoutMethod: "mobile_money" | "bank_transfer" | "paypal";
      mobileNumber?: string;
      bankName?: string;
      bankAccount?: string;
      paypalEmail?: string;
    }) => userApi.updatePayoutMethod(data),
    onSuccess: (res) => {
      if (res.status_code === 200 && token) {
        login(res.data as any, token);
        toast({
          title: "Payout Settings Saved",
          description: "Your merchant payment details have been updated successfully.",
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Failed to Save",
        description: err.message || "Failed to update payout settings",
        variant: "destructive",
      });
    },
  });

  const handleSavePayout = () => {
    updatePayoutMutation.mutate({
      payoutMethod,
      mobileNumber: payoutMethod === "mobile_money" ? mobileNumber : undefined,
      bankName: payoutMethod === "bank_transfer" ? bankName : undefined,
      bankAccount: payoutMethod === "bank_transfer" ? bankAccount : undefined,
      paypalEmail: payoutMethod === "paypal" ? paypalEmail : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
      <Header cartCount={0} showSearch={false} />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <h1 className="font-display font-bold text-3xl mb-8">Account & Payout Settings</h1>

        <div className="grid gap-6">
          {/* Profile Details */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">Profile Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input value={user?.firstName || ""} disabled className="bg-muted cursor-not-allowed" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={user?.lastName || ""} disabled className="bg-muted cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled className="bg-muted cursor-not-allowed" />
              </div>
            </div>
          </Card>

          {/* User Role Management */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-2">User Role</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Switch your account type to buy farm crops or list items as a vendor.
            </p>
            <div className="flex items-center gap-4">
              <Select
                value={role}
                onValueChange={(val) => {
                  setRole(val);
                  updateRoleMutation.mutate(val as any);
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer / Customer</SelectItem>
                  <SelectItem value="seller">Seller / Farmer</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary">
                Current: {user?.role?.toUpperCase()}
              </Badge>
            </div>
          </Card>

          {/* Seller Payout Preferences */}
          {user?.role === "seller" && (
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-2">Farmer Payout & Payment Settings</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Define how you want to receive payments from customers. If you select Mobile Money, customers can pay you directly using STK Push.
              </p>

              <div className="space-y-6">
                <div>
                  <Label>Payout Method</Label>
                  <Select
                    value={payoutMethod}
                    onValueChange={(val: any) => setPayoutMethod(val)}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <SelectValue placeholder="Select Payout Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">M-Pesa / Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Account Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal Merchant Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payoutMethod === "mobile_money" && (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="mpesa-number">M-Pesa Paybill/Till Phone Number (or Till Merchant Shortcode)</Label>
                      <Input
                        id="mpesa-number"
                        placeholder="e.g. 0712345678 or Shortcode"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Use Safaricom format (e.g., 07XXXXXXXX or 2547XXXXXXXX).
                      </p>
                    </div>
                  </div>
                )}

                {payoutMethod === "bank_transfer" && (
                  <div className="grid gap-4 md:grid-cols-2 max-w-xl">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="e.g. KCB Bank, Equity Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        placeholder="e.g. 1234567890"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {payoutMethod === "paypal" && (
                  <div className="max-w-md">
                    <Label>PayPal Email Address</Label>
                    <Input
                      type="email"
                      placeholder="e.g. farmer@example.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSavePayout} 
                  disabled={updatePayoutMutation.isPending}
                  className="mt-4"
                >
                  {updatePayoutMutation.isPending ? "Saving Settings..." : "Save Merchant Preferences"}
                </Button>
              </div>
            </Card>
          )}

          {/* Shipping Address Information */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">Default Delivery Coordinates</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shipping-address">Shipping / Farm Pickup Address</Label>
                <Input
                  id="shipping-address"
                  placeholder="e.g. Langata Rd, House 42, Nairobi"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
              <Button onClick={() => toast({ title: "Address Saved", description: "Default shipping address set successfully." })}>
                Save Address
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileNav cartCount={0} />
    </div>
  );
}
