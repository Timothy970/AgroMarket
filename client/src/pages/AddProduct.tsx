import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PayoutMethodSelector, { PayoutMethod } from "@/components/PayoutMethodSelector";
import { Link } from "wouter";

export default function AddProduct() {
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("mobile_money");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header cartCount={0} showSearch={false} />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/seller">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="font-display font-bold text-3xl mb-2" data-testid="text-page-title">
          Add New Product
        </h1>
        <p className="text-muted-foreground mb-8">
          All products are reviewed by an admin before going live
        </p>

        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="e.g., Organic Tomatoes"
                className="mt-1.5"
                data-testid="input-product-name"
              />
            </div>

            <div>
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger className="mt-1.5" data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell buyers about your product..."
                className="mt-1.5 min-h-24"
                data-testid="input-description"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Pricing</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="small-price">
                  Small Purchase Price (per kg) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="small-price"
                  type="number"
                  placeholder="200"
                  className="mt-1.5"
                  data-testid="input-small-price"
                />
              </div>
              <div>
                <Label htmlFor="small-unit">Unit</Label>
                <Input
                  id="small-unit"
                  placeholder="kg"
                  className="mt-1.5"
                  data-testid="input-small-unit"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-price">Bulk Purchase Price (optional)</Label>
                <Input
                  id="bulk-price"
                  type="number"
                  placeholder="4500"
                  className="mt-1.5"
                  data-testid="input-bulk-price"
                />
              </div>
              <div>
                <Label htmlFor="bulk-unit">Bulk Unit</Label>
                <Input
                  id="bulk-unit"
                  placeholder="25kg sack"
                  className="mt-1.5"
                  data-testid="input-bulk-unit"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">
                  Available Quantity (kg) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="500"
                  className="mt-1.5"
                  data-testid="input-quantity"
                />
              </div>
              <div>
                <Label htmlFor="harvest-date">Harvest Date</Label>
                <Input
                  id="harvest-date"
                  type="date"
                  className="mt-1.5"
                  data-testid="input-harvest-date"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Product Images</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium mb-1">Click to upload images</p>
              <p className="text-sm text-muted-foreground">
                Upload up to 5 images (JPG, PNG up to 5MB each)
              </p>
              <input type="file" className="hidden" accept="image/*" multiple />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Payout Method</h2>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to receive payments for your sales
            </p>
            <PayoutMethodSelector
              selectedMethod={payoutMethod}
              onMethodChange={setPayoutMethod}
              mobileNumber={mobileNumber}
              onMobileNumberChange={setMobileNumber}
              bankAccount={bankAccount}
              onBankAccountChange={setBankAccount}
              bankName={bankName}
              onBankNameChange={setBankName}
              paypalEmail={paypalEmail}
              onPaypalEmailChange={setPaypalEmail}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => console.log('Product submitted for approval')}
              data-testid="button-submit"
            >
              Submit for Approval
            </Button>
            <Button variant="outline" size="lg" data-testid="button-save-draft">
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <MobileNav cartCount={0} />
    </div>
  );
}
