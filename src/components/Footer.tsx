import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="CoachConnect" width={28} height={28} className="rounded-full" />
              <span className="text-lg font-bold text-gray-900">
                CoachConnect
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              A Thinking Barbershop project. Connecting Australian ensemble
              groups with qualified coaches.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/coaches"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Find Coaches
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500">
                  help@coachconnect.com.au
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CoachConnect by Thinking
            Barbershop. Built for the Australian ensemble community.
          </p>
        </div>
      </div>
    </footer>
  );
}
