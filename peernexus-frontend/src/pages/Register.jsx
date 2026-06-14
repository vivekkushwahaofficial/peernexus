import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { useToast } from "../hooks/useToast.js";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Please enter a valid email address";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters long";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register(form);
      toast.success("Account created! You can now log in.");
      navigate("/login");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Registration failed. Try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-ink font-display">Create Account</h1>
        <p className="mt-1 text-xs text-ink/50">Join verified peers and study smarter.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. Alex Mercer"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

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

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full py-3 mt-2">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-ink/50 mt-1">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-accent hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
