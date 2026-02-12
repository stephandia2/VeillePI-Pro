'use client';

import { useState, useEffect } from 'react';

interface Article {
  title: string;
  url: string;
  description: string;
  age: string;
  meta_url?: {
    hostname?: string;
  };
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('contrefaçon saisie douane');
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/veille?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setArticles(data.results || []);
      } else {
        setError(data.error || 'Erreur lors de la récupération');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(query);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔍 VeillePI Pro
        </h1>
        <p className="text-gray-600 mb-8">
          Veille automatique sur la propriété intellectuelle
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher..."
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-6 text-sm text-gray-500">
            {articles.length} article{articles.length > 1 ? 's' : ''} trouvé{articles.length > 1 ? 's' : ''} pour &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p>Chargement des articles...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {articles.map((article, idx) => (
              <article
                key={idx}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline"
                      >
                        {article.title}
                      </a>
                    </h2>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium">
                        🌐 {article.meta_url?.hostname || 'Source inconnue'}
                      </span>
                      <span>•</span>
                      <span>🕐 {article.age}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Aucun article trouvé</p>
            <p>Essayez une autre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
}
