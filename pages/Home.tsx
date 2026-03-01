
import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Star, Heart, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import DualImageFrame from '../components/DualImageFrame';
import ChatBot from '../components/ChatBot';

const Counter = ({ target, label }: { target: number, label: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0); // Reset when target changes
    let start = 0;
    const end = target;
    if (end === 0) return;
    
    const duration = 2000;
    const steps = 40;
    const increment = Math.ceil(end / steps);
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center p-4 sm:p-6 bg-gray-800/80 border border-gray-700 rounded-2xl backdrop-blur-md transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
      <div className="text-2xl 2xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-400 mb-1 sm:mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-gray-300 font-bold uppercase tracking-widest text-[10px] 2xs:text-xs">{label}</div>
    </div>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueUsers: 0,
    toolsBuilt: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (!error && data) setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchRealData = async () => {
      // 1. Log current visit (fire-and-forget, don't block stats)
      supabase.from('site_visits').insert([{
        path: '/',
        user_agent: navigator.userAgent
      }]).then(() => {});

      // 2. Fetch stats via SECURITY DEFINER RPC (bypasses RLS)
      const { data, error } = await supabase.rpc('get_public_stats');

      if (!error && data) {
        setStats({
          totalVisits: data.total_visits || 0,
          uniqueUsers: data.total_users || 0,
          toolsBuilt: data.total_projects || 0,
          totalLikes: data.total_likes || 0
        });
      } else {
        // Fallback: query tables individually (profiles & projects have public read)
        console.warn("RPC failed, falling back to individual queries:", error);
        const [projectsRes, usersRes] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);
        setStats({
          totalVisits: 0,
          uniqueUsers: usersRes.count || 0,
          toolsBuilt: projectsRes.count || 0,
          totalLikes: 0
        });
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background Light Orbs */}
      <div className="blur-orb w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-orange-500 top-[-50px] left-[-50px] sm:top-[-100px] sm:left-[-100px] animate-float"></div>
      <div className="blur-orb w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-red-600 top-[20%] right-[-30px] sm:right-[-50px] animate-float-delayed"></div>
      <div className="blur-orb w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-blue-600 bottom-[-100px] sm:bottom-[-200px] left-[10%] animate-float-slow"></div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 md:pt-24 md:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-left space-y-5 sm:space-y-8 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-bold animate-pulse">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                New: Smart AI Tools
              </div>

              <h1 className="text-3xl 2xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white leading-tight tracking-tighter">
                WE MAKE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-600">SMART</span> <br />
                AI TECH
              </h1>

              <p className="max-w-xl text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-400 leading-relaxed">
                Code Wave AI builds tools that talk, learn, and grow.
                Our robots help you do your work faster and better every day.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link to="/projects" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-red-600/30 text-sm sm:text-base active:scale-95">
                  SEE OUR WORK <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                {user && (
                  <Link to="/contact" className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-gray-900 text-black dark:text-white font-bold border-2 border-black dark:border-white rounded-2xl flex items-center justify-center transition-all text-sm sm:text-base active:scale-95">
                    CONTACT US
                  </Link>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-in slide-in-from-right duration-1000 z-10 mt-4 lg:mt-0">
              <div className="absolute -inset-6 sm:-inset-10 bg-orange-600/10 dark:bg-orange-600/20 blur-[60px] sm:blur-[100px] rounded-full"></div>
              <div className="relative rounded-2xl sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-white dark:border-black shadow-2xl rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/hero.jpg"
                  alt="AI Technology"
                  className="w-full h-auto aspect-video object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-10 sm:py-16 md:py-20 bg-black/90 dark:bg-black/80 transition-colors border-y border-gray-900 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <Counter target={stats.totalVisits} label="Total Visits" />
            <Counter target={stats.uniqueUsers} label="New People" />
            <Counter target={stats.toolsBuilt} label="Tools Built" />
            <Counter target={stats.totalLikes} label="Total Likes" />
          </div>
        </div>
      </section>

      {/* Our Projects Section */}
      <section className="py-14 sm:py-20 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-black dark:text-white mb-3 sm:mb-4 uppercase tracking-tighter">OUR PROJECTS</h2>
              <div className="w-14 sm:w-20 h-1.5 sm:h-2 bg-orange-600 rounded-full"></div>
            </div>
            <Link to="/projects" className="flex items-center text-orange-600 hover:text-red-600 font-bold text-sm sm:text-base transition-colors">
              VIEW ALL <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl sm:rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No projects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="group bg-white dark:bg-black border border-gray-200 dark:border-gray-900 rounded-2xl sm:rounded-[2rem] overflow-hidden hover:border-orange-500 transition-all duration-500 flex flex-col">
                  <div className="p-2 sm:p-3">
                    <DualImageFrame
                      image1={project.media?.[0] || 'https://via.placeholder.com/800x450'}
                      image2={project.media?.[1] || 'https://via.placeholder.com/800x450'}
                      alt={project.title}
                    />
                  </div>
                  <div className="p-4 sm:p-6 flex-grow space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-tighter line-clamp-2">{project.title}</h3>
                      <div className="flex items-center text-orange-600 font-bold bg-orange-600/10 px-2 py-1 rounded-lg text-sm shrink-0">
                        <Star className="w-4 h-4 mr-1 fill-current" /> {project.rating || 0}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                    <div className="pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-900">
                      <div className="flex items-center space-x-3 text-gray-400">
                        <span className="flex items-center space-x-1.5">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-bold">{project.likes_count || 0}</span>
                        </span>
                      </div>
                      <span className="p-2 bg-gray-100 dark:bg-gray-900 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-14 sm:py-20 md:py-24 relative bg-gray-50/50 dark:bg-black/50 backdrop-blur-3xl z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-black dark:text-white mb-3 sm:mb-4 uppercase tracking-tighter">WHAT WE DO</h2>
            <div className="w-14 sm:w-20 h-1.5 sm:h-2 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {/* Feature 1 */}
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:border-orange-500 transition-all duration-300 shadow-xl shadow-black/5">
              <div className="h-36 sm:h-48 overflow-hidden">
                <img
                  src="/talk-ai.avif"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Talking AI"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-600 mb-4 sm:mb-6 font-bold text-sm sm:text-base">
                  01
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-3 sm:mb-4">Talking AI</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Computers that talk and listen just like real people to help your customers.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:border-green-500 transition-all duration-300 shadow-xl shadow-black/5">
              <div className="h-36 sm:h-48 overflow-hidden">
                <img
                  src="/auto-systems.jpg"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Automation"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/10 rounded-xl flex items-center justify-center text-green-600 mb-4 sm:mb-6 font-bold text-sm sm:text-base">
                  02
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-3 sm:mb-4">Auto Systems</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Smart tools that do boring work for you so you can save time every day.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-[2.5rem] overflow-hidden hover:border-red-500 transition-all duration-300 shadow-xl shadow-black/5 sm:col-span-2 md:col-span-1">
              <div className="h-36 sm:h-48 overflow-hidden">
                <img
                  src="/web-app.webp"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt="Web Apps"
                />
              </div>
              <div className="p-5 sm:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 mb-4 sm:mb-6 font-bold text-sm sm:text-base">
                  03
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-3 sm:mb-4">Web Apps</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Fast and safe websites built with the best and newest smart technology.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ChatBot />
    </div>
  );
};

export default Home;
