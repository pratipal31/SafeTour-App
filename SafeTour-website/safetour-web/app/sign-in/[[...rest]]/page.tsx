import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/logo.png"
              alt="SafeTour Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-3xl font-bold text-white">SafeTour</span>
          </div>
          <p className="text-gray-400">Welcome back! Sign in to continue</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
