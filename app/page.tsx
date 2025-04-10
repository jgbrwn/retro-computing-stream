import RetroComputingStream from "@/components/retro-computing-stream"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
          Retro Computing Time Machine
        </h1>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
          A continuous stream of vintage computing artifacts from the Internet Archive. Scroll through computing history
          or just sit back and watch as new images appear.
        </p>
        <RetroComputingStream />
      </div>
    </main>
  )
}
