import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Please enter a valid email address";

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authService.login(form);
      login(data);
      toast.success("Welcome back to PeerNexus!");
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Invalid email or password";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-ink font-display">Welcome Back</h1>
        <p className="mt-1 text-xs text-ink/50">Log in to reconnect with your student community.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="yourname@college.edu"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <div className="flex flex-col">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
            />
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full py-3 mt-2">
          Log In
        </Button>
      </form>

      <div className="text-center text-xs text-ink/50 mt-1">
        Don't have an account?{" "}
        <Link to="/register" className="font-bold text-accent hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
