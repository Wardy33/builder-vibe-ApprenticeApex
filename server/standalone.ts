import dotenv from "dotenv";
import { createApp, connectToDatabase } from './index';

dotenv.config();

async function startStandaloneServer() {
  const PORT = 3001;
  console.log('🚀 Starting Standalone Express Server...');
  
  const { app, httpServer } = createApp();
  
  try {
    const dbConnected = await connectToDatabase();
    console.log(dbConnected ? '✅ Database connected' : '⚠️ Using mock data');
  } catch (error) {
    console.warn('⚠️ Database failed, continuing with mock data');
  }
  
  httpServer.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/auth/test`);
  });
}

startStandaloneServer().catch(console.error);
