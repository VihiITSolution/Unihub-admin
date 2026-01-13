import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Unihub.lk. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-primary-600">Privacy Policy</a>
          <a href="#" className="hover:text-primary-600">Terms of Service</a>
          <a href="#" className="hover:text-primary-600">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
