import { MongoClient, ObjectId } from 'mongodb';
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

    MongoClient.connect(url,
      { useUnifiedTopology: true, useNewUrlParser: true },
      (err, client) => {
        if (!err) {
          this.db = client.db(DB_DATABASE);
          this.usersCollection = this.db.collection('users');
          this.filesCollection = this.db.collection('files');
          this.connected = true;
        } else {
          this.connected = false;
          console.log(`Error connecting to Mongodb: ${err.message}`);
        }
      });
  }

  /**
   * Checks if the MongoDB client is currently connected.
   *
   * @returns {boolean} Connection status of the MongoDB client
   * @description Verifies whether an active connection to the database exists
   */
  isAlive() {
    return Boolean(this.connected);
  }

  /**
   * Retrieves the total number of users in the database.
   *
   * @returns {Promise<number>} Total count of documents in the users collection
   * @description Lazily initializes the users collection and counts its documents
   */
  async nbUsers() {
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

  /**
   * Retrieves a specific file or folder by its ID and user ID.
   *
   * @async
   * @method getFile
   * @param {string} id - Unique identifier of the file or folder
   * @param {string} userId - ID of the user who owns the file
   *
   * @description
   * Searches the files collection for a document matching both the file ID
   * and the user ID, ensuring users can only access their own files.
   *
   * @returns {Object|null} The file/folder document or null if not found
   */
  async getFile(id, userId) {
    const file = await this.filesCollection.findOne({
      _id: id,
      userId: ObjectId(userId),
    });
    return file;
  }

  /**
   * Creates a new file or folder entry in the database.
   *
   * @async
   * @method createFile
   * @param {string} userId - ID of the user creating the file/folder
   * @param {string} name - Name of the file or folder
   * @param {string} type - Type of the entry (file/folder/image)
   * @param {string} parentId - ID of the parent folder (if applicable)
   * @param {boolean} isPublic - Indicates if the file/folder is publicly accessible
   * @param {string} [localPath] - Local file system path for file storage (optional)
   *
   * @description
   * Inserts a new file or folder document into the database.
   * Handles two scenarios:
   * - Files with a local path (actual file storage)
   * - Folders or files without local path
   *
   * @returns {Object}
   */
  async createFile(userId, name, type, parentId, isPublic, localPath = undefined) {
    // Check if a local path is provided (indicates an actual file)
    if (localPath) {
      const file = await this.filesCollection.insertOne({
        userId,
        name,
        type,
        parentId,
        isPublic,
        localPath,
      });
      return file;
    }

    // Insert folder or file without local path (typically for folders)
    const folder = await this.filesCollection.insertOne({
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
    return folder;
  }

  /**
   * Retrieves a paginated list of files or folders for a specific parent folder.
   *
   * @async
   * @method getFiles
   * @param {string} parentId - ID of the parent folder to filter by
   * @param {string} userId - ID of the user to filter by
   * @param {number} offset - Number of documents to skip (for pagination)
   * @param {number} limit - Maximum number of documents to return
   *
   * @description
   * Fetches files/folders belonging to a specific user within a given parent folder.
   * Implements pagination by using skip and limit.
   *
   * @returns {Array} List of file/folder documents matching the criteria
   */
  async getFiles(parentId, userId, offset, limit) {
    // Find files/folders matching the parent folder and user ID
    const files = await this.filesCollection.find({ parentId, userId })
      .skip(offset) // Skip the first 20 documents
      .limit(limit) // Limit the results to 20 documents
      .toArray();

    return files;
  }
}

// Create a singleton instance of DBClient
const dbClient = new DBClient();
export default dbClient;
