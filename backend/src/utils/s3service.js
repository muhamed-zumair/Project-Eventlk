const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Upload Function (You already have this)
const uploadFileToS3 = async (file, folderName = 'documents') => {
    const randomHex = crypto.randomBytes(4).toString('hex');
    const uniqueFileName = `${folderName}/${Date.now()}-${randomHex}-${file.originalname.replace(/\s+/g, '_')}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    await s3Client.send(new PutObjectCommand(params));
    return uniqueFileName;
};

// 🚀 NEW: Download Function (Generates a temporary 1-hour secure link)
const getPresignedDownloadUrl = async (awsKey) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: awsKey,
    });
    // The link will expire in 3600 seconds (1 hour)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const deleteFileFromS3 = async (awsKey) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: awsKey,
    };
    await s3Client.send(new DeleteObjectCommand(params));
};



// Add this function to your s3Service.js
const uploadAttachmentToS3 = async (file, eventId, type = 'general') => {
    const randomHex = crypto.randomBytes(4).toString('hex');
    // Folder structure: event_123/chat/image_171000.png
    const uniqueFileName = `event_${eventId}/${type}/${Date.now()}-${randomHex}-${file.originalname.replace(/\s+/g, '_')}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    await s3Client.send(new PutObjectCommand(params));
    return uniqueFileName;
};
// 3. Update the export at the bottom
module.exports = { s3Client, uploadFileToS3, getPresignedDownloadUrl, deleteFileFromS3 , uploadAttachmentToS3};