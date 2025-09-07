const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');

async function migrateUserData(username) {
  try {
    const userFolderPath = path.join(__dirname, '../../Data', username);
    const files = await fs.readdir(userFolderPath);
    
    const faceImages = [];
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const imageData = await fs.readFile(path.join(userFolderPath, file));
        faceImages.push({
          data: imageData,
          contentType: `image/${path.extname(file).substring(1)}`,
          uploadDate: new Date()
        });
      }
    }

    const user = await User.findOneAndUpdate(
      { username },
      { $set: { faceImages } },
      { upsert: true, new: true }
    );

    console.log(`Migrated ${faceImages.length} images for user ${username}`);
    return user;
  } catch (error) {
    console.error(`Error migrating data for ${username}:`, error);
  }
}

async function migrateAllUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/face_attendance', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const dataFolderPath = path.join(__dirname, '../../Data');
    const userFolders = await fs.readdir(dataFolderPath);

    for (const username of userFolders) {
      await migrateUserData(username);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAllUsers();