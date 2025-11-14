import React from 'react';

export default function FaqHelper() {
  const helperFaqs = [
    { q: 'How do I sign up as a helper on DailyDone?', a: 'Visit the "Become a Helper" page, complete the registration form, upload required documents (ID, address proof), and complete our verification process.' },
    { q: 'What documents do I need to become a helper?', a: 'You need a valid government ID (Aadhaar/PAN/Passport), address proof, and a recent photograph. Some task categories may require additional certifications.' },
    { q: 'How long does the verification process take?', a: 'Verification typically takes 2-3 business days. We will notify you via SMS and email once your profile is approved.' },
    { q: 'How do I set my rates and availability?', a: 'Go to Helper Dashboard → Profile Settings → Rates & Availability. Set your hourly rates, preferred task types, and working hours.' },
    { q: 'When and how do I get paid?', a: 'Payments are released 24 hours after task completion. You can withdraw earnings to your bank account or UPI instantly, with a minimum balance of ₹100.' },
    { q: 'What commission does DailyDone charge?', a: 'DailyDone charges a service fee of 15-20% depending on your helper tier and task category. Higher-rated helpers enjoy lower commission rates.' },
    { q: 'How do I accept or decline tasks?', a: 'You will receive notifications for nearby tasks. Review the details and tap Accept or Decline within the time limit. Declined tasks will not affect your rating.' },
    { q: 'What if a customer cancels after I accept?', a: 'If cancelled within 2 hours of acceptance, you will receive 25% of the task value as compensation. Same-day cancellations earn 50% compensation.' },
    { q: 'How can I improve my rating and get more tasks?', a: 'Maintain punctuality, communicate clearly, complete tasks as described, and ask customers for honest reviews. High ratings unlock premium task categories.' },
    { q: 'What happens if I cannot complete a task?', a: 'Contact the customer and our support team immediately. Depending on the reason, we may reassign the task or arrange partial payment.' },
    { q: 'Can I bring my own tools and equipment?', a: 'Yes, using professional tools is encouraged and often leads to better ratings. Some tasks may provide materials, which will be mentioned in the task description.' },
    { q: 'How do I handle difficult customers?', a: 'Stay professional and try to resolve issues through clear communication. If problems persist, contact support via the in-app chat or emergency helpline.' },
    { q: 'Is there insurance coverage while I work?', a: 'Yes, all verified helpers are covered under our partner insurance policy during active task hours. Coverage details are available in your helper agreement.' },
    { q: 'Can I work in multiple cities?', a: 'Yes, update your service areas in profile settings. You can work in any city where DailyDone operates, subject to local verification requirements.' },
    { q: 'What types of tasks can I choose from?', a: 'Categories include home cleaning, repairs, delivery, tutoring, pet care, elderly assistance, and more. Choose based on your skills and interests.' },
    { q: 'How do I report safety concerns or inappropriate behavior?', a: 'Use the "Report Issue" button in the task screen or contact our 24/7 safety helpline. We take all reports seriously and investigate immediately.' },
    { q: 'Can I block certain customers?', a: 'Yes, you can block customers from your profile settings. Blocked customers will not be able to book you for future tasks.' },
    { q: 'What are helper tiers and how do I advance?', a: 'Tiers (Bronze, Silver, Gold, Platinum) are based on ratings, task completion rate, and customer feedback. Higher tiers get priority bookings and lower commission rates.' },
    { q: 'Do I need to pay any registration fees?', a: 'No, registration is completely free. Beware of scams asking for upfront payments - DailyDone never charges helpers to join.' },
    { q: 'How do I update my profile or add new skills?', a: 'Go to Helper Dashboard → Profile → Edit Profile. You can add certifications, update photos, and modify your service offerings anytime.' },
    { q: 'What if I have a dispute about payment?', a: 'Contact support with task details and evidence. We review all payment disputes within 48 hours and resolve them fairly based on our helper agreement.' },
    { q: 'Can I refer other helpers and earn rewards?', a: 'Yes! Our referral program offers ₹500 for each successful helper referral who completes 5 tasks. Find your referral code in the app.' }
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
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Helper Support</h2>
            <p className="text-slate-600 mb-4">Need help with your helper account? Our dedicated helper support team is here to assist you..</p>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm text-slate-500">Email</h3>
                <a href="mailto:support@dailydone.com" className="text-blue-800 font-medium">helper@dailydone.com</a>
              </div>
              <div>
                <h3 className="text-sm text-slate-500">Phone</h3>
                <a href="tel:+911234567890" className="text-blue-800 font-medium">+91 97699 10887</a>
              </div>
            </div>

            <hr className="my-6" />

            <p className="text-sm text-slate-500">Office Hours: Mon - Sat, 9:00 AM - 6:00 PM (IST)</p>
          </div>

          {/* FAQ Scroll Container */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>

            <div className="max-h-[480px] overflow-y-auto pr-2 space-y-3">
              {helperFaqs.map((faq, idx) => (
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