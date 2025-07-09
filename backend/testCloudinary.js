const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const cloudinary = require('cloudinary').v2;

console.log('Cloudinary Configuration:');
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  try {
    // List a few resources to test connection
    const resources = await cloudinary.api.resources({ max_results: 3 });
    console.log('Successfully listed Cloudinary resources:');
    console.log(resources);
  } catch (error) {
    console.error('Error communicating with Cloudinary API:');
    console.error(error);
  }
})();
