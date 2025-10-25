import { useState } from 'react';
import CartItem from '../CartItem';
import tomatoesImg from '@assets/generated_images/Sample_product_tomatoes_cc18b3ed.png';

export default function CartItemExample() {
  const [quantity, setQuantity] = useState(2);

  return (
    <div className="max-w-2xl p-4">
      <CartItem
        id="1"
        image={tomatoesImg}
        name="Organic Tomatoes"
        mode="small"
        price={200}
        unit="kg"
        quantity={quantity}
        onQuantityChange={setQuantity}
        onRemove={() => console.log('Item removed')}
      />
    </div>
  );
}
