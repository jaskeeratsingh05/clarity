const { QdrantClient } = require('@qdrant/js-client-rest');

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'bookmind_chunks';

/**
 * Ensure the Qdrant collection exists.
 * Gemini text-embedding-004 produces 768-dimensional vectors.
 */
const ensureCollection = async () => {
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: 'Cosine' },
      });
      console.log(`✅ Qdrant collection "${COLLECTION_NAME}" created`);
    } else {
      console.log(`✅ Qdrant collection "${COLLECTION_NAME}" ready`);
    }
  } catch (err) {
    console.error('❌ Qdrant collection error:', err.message);
  }
};

module.exports = { qdrant, COLLECTION_NAME, ensureCollection };
