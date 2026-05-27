import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleSubmit(event) {
    event.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Enter a new password",
        description: "Both password fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm the same password twice.",
        variant: "destructive",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/reset-password/${token}`, {
        password,
      })
      .then((response) => {
        toast({
          title: response?.data?.message || "Password updated",
        });
        navigate("/auth/login");
      })
      .catch((error) => {
        toast({
          title: error?.response?.data?.message || "Unable to update password",
          description: "The link may be invalid or expired.",
          variant: "destructive",
        });
      });
  }

  return (
    <Card className="w-full max-w-md border-white/50 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <CardHeader className="space-y-3 text-center">
        <span className="mx-auto inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
          Reset password
        </span>
        <CardTitle className="text-3xl text-slate-900">Create a new password</CardTitle>
        <CardDescription className="text-slate-600">
          Choose a password you have not used before.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-password">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirm-password">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <Button className="w-full" type="submit">
            Update password
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

export default ResetPassword;