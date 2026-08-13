'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/lib/context/LibraryContext';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { Plus, Library as LibraryIcon, Sparkles, FolderPlus, X } from 'lucide-react';

export default function CollectionsPage() {
  const { collections, createCollection } = useLibrary();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCollection(name, description);
    setName('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen py-6 sm:py-10 pb-28 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Crunchyroll Custom Lists
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Movie Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Group movies into custom themed lists to share with friends or keep for yourself.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Collection
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" /> New Collection
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Collection Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 90s Sci-Fi Classics, Date Night..."
                  className="w-full p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this list special?"
                  className="w-full p-3 sm:p-3.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
