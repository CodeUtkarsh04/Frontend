import React, { useEffect, useRef } from "react";

const LAST_UPDATED = "14 Nov 2025";

export default function CookiePolicy() {
  const sectionsRef = useRef([]);
  sectionsRef.current = [];

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
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

  const Section = ({ id, title, children }) => (
    <section id={id} ref={addToRefs} className="transition-all duration-700">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-4">{title}</h2>
      <div className="prose prose-slate max-w-none text-slate-700">{children}</div>
    </section>
  );

  return (
    <div className="text-gray-800 bg-white antialiased font-sans">
      {/* HERO */}
      <header className="bg-gradient-to-br from-sky-800 via-blue-700 to-sky-500 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-extrabold leading-tight text-4xl sm:text-5xl">Cookie Policy</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg opacity-90">
            How DailyDone uses cookies and similar technologies, and how you can control them.
          </p>
          <p className="mt-2 text-sm opacity-90">Last updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {/* Quick summary + TOC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-6">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-slate-900">Quick summary</h3>
            <p className="mt-2 text-slate-700">
              We use cookies to make the site work, remember your preferences, and to improve the product via analytics. You can control or disable cookies from your browser, but note some parts of the site may not work properly without them.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="text-sm text-slate-500">Essential</div>
                <div className="font-semibold mt-1 text-slate-900">Site functionality</div>
              </div>
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="text-sm text-slate-500">Analytics</div>
                <div className="font-semibold mt-1 text-slate-900">Performance & usage</div>
              </div>
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="text-sm text-slate-500">Preference</div>
                <div className="font-semibold mt-1 text-slate-900">Language & UI settings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <Section id="what-are-cookies" title="1. What are cookies?">
          <p>
            Cookies are small text files placed on your device (computer or mobile) by websites you visit. They are widely used to make websites work more efficiently and to provide information to the site owners.
          </p>
        </Section>

        <Section id="how-we-use" title="2. How we use cookies">
          <ul className="list-disc ml-6">
            <li><strong>Essential site functionality:</strong> cookies that are necessary to run core features (login, session, security).</li>
            <li><strong>Preferences:</strong> remember settings like language, region, or UI preferences so the site feels personal.</li>
            <li><strong>Analytics & performance:</strong> collect anonymous data about how people use the site so we can improve performance and fix issues.</li>
            <li><strong>Marketing:</strong> help serve relevant content and promotions (only if you opt-in to such experiences).</li>
          </ul>
        </Section>

        <Section id="types" title="3. Types of cookies we use">
          <p className="mb-2">We typically use the following categories of cookies:</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Strictly necessary / essential:</strong> Required for the website to function (e.g., session cookies). These cannot be turned off via site controls because the service depends on them.
            </li>
            <li>
              <strong>Performance / analytics:</strong> Help us understand how the site is used (page views, errors) — usually anonymous and aggregated.
            </li>
            <li>
              <strong>Functional / preference:</strong> Remember choices you make (language, font size).
            </li>
            <li>
              <strong>Marketing / advertising:</strong> Used to deliver adverts or promotional content. We only use these if you consent.
            </li>
          </ul>
        </Section>

        <Section id="third-parties" title="4. Third-party cookies">
          <p>
            We may allow third-party services to place cookies for analytics, crash reporting, or optional marketing integrations. Examples include analytics providers and content-delivery services. These third parties follow their own privacy policies and you can manage their cookies separately (see Managing Cookies below).
          </p>
        </Section>

        <Section id="manage" title="5. Managing cookies & your choices">
          <p>
            You control cookies. Options include:
          </p>
          <ul className="list-disc ml-6">
            <li><strong>Browser settings:</strong> Most browsers let you block or delete cookies (check browser help for steps).</li>
            <li><strong>Per-site controls:</strong> You can deny non-essential cookies via our cookie consent UI (if implemented) or by changing settings in your browser.</li>
            <li><strong>Clearing cookies:</strong> Deleting cookies will sign you out and may remove preferences; it does not delete information we've already stored about you on our servers.</li>
          </ul>

          <p className="mt-3">
            For guidance:
          </p>
          <ul className="list-disc ml-6">
            <li>Chrome: Settings → Privacy → Cookies</li>
            <li>Firefox: Preferences → Privacy & Security → Cookies</li>
            <li>Edge: Settings → Cookies and site permissions</li>
            <li>Safari: Preferences → Privacy</li>
          </ul>
        </Section>

        <Section id="cookies-list" title="6. Example cookie names (non-exhaustive)">
          <p>
            Cookie names and providers vary by implementation. Example names you might see:
          </p>
          <ul className="list-disc ml-6">
            <li><strong>session_id / __session:</strong> site session identifier (essential).</li>
            <li><strong>_ga / _gid:</strong> Google Analytics identifiers (analytics).</li>
            <li><strong>pref_lang:</strong> UI language preference (functional).</li>
            <li><strong>_fbp / _gcl_au:</strong> marketing/ads identifiers (if used with consent).</li>
          </ul>
        </Section>

        <Section id="data-retention" title="7. How long we keep cookie data">
          <p>
            Retention depends on the cookie type. Session cookies expire when you close your browser; analytics or preference cookies may persist for months. We review third-party cookie retention periodically and limit storage where practical.
          </p>
        </Section>

        <Section id="children" title="8. Children & cookies">
          <p>
            Our services are intended for users aged 18 and over. We do not knowingly set cookies for children under 18. If you are a parent and believe your child has an account, contact us to request deletion.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to this policy">
          <p>
            We may update this Cookie Policy occasionally. We will post the revised date at the top of this page. If we make material changes, we will provide prominent notice (for example via email or in-app banner) where required.
          </p>
        </Section>

        <Section id="contact" title="10. Contact">
          <p>
            If you have questions about our use of cookies, email us at <a className="text-blue-600" href="mailto:privacy@dailydone.in">privacy@dailydone.in</a>.
          </p>
        </Section>

        {/* Closing note */}
        <section ref={addToRefs} className="transition-all duration-700 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Thanks — your privacy matters</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            If anything here is unclear or you want help managing cookies, reach out to us at <a className="text-blue-600" href="mailto:privacy@dailydone.in">privacy@dailydone.in</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
