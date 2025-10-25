import OrderTrackingTimeline from '../OrderTrackingTimeline';

export default function OrderTrackingTimelineExample() {
  return (
    <div className="max-w-4xl space-y-8 p-4">
      <div>
        <h3 className="font-semibold mb-4">Regular Order - Shipped</h3>
        <OrderTrackingTimeline currentStatus="shipped" />
      </div>
      <div>
        <h3 className="font-semibold mb-4">Bulk Order - Awaiting Payment</h3>
        <OrderTrackingTimeline currentStatus="awaiting_payment" isBulkOrder={true} />
      </div>
    </div>
  );
}
