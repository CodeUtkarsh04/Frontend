import React from "react";
import { useEffect, useRef } from "react";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl opacity-90">
            Your privacy matters to us. This policy explains how DailyDone collects, uses,
            and safeguards your personal information.
          </p>
          <p className="mt-2 text-sm opacity-90">Last Updated: 30 Oct 2025</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* 1 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            1. Introduction
          </h2>
          <p className="text-lg text-slate-600">
            This Privacy Policy is published in compliance with the Information
            Technology Act, 2000, the Information Technology (Reasonable Security
            Practices and Procedures and Sensitive Personal Data or Information)
            Rules, 2011, and the Digital Personal Data Protection Act, 2023 (DPDP Act).
            By using DailyDone, you consent to the practices described in this Policy.
          </p>
        </section>

        {/* 2 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            2. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Personal details: name, phone number, email, address.</li>
            <li>Identity verification data (e.g., ID proof, selfie, etc.).</li>
            <li>Payment details: UPI/Bank info (processed via secure third parties).</li>
            <li>Usage data: app interactions, task history, ratings, device/IP logs.</li>
          </ul>
        </section>

        {/* 3 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>To create and manage your account.</li>
            <li>To connect you with helpers/requesters in your area.</li>
            <li>To process payments and issue receipts.</li>
            <li>To ensure trust, safety, and fraud prevention.</li>
            <li>To send essential communications (task updates, confirmations).</li>
            <li>For analytics, service improvement, and compliance with laws.</li>
          </ul>
        </section>

        {/* 4 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            4. Sharing of Information
          </h2>
          <p className="text-lg text-slate-600">
            We do not sell your personal information. We may share limited data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 mt-2">
            <li>With other users (only necessary details for a task).</li>
            <li>With trusted service providers (payments, verification, hosting).</li>
            <li>When required by law, government agencies, or court orders.</li>
          </ul>
        </section>

        {/* 5 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            5. Data Security
          </h2>
          <p className="text-lg text-slate-600">
            We implement reasonable security practices including encryption, access
            control, and secure servers as mandated by Indian law. However, no method
            of transmission or storage is 100% secure.
          </p>
        </section>

        {/* 6 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            6. Your Rights
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Right to access, correct, or update your data.</li>
            <li>Right to withdraw consent (may affect service availability).</li>
            <li>Right to request deletion of your personal data (subject to retention laws).</li>
            <li>Right to raise grievances via our Grievance Officer.</li>
          </ul>
        </section>

        {/* 7 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            7. Data Retention
          </h2>
          <p className="text-lg text-slate-600">
            We retain data as long as necessary for service, legal, and business
            purposes. Some records may be retained after account deletion in compliance
            with law enforcement and tax regulations.
          </p>
        </section>

        {/* 8 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            8. Children’s Privacy
          </h2>
          <p className="text-lg text-slate-600">
            DailyDone is not intended for users under 18. We do not knowingly collect
            personal data from minors. If found, such accounts will be deleted.
          </p>
        </section>

        {/* 9 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            9. Grievance Redressal
          </h2>
          <div className="mt-3 rounded-xl border border-slate-200 p-4 text-slate-700">
            <p><span className="font-semibold">Grievance Officer:</span> [Name]</p>
            <p><span className="font-semibold">Email:</span> grievance@dailydone.in</p>
            <p><span className="font-semibold">Address:</span> [Full Address, City, State, PIN, India]</p>
            <p><span className="font-semibold">Working Hours:</span> Mon–Fri, 10:00–18:00 IST</p>
          </div>
        </section>

        {/* 10 */}
        <section ref={addToRefs} className="transition-all duration-700">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            10. Changes to this Policy
          </h2>
          <p className="text-lg text-slate-600">
            We may update this Privacy Policy from time to time. The latest version
            will always be available on this page, with the “Last Updated” date shown.
          </p>
        </section>

        {/* Closing */}
        <section ref={addToRefs} className="transition-all duration-700 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
            We Respect Your Privacy
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Thank you for trusting DailyDone. Your privacy and data security are central
            to our mission of building a safe and supportive community.
          </p>
        </section>
      </main>
    </div>
  );
}
