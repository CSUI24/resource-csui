import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | Academic Resource Hub",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 py-12 text-[#181d26]">
      <h1 className="sr-only">Login</h1>
      <button className="border-2 shadow-[0_8px_24px_rgba(24,29,38,0.12)] border-[#0d1218] px-6 py-2 rounded-xl">
        <a href="/api/auth/sso/login" className="flex items-center gap-2">
          <Image
            src="/logo-ui.png"
            alt=""
            width={24}
            height={26}
            className="h-6 w-auto"
            priority
          />
          <span className="min-w-0 font-normal flex-1 text-center">
            Masuk dengan akun UI
          </span>
        </a>
      </button>
    </main>
  );
}
