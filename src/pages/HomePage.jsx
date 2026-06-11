import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import TeamSection from '../components/TeamSection'; // Import TeamSection

const HomePage = () => {
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    happyPatients: 0
  });
  const [featuredClinics, setFeaturedClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [clinicsRes, doctorsRes] = await Promise.all([
        API.get('/clinics?limit=6'),
        API.get('/doctors?limit=1000')
      ]);
      setFeaturedClinics(clinicsRes.data || []);
      
      setStats({
        totalClinics: clinicsRes.data?.length || 0,
        totalDoctors: doctorsRes.data?.length || 0,
        totalAppointments: 12500,
        happyPatients: 8900
      });
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Same as before */}
      <section className="relative bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-800 text-white">
        {/* ... hero content same as previous ... */}
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-lg md:text-xl mb-8 text-cyan-100">
                Find quality healthcare services across Sierra Leone. 
                Book appointments with qualified doctors, manage your health records, 
                and access emergency care when you need it most.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/role-login" className="bg-white text-cyan-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
                  Get Started
                </Link>
                <Link to="/patient/clinics" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-cyan-700 transition">
                  Find a Clinic
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Licensed Healthcare Providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Emergency Support</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400 rounded-full opacity-20"></div>
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=500&fit=crop" alt="Doctor and Patient" className="rounded-2xl shadow-2xl relative z-10" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#f0f9ff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-700">{stats.totalClinics}+</div>
              <p className="text-gray-600 mt-2">Healthcare Facilities</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-700">{stats.totalDoctors}+</div>
              <p className="text-gray-600 mt-2">Qualified Doctors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-700">{stats.totalAppointments.toLocaleString()}+</div>
              <p className="text-gray-600 mt-2">Appointments Booked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-700">{stats.happyPatients.toLocaleString()}+</div>
              <p className="text-gray-600 mt-2">Happy Patients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Smart Clinic Service?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We're making healthcare accessible and convenient for everyone in Sierra Leone</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
              <p className="text-gray-600">Find clinics and doctors near you with our intelligent search system</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Online Booking</h3>
              <p className="text-gray-600">Book appointments 24/7 from anywhere, anytime</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Your health data is protected with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Using the TeamSection Component */}
      <TeamSection />

      {/* SDG Section */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-white bg-opacity-20 rounded-full px-4 py-1 mb-4">
            <span className="text-sm font-semibold">United Nations Sustainable Development Goals</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🌍 SDG 3: Good Health & Well-being</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6">"Ensure healthy lives and promote well-being for all at all ages"</p>
          <p className="text-emerald-100 max-w-2xl mx-auto">In Sierra Leone, we're committed to improving healthcare access, reducing wait times, and connecting citizens with quality medical services across all districts.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Freetown</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Bo</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Kenema</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Makeni</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Kailahun</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Port Loko</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Kono</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">Tonkolili</span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">and more...</span>
          </div>
        </div>
      </section>

      {/* Featured Clinics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Healthcare Facilities</h2>
              <p className="text-lg text-gray-600">Quality healthcare providers across Sierra Leone</p>
            </div>
            <Link to="/patient/clinics" className="text-cyan-600 hover:text-cyan-700 font-semibold">View All →</Link>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading clinics...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredClinics.map((clinic) => (
                <div key={clinic.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                  <div className="relative h-48 overflow-hidden">
                    {clinic.image_url ? (
                      <img src={clinic.image_url} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                        <span className="text-6xl">🏥</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      {clinic.emergency_available && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Emergency</span>}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{clinic.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">📍 {clinic.district}, {clinic.location}</p>
                      <p className="flex items-center gap-2">📞 {clinic.phone}</p>
                      <p className="flex items-center gap-2">🕐 {clinic.opening_time} - {clinic.closing_time}</p>
                    </div>
                    <Link to={`/patient/clinic/${clinic.id}`} className="mt-4 inline-block w-full text-center bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition">View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Getting quality healthcare has never been easier</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-3xl font-bold text-cyan-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up in minutes as a patient to get started</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-3xl font-bold text-cyan-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Doctor</h3>
              <p className="text-gray-600">Search by specialization, location, or clinic</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-cyan-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">Schedule your visit and get confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-lg text-gray-600">Real stories from people who found quality care through our platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4">"The platform made it so easy to find a specialist. I booked an appointment within minutes!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center"><span className="text-cyan-600 font-bold">MK</span></div>
                <div><p className="font-semibold text-gray-900">Mariama K.</p><p className="text-sm text-gray-500">Freetown</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4">"Great service! The doctors are professional and the booking system is very convenient."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center"><span className="text-cyan-600 font-bold">JC</span></div>
                <div><p className="font-semibold text-gray-900">James C.</p><p className="text-sm text-gray-500">Bo</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 mb-4">"Finally found a reliable way to manage my family's healthcare needs. Highly recommended!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center"><span className="text-cyan-600 font-bold">FT</span></div>
                <div><p className="font-semibold text-gray-900">Fatmata T.</p><p className="text-sm text-gray-500">Kenema</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-lg mb-8 text-cyan-100">Join thousands of satisfied patients who trust us for their healthcare needs</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-cyan-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">Create Free Account</Link>
            <Link to="/patient/clinics" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-cyan-600 transition">Browse Clinics</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;