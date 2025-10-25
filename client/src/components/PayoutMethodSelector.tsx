import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Smartphone, Building2, Mail, Check } from "lucide-react";

export type PayoutMethod = "mobile_money" | "bank_transfer" | "paypal";

interface PayoutMethodSelectorProps {
  selectedMethod: PayoutMethod;
  onMethodChange: (method: PayoutMethod) => void;
  mobileNumber?: string;
  onMobileNumberChange?: (value: string) => void;
  bankAccount?: string;
  onBankAccountChange?: (value: string) => void;
  bankName?: string;
  onBankNameChange?: (value: string) => void;
  paypalEmail?: string;
  onPaypalEmailChange?: (value: string) => void;
}

export default function PayoutMethodSelector({
  selectedMethod,
  onMethodChange,
  mobileNumber,
  onMobileNumberChange,
  bankAccount,
  onBankAccountChange,
  bankName,
  onBankNameChange,
  paypalEmail,
  onPaypalEmailChange,
}: PayoutMethodSelectorProps) {
  return (
    <RadioGroup
      value={selectedMethod}
      onValueChange={(value) => {
        onMethodChange(value as PayoutMethod);
        console.log(`Payout method changed to: ${value}`);
      }}
      className="space-y-4"
    >
      <div
        className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
          selectedMethod === "mobile_money" ? "border-primary bg-primary/5" : "border-border"
        }`}
        onClick={() => onMethodChange("mobile_money")}
        data-testid="button-payout-mobile"
      >
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="mobile_money" id="mobile_money" />
              <Label htmlFor="mobile_money" className="font-semibold cursor-pointer">
                Mobile Money (M-Pesa)
              </Label>
              {selectedMethod === "mobile_money" && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-7">
              Receive payments directly to your mobile money account
            </p>
            {selectedMethod === "mobile_money" && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <Label htmlFor="mobile-number" className="text-sm">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobile-number"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={mobileNumber}
                    onChange={(e) => onMobileNumberChange?.(e.target.value)}
                    className="mt-1.5"
                    data-testid="input-mobile-number"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
          selectedMethod === "bank_transfer" ? "border-primary bg-primary/5" : "border-border"
        }`}
        onClick={() => onMethodChange("bank_transfer")}
        data-testid="button-payout-bank"
      >
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer" className="font-semibold cursor-pointer">
                Bank Transfer
              </Label>
              {selectedMethod === "bank_transfer" && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-7">
              Receive payments via direct bank transfer
            </p>
            {selectedMethod === "bank_transfer" && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <Label htmlFor="bank-name" className="text-sm">
                    Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bank-name"
                    type="text"
                    placeholder="e.g., Equity Bank"
                    value={bankName}
                    onChange={(e) => onBankNameChange?.(e.target.value)}
                    className="mt-1.5"
                    data-testid="input-bank-name"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-account" className="text-sm">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bank-account"
                    type="text"
                    placeholder="Enter your account number"
                    value={bankAccount}
                    onChange={(e) => onBankAccountChange?.(e.target.value)}
                    className="mt-1.5"
                    data-testid="input-bank-account"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
          selectedMethod === "paypal" ? "border-primary bg-primary/5" : "border-border"
        }`}
        onClick={() => onMethodChange("paypal")}
        data-testid="button-payout-paypal"
      >
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="font-semibold cursor-pointer">
                PayPal
              </Label>
              {selectedMethod === "paypal" && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-7">
              Receive international payments via PayPal
            </p>
            {selectedMethod === "paypal" && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <Label htmlFor="paypal-email" className="text-sm">
                    PayPal Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={paypalEmail}
                    onChange={(e) => onPaypalEmailChange?.(e.target.value)}
                    className="mt-1.5"
                    data-testid="input-paypal-email"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}
