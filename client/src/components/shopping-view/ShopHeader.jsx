import { HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice/index.js";
import UserCartWrapper from "./ShopCartWrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice/index.js";
import { Label } from "../ui/label";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col gap-2 mb-3 lg:mb-0 lg:flex-row lg:items-center lg:gap-1">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
            location.pathname.includes(menuItem.path.split("/").pop())
              ? "bg-sky-100 text-sky-800"
              : "text-slate-700 hover:bg-sky-50 hover:text-sky-800"
          }`}
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative h-11 w-11 rounded-full border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[11px] font-bold text-white">
            {cartItems?.items?.length || 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="ring-2 ring-sky-100">
            <AvatarFallback className="bg-sky-600 text-white font-extrabold">
              {user?.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56 rounded-2xl border-slate-200 p-2 shadow-xl">
          <DropdownMenuLabel>Logged in as {user?.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 lg:h-20">
        <Link to="/shop/home" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-sky-50">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
            <HousePlug className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">LightBlue Mart</span>
            <span className="text-sm font-black tracking-tight text-slate-950">Shop smarter</span>
          </div>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden rounded-full border-slate-200 bg-white text-slate-700">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs border-slate-200 bg-white">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden flex-1 justify-center lg:flex">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
