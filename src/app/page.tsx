export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">
          VeillePI Pro
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Application de veille automatique sur la propriété intellectuelle et la contrefaçon
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">📰 Veille Média</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Brave Search API intégré</li>
              <li>✅ Rate limiting (2s entre requêtes)</li>
              <li>✅ Catégorisation automatique</li>
              <li>✅ Détection de doublons</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">🤖 IA & LinkedIn</h2>
            <ul className="space-y-2 text-gray-700">
              <li>🔄 Kimi API (Phase 2)</li>
              <li>🔄 Génération de résumés</li>
              <li>🔄 Posts LinkedIn auto</li>
              <li>🔄 Publication planifiée</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">📊 API Endpoints</h2>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded">
                GET /api/veille?limit=5
              </code>
              <code className="block bg-gray-100 p-2 rounded">
                POST /api/veille
              </code>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">⚙️ Configuration</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>🔑 BRAVE_API_KEY requise</li>
              <li>🔑 DATABASE_URL requise</li>
              <li>📝 Voir README-SETUP.md</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Phase 1 MVP</strong> - Setup terminé le 12 février 2026
          </p>
        </div>
      </div>
    </main>
  );
}
