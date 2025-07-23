"use client";

import type React from "react";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  useEffect(() => {
    if (source === "unauthorized") {
      setTimeout(() => {
        toast.error("Your session has expired. Please log in again.");
      }, 100);
    }
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.login({ identifier, password });
      const { accessToken } = response.data;

      //get user data from API
      try {
        await login(accessToken);
      } catch {
        setError("Failed to fetch user data. Please try logging in again.");
        router.push("/login");
        return;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">
              Welcome Back
            </CardTitle>
            <CardDescription>Sign in to your messenger account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[rgba(1,125,239,1)] hover:bg-[rgba(1,100,200,1)] text-white"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                href="/register"
                className="text-[rgba(1,125,239,1)] hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
