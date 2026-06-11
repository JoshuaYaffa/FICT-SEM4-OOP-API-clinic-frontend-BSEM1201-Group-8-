import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏥</span>
              </div>
              <span className="font-bold text-xl">ClinicService</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting Sierra Leoneans with quality healthcare services.
              Find clinics, book appointments, and manage your health online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-cyan-400 transition">Home</Link></li>
              <li><Link to="/patient/clinics" className="text-gray-400 hover:text-cyan-400 transition">Find Clinics</Link></li>
              <li><Link to="/patient/doctors" className="text-gray-400 hover:text-cyan-400 transition">Find Doctors</Link></li>
              <li><Link to="/role-login" className="text-gray-400 hover:text-cyan-400 transition">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-cyan-400 transition">Register</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">📍 Freetown, Sierra Leone</li>
              <li className="flex items-center gap-2">📞 +232 76 123 456</li>
              <li className="flex items-center gap-2">✉️ info@clinicservice.sl</li>
            </ul>
          </div>
        </div>

        {/* SDG Section */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <span className="px-3 py-1 bg-green-800 rounded-full text-sm">🌍 SDG 3: Good Health & Well-being</span>
            <span className="px-3 py-1 bg-blue-800 rounded-full text-sm">🇸🇱 Sierra Leone</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Smart Clinic Service. All rights reserved.
            Improving healthcare access across Sierra Leone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;