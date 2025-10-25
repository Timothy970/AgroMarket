import CategoryCard from '../CategoryCard';
import fruitsIcon from '@assets/generated_images/Fruits_category_icon_53db4367.png';

export default function CategoryCardExample() {
  return (
    <div className="max-w-xs">
      <CategoryCard
        icon={fruitsIcon}
        name="Fruits"
        count={24}
      />
    </div>
  );
}
