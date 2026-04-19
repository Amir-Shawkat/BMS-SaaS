import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

const cached = global.mongooseCache || ( global.mongooseCache = { conn: null, promise: null});

export const  connectToDatabase = async () => {
    if ( cached.conn ) return cached.conn;

    if ( !cached.promise ) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error:', e);

        const message = e instanceof Error ? e.message : String(e);
        const atlasHint = 'Could not connect to MongoDB Atlas. Check that your Atlas network access allows the current IP or serverless environment, and verify the MONGODB_URI credentials.';

        throw new Error(message.includes('Could not connect to any servers') ? atlasHint : `MongoDB connection failed: ${message}`);
    }
     
    console.info('Connected to MongoDB');
    return cached.conn;
}
