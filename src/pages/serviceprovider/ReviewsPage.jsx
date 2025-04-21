import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewModal from '../../Components/serviceprovider/modals/ReviewModal';
import { FaStar } from 'react-icons/fa';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewResponse, setReviewResponse] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const serviceProviderId = localStorage.getItem('id');
      const response = await axios.get(`/review/provider/${serviceProviderId}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleRespondToReview = (review) => {
    setSelectedReview(review);
    setReviewResponse('');
    setShowReviewModal(true);
  };

  const handleReviewResponse = async () => {
    try {
      const res = await axios.put(`/review/${selectedReview._id}`, {
        response: reviewResponse
      });
      setReviews(reviews.map(review => 
        review._id === selectedReview._id ? res.data.data : review
      ));
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error updating review response:', error);
    }
  };

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter(review => review.rating === parseInt(filterRating));

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'sp-star-filled' : 'sp-star-empty'}
      />
    ));
  };

  return (
    <div className="sp-page-container">
      <div className="sp-page-header">
        <h1 className="sp-page-title">Customer Reviews</h1>
        <div className="sp-filter-controls">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="sp-filter-select"
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

      <div className="sp-reviews-grid">
        {filteredReviews.map(review => (
          <div key={review._id} className="sp-review-card">
            <div className="sp-review-header">
              <span className="sp-review-customer">{review.customerName}</span>
              <span className="sp-review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="sp-review-rating">
              {renderStars(review.rating)}
            </div>
            <p className="sp-review-service">
              Service: {review.serviceName}
            </p>
            <p className="sp-review-comment">
              {review.comment}
            </p>
            {review.response ? (
              <div className="sp-review-response">
                <p className="sp-response-header">Your Response:</p>
                <p className="sp-response-text">{review.response}</p>
              </div>
            ) : (
              <button 
                className="sp-btn sp-btn-respond"
                onClick={() => handleRespondToReview(review)}
              >
                Respond to Review
              </button>
            )}
          </div>
        ))}
      </div>

      {showReviewModal && selectedReview && (
        <ReviewModal
          selectedReview={selectedReview}
          reviewResponse={reviewResponse}
          setReviewResponse={setReviewResponse}
          handleReviewResponse={handleReviewResponse}
          setShowReviewModal={setShowReviewModal}
        />
      )}
    </div>
  );
};

export default ReviewsPage; 