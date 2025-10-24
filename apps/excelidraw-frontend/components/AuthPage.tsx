"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = isSignin
        ? { username: form.username, password: form.password }
        : { name: form.name, username: form.username, password: form.password };

      const res = await axios.post(
        isSignin
          ? "http://localhost:3002/signin"
          : "http://localhost:3002/signup",
        body,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      // Store the token (assumes field is "token")
      localStorage.setItem("Authorization", res.data.token);

      // Redirect to rooms page
      router.push("/rooms");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 m-4 bg-white rounded-lg shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-600">
            {isSignin ? "Sign in to continue" : "Sign up to get started"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isSignin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              name="username"
              type="email"
              placeholder="you@example.com"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}

          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            type="submit"
            disabled={loading}
          >
            {isSignin ? (loading ? "Signing In..." : "Sign In") : (loading ? "Signing Up..." : "Sign Up")}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignin ? "Don't have an account? " : "Already have an account? "}
          <a
            href={isSignin ? "/signup" : "/signin"}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isSignin ? "Sign up" : "Sign in"}
          </a>
        </p>
      </div>
    </div>
  );
}
