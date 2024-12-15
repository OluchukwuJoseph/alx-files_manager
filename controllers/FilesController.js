import { v4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import getUserFromToken from '../utils/auth';

/**
 * FileController handles file and folder upload, retrieval, and management operations.
 * It provides static methods for interacting with files in a web application.
 */
export default class FileController {
  /**
   * Uploads a new file or folder to the system.
   *
   * @static
   * @async
   * @method postUpload
   * @param {Object} req - Express request object containing file upload details
   * @param {Object} res - Express response object for sending upload results
   *
   * @description
   * This method handles file and folder uploads with the following key functionalities:
   * - Authenticates the user via token
   * - Validates input parameters (name, type, data)
   * - Supports creating folders and files/images
   * - Handles base64 encoded file data
   * - Stores files in a specified folder path
   * - Creates database entries for uploaded files/folders
   *
   * @throws {Error} Throws errors for:
   * - Missing authentication token
   * - Invalid or missing file/folder attributes
   * - Unauthorized access
   * - Parent folder validation issues
   *
   * @returns {Object} JSON response with uploaded file/folder details
   * - 201 status code on successful upload
   * - 400 status code for input errors
   * - 401 status code for unauthorized access
   */
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      // Verify and retrieve user based on the token
      const user = await getUserFromToken(token);

      const { name, type, data } = req.body;
      // Validate name is provided
      if (!name) throw new Error('Missing name');
      // Validate type is one of the allowed values
      if (!type || (type !== 'folder' && type !== 'file' && type !== 'image')) {
        throw new Error('Missing type');
      }
      // Ensure data is provided for files and images
      if ((type === 'file' || type === 'image') && !data) throw new Error('Missing data');

      const parentId = req.body.parentId || 0;
      const isPublic = req.body.isPublic || false;

      // Handle folder creation
      if (type === 'folder') {
        const folder = await dbClient.createFile(user._id, name, type, parentId, isPublic);
        res.status(201).json({
          id: folder.insertedId,
          userId: user._id,
          name,
          type,
          isPublic,
          parentId,
        });
        return;
      }

      // Validate parent folder for files and images
      if (parentId !== 0) {
        const parent = await dbClient.getFile(parentId, user._id);
        if (!parent) {
          throw new Error('Parent not found');
        }
        if (parent.type !== 'folder') {
          throw new Error('Parent is not a folder');
        }
      }

      // Determine file storage path
      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      const path = `${FOLDER_PATH}/${v4()}`;
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      // Create storage directory if it doesn't exist
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH);
      }

      fs.writeFile(path, decodedData, (err) => {
        if (err) {
          console.log(`An error occured while file contents: ${err.message}`);
        }
      });

      // Create file entry in the database and Respond with file details
      const file = await dbClient.createFile(user._id, name, type, parentId, isPublic, path);
      res.status(201).json({
        id: file.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (err) {
      console.log(`An error occured: ${err.message}`);
      // Handle unauthorized access specifically
      if (err.message === 'Unauthorized') {
        res.status(401).json({ error: err.message });
        return;
      }
      // Respond with 400 status for other errors
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves details of a specific file or folder.
   *
   * @static
   * @async
   * @method getShow
   * @param {Object} req - Express request object containing file ID in parameters
   * @param {Object} res - Express response object for sending file details
   *
   * @description
   * This method retrieves detailed information about a specific file or folder:
   * - Authenticates the user via token
   * - Fetches file/folder details from the database
   * - Returns comprehensive file metadata
   *
   * @throws {Error} Throws errors for:
   * - Missing authentication token
   * - File/folder not found
   * - Unauthorized access
   *
   * @returns {Object} JSON response with file/folder details
   * - 200 status code on successful retrieval
   * - 404 status code if file/folder not found
   * - 401 status code for unauthorized access
   */
  static async getShow(req, res) {
    try {
      const token = req.headers['x-token'];
      // Verify and retrieve user based on the token
      const user = await getUserFromToken(token);
      const { id } = req.params;

      // Retrieve document details from database
      const document = await dbClient.getFile(id, user._id);
      if (!document) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      // Respond with document metadata
      res.json({
        id: document._id,
        userId: document._id,
        name: document.name,
        type: document.type,
        isPublic: document.isPublic,
        parentId: document.parentId,
      });
    } catch (err) {
      console.log(`An error occured: ${err.message}`);
      // Handle unauthorized access specifically
      if (err.message === 'Unauthorized') {
        res.status(401).json({ error: err.message });
        return;
      }
      // Respond with 400 status for other errors
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * Retrieves a paginated list of files and folders.
   *
   * @static
   * @async
   * @method getIndex
   * @param {Object} req - Express request object containing query parameters
   * @param {Object} res - Express response object for sending file list
   *
   * @description
   * This method fetches a paginated list of files/folders:
   * - Authenticates the user via token
   * - Supports filtering by parent folder
   * - Implements pagination with 20 items per page
   * - Returns metadata for files/folders accessible to the user
   *
   * @throws {Error} Throws errors for:
   * - Missing authentication token
   * - Unauthorized access
   *
   * @returns {Object} JSON array of file/folder metadata
   * - 200 status code on successful retrieval
   * - 401 status code for unauthorized access
   */
  static async getIndex(req, res) {
    try {
      const token = req.headers['x-token'];
      // Verify and retrieve user based on the token
      const user = await getUserFromToken(token);
      const parentId = req.query.parentId || 0;
      const page = req.query.page * 20 || 0;

      // Retrieve files/folders from database
      // Fetch 20 items per page, filtered by parent folder and user
      const documents = await dbClient.getFiles(parentId, user._id, page, 20);
      const files = [];
      documents.forEach((document) => {
        files.push({
          id: document._id,
          userId: document._id,
          name: document.name,
          type: document.type,
          isPublic: document.isPublic,
          parentId: document.parentId,
        });
      });
      // Send list of files/folders as JSON response
      res.json(files);
    } catch (err) {
      console.log(`An error occured: ${err.message}`);
      // Handle unauthorized access specifically
      if (err.message === 'Unauthorized') {
        res.status(401).json({ error: err.message });
        return;
      }
      // Respond with 400 status for other errors
      res.status(400).json({ error: err.message });
    }
  }
}
