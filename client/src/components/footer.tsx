import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <svg
                className="w-6 h-6 text-primary mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.5 3L17 7.5L12.5 12L8 7.5L12.5 3z" />
                <path d="M5 13L9.5 8.5L14 13L9.5 17.5L5 13z" />
                <path d="M20 13L15.5 17.5L11 13L15.5 8.5L20 13z" />
                <path d="M8 19L12.5 14.5L17 19L12.5 23.5L8 19z" />
              </svg>
              <h2 className="text-xl font-bold text-white">TextStyler</h2>
            </div>
            <p className="text-sm mt-2 text-center md:text-left">Neural Style Transfer for Text-to-Text Rewriting</p>
          </div>

          <div className="flex space-x-4">
            <Link href="/" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link href="/auth" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Sign Up
            </Link>
            <Link href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link href="#" className="text-neutral-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-700 pt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TextStyler. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
