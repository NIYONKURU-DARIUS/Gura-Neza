import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, ChevronLeft, ShieldCheck, Truck, RotateCcw, Heart, Share2, Plus, Minus, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import { productService, type Product } from '../services/productService';
import { getStockInfo } from '../services/stockUtils';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('description');
  const [loading, setLoading] = React.useState(true);

  // Rating state
  const [canRate, setCanRate] = React.useState(false);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [selectedRating, setSelectedRating] = React.useState(0); // user's own submitted rating
  const [isRating, setIsRating] = React.useState(false);
  const [ratingError, setRatingError] = React.useState('');
  const [ratingSuccess, setRatingSuccess] = React.useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const found = await productService.getProductById(Number(id));
        setProduct(found);
        // Fetch related products from same category, exclude current
        const all = await productService.getAllProducts();
        const relatedItems = all
          .filter(p => p.category === found.category && p.id !== found.id)
          .slice(0, 3);
        setRelated(relatedItems);
        // Check eligibility and pre-load the user's existing rating in parallel
        try {
          const [eligible, myRating] = await Promise.all([
            productService.canRate(Number(id)),
            productService.getMyRating(Number(id)),
          ]);
          setCanRate(eligible);
          if (myRating > 0) setSelectedRating(myRating);
        } catch { /* not authenticated — skip */ }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleRate = async (stars: number) => {
    if (!stars || isRating) return;
    setIsRating(true);
    setRatingError('');
    try {
      // Server returns the product with the recalculated average rating
      const updated = await productService.rateProduct(Number(id), stars);
      setProduct(updated);           // updates the displayed average
      setSelectedRating(stars);      // remembers this user's own choice
      setRatingSuccess(true);
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (err: any) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsRating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-p)] font-black text-2xl italic">Product Not Found.</div>;


  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500 pb-20">
      <Navbar />

      <main className="pt-28 px-4 sm:px-[5%] max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-s)] uppercase tracking-[0.2em] mb-12">
           <Link to="/" className="hover:text-primary transition-colors">Home</Link>
           <ChevronLeft size={10} className="rotate-180 opacity-30" />
           <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
           <ChevronLeft size={10} className="rotate-180 opacity-30" />
           <span className="text-primary italic">Product View</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
          {/* Image Slider Mock */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-square bg-[var(--card-bg)] rounded-[3rem] border border-[var(--border-c)] overflow-hidden flex items-center justify-center p-20 shadow-sm group">
               <motion.img 
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                src={product.imageUrl} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700" 
                alt={product.name}
               />
               <div className="absolute top-8 right-8 flex flex-col gap-3">
                  <button className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)] text-[var(--text-s)] hover:text-red transition-all shadow-md">
                    <Heart size={20} />
                  </button>
                  <button className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-c)] text-[var(--text-s)] hover:text-primary transition-all shadow-md">
                    <Share2 size={20} />
                  </button>
               </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-4">
               <div className={`w-24 h-24 rounded-2xl border-2 border-primary transition-all cursor-pointer bg-[var(--card-bg)] flex items-center justify-center p-4`}>
                  <img src={product.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt={product.name} />
               </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 text-gold mb-6">
                <Star size={20} fill="currentColor" strokeWidth={0} />
                <span className="font-black text-xs text-[var(--text-p)]">{product.rating?.toFixed(1) ?? '—'}</span>
                <span className="text-[var(--text-s)] font-bold text-xs ml-2 uppercase tracking-widest">({product.totalReviews ?? 0} Reviews)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-p)] mb-6 italic tracking-tighter leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between mb-10 pb-10 border-b border-[var(--border-c)]">
                <div className="flex items-center gap-4">
                    <span className="text-4xl sm:text-5xl font-mono-price font-black text-primary italic">${product.price.toFixed(2)}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border ${getStockInfo(product.stock).bg} ${getStockInfo(product.stock).text} ${getStockInfo(product.stock).border}`}>
                   <div className={`w-2 h-2 rounded-full ${getStockInfo(product.stock).dot} animate-pulse`} />
                   {getStockInfo(product.stock).label}
                </div>
            </div>

            <p className="text-[var(--text-s)] text-lg font-bold mb-12 leading-relaxed italic">
               {product.description}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
               <div className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--border-c)] p-2 rounded-2xl w-full sm:w-fit min-w-[150px]">
                  <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 rounded-xl hover:bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-p)] transition-all"><Minus size={20} /></button>
                  <span className="text-xl font-black text-[var(--text-p)] w-10 text-center">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="w-12 h-12 rounded-xl hover:bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-p)] transition-all"><Plus size={20} /></button>
               </div>
               <button 
                onClick={() => addToCart(product, qty)}
                className="flex-1 btn-primary py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-primary/30"
               >
                  <ShoppingCart size={24} /> Add to Cart
               </button>
            </div>

            <button className="w-full bg-[var(--bg-main)] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-2 border-[var(--text-p)] text-[var(--text-p)] font-black py-5 rounded-2xl text-xl transition-all flex items-center justify-center gap-3 italic"
                onClick={async () => {
                  await addToCart(product, qty);
                  navigate('/checkout');
                }}
            >
                Buy Now &amp; Pay Later <ArrowRight size={24} />
            </button>

            {/* Trust Badges Details */}
            <div className="mt-16 grid grid-cols-3 gap-4 border-t border-[var(--border-c)] pt-12">
                {[
                    { icon: <ShieldCheck />, label: 'Genuine' },
                    { icon: <Truck />, label: 'Fast' },
                    { icon: <RotateCcw />, label: 'Return' }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 text-center">
                        <div className="text-primary opacity-50">{item.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-s)]">{item.label}</span>
                    </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs section */}
        <section className="mb-24">
            <div className="flex gap-12 border-b border-[var(--border-c)] mb-12">
                {['description', 'specifications', 'reviews'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-[var(--text-s)] hover:text-[var(--text-p)]'}`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(76,175,80,0.5)]" />}
                    </button>
                ))}
            </div>
            <div className="bg-[var(--card-bg)] p-8 sm:p-12 rounded-[3.5rem] border border-[var(--border-c)] transition-colors">
                {activeTab === 'description' && (
                    <p className="text-[var(--text-s)] font-bold text-lg leading-loose italic">
                        {product.description || "No full description available for this item yet."}
                    </p>
                )}
                {activeTab === 'reviews' && (
                    <div className="space-y-8">
                        {/* ── Average rating summary ── */}
                        <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-[var(--border-c)]">
                            {/* Big number */}
                            <div className="text-center flex-shrink-0">
                                <div className="text-6xl font-black text-primary italic leading-none mb-2">
                                    {product.totalReviews > 0 ? (product.rating ?? 0).toFixed(1) : '—'}
                                </div>
                                <div className="flex gap-1 justify-center text-gold mb-1">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} size={18}
                                            fill={i <= Math.round(product.rating ?? 0) ? 'currentColor' : 'none'}
                                            strokeWidth={i <= Math.round(product.rating ?? 0) ? 0 : 1.5} />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest">
                                    {product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Per-star breakdown bars */}
                            <div className="flex-1 w-full space-y-1.5">
                                {[5,4,3,2,1].map(star => {
                                    // We don't have per-star counts from the API, so show a
                                    // proportional bar based on how close the average is to each star
                                    const avg = product.rating ?? 0;
                                    const weight = Math.max(0, 1 - Math.abs(avg - star));
                                    const pct = product.totalReviews > 0 ? Math.round(weight * 100) : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-[var(--text-s)] w-3 flex-shrink-0">{star}</span>
                                            <Star size={10} className="text-gold flex-shrink-0" fill="#FFD700" strokeWidth={0} />
                                            <div className="flex-1 h-1.5 bg-[var(--border-c)] rounded-full overflow-hidden">
                                                <div className="h-full bg-gold rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, background: '#FFD700' }} />
                                            </div>
                                            <span className="text-[9px] font-bold text-[var(--text-s)] w-6 text-right flex-shrink-0">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Rate this product ── */}
                        {canRate && (
                            <div className="bg-[var(--bg-main)] p-6 rounded-2xl border border-[var(--border-c)]">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-black text-[var(--text-p)] italic">
                                        {selectedRating > 0 ? 'Update Your Rating' : 'Rate This Product'}
                                    </h4>
                                    {selectedRating > 0 && (
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                                            Your rating: {selectedRating}/5
                                        </span>
                                    )}
                                </div>

                                {/* Input stars — show user's own choice, not the average */}
                                <div className="flex items-center gap-2 mb-4">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => handleRate(star)}
                                            disabled={isRating}
                                            className="transition-transform hover:scale-125 disabled:opacity-50"
                                        >
                                            <Star size={30}
                                                className="text-gold transition-all"
                                                fill={star <= (hoverRating || selectedRating) ? 'currentColor' : 'none'}
                                                strokeWidth={star <= (hoverRating || selectedRating) ? 0 : 1.5}
                                            />
                                        </button>
                                    ))}
                                    {isRating && <Loader2 size={20} className="animate-spin text-primary ml-2" />}
                                    {/* Live label */}
                                    {(hoverRating || selectedRating) > 0 && !isRating && (
                                        <span className="text-xs font-black text-[var(--text-s)] ml-1 italic">
                                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || selectedRating]}
                                        </span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {ratingSuccess && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-xs font-black text-primary bg-primary/10 px-3 py-2 rounded-xl">
                                            <Star size={14} fill="currentColor" strokeWidth={0} />
                                            Rating submitted! Average updated to {(product.rating ?? 0).toFixed(1)} from {product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''}.
                                        </motion.div>
                                    )}
                                    {ratingError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="text-xs font-black text-red">
                                            {ratingError}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {product.totalReviews === 0 && (
                            <p className="text-[var(--text-s)] font-bold italic text-center py-8">
                                No reviews yet. Be the first to rate this product!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>

        {/* Related Products */}
        <section>
          <h2 className="text-4xl font-black mb-12 italic flex items-center gap-4">
             <Heart className="text-primary" /> Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {related.map((p) => <ProductCard key={p.id} product={p} />)}
             <Link to="/products" className="bg-primary/5 rounded-[3rem] border border-primary/20 border-dashed flex flex-col items-center justify-center p-12 text-center group hover:bg-primary/10 transition-colors">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                   <ArrowRight size={32} />
                </div>
                <span className="text-xl font-black italic text-primary">Explore All Shop Items</span>
             </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
