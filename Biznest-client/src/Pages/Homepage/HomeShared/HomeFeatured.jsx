import { FeatProductCard } from "../../../Components/Cards";
import { useFeaturedProducts } from "../../../Hooks/useProducts";

const HomeFeatured = ({
  products = null,
  loading: externalLoading = null,
  title = "Featured Products",
  description = null,
  maxProducts = 8,
  showWishlist = true,
  showAddToCart = true,
  backgroundColor = "bg-gray-50",
}) => {
  const { data: fetchedProducts = [], isLoading: internalLoading } =
    useFeaturedProducts();

  const displayProducts = products !== null ? products : fetchedProducts;
  const isLoading =
    externalLoading !== null ? externalLoading : internalLoading;

  return (
    <section className={`py-16 px-4 ${backgroundColor}`}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-gray-600">Loading featured products...</p>
          </div>
        ) : Array.isArray(displayProducts) && displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.slice(0, maxProducts).map((product) => (
              <FeatProductCard
                key={product.product_id}
                product={product}
                showWishlist={showWishlist}
                showAddToCart={showAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600">
              No featured products available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeFeatured;
