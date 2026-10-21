import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { fetchWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

function ShoppingWishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, isLoading } = useSelector((state) => state.shopWishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId)).then((res) => {
      if (res?.payload?.success) {
        toast({
          title: "Item removed from wishlist",
        });
      }
    });
  };

  const handleMoveToCart = (product) => {
    if (!product) return;

    if (product.totalStock <= 0) {
      toast({
        title: "Product is out of stock",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: product._id,
        quantity: 1,
      }),
    ).then((res) => {
      if (res?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        dispatch(removeFromWishlist(product._id));
        toast({
          title: "Moved to cart successfully!",
        });
      }
    });
  };

  return (
    <div className="min-h-[70vh] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your saved favorite items and move them to cart anytime.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="self-start sm:self-auto rounded-full px-4 py-1.5 text-sm font-semibold text-sky-800 bg-sky-100"
          >
            {items?.length || 0} {items?.length === 1 ? "Item" : "Items"}
          </Badge>
        </div>

        {items && items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item?.productId;
              if (!product) return null;

              const isOutOfStock = product.totalStock <= 0;

              return (
                <div
                  key={product._id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
                        Out of Stock
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-slate-400 hover:text-rose-500 hover:bg-white shadow transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                        {product.brand || product.category}
                      </span>
                      <h3 className="mt-1 font-bold text-slate-900 line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        {product.salePrice > 0 ? (
                          <>
                            <span className="text-lg font-black text-slate-950">
                              ${product.salePrice}
                            </span>
                            <span className="text-sm font-semibold text-slate-400 line-through">
                              ${product.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-black text-slate-950">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5">
                      <Button
                        disabled={isOutOfStock}
                        onClick={() => handleMoveToCart(product)}
                        className="w-full rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isOutOfStock ? "Out of Stock" : "Move to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-sky-50 text-sky-600">
              <Heart className="h-10 w-10 text-sky-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Explore our collections, tap the heart icon on any product, and
              save items for later.
            </p>
            <Button
              onClick={() => navigate("/shop/listing")}
              className="mt-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShoppingWishlist;
