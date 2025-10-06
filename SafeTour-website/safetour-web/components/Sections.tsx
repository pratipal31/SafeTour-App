import React from "react";
import {
  Shield,
  MapPin,
  CheckCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
const Section = () => {
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
    <div>
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
    </div>
  );
};

export default Section;
