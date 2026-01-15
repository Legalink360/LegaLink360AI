"use client";

import { useState } from "react";
import { X, Check, Zap, Gift } from "lucide-react";

type UpgradePlanProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UpgradePlan({ isOpen, onClose }: UpgradePlanProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const plans = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? 29 : 290,
      description: "Perfect for individuals",
      features: [
        "Up to 100 conversations per month",
        "Basic legal document analysis",
        "Email support",
        "Standard response time",
        "Basic privacy controls",
      ],
      current: true,
    },
    {
      name: "Professional",
      price: billingCycle === "monthly" ? 79 : 790,
      description: "For legal professionals",
      features: [
        "Unlimited conversations",
        "Advanced document analysis",
        "Priority email & chat support",
        "Fast response time",
        "Advanced privacy controls",
        "Custom templates",
        "Team collaboration (up to 3 members)",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced security features",
        "API access",
      ],
      cta: "Contact Sales",
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`font-medium ${billingCycle === "monthly" ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`w-14 h-8 rounded-full transition-colors ${
                billingCycle === "yearly" ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-7 h-7 bg-white rounded-full transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === "yearly" ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
              Yearly
              <span className="ml-2 text-sm font-semibold text-green-600 dark:text-green-400">Save 20%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-lg border-2 transition-all ${
                  plan.popular
                    ? "border-blue-600 shadow-2xl scale-105"
                    : "border-slate-200 dark:border-slate-700"
                } p-6 bg-white dark:bg-slate-800`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap size={16} />
                    Most Popular
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Current Plan
                  </div>
                )}

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                  </div>
                  {typeof plan.price === "number" && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      per {billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-2.5 rounded-lg font-semibold transition-colors mb-6 ${
                    plan.current
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
                      : plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : plan.cta || "Upgrade Now"}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <Check size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
            <Gift size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">30-Day Money Back Guarantee</h4>
              <p className="text-sm text-slate-700 dark:text-slate-400">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
