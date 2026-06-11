// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated && hasRole('patient')) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { path: '/', label: 'Home' },
        { path: '/role-login', label: 'Login' },
        { path: '/register', label: 'Register' },
      ];
    }

    const links = [{ path: '/', label: 'Home' }];

    if (hasRole('patient')) {
      links.push(
        { path: '/patient/dashboard', label: 'Dashboard' },
        { path: '/patient/clinics', label: 'Clinics' },
        { path: '/patient/doctors', label: 'Doctors' },
        { path: '/patient/appointments', label: 'My Appointments' }
      );
    }

    if (hasRole('doctor')) {
      links.push(
        { path: '/doctor/dashboard', label: 'Dashboard' },
        { path: '/doctor/appointments', label: 'Appointments' },
        { path: '/doctor/patients', label: 'Patients' },
        { path: '/doctor/reviews', label: 'Reviews' }
      );
    }

    if (hasRole('manager')) {
      links.push(
        { path: '/manager/dashboard', label: 'Dashboard' },
        { path: '/manager/doctors', label: 'Doctors' },
        { path: '/manager/appointments', label: 'Appointments' },
        { path: '/manager/reviews', label: 'Reviews' },
        { path: '/manager/services', label: 'Services' },
        { path: '/manager/annual-reports', label: 'Reports' }
      );
    }

    if (hasRole('admin')) {
      links.push(
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/clinics', label: 'Clinics' },
        { path: '/admin/doctors', label: 'Doctors' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/appointments', label: 'Appointments' },
        { path: '/admin/analytics', label: 'Analytics' }
      );
    }

    return links;
  };

  const getProfileLink = () => {
    if (hasRole('patient')) return '/patient/profile';
    if (hasRole('doctor')) return '/doctor/profile';
    if (hasRole('manager')) return '/manager/profile';
    if (hasRole('admin')) return '/admin/profile';
    return '/profile';
  };

  const navLinks = getNavLinks();
  const profileLink = getProfileLink();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏥</span>
              </div>
              <span className="font-bold text-xl text-gray-800">ClinicService</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hidden md:inline-block">
                Sierra Leone
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="flex items-center space-x-4 ml-4">
                {/* Notification Bell for Patients */}
                {hasRole('patient') && (
                  <Link to="/patient/notifications" className="relative">
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center">
                      {user?.profile_image ? (
                        <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-cyan-600 font-medium text-sm">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border">
                      <Link
                        to={profileLink}
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50"
                      >
                        👤 My Profile
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-cyan-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t max-h-[80vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-md text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to={profileLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  👤 My Profile
                </Link>
                {hasRole('patient') && (
                  <Link
                    to="/patient/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium"
                >
                  🚪 Logout
                </button>
              </>
            )}
          </div>
          {isAuthenticated && user && (
            <div className="border-t pt-3 pb-4 px-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-cyan-600 font-medium">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;