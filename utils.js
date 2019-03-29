const {Storage} = require('@google-cloud/storage');

async function uploadFile(srcFilename) {
  // Instantiate a client
  const storage = new Storage();
  const bucketName = 'wonderley-transcription';
  console.log(`Uploading ${srcFilename} to gs://${bucketName}`);
  return storage
    .bucket(bucketName)
    .upload(srcFilename)
    .then(() => {
      console.log(
        `File ${srcFilename} uploaded to gs://${bucketName}.`
      );
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

async function deleteFile(file) {
  // Instantiate a client
  const storage = new Storage();
  const bucketName = 'wonderley-transcription';
  console.log(`Deleting gs://${bucketName}/${file}`);
  return storage
    .bucket(bucketName)
    .file(file)
    .delete()
    .then(() => {
      console.log(
        `Deleted gs://${bucketName}/${file}.`
      );
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

if (require.main === module) {
  uploadFile('podcastDownload.raw');
}

module.exports = {
  uploadFile,
  deleteFile,
};
