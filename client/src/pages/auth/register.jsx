import CommonForm from "@/components/common/form.jsx";
import { registerFormControls } from "@/config";
import { useToast } from "@/hooks/useToast";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  username: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    console.log(formData);
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload || "Registration failed",
          description: data?.error?.message || "An error occured",
          variant: "destructive",
        });
      }
      console.log("Register response:", data);
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
      <div className="space-y-3 text-left">
        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700">
          Join us
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Create your account
        </h1>
        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Register once and keep your shopping details saved across devices.
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      <p className="text-center text-sm text-slate-600">
        Already have an account?
        <Link className="ml-2 font-semibold text-slate-950 underline-offset-4 hover:underline" to="/auth/login">
          Login
        </Link>
      </p>
    </div>
  );
}

export default AuthRegister;
