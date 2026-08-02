import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Home", to: "/shop/home" },
      { label: "Products", to: "/shop/listing" },
      { label: "Search", to: "/shop/search" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Orders", to: "/shop/account" },
      { label: "Addresses", to: "/shop/account" },
      { label: "Checkout", to: "/shop/checkout" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/auth/login" },
      { label: "Track Order", to: "/shop/account" },
      { label: "Returns", to: "/shop/account" },
    ],
  },
];

function ShopFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
              <span className="text-lg font-black">L</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
                LightBlue Mart
              </p>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Premium marketplace experience
              </h2>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            A refined shopping destination for browsing products, tracking
            orders, and managing your account with clarity.
          </p>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            Secure checkout, faster browsing, cleaner design.
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                {column.title}
              </h3>
              <div className="grid gap-2">
                {column.links.map((linkItem) => (
                  <Link
                    key={linkItem.label}
                    to={linkItem.to}
                    className="text-sm font-medium text-slate-700 transition hover:text-sky-700"
                  >
                    {linkItem.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p>© 2026 LightBlue Mart. All rights reserved.</p>
          <p>Built for a polished, professional storefront experience.</p>
        </div>
      </div>
    </footer>
  );
}

export default ShopFooter;
