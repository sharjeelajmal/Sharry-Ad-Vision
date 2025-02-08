import React from 'react';
import { Facebook, Instagram,Github , Linkedin } from 'lucide-react'; // Import Lucide React icons

const Footer = () => {
  return (
    <footer className="bg-white pb-40">
      <div className="mx-auto max-w-screen-xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        {/* Email Subscription Section */}
        <div className="mx-auto max-w-md">
          <strong className="block text-center text-xl font-bold text-gray-900 sm:text-3xl">
            Want us to email you with the latest blockbuster news?
          </strong>

          <form className="mt-6">
            <div className="relative max-w-lg">
              <label className="sr-only" htmlFor="email"> Email </label>
              <input
                className="w-full rounded-full border-gray-200 bg-gray-100 p-4 pe-32 text-sm font-medium"
                id="email"
                type="email"
                placeholder="john@doe.com"
              />
              <button
                className="absolute end-1 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Footer Links Section */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-32">
          <div className="mx-auto max-w-sm lg:max-w-none">
            <p className="mt-4 text-center text-gray-500 lg:text-left lg:text-lg">
 <b> Stay Connected</b> Subscribe to our newsletter to get the latest updates, tips, and insights straight to your inbox.
            </p>

{/* Social Media Links */}
   <div className="flex space-x-4 mt-4">
                <a href="https://www.facebook.com/profile.php?id=100084778281907" className="text-blue-600 hover:text-blue-800" target='_blank'>
                  <Facebook className="h-6 w-6"  />
                </a>
                <a href="https://github.com/sharjeelajmal" className="text-blue-600 hover:text-blue-800" target='_blank'>
                  <Github className="h-6 w-6" />
                </a>
                <a href="https://www.instagram.com/codeenginesharjeel" className="text-blue-600 hover:text-blue-800" target='_blank'>
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://www.linkedin.com/in/muhammad-sharjeel-701578274/" className="text-blue-600 hover:text-blue-800" target='_blank'>
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>

          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 gap-8 text-center lg:grid-cols-3 lg:text-left">
            {/* Services Column */}
            <div>
              <strong className="font-medium text-gray-900"> Services </strong>
              <ul className="mt-6 space-y-1">
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/"> Marketing </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/"> Graphic Design </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/"> SMM</a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/"> Web Development </a></li>
              </ul>
            </div>

            {/* About Column */}
            <div>
              <strong className="font-medium text-gray-900"> About </strong>
              <ul className="mt-6 space-y-1">
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Reviews"> About </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Reviews"> Careers </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Reviews"> History </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Reviews"> Our Team </a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <strong className="font-medium text-gray-900"> Support </strong>
              <ul className="mt-6 space-y-1">
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Contact"> FAQs </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Contact"> Contact </a></li>
                <li><a className="text-gray-700 transition hover:text-gray-700/75" href="/Contact"> Ready To Chat </a></li>
              </ul>
            </div>
           
          </div>
        </div>
      </div>
      <p className='text-center mb-4'>© 2025 Sharry Ads Vision. All Rights Reserved.
      Built with ❤️ by Sharry Yar.</p>
    </footer>
  );
};

export default Footer;
