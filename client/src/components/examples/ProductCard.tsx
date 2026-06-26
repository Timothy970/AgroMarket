import ProductCard from '../ProductCard';
import tomatoesImg from '@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        product={{
          id: "1",
          sellerId: "seller1",
          name: "Organic Tomatoes",
          description: "Fresh organic tomatoes",
          categoryId: "cat1",
          smallPrice: "200",
          smallUnit: "kg",
          bulkPrice: "4500",
          bulkUnit: "25kg sack",
          minBulkQuantity: 1,
          availableQuantity: 100,
          harvestDate: new Date(),
          images: [tomatoesImg],
          location: "Nairobi, Kenya",
          status: "approved",
          isFeatured: false,
          rejectionReason: null,
          approvedAt: new Date(),
          approvedBy: "admin1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    </div>
  );
}
