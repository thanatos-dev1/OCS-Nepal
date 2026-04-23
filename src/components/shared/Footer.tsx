import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-blue-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xl font-bold text-white">
              OCS <span className="text-accent">Nepal</span>
            </span>
            <p className="mt-3 text-sm leading-6">
              Genuine computer hardware and PC components. Serving Nepal since
              day one.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/categories/ram"
                  className="hover:text-white transition-colors"
                >
                  RAM
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/ssd"
                  className="hover:text-white transition-colors"
                >
                  SSD
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/hdd"
                  className="hover:text-white transition-colors"
                >
                  Hard Drives
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/keyboards"
                  className="hover:text-white transition-colors"
                >
                  Keyboards
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/accessories"
                  className="hover:text-white transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/account/login"
                  className="hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/account/register"
                  className="hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="hover:text-white transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Kathmandu, Nepal</li>
              <li>
                <a
                  href="https://wa.me/9779860232485"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@ocsnepal.com"
                  className="hover:text-white transition-colors"
                >
                  info@ocsnepal.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 text-xs text-center text-blue-300">
          © {new Date().getFullYear()} OCS Nepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
