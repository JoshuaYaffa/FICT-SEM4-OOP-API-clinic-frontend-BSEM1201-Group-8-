import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ClinicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClinicDetails();
  }, [id]);

  const fetchClinicDetails = async () => {
    try {
      const [clinicRes, doctorsRes, reviewsRes] = await Promise.all([
        API.get(`/clinics/${id}`),
        API.get(`/doctors/clinic/${id}`),
        API.get(`/reviews/clinic/${id}`)
      ]);
      setClinic(clinicRes.data);
      setDoctors(doctorsRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error fetching clinic details:', error);
      toast.error('Failed to load clinic details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reviews', {
        rating: reviewData.rating,
        comment: reviewData.comment,
        clinic_id: parseInt(id)
      });
      toast.success('Review submitted successfully!');
      setReviewData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchClinicDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{clinic?.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-2">📍 {clinic?.district}, {clinic?.location}</p>
            <p className="mb-2">📞 {clinic?.phone}</p>
            <p>🕐 {clinic?.opening_time} - {clinic?.closing_time}</p>
          </div>
          <div>
            <p className="mb-2">⭐ Rating: {averageRating} / 5</p>
            <p>📋 {reviews.length} reviews</p>
            <div className="flex gap-2 mt-2">
              {clinic?.emergency_available && (
                <span className="px-3 py-1 bg-red-500 rounded-full text-sm">🚨 Emergency</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">👨‍⚕️ Doctors at {clinic?.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-3xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Dr. {doctor.name}</h3>
                    <p className="text-cyan-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">📅 {doctor.experience_years || 0}+ years experience</p>
                  <p className="text-gray-600">⏰ {doctor.availability || 'Weekdays 9AM-5PM'}</p>
                  {doctor.bio && <p className="text-gray-500 mt-2">{doctor.bio.substring(0, 80)}...</p>}
                </div>
                <Link
                  to={`/patient/book/${doctor.id}`}
                  className="mt-4 block w-full text-center bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
        {doctors.length === 0 && (
          <p className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">No doctors available at this clinic yet.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">⭐ Patient Reviews</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Share your experience</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={reviewData.rating}
                onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Very Good</option>
                <option value="3">3 Stars - Good</option>
                <option value="2">2 Stars - Fair</option>
                <option value="1">1 Star - Poor</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
              <textarea
                rows="3"
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Share your experience at this clinic..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-400 text-lg">{getStarRating(review.rating)}</div>
                  <span className="text-sm text-gray-500">Patient #{review.user_id}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDetails;