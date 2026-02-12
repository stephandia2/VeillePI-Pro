import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration Brave Search API
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/news/search';

// Mots-clés de veille par défaut (selon PRD)
const DEFAULT_KEYWORDS = [
  'contrefaçon',
  'saisie douane contrefaçon',
  'brevet propriété intellectuelle',
  'marque contrefaçon',
  'contrefaçon produits',
  'customs seizure counterfeit',
  'intellectual property infringement',
  'ompic maroc contrefaçon',
  'douane maroc saisie',
  'euipo counterfeit',
  'wipo counterfeiting'
];

// Fonction de délai pour rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BraveNewsResult {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

/**
 * Appel l'API Brave Search avec rate limiting
 */
async function searchBraveNews(query: string, count: number = 10): Promise<BraveNewsResult[]> {
  if (!BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY non configurée');
  }

  const params = new URLSearchParams({
    q: query,
    count: count.toString(),
    search_lang: 'fr',
    text_decorations: 'false',
    safesearch: 'strict'
  });

  const response = await fetch(`${BRAVE_API_URL}?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': BRAVE_API_KEY
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Brave API (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: { title?: string; description?: string; url?: string; meta?: { url?: { hostname?: string }; thumbnail?: { src?: string } }; source?: string; age?: string }) => ({
    title: item.title || '',
    description: item.description || '',
    url: item.url || '',
    source: item.meta?.url?.hostname || item.source || 'Inconnu',
    publishedAt: item.age || new Date().toISOString(),
    imageUrl: item.meta?.thumbnail?.src || undefined
  }));
}

/**
 * Détermine la catégorie d'un article selon son contenu
 */
function categorizeArticle(title: string, description: string): string {
  const content = `${title} ${description}`.toLowerCase();
  
  if (content.includes('saisie') || content.includes('douane') || content.includes('customs') || content.includes('seizure')) {
    return 'saisie';
  }
  if (content.includes('brevet') || content.includes('patent') || content.includes('invention')) {
    return 'brevet';
  }
  if (content.includes('marque') || content.includes('trademark') || content.includes('brand')) {
    return 'marque';
  }
  if (content.includes('justice') || content.includes('tribunal') || content.includes('judiciaire') || content.includes('court') || content.includes('lawsuit')) {
    return 'judiciaire';
  }
  if (content.includes('droit d\'auteur') || content.includes('copyright') || content.includes('copie')) {
    return 'copyright';
  }
  
  return 'general';
}

/**
 * Extrait les mots-clés d'un article
 */
function extractKeywords(title: string, description: string): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const keywords: string[] = [];
  
  const keywordMap: { [key: string]: string[] } = {
    'saisie': ['saisie', 'seizure', 'saisies'],
    'douane': ['douane', 'customs', 'douanes'],
    'contrefaçon': ['contrefaçon', 'contrefacon', 'counterfeit', 'counterfeiting'],
    'brevet': ['brevet', 'patent'],
    'marque': ['marque', 'trademark', 'brand'],
    'ompic': ['ompic', 'maroc'],
    'euipo': ['euipo', 'europe'],
    'wipo': ['wipo', 'ompi'],
    'chine': ['chine', 'china', 'chinois'],
    'marseille': ['marseille'],
    'paris': ['paris']
  };
  
  for (const [tag, terms] of Object.entries(keywordMap)) {
    if (terms.some(term => content.includes(term))) {
      keywords.push(tag);
    }
  }
  
  return keywords;
}

/**
 * Détecte la langue d'un texte (simplifié)
 */
function detectLanguage(title: string): string {
  const frWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc'];
  const enWords = ['the', 'a', 'an', 'and', 'or', 'but', 'so', 'in', 'on', 'at'];
  const esWords = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero', 'en'];
  
  const titleLower = title.toLowerCase();
  const words = titleLower.split(/\s+/);
  
  const frCount = words.filter(w => frWords.includes(w)).length;
  const enCount = words.filter(w => enWords.includes(w)).length;
  const esCount = words.filter(w => esWords.includes(w)).length;
  
  if (frCount > enCount && frCount > esCount) return 'fr';
  if (enCount > frCount && enCount > esCount) return 'en';
  if (esCount > frCount && esCount > enCount) return 'es';
  
  return 'fr'; // Défaut
}

/**
 * POST /api/veille - Lance une veille manuelle
 */
export async function POST(request: NextRequest) {
  try {
    if (!BRAVE_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Brave Search non configurée' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const keywords = body.keywords || DEFAULT_KEYWORDS;
    const maxResultsPerKeyword = body.maxResults || 5;
    
    console.log(`🚀 Lancement de la veille sur ${keywords.length} mots-clés...`);

    const allArticles: BraveNewsResult[] = [];
    const errors: string[] = [];

    // Recherche pour chaque mot-clé avec rate limiting (2 secondes)
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      console.log(`🔍 [${i + 1}/${keywords.length}] Recherche: "${keyword}"`);

      try {
        // Rate limiting: 2 secondes entre chaque requête
        if (i > 0) {
          await delay(2000);
        }

        const results = await searchBraveNews(keyword, maxResultsPerKeyword);
        console.log(`✅ ${results.length} résultats trouvés pour "${keyword}"`);
        
        allArticles.push(...results);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Erreur recherche "${keyword}":`, errorMsg);
        errors.push(`${keyword}: ${errorMsg}`);
      }
    }

    // Déduplication par URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.url, a])).values()
    );

    console.log(`📊 ${uniqueArticles.length} articles uniques trouvés (après déduplication)`);

    // Utilisateur par défaut (Nihel)
    const userId = 'nihel-eabpa-001';

    // Sauvegarde en base de données
    const savedArticles = [];
    const skippedArticles = [];

    for (const article of uniqueArticles) {
      try {
        // Vérifier si l'article existe déjà
        const existing = await prisma.article.findUnique({
          where: { url: article.url }
        });

        if (existing) {
          skippedArticles.push(article.url);
          continue;
        }

        // Créer l'article
        const category = categorizeArticle(article.title, article.description);
        const keywords = extractKeywords(article.title, article.description);
        const language = detectLanguage(article.title);

        const saved = await prisma.article.create({
          data: {
            title: article.title,
            summary: article.description,
            url: article.url,
            source: article.source,
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.imageUrl,
            category,
            keywords,
            language,
            relevanceScore: 0, // Sera calculé plus tard par IA
            userId: userId
          }
        });

        savedArticles.push(saved);
      } catch (error) {
        console.error(`❌ Erreur sauvegarde article "${article.title}":`, error);
      }
    }

    console.log(`💾 ${savedArticles.length} articles sauvegardés, ${skippedArticles.length} ignorés (doublons)`);

    return NextResponse.json({
      success: true,
      stats: {
        totalFound: allArticles.length,
        unique: uniqueArticles.length,
        saved: savedArticles.length,
        skipped: skippedArticles.length,
        errors: errors.length
      },
      articles: savedArticles.map(a => ({
        id: a.id,
        title: a.title,
        source: a.source,
        category: a.category,
        keywords: a.keywords
      })),
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Erreur globale veille:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la veille',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/veille - Récupère les articles récents
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const language = searchParams.get('language');

    const where: { category?: string; language?: string } = {};
    if (category) where.category = category;
    if (language) where.language = language;

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles
    });

  } catch (error) {
    console.error('❌ Erreur récupération articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}
