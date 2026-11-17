import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/website/gallery');
        if (res.data.success) {
          setItems(res.data.gallery);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      }
    };
    fetchGallery();
  }, []);

  const categories = [
    'All',
    'Architecture & Exterior',
    'Infinity Pool',
    'Master Suites',
    'Living & Lounge',
    'Dining & Bar',
    'Scenic Horizons'
  ];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="py-12 space-y-12">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold block mb-3">
          Visual Tour
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-slate-100 mb-4">
          Estate Gallery
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-light leading-relaxed">
          Immerse yourself in the visual splendor of Moon Light Villa. From twilight infinity pool reflections to lavish penthouse master suites.
        </p>
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-6" />
      </div>

      {/* Category Filter Pills */}
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 bg-slate-900 shadow-xl"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-medium block">
                  {item.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full max-h-[80vh] object-cover" />
            <div className="p-4 bg-slate-950 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{selectedImage.title}</h4>
                <p className="text-slate-400">{selectedImage.category}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
