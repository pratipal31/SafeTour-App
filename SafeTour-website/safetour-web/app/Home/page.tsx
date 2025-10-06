"use client";

import React from "react";
import {
  Shield,
  MapPin,
  CheckCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Home = () => {
  const router = useRouter();

  const cards = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Every transaction and service is verified on the blockchain, ensuring complete transparency and immutable records for your safety.",
    },
    {
      icon: MapPin,
      title: "Geo-Tagged Verification",
      description:
        "Real-time location tracking and verification of all accommodations, guides, and transport services for your peace of mind.",
    },
    {
      icon: CheckCircle,
      title: "Trusted Network",
      description:
        "24/7 emergency support with verified service providers. Access reliable monitoring tools and real-time safety insights.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">
                Blockchain Powered Tourism
              </span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your Safety, Our Priority
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Experience end-to-end safety and trust in tourism with geo-tagged,
              verified travel services, emergency support, and transparent
              traceability.
            </p>

            <SignedOut>
              <Link href="/sign-up">
                <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-br from-blue-100 to-indigo-100 text-black rounded-lg font-semibold text-lg transition-all space-x-2 hover:shadow-lg">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </SignedOut>

            <SignedIn>
              <button
                onClick={() => router.push("/dashboard")}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-br from-blue-100 to-indigo-100 text-black rounded-lg font-semibold text-lg transition-all space-x-2 hover:shadow-lg"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignedIn>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-xl">
              <img
                src="/1.jpeg"
                alt="Safe Tourism"
                className="rounded-2xl shadow-lg w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                    <p className="text-sm text-gray-600">Safety Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SafeTour?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on blockchain technology to ensure transparency, security,
              and trust in every journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <card.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo.png"
                  alt="SafeTour Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold">SafeTour</span>
              </div>
              <p className="text-gray-400 mb-4">
                Blockchain-powered platform ensuring end-to-end safety and trust
                in tourism with verified services and real-time monitoring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">About Us</button></li>
                <li><button className="hover:text-white">Services</button></li>
                <li><button className="hover:text-white">How It Works</button></li>
                <li><button className="hover:text-white">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white">Privacy Policy</button></li>
                <li><button className="hover:text-white">Terms of Service</button></li>
                <li><button className="hover:text-white">Cookie Policy</button></li>
                <li><button className="hover:text-white">Support</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 SafeTour. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button className="text-gray-400 hover:text-white">Facebook</button>
              <button className="text-gray-400 hover:text-white">Twitter</button>
              <button className="text-gray-400 hover:text-white">LinkedIn</button>
              <button className="text-gray-400 hover:text-white">Instagram</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
