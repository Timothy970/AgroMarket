import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PayoutMethodSelector, { PayoutMethod } from "@/components/PayoutMethodSelector";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { categoriesApi, productsApi } from "@/lib/api";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { token, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [smallPrice, setSmallPrice] = useState("");
  const [smallUnit, setSmallUnit] = useState("kg");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkUnit, setBulkUnit] = useState("");
  const [minBulkQuantity, setMinBulkQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [locationName, setLocationName] = useState("Nairobi, Kenya");

  // Image Upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Payout states
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("mobile_money");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  // Fetch real categories from database
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });
  const categories = categoriesResponse?.data || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", files[0]);

      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status_code === 200) {
        const fileUrl = response.data.data.url;
        setUploadedImages((prev) => [...prev, fileUrl]);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: response.data.message || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "An error occurred during file upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!name || !categoryId || !smallPrice || !availableQuantity) {
        throw new Error("Please fill in all required fields.");
      }

      // First update payout preferences if seller settings change
      if (token) {
        await api.patch("/api/user/payout", {
          payoutMethod,
          mobileNumber: mobileNumber || null,
          bankName: bankName || null,
          bankAccount: bankAccount || null,
          paypalEmail: paypalEmail || null,
        });
      }

      // Submit crop details
      return productsApi.create({
        name,
        description: description || null,
        categoryId,
        smallPrice: smallPrice.toString(),
        smallUnit,
        bulkPrice: bulkPrice ? bulkPrice.toString() : null,
        bulkUnit: bulkUnit || null,
        minBulkQuantity: minBulkQuantity ? parseInt(minBulkQuantity) : null,
        availableQuantity: parseInt(availableQuantity),
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        images: uploadedImages.length > 0 ? uploadedImages : ["/uploads/placeholder.png"],
        location: locationName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Product Submitted",
        description: "Your product has been submitted for admin moderation.",
      });
      setLocation("/seller");
    },
    onError: (err: any) => {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit product",
        variant: "destructive",
      });
    }
  });

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
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5" data-testid="select-category">
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="location">Farm Location</Label>
              <Input
                id="location"
                placeholder="e.g., Nakuru, Kenya"
                className="mt-1.5"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Pricing</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="small-price">
                  Small Purchase Price (per unit) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="small-price"
                  type="number"
                  placeholder="200"
                  className="mt-1.5"
                  data-testid="input-small-price"
                  value={smallPrice}
                  onChange={(e) => setSmallPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="small-unit">Unit</Label>
                <Input
                  id="small-unit"
                  placeholder="kg"
                  className="mt-1.5"
                  data-testid="input-small-unit"
                  value={smallUnit}
                  onChange={(e) => setSmallUnit(e.target.value)}
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
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bulk-unit">Bulk Unit (e.g., 25kg sack)</Label>
                <Input
                  id="bulk-unit"
                  placeholder="25kg sack"
                  className="mt-1.5"
                  data-testid="input-bulk-unit"
                  value={bulkUnit}
                  onChange={(e) => setBulkUnit(e.target.value)}
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
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="min-bulk">Min Bulk Quantity</Label>
                <Input
                  id="min-bulk"
                  type="number"
                  placeholder="5"
                  className="mt-1.5"
                  value={minBulkQuantity}
                  onChange={(e) => setMinBulkQuantity(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="harvest-date">Harvest Date</Label>
              <Input
                id="harvest-date"
                type="date"
                className="mt-1.5 w-full sm:w-auto"
                data-testid="input-harvest-date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Product Images</h2>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium mb-1">
                {isUploading ? "Uploading image..." : "Click to upload image"}
              </p>
              <p className="text-sm text-muted-foreground">
                Upload PNG or JPG format (Max 5MB)
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Or paste image URL (e.g., https://...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
              />
              <Button 
                type="button" 
                variant="secondary"
                disabled={!imageUrlInput.trim()}
                onClick={() => {
                  setUploadedImages((prev) => [...prev, imageUrlInput.trim()]);
                  setImageUrlInput("");
                  toast({
                    title: "Success",
                    description: "Image URL added successfully",
                  });
                }}
              >
                Add URL
              </Button>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                {uploadedImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group bg-muted">
                    <img src={imgUrl} alt="crop preview" className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
            <Link href="/seller" className="flex-1">
              <Button variant="outline" size="lg" className="w-full" data-testid="button-save-draft">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <MobileNav cartCount={0} />
    </div>
  );
}
