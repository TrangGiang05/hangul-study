"use client";

import { useState } from "react";
import { signIn } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    const result = await signIn.email({
      email,
      password,
      fetchOptions: {
        onError: (ctx) => {
          setError(ctx.error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      }
    });

    if (result.data) {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 border border-[#e2e8f0]">
        <div className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/assets/brand/logo.png"
            alt="Hangul Study"
            width={68}
            height={68}
            className="mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Đăng nhập</h1>
          <p className="text-sm font-semibold text-[#2563eb] mt-1">Chào mừng bạn trở lại!</p>
          <p className="text-xs text-[#64748b] mt-0.5">Đăng nhập để tiếp tục học cùng Hangul Study</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1e293b] mb-1.5 uppercase tracking-wider">
              Email hoặc tài khoản
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#1e293b] placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1e293b] uppercase tracking-wider">
                Mật khẩu
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#1e293b] placeholder:text-gray-400 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex justify-center shadow-2xs mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#64748b]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-[#2563eb] hover:underline font-semibold">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
