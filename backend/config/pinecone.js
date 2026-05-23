const { Pinecone } = require('@pinecone-database/pinecone');

let pinecone = null;

const initializePinecone = async () => {
  if (pinecone) return pinecone;

  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  return pinecone;
};

const getPineconeIndex = async () => {
  const client = await initializePinecone();
  return client.index(process.env.PINECONE_INDEX_NAME);
};

module.exports = {
  initializePinecone,
  getPineconeIndex,
};
