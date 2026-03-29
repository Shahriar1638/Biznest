require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkUser() {
  const client = new MongoClient(process.env.DB_URI);
  try {
    await client.connect();
    const db = client.db('BiznestDB');
    const user = await db.collection('userinfos').findOne({ email: 'customer@biznest.com' });
    console.log(JSON.stringify(user, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkUser();
