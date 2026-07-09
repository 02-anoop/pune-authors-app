import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface BookReviewPayload {
  reviewerName: string;
  overallRating: number;
  writingStyleRating: number;
  contentQualityRating: number;
  enjoyedMost: string;
  reviewText: string;
}

interface BookReviewFormProps {
  onSubmit: (data: BookReviewPayload) => void;
  isSubmitting?: boolean;
}

export const BookReviewForm: React.FC<BookReviewFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<BookReviewPayload>({
    reviewerName: '',
    overallRating: 0,
    writingStyleRating: 0,
    contentQualityRating: 0,
    enjoyedMost: '',
    reviewText: '',
  });

  const handleRatingChange = (field: keyof BookReviewPayload, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const enjoyedOptions = [
    'Story',
    'Writing Style',
    'Characters',
    'Knowledge & Insights',
    'Illustrations & Design',
    'Overall Experience',
    'Other'
  ];

  const renderStars = (field: keyof BookReviewPayload, currentRating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(field, star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto space-y-8">
      <div>
        <h3 className="text-xl font-bold text-paa-navy mb-4">Leave a Review</h3>
        
        {/* Reviewer Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="reviewerName">Your Name</label>
          <input
            type="text"
            id="reviewerName"
            name="reviewerName"
            value={formData.reviewerName}
            onChange={handleChange}
            className="w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-paa-navy focus:border-transparent bg-gray-50"
            required
            placeholder="Your Name"
          />
        </div>

        {/* Overall Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
          {renderStars('overallRating', formData.overallRating)}
        </div>
      </div>

      <div className="space-y-6">
        {/* Question 1 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How would you rate the writing style?
          </label>
          {renderStars('writingStyleRating', formData.writingStyleRating)}
        </div>

        {/* Question 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            How would you rate the quality and value of the content?
          </label>
          {renderStars('contentQualityRating', formData.contentQualityRating)}
        </div>

        {/* Question 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="enjoyedMost">
            What did you enjoy the most?
          </label>
          <div className="relative">
            <select
              id="enjoyedMost"
              name="enjoyedMost"
              value={formData.enjoyedMost}
              onChange={handleChange}
              className="w-full appearance-none border border-gray-200 text-gray-700 py-3 px-4 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-paa-navy focus:border-transparent bg-gray-50"
              required
            >
              <option value="" disabled>Select an option</option>
              {enjoyedOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Question 4 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="reviewText">
            Share your review
          </label>
          <textarea
            id="reviewText"
            name="reviewText"
            value={formData.reviewText}
            onChange={handleChange}
            rows={5}
            placeholder="Tell us what you liked, what could be improved, or why you'd recommend this book to others."
            className="w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-paa-navy focus:border-transparent bg-gray-50 resize-y"
            required
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting || formData.overallRating === 0 || !formData.reviewerName.trim()}
          className="w-full bg-paa-navy hover:bg-paa-navy/90 text-white font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};
