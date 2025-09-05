export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading NexusFlow</h2>
        <p className="text-text-secondary">Connecting to your networks...</p>
      </div>
    </div>
  );
}
