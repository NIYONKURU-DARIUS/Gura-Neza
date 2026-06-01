import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/store';
import { productService, type Product } from '../services/productService';
import { getStockInfo } from '../services/stockUtils';
import { playLikeSound } from '../services/speechService';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product: initialProduct }) => {
  const [product, setProduct] = useState(initialProduct);
  const [isLiking, setIsLiking] = useState(false);
  const { addToCart } = useStore();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      // Optimistic update
      const wasLiked = product.likedByCurrentUser;
      setProduct(prev => ({
        ...prev,
        likedByCurrentUser: !wasLiked,
        likesCount: wasLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1,
      }));

      // Play sound only when liking (not unliking)
      if (!wasLiked) playLikeSound();

      // Server call — response is authoritative
      const updated = await productService.likeProduct(product.id);
      setProduct(updated);
    } catch (err) {
      // Revert optimistic update on error
      setProduct(initialProduct);
      console.error('Failed to toggle like', err);
    } finally {
      setIsLiking(false);
    }
  };

  const stockInfo = getStockInfo(product.stock ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full rounded-[2rem] bg-[var(--card-bg)] border border-[var(--border-c)] overflow-hidden transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgb(76,175,80,0.15)] hover:-translate-y-2"
    >
      {/* Category Badge */}
      <div className="absolute top-5 left-5 z-10 flex gap-2">
        <span className="bg-charcoal dark:bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
          {product.category}
        </span>
        {product.isFeatured && (
          <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
            Featured
          </span>
        )}
      </div>

      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        title={product.likedByCurrentUser ? 'Unlike this product' : 'Like this product'}
        className={`absolute top-5 right-5 z-10 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-all
          ${product.likedByCurrentUser
            ? 'bg-red/10 text-red hover:bg-red/20'
            : 'bg-white/90 dark:bg-black/50 text-[var(--text-s)] hover:text-red'
          }`}
      >
        {isLiking
          ? <Loader2 size={18} className="animate-spin" />
          : <Heart
              size={18}
              className={`transition-all ${product.likedByCurrentUser ? 'fill-red text-red scale-110' : ''}`}
            />
        }
      </button>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-[var(--hover-c)] transition-colors duration-500 flex items-center justify-center p-10">
        <motion.img
          whileHover={{ scale: 1.15, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/300?text=${product.name}` }}
        />
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-4 bg-white/90 dark:bg-black/80 rounded-2xl text-primary shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
            <Eye size={24} />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-gold">
            {product.totalReviews === 0 ? (
              <span className="text-[10px] text-[var(--text-s)] font-black uppercase tracking-widest">No ratings yet</span>
            ) : (
              <>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13}
                    fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'}
                    strokeWidth={i < Math.round(product.rating || 0) ? 0 : 1.5}
                  />
                ))}
                <span className="text-[10px] text-[var(--text-s)] font-black ml-1 uppercase tracking-widest">
                  {(product.rating || 0).toFixed(1)} ({product.totalReviews})
                </span>
              </>
            )}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${product.likedByCurrentUser ? 'text-red' : 'text-[var(--text-s)]'}`}>
            {product.likesCount || 0} {product.likedByCurrentUser ? '♥' : 'Likes'}
          </span>
        </div>

        <h3 className="text-[var(--text-p)] font-black text-xl leading-snug mb-3 group-hover:text-primary transition-colors italic tracking-tight">
          {product.name}
        </h3>

        <div className="mt-auto pt-6 border-t border-[var(--border-c)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-s)] font-black uppercase tracking-[0.2em] mb-1">Price</span>
              <span className="text-2xl font-mono-price font-black text-primary italic">
                ${product.price ? product.price.toFixed(2) : '0.00'}
              </span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${stockInfo.bg} ${stockInfo.text} border-current/10`}>
              <div className={`w-2 h-2 rounded-full ${stockInfo.dot} animate-pulse`} />
              {stockInfo.label}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product)}
            className="w-full btn-primary py-4 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
            <ShoppingCart size={20} className="relative z-10" />
            <span className="relative z-10 italic">Add to Cart</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
