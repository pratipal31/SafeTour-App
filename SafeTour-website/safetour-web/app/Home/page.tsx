"use client";

import React from "react";
import {
  Shield,
  MapPin,
  CheckCircle,
  Lock,
  ArrowRight,
  Section,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import  Header  from "../../components/Header"
import Footer from "@/components/Footer";
import Sections from "@/components/Sections";

const Home = () => {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <Header/>



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
                onClick={() => router.push("/Main")}
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
      <Sections />

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Home;
