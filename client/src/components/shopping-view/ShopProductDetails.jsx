import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice/index.js";
import { setProductDetails } from "@/store/shop/products-slice/index.js";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/shop/wishlist-slice/index.js";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/StarRating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice/index.js";
import { useToast } from "@/hooks/useToast.js";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { items: wishlistItems } = useSelector((state) => state.shopWishlist);

  const { toast } = useToast();

  const productId = productDetails?._id || productDetails?.id;

  const isWishlisted = (wishlistItems || []).some(
    (item) =>
      item?.productId?._id?.toString() === productId?.toString() ||
      item?.productId?.toString() === productId?.toString(),
  );

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in to add products to your cart.",
      });
      setOpen(false);
      navigate("/auth/login");
      return;
    }

    let getCartItems = cartItems?.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId,
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleToggleWishlist() {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in to save items to your wishlist.",
      });
      setOpen(false);
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
  }

  function handleDialogClose(nextOpen) {
    if (nextOpen) return;

    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedImage("");
  }

  async function handleAddReview() {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in to submit a review.",
      });
      setOpen(false);
      navigate("/auth/login");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Please select a star rating before submitting.",
        variant: "destructive",
      });

      return;
    }

    const currentUserId = user?.id || user?._id;

    if (!currentUserId) {
      toast({
        title: "Please login again before submitting a review.",
        variant: "destructive",
      });

      return;
    }

    try {
      await dispatch(
        addReview({
          productId: productDetails?._id,
          userId: currentUserId,
          userName: user?.username || user?.userName,
          reviewMessage: reviewMsg,
          reviewValue: rating,
        }),
      ).unwrap();

      setRating(0);
      setReviewMsg("");
      dispatch(getReviews(productDetails?._id));
      toast({
        title: "Review added successfully!",
      });
    } catch (errorMessage) {
      toast({
        title:
          typeof errorMessage === "string"
            ? errorMessage
            : "Unable to add review. Make sure this product was purchased and paid for.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [dispatch, productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  const productImages = productDetails?.images?.length
    ? productDetails.images
    : productDetails?.image
      ? [productDetails.image]
      : [];

  const displayImage = selectedImage || productImages[0];

  const selectedImageIndex = productImages.findIndex(
    (imageUrl) => imageUrl === displayImage,
  );

  function handleSlideImage(direction) {
    if (productImages.length <= 1) return;

    const currentIndex = selectedImageIndex > -1 ? selectedImageIndex : 0;

    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % productImages.length
        : (currentIndex - 1 + productImages.length) % productImages.length;

    setSelectedImage(productImages[nextIndex]);
  }

  useEffect(() => {
    const firstImage = productDetails?.images?.length
      ? productDetails.images[0]
      : productDetails?.image || "";

    if (firstImage) {
      setSelectedImage(firstImage);
    }
  }, [productDetails]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid max-h-[92vh] max-w-[92vw] gap-8 overflow-y-auto rounded-[1.75rem] border-slate-200/80 bg-white p-6 sm:max-w-[84vw] sm:p-8 lg:max-w-[72vw] lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-50">
            <img
              src={displayImage}
              alt={productDetails?.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover"
            />
            {productImages.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleSlideImage("prev")}
                  className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-white/40 bg-white/90 text-slate-900 shadow"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleSlideImage("next")}
                  className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-white/40 bg-white/90 text-slate-900 shadow"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : null}
          </div>
          {productImages.length > 1 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {productImages.map((imageUrl) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition hover:opacity-90 ${
                    imageUrl === displayImage
                      ? "border-sky-400 ring-2 ring-sky-100"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={productDetails?.title}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex min-h-0 flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
              Product details
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {productDetails?.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {productDetails?.description}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
            <p
              className={`text-3xl font-black tracking-tight text-slate-950 ${
                productDetails?.salePrice > 0
                  ? "line-through text-slate-400"
                  : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-black text-sky-700">
                ${productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-sky-500">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-sm text-slate-500">
              ({averageReview.toFixed(2)})
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            {productDetails?.totalStock === 0 ? (
              <Button className="flex-1 cursor-not-allowed rounded-2xl bg-slate-200 text-slate-500 opacity-100 hover:bg-slate-200">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="flex-1 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock,
                  )
                }
              >
                Add to Cart
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleToggleWishlist}
              className="rounded-2xl border-slate-200 hover:bg-rose-50 hover:border-rose-200 px-4"
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-600"
                }`}
              />
            </Button>
          </div>
          <Separator className="bg-slate-100" />
          <div className="min-h-[180px] max-h-[34vh] overflow-y-auto pr-1">
            <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-950">
              Reviews
            </h2>
            <div className="grid gap-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div
                    key={reviewItem?._id || reviewItem?.userName}
                    className="flex gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <Avatar className="h-10 w-10 border border-sky-100 bg-sky-50">
                      <AvatarFallback className="bg-sky-600 text-white">
                        {reviewItem?.userName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-950">
                          {reviewItem?.userName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
          <div className="sticky bottom-0 mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
            <Label className="text-sm font-semibold text-slate-900">
              Write a review
            </Label>
            <div className="flex gap-1">
              <StarRatingComponent
                rating={rating}
                handleRatingChange={handleRatingChange}
              />
            </div>
            <Input
              name="reviewMsg"
              value={reviewMsg}
              onChange={(event) => setReviewMsg(event.target.value)}
              placeholder="Share your experience..."
            />
            <Button
              onClick={handleAddReview}
              className="rounded-2xl bg-sky-600 text-white hover:bg-sky-500"
              disabled={reviewMsg.trim() === "" || rating === 0}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
