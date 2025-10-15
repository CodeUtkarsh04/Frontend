import React from 'react';

export default function HelpPage() {
  const faqs = [
    { q: 'How do I create an account on DailyDone?', a: 'Tap Sign Up on the top-right, enter your phone number or email, verify the OTP, and complete your profile.' },
    { q: 'How do I request help for a task?', a: 'Open the app, tap "Request a Task", fill in the task details, set a time and price, and tap Submit.' },
    { q: 'How are helpers vetted?', a: 'Helpers complete identity verification and we run basic background checks. We also rely on community ratings and reviews.' },
    { q: 'What payment methods are supported?', a: 'We support UPI, credit/debit cards, and in some cities, cash on delivery. Payment options appear at checkout.' },
    { q: 'Can I schedule recurring tasks?', a: 'Yes — when creating a task, toggle "Repeat" and choose daily, weekly, or custom recurrence.' },
    { q: 'How do I cancel a task?', a: 'Open the task in your dashboard and tap Cancel. Cancellation rules and any fees are shown before you confirm.' },
    { q: 'What if the helper doesn\'t show up?', a: 'Contact support immediately via chat or phone. We will reassign or refund according to our policy.' },
    { q: 'How do I become a helper?', a: 'Go to the Become a Helper page, complete the sign-up form, upload documents, and pass the onboarding checks.' },
    { q: 'How does pricing work?', a: 'Helpers set their hourly or per-task rates; the platform may show a recommended price for guidance.' },
    { q: 'Do you offer corporate or bulk services?', a: 'Yes. Email our partnerships team at partnerships@dailydone.com for bulk or corporate requests.' },
    { q: 'How are ratings calculated?', a: 'Ratings are an average of user reviews after task completion. Detailed feedback helps maintain quality.' },
    { q: 'Is there insurance for tasks?', a: 'Certain tasks are covered under our partner insurance policy. Coverage details are shown on the task booking page.' },
    { q: 'Can I message a helper before booking?', a: 'Yes — use the in-app chat to ask questions and confirm details before accepting a helper.' },
    { q: 'What happens to my data?', a: 'We store user data per our Privacy Policy. You can request data export or deletion from account settings.' },
    { q: 'How do refunds work?', a: 'Refunds depend on the cancellation reason and timing. Open a support ticket with evidence and we\'ll evaluate it.' },
    { q: 'Can I tip a helper?', a: 'Yes — tipping is available after task completion as an optional amount.' },
    { q: 'How do I report inappropriate behavior?', a: 'Open the task, tap Report, describe the issue, and submit. Our safety team will investigate.' },
    { q: 'Do you operate in my city?', a: 'Check the Cities page or enter your pincode in the app to see availability.' },
    { q: 'How do promo codes work?', a: 'Apply promo codes at checkout. Codes may have expiry dates and minimum order conditions.' },
    { q: 'How can I provide feedback about the app?', a: 'We love feedback — email feedback@dailydone.com or use the Feedback option in the app.' },
    { q: 'How do I change my phone number or email?', a: 'Go to Account Settings → Profile → Edit contact details and follow the verification steps.' },
    { q: 'Can I book tasks for someone else?', a: 'Yes — you can enter a different recipient address and contact details when creating a task.' }
  ];

  return (
    <div className="text-gray-800 bg-white font-sans antialiased min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="mt-10 bg-gradient-to-br from-blue-900 to-sky-400 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-extrabold leading-tight text-4xl sm:text-5xl md:text-5xl">
            Need Help?
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl opacity-90">
            We're here to support you — contact us by phone, email, or check the FAQs below.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Card */}
          <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Support</h2>
            <p className="text-slate-600 mb-4">Reach out to us via phone, email, or in-app chat. We aim to respond within 24 hours.</p>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm text-slate-500">Phone</h3>
                <a href="tel:+911234567890" className="text-blue-800 font-medium">+91 12345 67890</a>
              </div>

              <div>
                <h3 className="text-sm text-slate-500">Email</h3>
                <a href="mailto:support@dailydone.com" className="text-blue-800 font-medium">support@dailydone.com</a>
              </div>

              <div>
                <h3 className="text-sm text-slate-500">Business / Partnerships</h3>
                <a href="mailto:partnerships@dailydone.com" className="text-blue-800 font-medium">partnerships@dailydone.com</a>
              </div>
            </div>

            <hr className="my-6" />

            <p className="text-sm text-slate-500">Office Hours: Mon - Sat, 9:00 AM - 6:00 PM (IST)</p>
          </div>

          {/* FAQ Scroll Container */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>

            <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <summary className="cursor-pointer list-none font-medium text-slate-900 outline-none">{faq.q}</summary>
                  <div className="mt-2 text-sm text-slate-600">{faq.a}</div>
                </details>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-500">Can't find what you're looking for? Contact support and we'll help you out.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
