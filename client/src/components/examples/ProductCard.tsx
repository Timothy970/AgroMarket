import ProductCard from '../ProductCard';
import tomatoesImg from '@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id="1"
        image={tomatoesImg}
        name="Organic Tomatoes"
        seller="John's Farm"
        location="Nairobi, Kenya"
        smallPrice={200}
        smallUnit="kg"
        bulkPrice={4500}
        bulkUnit="25kg sack"
        approved={true}
      />
    </div>
  );
}
