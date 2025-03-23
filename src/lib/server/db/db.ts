import mongoose from 'mongoose'

const connections: Record<string, mongoose.Connection>  = {}

const DB_CONN_STRING = process.env.DB_CONN_STRING

if (!DB_CONN_STRING) {
    throw new Error("Bad DB connection uri");
}

export const connectToDatabase = async (dbName: any) =>{
    if (connections[dbName]){
        console.log(`Using cached connection for database: ${dbName}`)
        return { connection: connections[dbName]}
    }

    const uri = DB_CONN_STRING;
    const options = {
        dbName: dbName
    }

    try{
        const connection = await mongoose.createConnection(uri, options);
        connections[dbName] = connection
        console.log(`New connection established for database: ${dbName}`);
        return { connection }
    }catch(err){
        console.error(`Failed to connect to database: ${dbName}`)
        throw new Error(`Database connection error for ${dbName}`)
    }
}