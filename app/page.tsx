'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Globe, 
  Clock, 
  ExternalLink, 
  TrendingUp,
  Newspaper,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface Article {
  title: string;
  url: string;
  description: string;
  age: string;
  meta_url?: {
    hostname?: string;
  };
  source?: string;
  language?: string;
  country?: string;
  category?: string;
  relevanceScore?: number;
}

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
];

const countries = [
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'US', label: 'USA', flag: '🇺🇸' },
  { code: 'MA', label: 'Maroc', flag: '🇲🇦' },
  { code: 'DZ', label: 'Algérie', flag: '🇩🇿' },
  { code: 'TN', label: 'Tunisie', flag: '🇹🇳' },
  { code: 'QA', label: 'Qatar', flag: '🇶🇦' },
];

const categories = [
  { id: 'saisie', label: 'Saisies douanières', color: 'bg-red-100 text-red-800' },
  { id: 'brevet', label: 'Brevets', color: 'bg-blue-100 text-blue-800' },
  { id: 'contrefacon', label: 'Contrefaçon', color: 'bg-orange-100 text-orange-800' },
  { id: 'judiciaire', label: 'Judiciaire', color: 'bg-purple-100 text-purple-800' },
];

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('contrefaçon saisie douane');
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filtres
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">VeillePI Pro</h1>
                <p className="text-xs text-slate-500">EABPA - Expertise Anti-Contrefaçon</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Rechercher des articles..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? '...' : 'Rechercher'}
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                <Newspaper className="w-4 h-4" />
                <span>{articles.length} articles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Filtres */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Filtres</h2>
              </div>

              {/* Langues */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Langues</h3>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <label key={lang.code} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => toggleFilter(lang.code, selectedLanguages, setSelectedLanguages)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pays */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Pays</h3>
                <div className="space-y-2">
                  {countries.map((country) => (
                    <label key={country.code} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.code)}
                        onChange={() => toggleFilter(country.code, selectedCountries, setSelectedCountries)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{country.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Catégories */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleFilter(cat.id, selectedCategories, setSelectedCategories)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        selectedCategories.includes(cat.id)
                          ? cat.color
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Articles totaux</p>
                    <p className="text-3xl font-bold">{articles.length}</p>
                  </div>
                  <Newspaper className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Recherche active</p>
                    <p className="text-lg font-semibold truncate">{query}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Sources</p>
                    <p className="text-3xl font-bold">
                      {new Set(articles.map(a => a.meta_url?.hostname)).size}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">❌</div>
                <p>{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500">Chargement des articles...</p>
              </div>
            ) : (
              <>
                {/* Articles Grid */}
                <div className="space-y-4">
                  {articles.map((article, idx) => (
                    <article
                      key={idx}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
                    >
                      <div className="flex gap-4">
                        {/* Score/Priority Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {idx < 3 ? '🔥' : (idx + 1)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {article.title}
                              </a>
                            </h2>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>

                          {/* Description */}
                          <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                              <Globe className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-700 font-medium">
                                {article.meta_url?.hostname || 'Source inconnue'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                              <Clock className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-600">{article.age}</span>
                            </div>
                            {/* Language Badge */}
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">
                              🇫🇷 FR
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Empty State */}
                {articles.length === 0 && !error && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun article trouvé</h3>
                    <p className="text-slate-500">Essayez une autre recherche ou modifiez vos filtres</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
