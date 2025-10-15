import React, { useEffect, useRef } from 'react';
import OurStory from '../assets/OurStory.jpg';
import ConnectPeople from '../assets/ConnectPeople.jpg';
import Community from '../assets/Community.jpg';  

// AboutDailyDone.jsx
// Single-file React component using Tailwind CSS utility classes.
// Drop this component into your React app (e.g. src/components/AboutDailyDone.jsx)
// Make sure Tailwind is configured in your project.

export default function AboutDailyDone() {
  const sectionsRef = useRef([]);
  sectionsRef.current = [];

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
    // IntersectionObserver for entrance animations
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6');
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Subtle parallax effect for hero
    const hero = document.getElementById('hero-section');
    function onScroll() {
      const scrolled = window.pageYOffset;
      if (hero) hero.style.transform = `translateY(${scrolled * -0.15}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const team = [
    {
      name: 'Yashraj Deshmukh',
      role: 'Founder & CEO',
      bio: 'Former product leader with a passion for building technology that brings communities together and solves real problems.',
    },
    {
      name: 'Utkarsh Gade',
      role: 'Head of Engineering',
      bio: 'Full-stack engineer with 10+ years building scalable platforms that millions of users trust and rely on daily.',
    },
    {
      name: 'Rajesh Kulkarni',
      role: 'VP of Design',
      bio: 'User experience designer who believes great products should feel intuitive, delightful, and accessible to everyone.',
    },
  ];

  return (
    <div className="text-gray-800 bg-white font-sans antialiased">
      {/* HERO */}
      <header
        id="hero-section"
        className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-sky-400 text-white py-24"
      >
        {/* subtle grain-ish overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/6 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h1 className="font-extrabold leading-tight text-4xl sm:text-5xl md:text-6xl">
            About DailyDone
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl opacity-90">
            Transforming how communities connect and support each other through trusted,
            everyday assistance
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Our Story */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-content">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 mb-4">
                Founded in 2023, DailyDone emerged from a simple observation:{' '}
                <span className="text-blue-800 font-semibold">communities were becoming increasingly disconnected</span>{' '}
                despite living closer together than ever before.
              </p>
              <p className="text-lg text-slate-600">
                We envisioned a platform where neighbors could easily help each other with
                daily tasks, building stronger communities while providing flexible earning
                opportunities for helpers.
              </p>
            </div>

           <img 
              src={OurStory}
              alt="Our Story" 
              className="rounded-2xl border-2 border-dashed border-gray-300 object-cover h-100 w-full"
          />

          </div>
        </section>

        {/* What We Do (reverse layout on wide screens) */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="text-content">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">What We Do</h2>
              <p className="text-lg text-slate-600 mb-4">
                DailyDone connects people who need help with everyday tasks to{' '}
                <span className="text-blue-800 font-semibold">trusted helpers in their neighborhood</span>.
                From grocery runs to pet care, we make it simple and secure.
              </p>
              <p className="text-lg text-slate-600">
                Our platform combines the convenience of on-demand services with the trust
                and community spirit of neighborhood relationships.
              </p>
            </div>

            <img 
              src={ConnectPeople}
              alt="Connecting People" 
              className="rounded-2xl border-2 border-dashed border-gray-300 object-cover h-110 w-full"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="relative rounded-2xl p-10 bg-gradient-to-br from-blue-900 to-sky-400 text-white overflow-hidden">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-extrabold mb-2">Trusted by Communities Across India</h2>
              <p className="opacity-90 mb-8">Join thousands of neighbors who've discovered the power of community assistance</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                <div className="stat-item">
                  <h3 className="text-4xl font-extrabold text-sky-300 mb-2">50K+</h3>
                  <p className="opacity-90">Active Users</p>
                </div>

                <div className="stat-item">
                  <h3 className="text-4xl font-extrabold text-sky-300 mb-2">2M+</h3>
                  <p className="opacity-90">Tasks Completed</p>
                </div>

                <div className="stat-item">
                  <h3 className="text-4xl font-extrabold text-sky-300 mb-2">4.9★</h3>
                  <p className="opacity-90">Average Rating</p>
                </div>

                <div className="stat-item">
                  <h3 className="text-4xl font-extrabold text-sky-300 mb-2">25+</h3>
                  <p className="opacity-90">Cities</p>
                </div>
              </div>
            </div>

            {/* decorative overlay to mimic subtle grain */}
            <div className="pointer-events-none absolute inset-0 opacity-20"></div>
          </div>
        </section>

        {/* Mission */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="mission-section rounded-2xl bg-slate-50 border border-slate-200 p-10 text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              To strengthen communities by making it easy for neighbors to help each other,
              creating meaningful connections while providing flexible earning opportunities
              that improve lives.
            </p>
          </div>
        </section>

        {/* How We're Different */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-content">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">How We're Different</h2>
              <p className="text-lg text-slate-600 mb-4">
                Unlike traditional service platforms, DailyDone focuses on{' '}
                <span className="text-blue-800 font-semibold">building local communities</span>.
              </p>
              <p className="text-lg text-slate-600">
                We prioritize trust, safety, and fair compensation, ensuring every interaction
                strengthens the fabric of your neighborhood community.
              </p>
            </div>

            
            <img 
              src={Community}
              alt="Community" 
              className="rounded-2xl border-2 border-dashed border-gray-300 object-cover h-110 w-full"
            />
          </div>
        </section>

        {/* Team */}
        <section
          ref={addToRefs}
          className="content-section mb-16 transition-all duration-700"
        >
          <div className="team-section text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
              We're a diverse group of builders, dreamers, and community advocates united by
              our passion for connecting people and solving everyday problems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div key={member.name} className="team-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition">
                  <div className="team-avatar w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center text-white font-medium text-sm border-4 border-sky-50">
                    Photo
                  </div>
                  <h3 className="team-name text-xl font-semibold text-slate-900 mt-4">{member.name}</h3>
                  <p className="team-role text-blue-800 font-semibold text-sm mt-1">{member.role}</p>
                  <p className="team-bio text-sm text-slate-500 mt-3">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
