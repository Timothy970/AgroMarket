import { Check, Package, Truck, CheckCircle2, DollarSign } from "lucide-react";

export type OrderStatus = 
  | "placed" 
  | "approved" 
  | "packed" 
  | "shipped" 
  | "awaiting_payment" 
  | "delivered"
  | "cancelled";

interface OrderTrackingTimelineProps {
  currentStatus: OrderStatus;
  isBulkOrder?: boolean;
}

const steps = [
  { status: "placed", label: "Placed", icon: CheckCircle2 },
  { status: "approved", label: "Approved", icon: Check },
  { status: "packed", label: "Packed", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
];

const bulkSteps = [
  ...steps,
  { status: "awaiting_payment", label: "Awaiting Balance", icon: DollarSign },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderTrackingTimeline({
  currentStatus,
  isBulkOrder = false,
}: OrderTrackingTimelineProps) {
  const activeSteps = isBulkOrder ? bulkSteps : [...steps, { status: "delivered", label: "Delivered", icon: CheckCircle2 }];
  const currentIndex = activeSteps.findIndex(step => step.status === currentStatus);

  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between">
        {activeSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.status} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                  data-testid={`status-${step.status}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium mt-2 ${
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < activeSteps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    index < currentIndex ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="md:hidden space-y-4">
        {activeSteps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < activeSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 ${
                      index < currentIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pt-2">
                <span
                  className={`text-sm font-medium ${
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
