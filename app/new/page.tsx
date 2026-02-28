'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, FLAVOR_PROFILES } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { motion } from 'motion/react';
import { Coffee, Sparkles, Send, ArrowLeft, PlusCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { GoogleGenAI } from '@google/genai';

const COLORS = [
  'bg-pink-100',
  'bg-amber-100',
  'bg-teal-100',
  'bg-blue-100',
  'bg-purple-100',
  'bg-rose-100',
];

export default function NewBrewPage() {
  const router = useRouter();
  const { currentUser, roasters, addPost, addRoaster } = useAppStore();
  
  const [coffeeName, setCoffeeName] = useState('');
  const [coffeeUrl, setCoffeeUrl] = useState('');
  const [roasterId, setRoasterId] = useState(roasters[0]?.id || '');
  
  // New Roaster State
  const [newRoasterName, setNewRoasterName] = useState('');
  const [newRoasterLocation, setNewRoasterLocation] = useState('');
  const [newRoasterWebsite, setNewRoasterWebsite] = useState('');
  
  const [brewMethod, setBrewMethod] = useState('V60');
  const [coffeeWeight, setCoffeeWeight] = useState<number | ''>(15);
  const [waterWeight, setWaterWeight] = useState<number | ''>(250);
  
  const [country, setCountry] = useState('');
  const [varietal, setVarietal] = useState('');
  const [processMethod, setProcessMethod] = useState('');
  
  const [tasteNotes, setTasteNotes] = useState('');
  const [flavorProfiles, setFlavorProfiles] = useState<string[]>([]);
  const [rating, setRating] = useState(5);
  const [color, setColor] = useState(COLORS[0]);
  
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  const calculatedRatio = (coffeeWeight && waterWeight) 
    ? `1:${(waterWeight / coffeeWeight).toFixed(1)}` 
    : '---';

  // Redirect if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-3xl shadow-sm border-4 border-pink-200">
            <h2 className="text-2xl font-nunito font-bold mb-4">Oops! 🌸</h2>
            <p className="text-stone-600 mb-6">You need to sign in to log a brew.</p>
            <Link href="/" className="bg-pink-400 text-white px-6 py-3 rounded-full font-bold hover:bg-pink-500 transition-colors">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleGetAdvice = async () => {
    if (!tasteNotes) {
      alert("Please add some taste notes first so the Brew Coach can help!");
      return;
    }

    setIsGeneratingAdvice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `
        I am a home barista. Here is my recent brew:
        - Method: ${brewMethod}
        - Coffee: ${coffeeWeight}g
        - Water: ${waterWeight}g
        - Ratio: ${calculatedRatio}
        - Bean Info: ${country || 'Unknown origin'}, ${varietal || 'Unknown varietal'}, ${processMethod || 'Unknown process'}
        - My Taste Notes: "${tasteNotes}"
        
        Give me a very short, friendly, and encouraging 1-2 sentence tip on what I should tweak next time to improve my brew based on my taste notes. Keep it simple and actionable.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setAiAdvice(response.text);
      }
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiAdvice("Oops, the Brew Coach is taking a coffee break. Try again later!");
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalRoasterId = roasterId;
    let finalRoasterName = '';

    if (roasterId === 'new') {
      if (!newRoasterName) {
        alert("Please enter a name for the new roaster.");
        return;
      }
      finalRoasterId = addRoaster({
        name: newRoasterName,
        location: newRoasterLocation || 'Unknown',
        ethos: 'A new roaster discovered by the community!',
        equipment: 'Unknown',
        logo: '☕',
        website: newRoasterWebsite || undefined,
      });
      finalRoasterName = newRoasterName;
    } else {
      const roaster = roasters.find(r => r.id === roasterId);
      finalRoasterName = roaster?.name || 'Unknown Roaster';
    }
    
    addPost({
      coffeeName,
      coffeeUrl: coffeeUrl.trim() || undefined,
      roasterId: finalRoasterId,
      roasterName: finalRoasterName,
      brewMethod,
      coffeeWeight: Number(coffeeWeight) || 0,
      waterWeight: Number(waterWeight) || 0,
      ratio: calculatedRatio,
      country: country.trim() || undefined,
      varietal: varietal.trim() || undefined,
      process: processMethod.trim() || undefined,
      tasteNotes,
      flavorProfiles,
      rating,
      aiAdvice: aiAdvice || undefined,
      color,
    });
    
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Navbar />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-pink-500 font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Board
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 ${color.replace('bg-', 'border-').replace('100', '200')} relative overflow-hidden transition-colors duration-300`}
        >
          {/* Tape graphic */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 backdrop-blur-md rotate-[-1deg] shadow-sm rounded-sm z-10"></div>
          
          <h1 className="font-nunito text-3xl font-extrabold text-stone-800 mb-6 mt-2 text-center">
            Log a New Brew 📝
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pick a color */}
            <div className="flex justify-center gap-3 mb-8">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${c} border-2 transition-transform ${color === c ? 'scale-125 border-stone-400 shadow-md' : 'border-transparent hover:scale-110'}`}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">Coffee Name</label>
                <input
                  type="text"
                  required
                  value={coffeeName}
                  onChange={(e) => setCoffeeName(e.target.value)}
                  placeholder="e.g. Pink Bourbon"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">Roaster</label>
                <select
                  value={roasterId}
                  onChange={(e) => setRoasterId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium appearance-none bg-white"
                >
                  {roasters.map(r => (
                    <option key={r.id} value={r.id}>{r.logo} {r.name}</option>
                  ))}
                  <option value="new">✨ Add New Roaster...</option>
                </select>
              </div>

              {/* New Roaster Inline Form */}
              {roasterId === 'new' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="sm:col-span-2 bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 space-y-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PlusCircle className="w-5 h-5 text-pink-500" />
                    <span className="font-bold text-stone-800">New Roaster Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required={roasterId === 'new'}
                      value={newRoasterName}
                      onChange={(e) => setNewRoasterName(e.target.value)}
                      placeholder="Roaster Name"
                      className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm"
                    />
                    <input
                      type="text"
                      value={newRoasterLocation}
                      onChange={(e) => setNewRoasterLocation(e.target.value)}
                      placeholder="Location (e.g. Tokyo, JP)"
                      className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm"
                    />
                    <input
                      type="url"
                      value={newRoasterWebsite}
                      onChange={(e) => setNewRoasterWebsite(e.target.value)}
                      placeholder="Website URL"
                      className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm sm:col-span-2"
                    />
                  </div>
                </motion.div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-bold text-stone-700">Coffee Link (Optional)</label>
                <input
                  type="url"
                  value={coffeeUrl}
                  onChange={(e) => setCoffeeUrl(e.target.value)}
                  placeholder="https://roaster.com/coffee"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Bean Info */}
            <div className="bg-white/50 p-4 rounded-2xl border border-stone-200 space-y-4">
              <h3 className="text-sm font-bold text-stone-700">Bean Details (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country (e.g. Kenya)"
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm"
                />
                <input
                  type="text"
                  value={varietal}
                  onChange={(e) => setVarietal(e.target.value)}
                  placeholder="Varietal (e.g. SL28)"
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm"
                />
                <input
                  type="text"
                  value={processMethod}
                  onChange={(e) => setProcessMethod(e.target.value)}
                  placeholder="Process (e.g. Washed)"
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium text-sm"
                />
              </div>
            </div>

            {/* Recipe */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-bold text-stone-700">Method</label>
                <select
                  value={brewMethod}
                  onChange={(e) => setBrewMethod(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium bg-white"
                >
                  <option>V60</option>
                  <option>Aeropress</option>
                  <option>Chemex</option>
                  <option>Espresso</option>
                  <option>French Press</option>
                  <option>Batch Brew</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">Coffee (g)</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={coffeeWeight}
                  onChange={(e) => setCoffeeWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">Water (g)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={waterWeight}
                  onChange={(e) => setWaterWeight(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-stone-100 px-4 py-2 rounded-xl border border-stone-200 inline-flex items-center gap-2">
                <span className="text-sm font-bold text-stone-500">Calculated Ratio:</span>
                <span className="font-extrabold text-stone-800">{calculatedRatio}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">Flavor Profile</label>
              <div className="flex flex-wrap gap-2">
                {FLAVOR_PROFILES.map(flavor => {
                  const isSelected = flavorProfiles.includes(flavor);
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFlavorProfiles(prev => prev.filter(f => f !== flavor));
                        } else {
                          setFlavorProfiles(prev => [...prev, flavor]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-pink-400 text-white shadow-sm' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {flavor}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">Taste Notes</label>
              <textarea
                required
                value={tasteNotes}
                onChange={(e) => setTasteNotes(e.target.value)}
                placeholder="A bit sour, very floral, maybe too weak?"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium resize-none"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-700">Your Rating</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="relative w-8 h-8 cursor-pointer hover:scale-110 transition-transform">
                      <Star className="w-8 h-8 text-stone-200 absolute inset-0" />
                      <div 
                        className="absolute inset-0 overflow-hidden pointer-events-none" 
                        style={{ width: rating >= star ? '100%' : rating >= star - 0.5 ? '50%' : '0%' }}
                      >
                        <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                      </div>
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1/2 z-10" 
                        onClick={() => setRating(star - 0.5)}
                      />
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1/2 z-10" 
                        onClick={() => setRating(star)}
                      />
                    </div>
                  ))}
                </div>
                <span className="font-bold text-stone-600 ml-2">{rating} / 5</span>
              </div>
            </div>

            {/* AI Brew Coach Section */}
            <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-stone-800">Brew Coach</span>
                </div>
                <button
                  type="button"
                  onClick={handleGetAdvice}
                  disabled={isGeneratingAdvice || !tasteNotes}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAdvice ? 'Thinking...' : 'Get Advice ✨'}
                </button>
              </div>
              
              {aiAdvice ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-stone-700 font-medium bg-white p-3 rounded-xl border border-stone-200"
                >
                  {aiAdvice}
                </motion.div>
              ) : (
                <p className="text-xs text-stone-500 font-medium">
                  Write your taste notes and ask the coach for tips on your next brew!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
              Post to Board
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
