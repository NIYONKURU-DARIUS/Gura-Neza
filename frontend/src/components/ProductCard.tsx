import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/store';
import { type Product } from '../services/productService';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  
  const getStockColor = () => {
    const stock = (product.id * 7) % 30;
    if (stock === 0) return { label: 'Out of Stock', bg: 'bg-red/10', text: 'text-red', dot: 'bg-red' };
    if (stock < 10) return { label: 'Low Stock', bg: 'bg-amber/10', text: 'text-amber', dot: 'bg-amber' };
    return { label: 'In Stock', bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' };
  };

  const stockInfo = getStockColor();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full rounded-[2rem] bg-[var(--card-bg)] border border-[var(--border-c)] overflow-hidden transition-all duration-500 hover:shadow-2xl dark:hover:shadow-[0_8px_30px_rgb(76,175,80,0.15)] hover:-translate-y-2"
    >
      {/* Category Badge */}
      <div className="absolute top-5 left-5 z-10">
        <span className="bg-charcoal dark:bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
          {product.category}
        </span>
      </div>

      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-[var(--hover-c)] transition-colors duration-500 flex items-center justify-center p-10">
        <motion.img 
          whileHover={{ scale: 1.15, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          src={product.image} 
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
        <div className="flex items-center gap-1 text-gold mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} strokeWidth={i < 4 ? 0 : 2} />
          ))}
          <span className="text-[10px] text-[var(--text-s)] font-black ml-2 uppercase tracking-widest">(4.8)</span>
        </div>

        <h3 className="text-[var(--text-p)] font-black text-xl leading-snug mb-3 group-hover:text-primary transition-colors italic tracking-tight">
          {product.name}
        </h3>

        <div className="mt-auto pt-6 border-t border-[var(--border-c)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--text-s)] font-black uppercase tracking-[0.2em] mb-1">Price</span>
              <span className="text-2xl font-mono-price font-black text-primary italic">
                ${product.price.toFixed(2)}
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
