import ProductDetailsDialog from "@/components/shopping-view/ShopProductDetails";
import {
  fetchProductDetails,
  setProductDetails,
} from "@/store/shop/products-slice/index.js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function ShoppingProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productDetails } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }

    return () => {
      dispatch(setProductDetails());
    };
  }, [dispatch, productId]);

  function handleCloseDialog() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/shop/listing");
    }
  }

  return (
    <ProductDetailsDialog
      open={true}
      setOpen={handleCloseDialog}
      productDetails={productDetails}
    />
  );
}

export default ShoppingProductDetailsPage;
