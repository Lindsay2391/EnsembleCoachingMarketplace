import { Coffee, Heart } from "lucide-react";

const BMC_URL = "https://buymeacoffee.com/ThinkingBarbershop";

interface BuyMeACoffeeProps {
  variant?: "button" | "banner" | "inline" | "footer";
}

export default function BuyMeACoffee({ variant = "button" }: BuyMeACoffeeProps) {
  if (variant === "footer") {
    return (
      <a
        href={BMC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <Coffee className="h-4 w-4" />
        Help keep CoachConnect free
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Coffee className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700">
            CoachConnect is free for everyone.{" "}
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
            >
              Buy the team a coffee
            </a>{" "}
            to help keep it running.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className="py-16 bg-amber-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Support CoachConnect
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            CoachConnect is completely free for coaches and ensembles.
            If you find it useful, consider buying the team a coffee to
            help cover the running costs of the platform.
          </p>
          <a
            href={BMC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Coffee className="h-5 w-5" />
            Buy Me a Coffee
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Donations support the website, not individual coaches.
          </p>
        </div>
      </section>
    );
  }

  return (
    <a
      href={BMC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-xl transition-colors shadow-sm text-sm"
    >
      <Coffee className="h-4 w-4" />
      Buy Me a Coffee
    </a>
  );
}
