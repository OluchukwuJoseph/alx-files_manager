import { v4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import getUserFromToken from '../utils/auth';

export default class FileController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      const user = await getUserFromToken(token);

      const { name, type, data } = req.body;
      if (!name) throw new Error('Missing name');
      if (!type || (type !== 'folder' && type !== 'file' && type !== 'image')) {
        throw new Error('Missing type');
      }
      if ((type === 'file' || type === 'image') && !data) throw new Error('Missing data');

      const parentId = req.body.parentId || 0;
      const isPublic = req.body.isPublic || false;

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

      if (parentId !== 0) {
        const parent = await dbClient.getParent(parentId, user._id);
        if (!parent) {
          throw new Error('Parent not found');
        }
        if (parent.type !== 'folder') {
          throw new Error('Parent is not a folder');
        }
      }

      const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
      const path = `${FOLDER_PATH}/${v4()}`;
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH);
      }

      fs.writeFile(path, decodedData, (err) => {
        if (err) {
          console.log(`An error occured while file contents: ${err.message}`);
        }
      });

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
      if (err.message === 'Unauthorized') {
        res.status(401).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: err.message });
    }
  }
}
