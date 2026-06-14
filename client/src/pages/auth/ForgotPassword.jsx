import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Enter your email address",
        description: "We need the account email before we can send anything.",
        variant: "destructive",
      });
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/auth/forgot-password`, { email })
      .then((response) => {
        toast({
          title: response?.data?.message || "Reset link generated",
          description: response?.data?.resetUrl
            ? `Use this development link: ${response.data.resetUrl}`
            : "Check your inbox for password reset instructions.",
        });
      })
      .catch((error) => {
        toast({
          title: error?.response?.data?.message || "Unable to start reset flow",
          description: "Please verify the email and try again.",
          variant: "destructive",
        });
      });
  }

  return (
    <Card className="w-full max-w-md border-white/50 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <CardHeader className="space-y-3 text-center">
        <span className="mx-auto inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Account recovery
        </span>
        <CardTitle className="text-3xl text-slate-900">Forgot password?</CardTitle>
        <CardDescription className="text-slate-600">
          Enter the email tied to your account and we will guide the reset flow once the backend is connected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="reset-email">
              Email address
            </label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button className="w-full" type="submit">
            Send reset instructions
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Remembered it?
          <Link className="ml-2 font-semibold text-slate-950 hover:underline" to="/auth/login">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default ForgotPassword;