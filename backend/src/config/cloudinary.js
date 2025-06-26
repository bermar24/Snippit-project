const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for different file types
const createStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `blog-platform/${folder}`,
      allowed_formats: allowedFormats,
      transformation: folder === 'avatars' 
        ? [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
        : [{ width: 1200, height: 630, crop: 'fill' }]
    }
  });
};

// Create multer instances for different upload types
const avatarStorage = createStorage('avatars', ['jpg', 'jpeg', 'png', 'webp']);
const postImageStorage = createStorage('posts', ['jpg', 'jpeg', 'png', 'webp']);

// Export upload middlewares
exports.uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.uploadPostImage = multer({ 
  storage: postImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Utility function to delete images from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
exports.getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder path in public ID
  const folderIndex = parts.indexOf('blog-platform');
  if (folderIndex !== -1) {
    const folderPath = parts.slice(folderIndex, -1).join('/');
    return `${folderPath}/${publicId}`;
  }
  
  return publicId;
};
