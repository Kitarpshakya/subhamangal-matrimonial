import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { loginUser, isAdmin } from "../firebase/firebaseService";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      const adminStatus = await isAdmin(user.uid);

      toast.success("Signed in successfully!");

      setTimeout(() => {
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          navigate(adminStatus ? "/admin" : "/");
        }
      }, 500);
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center px-6 py-12">
      <Card
        className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 backdrop-blur"
        data-testid="signin-card"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your Shubhmangal account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-testid="signin-form"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
            />
          </div>

          <Button
            data-testid="signin-submit-button"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              data-testid="signup-link"
              className="text-rose-600 hover:text-rose-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
