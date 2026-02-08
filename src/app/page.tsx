import Link from "next/link";
import { Search, MessageCircle, Star, Shield, Users, Music } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div>
      <section className="relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-slate-800/60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Find Your Perfect{" "}
              <span className="text-coral-300">Ensemble Coach</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed">
              Connect with qualified coaches who specialise in your style
              and take your group to the next level.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/coaches">
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Coaches
                </Button>
              </Link>
              <Link href="/register?type=coach">
                <Button variant="outline" size="lg" className="border-coral-300 text-coral-300 hover:bg-coral-300/10 bg-transparent">
                  <Music className="h-5 w-5 mr-2" />
                  Join as a Coach
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Free to browse. Free to join. Built for the Australian ensemble
              community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to finding your next coach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-coral-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Discover
              </h3>
              <p className="text-gray-600">
                Search coaches to match your ensemble's needs — by location,
                skills, experience level, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-coral-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Connect
              </h3>
              <p className="text-gray-600">
                Found the right coach? Use their contact details to get in
                touch and arrange your next session.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-coral-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Grow
              </h3>
              <p className="text-gray-600">
                Have a great coaching session and take your ensemble's
                performance to the next level.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-8 w-8 text-coral-500" />
                <h3 className="text-2xl font-bold text-gray-900">
                  For Ensembles
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Filter by location, skills, and ensemble type to find coaches who fit your group
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Browse detailed profiles covering skills, experience, and coaching style
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Get in touch directly and arrange your next coaching session
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register?type=ensemble">
                  <Button>Register Your Ensemble</Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-coral-500" />
                <h3 className="text-2xl font-bold text-gray-900">
                  For Coaches
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Be found by Australian ensembles actively searching for coaching
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Highlight the skills and ensemble types you specialise in
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">+</span>
                  </div>
                  <span className="text-gray-600">
                    Create a professional profile that shows groups exactly what you offer
                  </span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register?type=coach">
                  <Button>Create Coach Profile</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-coral-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to find your next coach?
          </h2>
          <p className="mt-4 text-lg text-coral-100">
            Join the growing community of Australian ensembles and coaches on
            Ensemble Coach.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/coaches">
              <Button
                size="lg"
                className="bg-white text-coral-600 hover:bg-gray-100"
              >
                Browse Coaches
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/20 bg-transparent"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
