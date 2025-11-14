import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg text-blue-400 font-bold mb-5">Company</h3>
            <ul className="space-y-3">
              <li><a href="about" className="text-slate-300 hover:text-white transition-colors duration-200">About DailyDone</a></li>
              <li><a href="how" className="text-slate-300 hover:text-white transition-colors duration-200">How it works</a></li>
              <li><a href="how" className="text-slate-300 hover:text-white transition-colors duration-200">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-blue-400 font-bold mb-5">Products</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">For customers</a></li>
              <li><a href="helper" className="text-slate-300 hover:text-white transition-colors duration-200">For helpers</a></li>            
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-blue-400 font-bold mb-5">Support</h3>
            <ul className="space-y-3">
              <li><a href="help" className="text-slate-300 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="help" className="text-slate-300 hover:text-white transition-colors duration-200">Contact us</a></li>
              <li><a href="community-guidelines" className="text-slate-300 hover:text-white transition-colors duration-200">Community guidelines</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg text-blue-400 font-bold mb-5">Legal</h3>
            <ul className="space-y-3">
              <li><a href="terms" className="text-slate-300 hover:text-white transition-colors duration-200">Terms and Conditions</a></li>
              <li><a href="privacy" className="text-slate-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="cookie" className="text-slate-300 hover:text-white transition-colors duration-200">Cookie policy</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 DailyDone Technologies Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
