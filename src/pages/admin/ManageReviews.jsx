import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, filterRating, reviews]);

  const fetchReviews = async () => {
    try {
      const response = await API.get('/reviews');
      setReviews(response.data);
      setFilteredReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];
    
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_id.toString().includes(searchTerm)
      );
    }
    
    setFilteredReviews(filtered);
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <LoadingSpinner />;

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⭐ Manage Reviews</h1>
        <p className="text-gray-600">Moderate and manage patient reviews</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[5,4,3,2,1].map(rating => {
          const count = ratingCounts[rating];
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div key={rating} className="bg-white rounded-lg shadow p-3 text-center">
              <p className="text-xl font-bold">{rating}⭐</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{percentage.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Reviews</label>
            <input
              type="text"
              placeholder="Search by comment or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rating</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
          <p className="text-sm text-gray-500">{filteredReviews.length} reviews found</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="text-yellow-400">
                      {getStarRating(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      Patient #{review.user_id}
                    </span>
                    <span className="text-xs text-gray-400">
                      Clinic #{review.clinic_id}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-400">
                    Posted: {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredReviews.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="text-5xl mb-4">📝</p>
            <p>No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReviews;