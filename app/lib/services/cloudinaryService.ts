// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dqaocubzz',
  apiKey: '291534954615135',
  apiSecret: 'mwGjhX1K6G_svSdM-EbzxfL0hJs',
  uploadPreset: 'MasChat', // Your new upload preset name
  cloudinaryUrl: 'cloudinary://291534954615135:mwGjhX1K6G_svSdM-EbzxfL0hJs@dqaocubzz'
};

/**
 * Upload image to Cloudinary
 * @param imageUri - Local URI of the image
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'maschat'
): Promise<string> => {
  try {
    console.log('Starting Cloudinary upload...');
    console.log('Image URI:', imageUri);
    console.log('Folder:', folder);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);

    console.log('Uploading to Cloudinary with:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: folder,
      imageUri: imageUri
    });

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Cloudinary response status:', response.status);
    console.log('Cloudinary response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary response error:', errorText);
      console.error('Response status:', response.status);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to upload image to cloud storage: ${error.message || error}`);
  }
};

/**
 * Upload video to Cloudinary
 * @param videoUri - Local URI of the video
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise<string> - Cloudinary URL of uploaded video
 */
export const uploadVideoToCloudinary = async (
  videoUri: string,
  folder: string = 'maschat/videos'
): Promise<string> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');

    console.log('Uploading video to Cloudinary with:', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: folder,
      videoUri: videoUri
    });

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary video response error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Cloudinary video upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('Error uploading video to Cloudinary:', error);
    throw new Error(`Failed to upload video to cloud storage: ${error.message || error}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file in Cloudinary
 * @param resourceType - Type of resource ('image' or 'video')
 * @returns Promise<boolean> - Success status
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<boolean> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(publicId, timestamp);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    console.log('Cloudinary delete successful');
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Generate signature for Cloudinary API calls
 * @param publicId - Public ID of the file
 * @param timestamp - Current timestamp
 * @returns string - Generated signature
 */
const generateSignature = (publicId: string, timestamp: number): string => {
  // Note: In a production app, this should be done server-side for security
  // This is a simplified version for demonstration
  const params = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
  // You would typically use a crypto library here
  return btoa(params); // This is not secure - use proper crypto in production
};

/**
 * Get optimized image URL with transformations
 * @param originalUrl - Original Cloudinary URL
 * @param transformations - Cloudinary transformations
 * @returns string - Optimized URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  transformations: string = 'f_auto,q_auto,w_800'
): string => {
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // Insert transformations into the URL
  const urlParts = originalUrl.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
  }

  return originalUrl;
};

/**
 * Test Cloudinary connection and upload preset
 */
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Cloudinary connection...');
    console.log('Cloud Name:', CLOUDINARY_CONFIG.cloudName);
    console.log('Upload Preset:', CLOUDINARY_CONFIG.uploadPreset);
    
    // Test with a simple text file
    const formData = new FormData();
    formData.append('file', {
      uri: 'data:text/plain;base64,SGVsbG8gV29ybGQ=', // "Hello World" in base64
      type: 'text/plain',
      name: 'test.txt',
    } as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'test');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary test failed:', errorText);
      console.error('Response status:', response.status);
      return false;
    }

    const result = await response.json();
    console.log('Cloudinary test successful:', result);
    return true;
  } catch (error: any) {
    console.error('Cloudinary test error:', error);
    console.error('Error message:', error.message);
    return false;
  }
};

export default {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  testCloudinaryConnection,
}; 