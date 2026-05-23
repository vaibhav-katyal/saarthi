const dotenv = require('dotenv');
const { getPineconeIndex } = require('../config/pinecone');

dotenv.config();

/**
 * Clear all records from Pinecone index
 * Usage: node scripts/clearPineconeIndex.js
 */
const clearPineconeIndex = async () => {
  try {
    console.log('🗑️  Starting to clear Pinecone index...');
    console.log(`Index: ${process.env.PINECONE_INDEX_NAME}`);

    const index = await getPineconeIndex();

    // Delete all records - this is the most efficient way
    // It uses namespace if specified, otherwise clears the entire index
    const response = await index.deleteAll();

    console.log('✅ Successfully cleared all records from Pinecone index');
    console.log('Response:', response);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing Pinecone index:', error.message);
    process.exit(1);
  }
};

clearPineconeIndex();
