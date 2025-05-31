
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.slug)}
          className="capitalize"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
