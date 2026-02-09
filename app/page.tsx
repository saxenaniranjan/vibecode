export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-red-500 to-rose-600 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300">
              Your beautiful website is ready to go live!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Fast & Modern</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with Next.js for optimal performance
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Beautiful Design</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Styled with Tailwind CSS for modern aesthetics
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Easy Deploy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                One-click deployment with Vercel
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              Ready to customize?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start editing <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">app/page.tsx</code> to make this site your own!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Learn Next.js
              </a>
              <a
                href="https://tailwindcss.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Learn Tailwind
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
