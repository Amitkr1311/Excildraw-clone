import { Pencil, Users, Download, Zap, Lock, Palette, MousePointer2, Shapes } from 'lucide-react';
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">DrawFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-600/30">
            Start Drawing
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Free & Open Source</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Sketch Ideas,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Collaborate Freely
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              A powerful whiteboard tool for sketching hand-drawn diagrams, wireframes, and visual ideas.
              Simple, intuitive, and built for creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href= {"/signin"}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:scale-105">
                  Sign in
                </button>
              </Link>
              <Link href={"/signup"}>
                <button className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 transition-all hover:shadow-lg hover:border-slate-300">
                  Sign up
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-sm text-slate-600 font-medium">Untitled Drawing</div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-50 to-white p-12 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
                  <div className="col-span-2 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed p-6 flex items-center justify-center">
                    <Shapes className="w-16 h-16 text-blue-400" />
                  </div>
                  <div className="bg-cyan-50 rounded-lg border-2 border-cyan-200 border-dashed p-6 flex items-center justify-center">
                    <MousePointer2 className="w-12 h-12 text-cyan-400" />
                  </div>
                  <div className="bg-emerald-50 rounded-lg border-2 border-emerald-200 border-dashed p-6 flex items-center justify-center">
                    <Palette className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="col-span-2 bg-violet-50 rounded-lg border-2 border-violet-200 border-dashed p-6 flex items-center justify-center">
                    <Pencil className="w-16 h-16 text-violet-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-slate-600">
              Powerful features designed for seamless visual collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Pencil className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hand-Drawn Style</h3>
              <p className="text-slate-600 leading-relaxed">
                Create sketches that feel natural with our unique hand-drawn aesthetic that brings your ideas to life.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-cyan-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Collaboration</h3>
              <p className="text-slate-600 leading-relaxed">
                Work together with your team in real-time. See changes instantly as they happen.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-emerald-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data stays yours. End-to-end encryption ensures your drawings remain private and secure.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-violet-200">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Infinite Canvas</h3>
              <p className="text-slate-600 leading-relaxed">
                Never run out of space. Pan and zoom across an unlimited canvas to explore your creativity.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-orange-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Export Anywhere</h3>
              <p className="text-slate-600 leading-relaxed">
                Export your drawings as PNG, SVG, or share a link. Integrate seamlessly with your workflow.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:border-rose-200">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Optimized performance ensures smooth drawing even with complex diagrams and multiple users.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-32">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Start Creating Today
              </h2>
              <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
                Join thousands of creators, designers, and teams who use DrawFlow to bring their ideas to life.
              </p>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all hover:shadow-xl hover:scale-105">
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DrawFlow</span>
            </div>
            <div className="flex gap-8 text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            </div>
            <p className="text-slate-500 text-sm">© 2025 DrawFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
