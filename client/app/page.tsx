'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle,
  Star,
  Clock,
  FileText,
  Brain,
  Lock,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
              LegaLink360
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login" className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              Login
            </Link>
            <Link href="/auth/signup" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">🚀 AI-Powered Legal Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Transform Your Legal Practice with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI-Powered Insights</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            LegaLink360 is the intelligent assistant that helps legal professionals analyze documents, extract insights, and accelerate case preparation in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-lg transition-all hover:shadow-2xl hover:scale-105">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Learn More
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">14-Day Free Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Enterprise Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Powerful Features Built for Legal Experts</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Everything you need to work smarter, not harder</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Document Analysis</h3>
              <p className="text-slate-700 dark:text-slate-300">Automatically extract key clauses, risks, and obligations from complex legal documents in seconds.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Lightning-Fast Insights</h3>
              <p className="text-slate-700 dark:text-slate-300">Get instant summaries, precedent analysis, and potential issues flagged automatically for your review.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Template Library</h3>
              <p className="text-slate-700 dark:text-slate-300">Access curated templates for contracts, motions, briefs, and legal documents with AI customization.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Risk Detection</h3>
              <p className="text-slate-700 dark:text-slate-300">Identify potential legal risks, unfavorable terms, and red flags before they become problems.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Save 80% of Review Time</h3>
              <p className="text-slate-700 dark:text-slate-300">What takes hours can now be done in minutes. More time for strategy, less time on tedious work.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Bank-Level Security</h3>
              <p className="text-slate-700 dark:text-slate-300">Enterprise-grade encryption and compliance with SOC 2, GDPR, and legal industry standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Why Legal Professionals Choose LegaLink360</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2"> 10x Faster Case Preparation</h3>
                  <p className="text-blue-100">Analyze contracts and documents in minutes instead of days. Get more done in less time.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <BarChart3 className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Better Client Outcomes</h3>
                  <p className="text-blue-100">AI-powered insights help you identify issues early and negotiate better terms for your clients.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Users className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Collaborate Seamlessly</h3>
                  <p className="text-blue-100">Share analysis, notes, and documents with your team in real-time. Stay in sync.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Zap className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Reduce Errors & Omissions</h3>
                  <p className="text-blue-100">Never miss critical clauses or obligations again. AI catches what humans miss.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Star className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Premium Quality Work</h3>
                  <p className="text-blue-100">Deliver more thorough analysis and higher-quality work to your clients.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Lock className="w-6 h-6 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Complete Privacy & Control</h3>
                  <p className="text-blue-100">Your data stays yours. No unauthorized access, no selling of insights. Full compliance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">Trusted by Legal Professionals</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
              <p className="text-slate-600 dark:text-slate-300">Legal Professionals Using LegaLink360</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="text-4xl font-bold text-blue-600 mb-2">50M+</div>
              <p className="text-slate-600 dark:text-slate-300">Pages Analyzed & Insights Generated</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8/5</div>
              <p className="text-slate-600 dark:text-slate-300">Average User Rating & Reviews</p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "LegaLink360 cut our document review time by 80%. What used to take my team 3 days now takes a few hours. The ROI alone justified the subscription in the first month."
              </p>
              <p className="font-bold text-slate-900 dark:text-white">Sarah Chen</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Managing Partner, Chen & Associates</p>
            </div>

            <div className="p-8 border-2 border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "The AI caught a critical obligation in a contract that I almost missed. This tool is like having a junior associate who never gets tired and never makes mistakes."
              </p>
              <p className="font-bold text-slate-900 dark:text-white">Michael Rodriguez</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Senior Attorney, Fortune 500 Legal Department</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Start free, upgrade when you're ready. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Perfect for solo practitioners</p>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Free</div>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Forever, no credit card required</p>
              <Link href="/auth/signup" className="block w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold text-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors mb-8">
                Get Started
              </Link>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">5 documents/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Basic AI analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Community support</span>
                </li>
              </ul>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-8 border-2 border-blue-600 transform md:scale-105 md:z-10">
              <div className="bg-yellow-400 text-slate-900 rounded-full px-4 py-1 text-sm font-bold w-fit mb-4">MOST POPULAR</div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-blue-100 mb-6">For growing firms & departments</p>
              <div className="text-4xl font-bold mb-1">$49</div>
              <p className="text-blue-100 mb-8">per month, billed annually</p>
              <Link href="/auth/signup" className="block w-full py-3 bg-white text-blue-600 rounded-lg font-semibold text-center hover:bg-blue-50 transition-colors mb-8">
                Start Free Trial
              </Link>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Unlimited documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Advanced AI analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Risk detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">For large organizations</p>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Custom</div>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Contact our sales team</p>
              <button className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mb-8">
                Schedule Demo
              </button>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Advanced security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">Custom integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Updated on Legal Tech Innovation</h2>
          <p className="text-xl text-slate-300 mb-8">Get insights, tips, and updates on AI in legal practice delivered to your inbox weekly.</p>

          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>

          {isSubmitted && (
            <p className="text-green-400">✓ Thanks for subscribing! Check your email.</p>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Legal Practice?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of legal professionals who are already saving time and improving client outcomes with LegaLink360.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all hover:shadow-2xl">
              Start Your Free Trial Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="mailto:support@legalink360.com" className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
              Schedule a Demo
            </a>
          </div>
          <p className="text-blue-100 text-sm mt-6">No credit card required. Get instant access to all Starter features.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
          <div>
            <h3 className="font-bold text-white mb-4">LegaLink360</h3>
            <p className="text-sm">AI-powered legal assistant for modern legal professionals.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/auth/login" className="hover:text-white transition-colors">Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>&copy; 2026 LegaLink360. All rights reserved. | Transforming Legal Practice with AI</p>
        </div>
      </footer>
    </div>
  );
}
