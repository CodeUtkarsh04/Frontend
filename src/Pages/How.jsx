import appMock from "../assets/mock-page.jpg";


const steps = [
  {
    id: 1,
    title: "Tell us what you need",
    desc: "Describe your task, set your budget, and choose when you need it done. Our smart system will match you with the right helpers.",
  },
  {
    id: 2,
    title: "Get matched instantly",
    desc: "Receive offers from verified helpers nearby within minutes. View their profiles, ratings, and choose who you prefer.",
  },
  {
    id: 3,
    title: "Track and communicate",
    desc: "Stay connected with your helper through our secure chat. Get real-time updates and photos of task progress.",
  },
  {
    id: 4,
    title: "Pay and review",
    desc: "Pay securely through the app when your task is complete. Rate your experience to help build our trusted community.",
  },
];

const faqs = [
  {
    q: "How quickly will I get matched?",
    a: "Most simple tasks get matches within 10-20 minutes depending on helper availability in your area.",
  },
  {
    q: "Are helpers verified?",
    a: "Yes — helpers go through ID checks, rating reviews and we encourage users to leave feedback after each job.",
  },
  {
    q: "How does payment work?",
    a: "You can pay securely through the app using UPI, cards or wallet. Funds are released when you confirm the task is done.",
  },
];

export default function HowDDPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* HERO */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Get help from trusted neighbours — fast</h1>
            <p className="mt-6 text-lg text-gray-600">Post a task, get matched with local helpers, track progress and pay securely — all from your phone.</p>

            <div className="mt-8 flex gap-4">
              <a href="#how-it-works" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium">See how it works</a>
              <a href="/signup" className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-md text-gray-700">Try it Out!!</a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <StatCard number="1M+" label="Tasks posted" />
              <StatCard number="85%" label="Avg. satisfaction" />
              <StatCard number="50k+" label="Helpers" />
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            {/* Illustration / mock phone */}
            <div className="mx-auto max-w-md">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg">
                <img
                  alt="app-mock"
                  src={appMock}
                  className="w-full object-cover rounded-lg border"
                />

                <p className="mt-3 text-sm text-gray-500">App preview — task feed, messages and live tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS (full page version) */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold">How DailyDone works</h2>
            <p className="mt-4 text-gray-600">A simple 4-step flow to get tasks done by trusted, local helpers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step) => (
              <div key={step.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex flex-col items-center text-center">
                  {/* Circle */}
                  <div className="h-14 w-14 aspect-square rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 mb-4">
                    {step.id}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Quick examples */}
                  <div className="mt-6 w-full">
                    <ExampleCard stepId={step.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More explanatory section */}
          <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold">What you can request</h3>
              <p className="mt-4 text-gray-600">From home cleaning, furniture assembly, to running errands — post it and let local helpers bid or accept instantly.</p>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="bg-white p-4 rounded-lg shadow-sm">House cleaning</li>
                <li className="bg-white p-4 rounded-lg shadow-sm">Plumbing & repairs</li>
                <li className="bg-white p-4 rounded-lg shadow-sm">Moving help</li>
                <li className="bg-white p-4 rounded-lg shadow-sm">Tutoring & lessons</li>
              </ul>
            </div>
            <div>
              <div className="bg-white p-6 rounded-xl shadow-inner border">
                <h4 className="font-semibold">Example flow — "Assemble a study table"</h4>
                <ol className="mt-4 list-decimal list-inside text-gray-700 space-y-2">
                  <li>Post task with description, photos and a proposed budget.</li>
                  <li>Helpers nearby offer or accept — view ratings and past reviews to choose one.</li>
                  <li>Share phone numbers to confirm details; helper can send progress photos while working.</li>
                  <li>After the job is done, pay the helper directly (cash or UPI) and leave feedback for others.</li>
                </ol>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-extrabold">Why people love DailyDone</h3>
              <p className="mt-4 text-gray-600">Quick matches, verified helpers, honest reviews and in-app safety features make getting help stress-free.</p>

              <ul className="mt-6 space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="mt-1">✅</div>
                  <div>
                    <div className="font-semibold">Verified Helpers</div>
                    <div className="text-sm text-gray-600">ID checks, community reviews and ratings.</div>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="mt-1">🔒</div>
                  <div>
                    <div className="font-semibold">Secure Payments</div>
                    <div className="text-sm text-gray-600">Payments held in escrow until you confirm completion.</div>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="mt-1">⚡</div>
                  <div>
                    <div className="font-semibold">Fast Matches</div>
                    <div className="text-sm text-gray-600">Helpers nearby get notified instantly.</div>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard number="4.8" label="Avg rating" />
                <StatCard number="98%" label="Jobs completed" />
                <StatCard number="2x" label="Faster than classifieds" />
                <StatCard number="24/7" label="Support" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-extrabold">Frequently asked questions</h3>
            <p className="mt-2 text-gray-600">Answers to common questions about using DailyDone.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h4 className="text-xl font-semibold">Ready to get help?</h4>
            <p className="text-gray-600 mt-2">Post your first task — or download the app to manage everything on mobile.</p>
            <div className="mt-6 flex justify-center gap-4">
              <a href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-md">Post a task</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
      <div className="text-2xl font-bold">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function ExampleCard({ stepId }) {
  const examples = {
    1: ["Post title & photos", "Choose date & budget"],
    2: ["See helper profiles", "Chat & confirm"],
    3: ["Live updates", "Share photos"],
    4: ["Release payment", "Leave review"],
  };

  return (
    <div className="mt-2">
      <div className="text-sm text-gray-600">Quick examples</div>
      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        {examples[stepId].map((t, i) => (
          <li key={i}>• {t}</li>
        ))}
      </ul>
    </div>
  );
}
