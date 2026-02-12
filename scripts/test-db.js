const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInsert() {
  console.log('🧪 Test d\'insertion d\'un article...');
  
  try {
    const testArticle = await prisma.article.create({
      data: {
        title: 'Test Article VeillePI',
        summary: 'Ceci est un résumé de test pour vérifier que l\'insertion fonctionne correctement dans Supabase.',
        url: 'https://test-veillepi.example.com/article-test-' + Date.now(),
        source: 'Test Source',
        publishedAt: new Date(),
        category: 'Test',
        keywords: ['test', 'veillepi', 'supabase'],
        language: 'fr',
        relevanceScore: 5,
        isHighlight: false,
      }
    });
    
    console.log('✅ Article inséré avec succès :');
    console.log(`   ID: ${testArticle.id}`);
    console.log(`   Titre: ${testArticle.title}`);
    console.log(`   URL: ${testArticle.url}`);
    console.log(`   Créé le: ${testArticle.scrapedAt}`);
    
    // Compter les articles
    const count = await prisma.article.count();
    console.log(`\n📊 Total d'articles dans la base : ${count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion :', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testInsert().then(success => {
  process.exit(success ? 0 : 1);
});
