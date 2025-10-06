import React from 'react'

const Footer = () => {
  return (
    <div>
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
  )
}

export default Footer
