import ShoppingProductTile from "@/components/shopping-view/ShopProductTile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast.js";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/search-slice/index.js";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice/index.js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults } = useSelector((state) => state.shopSearch);

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      } else {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(resetSearchResults());
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [keyword, dispatch, setSearchParams]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
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
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  console.log(searchResults, "searchResults");

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-8 rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4"
            placeholder="Search products, brands, and categories..."
          />
        </div>
      </div>
      {!searchResults.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No results found.
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {searchResults.map((item) => (
          <ShoppingProductTile
            key={item._id}
            handleAddtoCart={handleAddtoCart}
            product={item}
            handleGetProductDetails={handleGetProductDetails}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchProducts;
