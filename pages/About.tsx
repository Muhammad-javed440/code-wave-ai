
import React, { useState, useEffect } from 'react';
import { Target, Users, Shield, Rocket, Linkedin, Twitter, Github, User, Loader2, Mail, Facebook } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TeamMember, Profile } from '../types';

const About: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [founder, setFounder] = useState<Profile | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, founderRes] = await Promise.all([
          supabase.from('team_members').select('*').order('display_order', { ascending: true }),
          supabase.from('profiles').select('*').eq('role', 'ADMIN').limit(1).single()
        ]);

        if (teamRes.data) setTeamMembers(teamRes.data);
        if (founderRes.data) setFounder(founderRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="py-12 sm:py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div className="space-y-5 sm:space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-600 text-xs sm:text-sm font-black uppercase tracking-widest">
              Who We Are
            </div>
            <h1 className="text-3xl 2xs:text-4xl md:text-6xl font-black text-black dark:text-white leading-tight uppercase tracking-tighter">
              WE ARE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">CODE WAVE AI</span>.<br />
              MAKING SMART TECH.
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              We started Code Wave AI to build smart tools that are fast and easy to use.
              We think computers should help people and feel like magic when you use them.
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 pt-2 sm:pt-4">
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-3xl font-black text-green-600">99%</div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-black tracking-widest">Good Results</p>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-2xl sm:text-3xl font-black text-orange-600">2.5s</div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-black tracking-widest">Fast Help</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-700 mt-4 lg:mt-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 to-red-600 blur-3xl opacity-20 rounded-2xl sm:rounded-[3rem]"></div>
            <div className="relative aspect-square rounded-2xl sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-white dark:border-black shadow-2xl rotate-1 sm:rotate-2">
              <img src="/group-business.jpg" className="w-full h-full object-cover" alt="Our Team" />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-16 sm:mt-24 md:mt-40 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          <div className="space-y-3 sm:space-y-4 group">
            <div className="p-3 sm:p-4 bg-orange-600/10 rounded-xl sm:rounded-2xl w-fit group-hover:bg-orange-600 transition-colors">
              <Target className="w-7 h-7 sm:w-10 sm:h-10 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-tighter">Careful Work</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">We make sure every tool we build works perfectly and very fast.</p>
          </div>
          <div className="space-y-3 sm:space-y-4 group">
            <div className="p-3 sm:p-4 bg-green-600/10 rounded-xl sm:rounded-2xl w-fit group-hover:bg-green-600 transition-colors">
              <Users className="w-7 h-7 sm:w-10 sm:h-10 text-green-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-tighter">Built for You</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">We build things that people like to use. They are easy and simple.</p>
          </div>
          <div className="space-y-3 sm:space-y-4 group">
            <div className="p-3 sm:p-4 bg-red-600/10 rounded-xl sm:rounded-2xl w-fit group-hover:bg-red-600 transition-colors">
              <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-red-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-tighter">Safe</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Your information is always safe with us. We take security seriously.</p>
          </div>
          <div className="space-y-3 sm:space-y-4 group">
            <div className="p-3 sm:p-4 bg-orange-600/10 rounded-xl sm:rounded-2xl w-fit group-hover:bg-orange-600 transition-colors">
              <Rocket className="w-7 h-7 sm:w-10 sm:h-10 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-tighter">Grows with You</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Our tools work well for small jobs and big companies too.</p>
          </div>
        </div>

        {/* Founder Section */}
        {founder && (
          <div className="mt-16 sm:mt-24 md:mt-40">
            <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-600 text-sm font-bold uppercase tracking-wider">
                <Rocket className="w-4 h-4" />
                Founder
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">VISIONARY</span> BEHIND
              </h2>
            </div>

            <div className="max-w-3xl mx-auto bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 md:p-14 relative overflow-hidden group hover:border-orange-500/50 transition-all duration-500 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-600/10 to-red-600/10 blur-[100px] rounded-full"></div>

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-2xl">
                    {founder.avatar_url ? (
                      <img src={founder.avatar_url} alt={founder.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <span className="text-5xl font-black text-white">{founder.full_name?.[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-grow text-center md:text-left space-y-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white uppercase tracking-tight">
                      {founder.full_name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-orange-600/10 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-full mt-2">
                      Founder & Lead Developer
                    </span>
                  </div>

                  {founder.bio && (
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{founder.bio}</p>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center gap-3 justify-center md:justify-start pt-2">
                    {founder.email && (
                      <a href={`mailto:${founder.email}`} className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all" title="Email">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {founder.social_links?.facebook && (
                      <a href={founder.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Facebook">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {founder.social_links?.linkedin && (
                      <a href={founder.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-blue-700 hover:text-white transition-all" title="LinkedIn">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {founder.social_links?.github && (
                      <a href={founder.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all" title="GitHub">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        <div className="mt-16 sm:mt-24 md:mt-40">
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-full text-orange-600 text-sm font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              Our Team
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tighter">
              MEET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">MINDS</span> BEHIND
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Our talented team of innovators, creators, and problem-solvers working together to build the future.
            </p>
          </div>

          {loadingTeam ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Team...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest">Team members coming soon...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="group relative bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-900 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-600/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-600/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="relative flex flex-col items-center text-center">
                    {/* Profile Image */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl bg-gray-100 dark:bg-gray-900">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            style={{ objectPosition: `${member.image_position?.x ?? 50}% ${member.image_position?.y ?? 50}%` }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight mb-1">
                      {member.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-orange-600/10 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                      {member.role}
                    </span>

                    {/* Description */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                      {member.description}
                    </p>

                    {/* Social Links & Email */}
                    <div className="flex items-center gap-3">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.social_links?.linkedin && (
                        <a
                          href={member.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.social_links?.twitter && (
                        <a
                          href={member.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                          title="Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {member.social_links?.github && (
                        <a
                          href={member.social_links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
