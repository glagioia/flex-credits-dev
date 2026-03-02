import React from "react";

const NavBar: React.FC = () => {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white relative z-10 border-b border-gray-100">
      <div className="w-10" /> 
      
      {/* Logo */}
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="32" viewBox="0 0 45 32" fill="none">
          <g clipPath="url(#clip0_2140_9838)">
            <path d="M18.7307 3.49396C20.169 1.94856 22.2024 1.00787 24.4342 1.00787C27.41 1.00787 29.989 2.68766 31.3777 5.19055C32.5845 4.65302 33.9071 4.35066 35.2957 4.35066C40.6521 4.35066 45 8.8021 45 14.295C45 19.7879 40.6521 24.2394 35.2957 24.2394C34.6345 24.2394 34.0062 24.1722 33.378 24.0378C32.1712 26.2383 29.8402 27.7333 27.1951 27.7333C26.0874 27.7333 25.0294 27.4646 24.0871 27.011C22.8472 29.9507 19.9871 32.0168 16.6477 32.0168C13.1594 32.0168 10.2002 29.7827 9.05951 26.6415C8.56356 26.7423 8.05106 26.8095 7.52204 26.8095C3.35599 26.7759 0 23.3323 0 19.0656C0 16.21 1.50441 13.7239 3.75276 12.3801C3.28986 11.305 3.04188 10.1123 3.04188 8.85249C3.04188 3.9643 6.94342 0 11.7708 0C14.6143 0 17.1271 1.36063 18.7307 3.49396Z" fill="#0D9DDA"/>
          </g>
          <defs>
            <clipPath id="clip0_2140_9838">
              <rect width="45" height="32" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="w-10" />
    </nav>
  );
};

export default NavBar;
