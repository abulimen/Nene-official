import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Star, Check, X, Trash2, Heart } from 'lucide-react';
import { getUploadUrl } from '../../utils/config';

const ReviewText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = text.length > 50;

    if (!isLong) return <span>{text}</span>;

    return (
        <div>
            <p className={expanded ? "" : "line-clamp-2"}>
                {text}
            </p>
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-vitality-teal font-medium mt-1 hover:underline"
            >
                {expanded ? "Show less" : "Read more"}
            </button>
        </div>
    );
};

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await adminService.getAdminReviews();
            setReviews(response.data.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminService.updateReviewStatus(id, status);
            fetchReviews();
        } catch (error) {
            console.error('Error updating review:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await adminService.deleteReview(id);
                fetchReviews();
            } catch (error) {
                console.error('Error deleting review:', error);
            }
        }
    };

    const handleFeatureToggle = async (id) => {
        try {
            await adminService.toggleFeaturedReview(id);
            fetchReviews();
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8" data-tour="reviews-header">Reviews</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="reviews-list">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-stone-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-stone-500 font-medium">Product</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Customer</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Rating</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Review</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Status</th>
                                <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center">No reviews found</td></tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getUploadUrl(review.product?.image_url) || '/api/placeholder/40/40'}
                                                    alt={review.product?.name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                                                />
                                                <span className="font-medium text-stone-900">{review.product?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-600">{review.customer_name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-600 max-w-md">
                                            <ReviewText text={review.review_text} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px - 2 py - 1 rounded - full text - xs font - medium capitalize ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                } `}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleFeatureToggle(review.id)}
                                                    className={`p-2 rounded-lg transition-colors ${review.is_featured ? 'text-pink-500 bg-pink-50' : 'text-stone-400 hover:text-pink-500 hover:bg-pink-50'}`}
                                                    title={review.is_featured ? "Unfeature" : "Feature"}
                                                >
                                                    <Heart size={18} fill={review.is_featured ? "currentColor" : "none"} />
                                                </button>
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
