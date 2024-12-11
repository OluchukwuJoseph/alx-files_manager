import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
/**
 * DBClient manages database connections and provides utility methods for MongoDB interactions.
 *
 * @class
 * @description Handles MongoDB database connection and provides basic database operations
 */
class DBClient {
  /**
   * Creates a new DBClient instance and establishes a connection to MongoDB.
   *
   * @constructor
   * @description Initializes MongoDB connection
   * @throws {Error} Logs connection errors to the console
   */
  constructor() {
    // Connection URL constructed from environment variables or defaults
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect()
      .then(() => {
        // Select the database, using environment variable or default 'file_manager'
        this.db = this.client.db(process.env.DB_DATABASE || 'file_manager');
      })
      .catch((error) => {
        console.log(`Error connecting to Mongodb: ${error.message}`);
      });
  }

  /**
   * Checks if the MongoDB client is currently connected.
   *
   * @returns {boolean} Connection status of the MongoDB client
   * @description Verifies whether an active connection to the database exists
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves the total number of users in the database.
   *
   * @returns {Promise<number>} Total count of documents in the users collection
   * @description Lazily initializes the users collection and counts its documents
   */
  async nbUsers() {
    if (!this.usersCollection) {
      this.usersCollection = this.db.collection('users');
    }
    const usersCount = await this.usersCollection.countDocuments();
    return usersCount;
  }

  /**
   * Retrieves the total number of files in the database.
   *
   * @returns {Promise<number>} Total count of documents in the files collection
   * @description Lazily initializes the files collection and counts its documents
   */
  async nbFiles() {
    if (!this.filesCollection) {
      this.filesCollection = this.db.collection('files');
    }
    const filesCount = await this.filesCollection.countDocuments();
    return filesCount;
  }
}

// Create a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
