import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./ShopCartItemContent";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          const price =
            Number(currentItem?.salePrice) > 0
              ? Number(currentItem?.salePrice)
              : Number(currentItem?.price || 0);
          const quantity = Number(currentItem?.quantity || 0);
          return sum + price * quantity;
        }, 0)
      : 0;

  return (
    <SheetContent className="border-slate-200 bg-white sm:max-w-md">
      <SheetHeader className="border-b border-slate-100 pb-4">
        <SheetTitle className="text-xl font-black tracking-tight text-slate-950">
          Your cart
        </SheetTitle>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <UserCartItemsContent key={item.productId} cartItem={item} />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
            Your cart is empty.
          </p>
        )}
      </div>
      <div className="mt-8 space-y-4 rounded-2xl bg-sky-50 p-4">
        <div className="flex justify-between text-slate-700">
          <span className="font-medium">Total</span>
          <span className="font-black text-slate-950">${totalCartAmount}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="mt-6 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-500"
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
