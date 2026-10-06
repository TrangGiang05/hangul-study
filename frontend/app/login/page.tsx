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
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 border border-[#e5e9f1]">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/assets/brand/logo.png"
            alt="Hangul Study"
            width={64}
            height={64}
            className="mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#1d2942]">Đăng nhập</h1>
          <p className="text-sm text-[#7f8ba1] mt-2">Tiếp tục học tiếng Hàn mỗi ngày</p>
        </div>

        {error && (
          <div className="bg-[#f36b5f]/10 border border-[#f36b5f]/20 text-[#f36b5f] text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1d2942] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e9f1] focus:border-[#2455a4] focus:ring-1 focus:ring-[#2455a4] outline-none transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1d2942] mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e9f1] focus:border-[#2455a4] focus:ring-1 focus:ring-[#2455a4] outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d2942] hover:bg-[#293650] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 flex justify-center"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#7f8ba1]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-[#2455a4] hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
