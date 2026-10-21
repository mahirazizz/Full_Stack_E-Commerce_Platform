import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/useToast";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlist-slice";

function ShoppingProductTile({ product, handleAddtoCart }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.shopWishlist);

  const productId = product?._id || product?.id;
  const productRoute = productId ? `/shop/product/${productId}` : "#";

  const productImages = product?.images?.length
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const isWishlisted = (wishlistItems || []).some(
    (item) =>
      item?.productId?._id?.toString() === productId?.toString() ||
      item?.productId?.toString() === productId?.toString(),
  );

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please sign in to save items to your wishlist.",
      });
      navigate("/auth/login");
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(productId)).then((res) => {
        if (res?.payload?.success) {
          toast({
            title: "Removed from wishlist",
          });
        }
      });
    } else {
      dispatch(addToWishlist(productId)).then((res) => {
        if (res?.payload?.success) {
          toast({
            title: "Added to wishlist!",
          });
        }
      });
    }
  };

  return (
    <Card className="group relative w-full max-w-sm overflow-hidden rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
      {/* Wishlist Floating Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-md transition hover:scale-110 hover:bg-white"
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 transition ${
            isWishlisted
              ? "fill-rose-500 text-rose-500"
              : "text-slate-600 hover:text-rose-500"
          }`}
        />
      </button>

      <Link to={productRoute} className="block cursor-pointer">
        <div className="relative overflow-hidden">
          <img
            src={productImages[0]}
            alt={product?.title}
            className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-white hover:bg-rose-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-white hover:bg-amber-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute left-3 top-3 rounded-full bg-sky-600 px-3 py-1 text-white hover:bg-sky-700">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-3 p-4">
          <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-950">
            {product?.title}
          </h2>
          {productImages.length > 1 ? (
            <div className="flex gap-2 overflow-hidden">
              {productImages.slice(0, 3).map((imageUrl) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={product?.title}
                  className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                />
              ))}
              {productImages.length > 3 ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  +{productImages.length - 3}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-sm text-slate-500">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-sky-50 px-3 py-2">
            <span
              className={`${
                product?.salePrice > 0
                  ? "line-through text-slate-400"
                  : "text-slate-950"
              } text-lg font-semibold`}
            >
              ${product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-black text-sky-700">
                ${product?.salePrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Link>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full cursor-not-allowed rounded-2xl bg-slate-200 text-slate-500 opacity-100 hover:bg-slate-200">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              handleAddtoCart(productId, product?.totalStock);
            }}
            className="w-full rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500"
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
