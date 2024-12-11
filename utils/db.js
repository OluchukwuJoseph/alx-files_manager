import { MongoClient } from 'mongodb';
import SHA1 from 'sha1';

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
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'file_manager';
    const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

    this.client.connect()
      .then(() => {
        // Select the database, using environment variable or default 'file_manager'
        this.db = this.client.db(DB_DATABASE);
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

  /**
   * Retrieves a user from the database by email address.
   *
   * @async
   * @method getUser
   * @param {string} email - The email address of the user to retrieve
   * @returns {Promise<Object|null>} The user document if found, or null if no user exists
   * @description Searches the users collection for a user with the given email address
   *
   * @example
   * // Example usage
   * const user = await dbClient.getUser('user@example.com');
   * // Returns user object or null
   * {
   *   _id: ObjectId("..."),
   *   email: "user@example.com",
   *   password: "hashed_password"
   * }
   */
  async getUser(email) {
    // Lazy initialize the users collection if not already created
    if (!this.usersCollection) {
      this.usersCollection = this.db.collection('users');
    }

    // Find and return the user by email
    const user = await this.usersCollection.findOne({ email });
    return user;
  }

  /**
   * Creates a new user in the database.
   *
   * @async
   * @method createUser
   * @param {string} email - The email address of the new user
   * @param {string} password - The user's password (will be hashed before storage)
   * @returns {Promise<Object>} The result of the insert operation
   * @description Inserts a new user into the users collection with a hashed password
   *
   * @example
   * // Example usage
   * const result = await dbClient.createUser('newuser@example.com', 'password123');
   * // Returns insert result
   * {
   *   acknowledged: true,
   *   insertedId: ObjectId("...")
   * }
   */
  async createUser(email, password) {
    // Lazy initialize the users collection if not already created
    if (!this.usersCollection) {
      this.usersCollection = this.db.collection('users');
    }

    // Insert new user with hashed password
    const result = await this.usersCollection.insertOne({
      email,
      password: SHA1(password),
    });

    return result;
  }
}

// Create a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
