// components/cards/ReviewCard.js
import React from 'react';
import { FaReply } from 'react-icons/fa';

export const ReviewCard=({ review, onRespond })=> {
  return (
    <div className="sp-review-card">
      <div className="sp-review-header">
        <div className="sp-review-customer">{review.customer}</div>
        <div className="sp-review-rating">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`sp-rating-star ${i < review.rating ? 'sp-star-filled' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="sp-review-date">{review.date}</div>
      </div>
      <div className="sp-review-service">Service: {review.service}</div>
      <div className="sp-review-comment">{review.comment}</div>
      {review.response ? (
        <div className="sp-review-response">
          <div className="sp-response-header">Your Response:</div>
          <div className="sp-response-text">{review.response}</div>
        </div>
      ) : (
        <button
          className="sp-btn sp-btn-respond"
          onClick={onRespond}
        >
          <FaReply /> Respond
        </button>
      )}
    </div>
  );
}

export default ReviewCard;