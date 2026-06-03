const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Memory storage for processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if ([...allowedVideoTypes, ...allowedImageTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const uploadImage = async (buffer, folder = 'streamsphere/images') => {
  return uploadToCloudinary(buffer, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
};

const uploadVideo = async (buffer, folder = 'streamsphere/videos') => {
  return uploadToCloudinary(buffer, {
    folder,
    resource_type: 'video',
    chunk_size: 6000000,
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { upload, uploadImage, uploadVideo, deleteFromCloudinary };
