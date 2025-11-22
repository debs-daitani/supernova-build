"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    preferredName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setSuccess("Registration successful! Redirecting to dashboard...");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
      <form className="bg-white bg-opacity-90 rounded-lg shadow-lg p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">Register</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          required
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
          value={form.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          required
          value={form.confirmPassword}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
          value={form.fullName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="preferredName"
          placeholder="Preferred Name (optional)"
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={form.preferredName}
          onChange={handleChange}
        />
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mb-4 text-center">{success}</div>}
      <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded hover:scale-105 transition"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <div className="mt-4 text-center">
          <a href="/login" className="text-purple-600 hover:underline">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
}
