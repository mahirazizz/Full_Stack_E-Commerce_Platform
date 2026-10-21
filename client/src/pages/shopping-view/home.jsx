import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice/index.js";
import ShoppingProductTile from "@/components/shopping-view/ShopProductTile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice/index.js";
import { getFeatureImages } from "@/store/common-slice/index.js";
import { useToast } from "@/hooks/useToast.js";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId) {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in to add products to your cart.",
      });
      navigate("/auth/login");
      return;
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (featureImageList && featureImageList.length > 0) {
        setCurrentSlide(
          (prevSlide) => (prevSlide + 1) % featureImageList.length,
        );
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <section className="relative w-full overflow-hidden bg-slate-950">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <img
                src={slide?.image}
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-1000`}
              />
            ))
          : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.82),_rgba(2,6,23,0.35),_rgba(2,6,23,0.15))]" />
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center px-4 py-12 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="max-w-2xl space-y-6 text-white">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
              Light blue marketplace
            </span>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Discover your next favorite product with a cleaner marketplace
              feel.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Browse curated categories, popular brands, and featured offers in
              a storefront styled for speed and confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/shop/listing")}
                className="h-12 rounded-full bg-sky-500 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
              >
                Shop now
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/shop/search")}
                className="h-12 rounded-full border-white/15 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/15 hover:text-white"
              >
                Search products
              </Button>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Fast checkout
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Secure payment flow
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Popular brands
                </p>
                <p className="mt-2 text-sm font-semibold">Curated shopping</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Trusted orders
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Easy account tracking
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-4 lg:mt-0 lg:justify-self-end">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
                Trending now
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Fresh drops, clean layout.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                A marketplace-style entry point that keeps the focus on
                products, brands, and value.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-xl shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Categories
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">05</p>
              </div>
              <div className="rounded-[1.5rem] bg-sky-600 p-5 text-white shadow-xl shadow-sky-600/25">
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                  Featured
                </p>
                <p className="mt-2 text-3xl font-black">24/7</p>
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length,
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border-white/20 bg-white/80 text-slate-950 shadow-lg backdrop-blur"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length,
            )
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border-white/20 bg-white/80 text-slate-950 shadow-lg backdrop-blur"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </section>
      <section className="border-b border-slate-200/70 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Shop by category
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Quickly jump into the departments customers browse most often.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer rounded-2xl border-slate-200/80 bg-slate-50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                    <categoryItem.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-4 font-semibold text-slate-900">
                    {categoryItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/70 bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Brand collection
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Shop by brand
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Explore labels people trust, presented in a cleaner storefront
              grid.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {brandsWithIcon.map((brandItem) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer rounded-2xl border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                    <brandItem.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-4 font-semibold text-slate-900">
                    {brandItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
              Featured selection
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Featured products
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A hand-picked catalog area styled to feel closer to a modern
              retail homepage.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id || productItem.id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShoppingHome;
