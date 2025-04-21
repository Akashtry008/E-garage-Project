import React from 'react';
import '../../../assets/css/ServiceProvider.css';

const ReviewsTab = ({ 
  reviews, 
  setSelectedReview,
  setShowReviewModal
}) => {
  const handleRespondToReview = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  return (
    <div className="reviews-tab">
      <div className="sp-section-header">
        <h2 className="sp-section-title">Customer Reviews</h2>
      </div>

      <div className="sp-reviews-grid">
        {reviews.map(review => (
          <div key={review._id} className="sp-review-card">
            <div className="sp-review-header">
              <span className="sp-review-customer">{review.customerName}</span>
              <span className="sp-review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="sp-review-rating">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`sp-star-${i < review.rating ? 'filled' : 'empty'}`}
                >
                  ★
                </span>
              ))}
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
    </div>
  );
};

export default ReviewsTab; 