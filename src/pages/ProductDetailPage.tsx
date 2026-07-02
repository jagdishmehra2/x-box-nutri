import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { addToCart } from "../features/cart/cartSlice";
import { getProductBySlug } from "../services/productService";
import type { Product } from "../types/product";
import { formatCurrency } from "../utils/currency";
import { setDocumentMeta } from "../utils/seo";

const ProductDetailPage = () => {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setProductError("");

      try {
        const selectedProduct = await getProductBySlug(id);

        if (!isMounted) return;

        setProduct(selectedProduct);

        if (!selectedProduct) {
          setDocumentMeta({
            title: "Product Not Found | X-Box Nutrition",
            description: "The product you are looking for could not be found.",
          });
          return;
        }

        setDocumentMeta({
          title: `${selectedProduct.name} | X-Box Nutrition`,
          description: selectedProduct.shortDescription,
        });
      } catch (error) {
        if (!isMounted) return;

        setProduct(null);
        setProductError(
          error instanceof Error
            ? error.message
            : "Unable to load this product.",
        );
        setDocumentMeta({
          title: "Product Error | X-Box Nutrition",
          description: "Unable to load this product right now.",
        });
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoadingProduct) {
    return <Loader />;
  }

  if (productError) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState title="Unable to load product" description={productError} />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Product not found</h1>
        <p className="mt-2 text-zinc-400">
          The product may have been removed or renamed.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block text-lime-400 hover:text-lime-300"
        >
          Go back to products
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          className="h-[420px] w-full rounded-3xl border border-zinc-800 object-cover"
        />

        <article>
          <p className="text-sm uppercase tracking-wide text-lime-400">
            {product.category.replace("-", " ")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
            <Star className="h-4 w-4 fill-lime-300 text-lime-300" />
            <span>
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Product Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.brand && (
                <>
                  <span className="text-zinc-500">Brand</span>

                  <span className="text-white">{product.brand}</span>
                </>
              )}

              {product.subtype && (
                <>
                  <span className="text-zinc-500">Type</span>

                  <span className="text-white">{product.subtype}</span>
                </>
              )}

              {product.flavor && (
                <>
                  <span className="text-zinc-500">Flavor</span>

                  <span className="text-white">{product.flavor}</span>
                </>
              )}

              {product.weight && (
                <>
                  <span className="text-zinc-500">Weight</span>

                  <span className="text-white">{product.weight}</span>
                </>
              )}
              {product.description && (
                <>
                  <span className="text-zinc-500">Description</span>

                  <span className="text-white">{product.description}</span>
                </>
              )}
              
            </div>
          </div>

          <div className="mt-6">
            {product.discountPrice ? (
              <>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-semibold text-lime-400">
                    {formatCurrency(product.discountPrice)}
                  </p>

                  <p className="text-lg text-zinc-500 line-through">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="mt-1 text-sm font-medium text-green-400">
                  {Math.round(
                    ((product.price - product.discountPrice) / product.price) *
                      100,
                  )}
                  % OFF
                </p>
              </>
            ) : (
              <p className="text-3xl font-semibold text-lime-400">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.inStock ? "Add To Cart" : "Out of Stock"}
            </Button>
            <Link to="/cart">
              <Button size="lg" variant="secondary">
                Go To Cart
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default ProductDetailPage;
