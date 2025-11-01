import React, { useEffect, useRef } from "react";

export default function TermsAndConditions () {
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
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    sectionsRef.current.forEach((el) => {
      el.classList.add("opacity-0", "translate-y-6");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div className="text-gray-800 bg-white font-sans antialiased">
      {/* HERO */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-sky-400 text-white py-20 mt-15">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-extrabold leading-tight text-4xl sm:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl opacity-90">
            By creating an account on DailyDone, you agree to these Terms &
            Conditions.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* Acceptance */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-lg text-slate-600">
            By registering, accessing, or using DailyDone, you confirm that you
            have read, understood, and agree to be bound by these Terms &
            Conditions. These Terms are in accordance with the Information
            Technology Act, 2000 and relevant Indian laws.
          </p>
        </section>

        {/* Eligibility */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            2. Eligibility
          </h2>
          <p className="text-lg text-slate-600">
            You must be at least 18 years old to use DailyDone. By using our
            services, you confirm that you are legally capable of entering into
            a binding contract under Indian Contract Act, 1872.
          </p>
        </section>

        {/* User Obligations */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            3. User Responsibilities
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              Provide accurate and truthful information when creating your
              account.
            </li>
            <li>
              Use DailyDone only for lawful purposes and in compliance with
              Indian laws.
            </li>
            <li>
              Do not engage in fraudulent, abusive, or harmful behavior towards
              other users.
            </li>
            <li>
              Maintain confidentiality of your login credentials and be
              responsible for all activities under your account.
            </li>
          </ul>
        </section>

        {/* Services */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            4. Services
          </h2>
          <p className="text-lg text-slate-600">
            DailyDone is a community-based platform that connects people who
            need assistance with trusted helpers. We act only as a facilitator
            and are not directly responsible for the quality, timing, legality,
            or outcome of services performed by users.
          </p>
        </section>

        {/* Payments */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            5. Payments & Refunds
          </h2>
          <p className="text-lg text-slate-600">
            Payments must be made through authorized methods on DailyDone. Any
            disputes regarding payments or refunds shall be handled in
            accordance with Indian laws and our platform’s policies.
          </p>
        </section>

        {/* Privacy */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            6. Privacy & Data Protection
          </h2>
          <p className="text-lg text-slate-600">
            We respect your privacy and protect your data in compliance with the
            Information Technology (Reasonable Security Practices and Procedures
            and Sensitive Personal Data or Information) Rules, 2011.
          </p>
        </section>

        {/* Termination */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            7. Termination
          </h2>
          <p className="text-lg text-slate-600">
            DailyDone reserves the right to suspend or terminate your account at
            any time if you violate these Terms or applicable laws.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            8. Limitation of Liability
          </h2>
          <p className="text-lg text-slate-600">
            DailyDone shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of our platform or
            services provided by users.
          </p>
        </section>

        {/* Governing Law */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            9. Governing Law & Jurisdiction
          </h2>
          <p className="text-lg text-slate-600">
            These Terms shall be governed by and interpreted under the laws of
            India. Any disputes shall be subject to the exclusive jurisdiction
            of courts located in Pune, Maharashtra.
          </p>
        </section>

        {/* Changes */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            10. Changes to Terms
          </h2>
          <p className="text-lg text-slate-600">
            DailyDone may update these Terms from time to time. Continued use of
            the platform after changes constitutes acceptance of the revised
            Terms.
          </p>
        </section>

        {/* Closing */}
        <section
          ref={addToRefs}
          className="transition-all duration-700 text-center"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            By Creating an Account, You Accept These Terms
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Thank you for being part of DailyDone. We are committed to building
            a safe and trustworthy community for all users.
          </p>
        </section>
      </main>
    </div>
  );
}
