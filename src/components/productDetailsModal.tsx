import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Button,
  Typography,
  Box,
  Paper
} from '@mui/material';
import { Info, Star } from 'lucide-react';

const getStars = (rating: string) => {
  const numRating = parseFloat(rating);
  const stars = [];
  
  for (let i = 0; i < Math.floor(numRating); i++) {
    stars.push('filled');
  }
  
  for (let i = Math.floor(numRating); i < 5; i++) {
    stars.push('empty');
  }
  
  return stars;
};

interface ProductDetailsModalProps {
  product: {
    product_name: string;
    prod_img: string;
    availability: boolean;
    category: string;
    description: string;
    price: number;
    quantity: number;
    date: string;
    variations?: Array<{
      variation_name: string;
      price: number;
      stock: number;
    }>;
    reviews?: Array<{
      reviewer_name: string;
      review_date: string;
      rating: string;
      comment: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal = ({ product, isOpen, onClose }: ProductDetailsModalProps) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent className="p-0">
        <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Product Details Section */}
          <Box>
            <Typography variant="h4" className="text-center text-gray-800 mb-6">
              {product.product_name}
            </Typography>

            {/* Product Image */}
            <Box className="relative mb-6">
              <img
                src={product.prod_img}
                alt={product.product_name}
                className="w-full h-64 object-cover rounded-md border border-gray-300 shadow-lg"
              />
              <span
                className={`absolute top-2 right-2 px-3 py-2 text-white text-xs font-semibold rounded-full ${
                  product.availability ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {product.availability ? 'In Stock' : 'Out of Stock'}
              </span>
            </Box>

            <Box className="text-gray-700 space-y-4">
              <Typography><strong>Category:</strong> {product.category}</Typography>
              <Typography><strong>Description:</strong> {product.description}</Typography>
              <Typography variant="h6">
                <strong>Price:</strong>
                <span className="text-green-600"> ₱{product.price}</span>
              </Typography>
              <Typography><strong>Quantity:</strong> {product.quantity}</Typography>
              <Typography><strong>Date Added:</strong> {product.date}</Typography>
            </Box>

            {/* Variations */}
            {product.variations && product.variations.length > 0 && (
              <Box className="mt-6">
                <Typography variant="h6" className="text-gray-800">Variations:</Typography>
                <Box className="mt-4 space-y-3">
                  {product.variations.map((variation, index) => (
                    <Paper
                      key={index}
                      className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 transition"
                      elevation={1}
                    >
                      <Typography>{variation.variation_name}</Typography>
                      <Typography variant="body2" className="text-gray-500">
                        ₱{variation.price} | Stock: {variation.stock}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* Close Button */}
            <Box className="mt-8 text-center">
              <Button
                variant="contained"
                onClick={onClose}
                fullWidth
                size="large"
              >
                Close
              </Button>
            </Box>
          </Box>

          {/* Right: Reviews Section */}
          <Box className="space-y-6">
            <Typography variant="h6" className="text-gray-800">Customer Reviews</Typography>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <Paper
                  key={index}
                  className="p-6 hover:shadow-lg transition"
                  elevation={2}
                >
                  <Typography variant="subtitle2">{review.reviewer_name}</Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {new Date(review.review_date).toLocaleString()}
                  </Typography>

                  {/* Display Stars for Rating */}
                  <Box className="flex items-center my-1">
                    {getStars(review.rating).map((star, i) => (
                      <Star
                        key={i}
                        size={20}
                        fill={star === 'filled' ? '#FCD34D' : 'none'}
                        color={star === 'filled' ? '#FCD34D' : '#D1D5DB'}
                      />
                    ))}
                  </Box>
                  <Typography className="mt-2 text-gray-700">{review.comment}</Typography>
                </Paper>
              ))
            ) : (
              <Typography className="text-center text-gray-500">
                No comments for this product yet.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const ProductDetailsButton = ({ product, onClick }: { product: any; onClick: () => void }) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="secondary"
      fullWidth
      startIcon={<Info size={20} />}
      size="small"
    >
      Details
    </Button>
  );
};

export default ProductDetailsModal;