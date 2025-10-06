import React from 'react';
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  return (
    <header className="bg-gray-900 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <img
            src="/logo.png"
            alt="SafeTour Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="text-2xl font-bold text-white">SafeTour</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <SignedOut>
            <Link href="/sign-in">
              <button className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-br from-blue-100 to-indigo-100 text-black rounded-lg font-medium transition-colors hover:shadow-lg">
                <Lock className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
