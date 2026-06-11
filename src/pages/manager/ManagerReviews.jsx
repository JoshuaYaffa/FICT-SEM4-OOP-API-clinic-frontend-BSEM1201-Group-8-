import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManagerReviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchClinicAndReviews();
  }, []);

  const fetchClinicAndReviews = async () => {
    try {
      setLoading(true);
      const clinicsRes = await API.get('/clinics?limit=1000');
      const managerClinic = clinicsRes.data.find(c => c.clinic_manager_id === user?.id);
      setClinic(managerClinic);
      
      if (managerClinic) {
        const reviewsRes = await API.get(`/reviews/clinic/${managerClinic.id}`);
        setReviews(reviewsRes.data || []);
      } else {
        toast.error('You are not assigned to any clinic');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.detail || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    try {
      await API.post('/notifications/send', {
        title: 'Review Response from Clinic',
        message: `Dear patient, thank you for your feedback. ${replyText}`,
        user_id: reviews.find(r => r.id === reviewId)?.user_id
      });
      toast.success('Reply sent to patient successfully');
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.detail || 'Failed to send reply');
    }
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  if (loading) return <LoadingSpinner />;

  if (!clinic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You are not assigned to any clinic.</p>
        <p className="text-gray-500 mt-2">Please contact the administrator.</p>
        <button 
          onClick={() => navigate('/manager/dashboard')}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⭐ Clinic Reviews</h1>
        <p className="text-gray-600">Managing reviews for {clinic.name}</p>
        <p className="text-sm text-gray-500 mt-1">📍 {clinic.district} | Total reviews: {reviews.length}</p>
      </div>

      {/* Rating Overview */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-5xl font-bold">{averageRating}</p>
            <p className="text-lg mt-1">/ 5.0</p>
            <p className="text-cyan-100 text-sm">Overall Rating</p>
          </div>
          <div>
            <p className="text-5xl font-bold">{reviews.length}</p>
            <p className="text-lg mt-1">Reviews</p>
            <p className="text-cyan-100 text-sm">Total Feedback</p>
          </div>
          <div>
            <div className="text-yellow-300 text-2xl mb-1">
              {getStarRating(Math.round(averageRating))}
            </div>
            <p className="text-cyan-100 text-sm">Average {averageRating} out of 5 stars</p>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingCounts[rating];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-12 text-sm">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="font-medium text-gray-700">Filter by Rating:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterRating === 'all' 
                  ? 'bg-cyan-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5,4,3,2,1].map(rating => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating.toString())}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  filterRating === rating.toString() 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {rating} ★ ({ratingCounts[rating]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Patient Feedback</h2>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-5xl mb-4">📝</p>
            <p>No reviews found</p>
            <p className="text-sm mt-1">Try changing the rating filter</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <div className="text-yellow-400 text-lg mb-1">
                      {getStarRating(review.rating)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Patient #{review.user_id} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      ID: #{review.id}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {replyingTo === review.id ? (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <textarea
                      rows="3"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Write your reply to this patient..."
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReply(review.id)}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
                      >
                        Send Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="text-sm text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                  >
                    <span>💬</span> Reply to Patient
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerReviews;