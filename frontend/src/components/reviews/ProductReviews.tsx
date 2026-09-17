import { useState } from 'react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { useReviews, useReviewStats, useCreateReview, useToggleHelpful } from '../../hooks/useReviews';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';

export function ProductReviews({ productId }: { productId: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const { data: stats } = useReviewStats(productId);
  const { data: reviewsData, isLoading } = useReviews(productId, page, 5, sort);
  
  const createReviewMutation = useCreateReview(productId);
  const toggleHelpfulMutation = useToggleHelpful(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReviewMutation.mutate({ rating, comment }, {
      onSuccess: () => {
        setShowForm(false);
        setComment('');
        setRating(5);
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || 'Failed to submit review');
      }
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'}`} />
    ));
  };

  return (
    <div className="py-12 border-t border-border mt-12">
      <h2 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="md:col-span-1">
          <div className="bg-surface p-6 rounded-2xl border border-border text-center">
            <div className="text-5xl font-bold font-serif text-primary mb-2">
              {stats?.averageRating || '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(stats?.averageRating || 0))}
            </div>
            <div className="text-text-muted text-sm">
              Based on {stats?.totalReviews || 0} reviews
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats?.distribution?.[star as keyof typeof stats.distribution] || 0;
            const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center text-sm">
                <span className="w-12">{star} stars</span>
                <div className="flex-1 mx-4 bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-12 text-right text-text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 flex justify-between items-center">
        {isAuthenticated ? (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        ) : (
          <p className="text-text-muted">Please log in to write a review.</p>
        )}
        
        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-2xl border border-border mb-12">
          <h3 className="font-bold text-lg mb-4">Write your review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Review</label>
            <textarea 
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-2 h-32 resize-none"
              placeholder="What did you like or dislike?"
            />
          </div>
          <Button type="submit" disabled={createReviewMutation.isPending}>
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : reviewsData?.reviews?.length === 0 ? (
          <p className="text-text-muted">No reviews yet.</p>
        ) : (
          reviewsData?.reviews?.map((review: any) => (
            <div key={review._id} className="border-b border-border pb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                    <span className="font-medium text-text-main">{review.user?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {review.isVerifiedPurchase && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-green-600 font-medium">
                          <ShieldCheck className="w-4 h-4 mr-1" /> Verified Purchase
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-text-main leading-relaxed mb-4">{review.comment || review.content}</p>
              
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <button 
                  onClick={() => {
                    if (!isAuthenticated) return alert('Please login to vote');
                    toggleHelpfulMutation.mutate(review._id);
                  }}
                  className={`flex items-center gap-1 hover:text-primary transition-colors ${review.helpfulVotes?.includes(user?.id as any) ? 'text-primary' : ''}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {reviewsData?.meta?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= reviewsData.meta.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
