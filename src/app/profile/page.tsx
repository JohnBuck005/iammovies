export default function ProfilePage() {
  return (
    <div className="px-4 py-6">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] mx-auto mb-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">Guest User</h1>
        <p className="text-[#888] text-sm">Sign in to sync your progress</p>
        <button className="mt-4 bg-[#D4AF37] text-black text-sm px-8 py-2.5 rounded-lg font-medium hover:bg-[#B8962E] transition">
          Sign In
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-[#888] text-xs">Watched</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-[#888] text-xs">Hours</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-[#888] text-xs">Saved</p>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Settings</h2>
        <div className="space-y-2">
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>🌐</span>
              <span className="text-sm">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#888] text-sm">English</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>🔔</span>
              <span className="text-sm">Notifications</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>📱</span>
              <span className="text-sm">Autoplay</span>
            </div>
            <div className="w-10 h-6 bg-[#D4AF37] rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
            </div>
          </button>
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>💾</span>
              <span className="text-sm">Data Saver</span>
            </div>
            <div className="w-10 h-6 bg-[#333] rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Subscription</h2>
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm">Current Plan</span>
            <span className="text-[#888] text-sm">Free</span>
          </div>
          <button className="w-full bg-[#D4AF37] text-black py-2.5 rounded-lg text-sm font-medium hover:bg-[#B8962E] transition">
            Upgrade to Premium
          </button>
        </div>
      </div>

      {/* Support */}
      <div>
        <h2 className="text-lg font-bold mb-3">Support</h2>
        <div className="space-y-2">
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>❓</span>
              <span className="text-sm">Help Center</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>📧</span>
              <span className="text-sm">Contact Us</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="w-full bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:bg-[#222] transition">
            <div className="flex items-center gap-3">
              <span>⭐</span>
              <span className="text-sm">Rate the App</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#888]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="text-center mt-8">
        <p className="text-[#666] text-xs">IAmoviestory v1.0.0</p>
      </div>
    </div>
  );
}
