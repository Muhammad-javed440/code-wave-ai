
import React, { useState } from 'react';
import { Send, Mail, MapPin, Phone, MessageSquare, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Office coordinates: 31.509318, 74.262818
  const officeCoords = { lat: 31.509318, lng: 74.262818 };
  const officeMapsUrl = 'https://www.google.com/maps/place/31%C2%B030\'33.5%22N+74%C2%B015\'46.1%22E/@31.5093225,74.2602431,17z';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (!response.ok) throw new Error('Failed to fetch address');
          const data = await response.json();
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        alert('Could not get your location.');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          location_text: location
        });
      
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      alert("Error sending message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-20 items-start">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">GET IN <br /><span className="text-orange-600">TOUCH</span>.</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-md font-medium">
              Do you have a smart idea? We want to hear from you.
            </p>
          </div>

          <div className="space-y-8">
            <a href={`https://mail.google.com/mail/?view=cm&to=codewaveai44@gmail.com&su=${encodeURIComponent(`Inquiry from ${user?.full_name || 'Visitor'} — CodeWaveAI`)}&body=${encodeURIComponent(`Hi CodeWaveAI Team,\n\nMy name is ${user?.full_name || 'a visitor'} and I'm reaching out because I'm interested in your AI solutions.\n\nI'd love to discuss how we can work together.\n\nLooking forward to hearing from you!\n\nBest regards,\n${user?.full_name || 'Visitor'}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-6 p-6 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-3xl group hover:border-orange-500 transition-all shadow-xl shadow-black/5 cursor-pointer">
              <div className="p-4 bg-orange-600/10 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Send an Email</p>
                <p className="text-lg font-black text-black dark:text-white">codewaveai44@gmail.com</p>
              </div>
            </a>

            <a href={officeMapsUrl} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-3xl group hover:border-red-500 transition-all shadow-xl shadow-black/5 overflow-hidden cursor-pointer">
              <div className="flex items-center space-x-6 p-6">
                <div className="p-4 bg-red-600/10 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Our Office</p>
                  <p className="text-lg font-black text-black dark:text-white">Awan Town, Lahore</p>
                </div>
              </div>
              <div className="h-48 w-full relative">
                <iframe
                  title="Office Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${officeCoords.lat},${officeCoords.lng}&z=16&output=embed`}
                />
                <div className="absolute inset-0" />
              </div>
            </a>

            {user ? (
              <a href={`https://wa.me/923238300086?text=${encodeURIComponent(`Hi CodeWaveAI Team,\n\nMy name is ${user.full_name} and I'm reaching out because I'm interested in your AI solutions.\n\nI'd love to discuss how we can work together.\n\nLooking forward to hearing from you!\n\nBest regards,\n${user.full_name}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-6 p-6 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-3xl group hover:border-green-500 transition-all shadow-xl shadow-black/5 cursor-pointer">
                <div className="p-4 bg-green-600/10 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">WhatsApp</p>
                  <p className="text-lg font-black text-black dark:text-white">+923238300086</p>
                </div>
              </a>
            ) : (
              <div onClick={() => alert('Please log in to contact us on WhatsApp.')} className="flex items-center space-x-6 p-6 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-3xl group hover:border-green-500 transition-all shadow-xl shadow-black/5 cursor-pointer opacity-60">
                <div className="p-4 bg-green-600/10 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">WhatsApp</p>
                  <p className="text-lg font-black text-black dark:text-white">+923238300086</p>
                  <p className="text-[10px] text-red-500 font-bold mt-1">Login required</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-orange-600/10 blur-[100px] rounded-full"></div>
          
          <div className="bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-900 p-8 md:p-12 rounded-[3rem] shadow-2xl relative">
            {submitted ? (
              <div className="py-20 text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-black dark:text-white uppercase">Message Sent!</h3>
                  <p className="text-gray-500 font-bold">Thank you. We will talk to you soon.</p>
                </div>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-10 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                >
                  Send Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-black dark:text-white focus:ring-2 focus:ring-orange-600 outline-none transition-all font-bold" 
                    placeholder="Tell us your name" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-black dark:text-white focus:ring-2 focus:ring-orange-600 outline-none transition-all font-bold" 
                    placeholder="Where can we email you?" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Your Location</label>
                  <div className="relative">
                    <input 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 pr-16 text-black dark:text-white focus:ring-2 focus:ring-orange-600 outline-none transition-all font-bold" 
                      placeholder="Coordinates or Address" 
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-600 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                      title="Auto-detect location"
                    >
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">How can we help?</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-black dark:text-white focus:ring-2 focus:ring-orange-600 outline-none transition-all font-medium" 
                    placeholder="Tell us what you need..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-orange-600 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-3 uppercase tracking-[0.2em]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> <span>SEND NOW</span></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
