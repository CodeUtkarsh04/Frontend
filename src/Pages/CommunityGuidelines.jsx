import React, { useEffect, useRef } from 'react';

export default function CommunityGuidelines() {
  const sectionsRef = useRef([]);
  sectionsRef.current = [];

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
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

  return (
    <div className="text-gray-800 bg-white font-sans antialiased">
      {/* HERO */}
      <header
        className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-sky-400 text-white py-20"
      >
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-extrabold leading-tight text-4xl sm:text-5xl">
            Community Guidelines
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl opacity-90">
            Building a safe, respectful, and helpful community for everyone on DailyDone
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Intro */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Why We Have Guidelines</h2>
          <p className="text-lg text-slate-600">
            DailyDone is built on trust. These guidelines help ensure that every interaction
            — whether you’re requesting help or offering it — is safe, respectful, and meaningful.
          </p>
        </section>

        {/* Guidelines List */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Core Guidelines</h2>
          <div className="space-y-6">
            <div className="p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">1. Respect Everyone</h3>
              <p className="text-slate-600 mt-2">
                Treat others the way you want to be treated. No harassment, hate speech, or discrimination.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">2. Be Honest & Transparent</h3>
              <p className="text-slate-600 mt-2">
                Only accept tasks you can complete. Provide accurate details when posting or offering help.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">3. Safety First</h3>
              <p className="text-slate-600 mt-2">
                Meet in safe public places when possible. Follow local laws and DailyDone’s verification steps.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">4. Fairness Matters</h3>
              <p className="text-slate-600 mt-2">
                Pay fairly and on time. Helpers should respect the agreed terms of service.
              </p>
            </div>
            <div className="p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-blue-800">5. Protect Privacy</h3>
              <p className="text-slate-600 mt-2">
                Never share personal or sensitive information outside the platform. Respect others’ data and boundaries.
              </p>
            </div>
          </div>
        </section>

        {/* Enforcement */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Enforcement</h2>
          <p className="text-lg text-slate-600">
            Violating these guidelines and T&C may result in warnings, temporary suspension, or permanent removal
            from the DailyDone community. Our goal is to maintain a supportive and trustworthy environment.
          </p>
        </section>

        {/* Closing */}
        <section ref={addToRefs} className="transition-all duration-700 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Together, We Build Stronger Communities</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Thank you for following these guidelines and helping DailyDone remain a safe and positive space for all.
          </p>
        </section>
      </main>
    </div>
  );
}
