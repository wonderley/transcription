function uploadWav(srcFilename) {
  // Instantiate a client
  const storage = new Storage();
  const bucketName = 'wonderley-transcription';
  console.log(`Uploading ${srcFilename} to gs://${bucketName}`);
  storage
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

if (require.main === module) {
  uploadWav('podcastDownload.wav');
}
