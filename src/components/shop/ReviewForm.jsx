import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../../services/api';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        rating: 5,
        review_text: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reviewService.submitReview(productId, formData);
            setSuccess(true);
            setFormData({ customer_name: '', rating: 5, review_text: '' });
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center">
                <h3 className="font-bold text-lg mb-2">Thank you for your review!</h3>
                <p>Your review has been submitted and is pending approval.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 text-sm underline hover:text-green-900"
                >
                    Write another review
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl">
            <h3 className="font-serif text-xl text-stone-900 mb-6">Write a Review</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Your Name</label>
                    <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                className="focus:outline-none"
                            >
                                <Star
                                    size={24}
                                    fill={star <= formData.rating ? "#fbbf24" : "none"}
                                    className={star <= formData.rating ? "text-amber-400" : "text-stone-300"}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Review</label>
                    <textarea
                        value={formData.review_text}
                        onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 h-32"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
