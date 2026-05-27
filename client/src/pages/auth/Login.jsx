import CommonForm from "@/components/common/Form";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/useToast";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isLoading } = useSelector((state) => state.auth);

  function onSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload || "Invalid email or password",
          description: "Check your credentials and try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
      <div className="space-y-3 text-left">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">
          Welcome back
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Sign in to your account
        </h1>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Access your cart, orders, and saved addresses from one place.
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={isLoading ? "Signing in..." : "Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isLoading}
      />
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link className="font-medium text-slate-700 transition hover:text-slate-950" to="/auth/forgot-password">
          Forgot password?
        </Link>
        <p className="text-slate-600">
          New here?
          <Link className="ml-2 font-semibold text-slate-950 underline-offset-4 hover:underline" to="/auth/register">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthLogin;
