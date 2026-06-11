import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorReviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await API.get('/reviews');
      setReviews(response.data);
      
      const total = response.data.length;
      const sum = response.data.reduce((acc, r) => acc + r.rating, 0);
      const avg = total > 0 ? (sum / total).toFixed(1) : 0;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      response.data.forEach(r => {
        if (distribution[r.rating]) distribution[r.rating]++;
      });
      
      setStats({
        averageRating: avg,
        totalReviews: total,
        ratingDistribution: distribution
      });
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⭐ Reviews & Feedback</h1>
        <p className="text-gray-600">See what patients are saying</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg p-6 text-center">
          <p className="text-5xl font-bold">{stats.averageRating}</p>
          <p className="text-2xl mt-1">/ 5.0</p>
          <p className="mt-2">{getStarRating(Math.round(stats.averageRating))}</p>
          <p className="mt-2 text-cyan-100">{stats.totalReviews} reviews</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.ratingDistribution[rating];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
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
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Patient Reviews</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400 text-lg">
                      {getStarRating(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      Patient #{review.user_id}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="mt-3">
                  <button className="text-sm text-cyan-600 hover:text-cyan-800">
                    Reply
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-5xl mb-4">📝</p>
              <p>No reviews yet</p>
              <p className="text-sm mt-2">Reviews from patients will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviews;