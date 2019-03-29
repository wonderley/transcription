#! /usr/bin/env node
const { downloadMp3 } = require('./downloadMp3.js');
const { uploadFile, deleteFile } = require('./utils.js');
const { execSync } = require('child_process');
const fs = require('fs');

async function go() {
  downloadMp3().then(async function(mp3FileName) {
    const rawFileName = mp3FileName.replace(/.mp3$/, '.raw');
    if (mp3FileName === rawFileName)
      throw new Error('Something is up with the mp3 file name');
    console.log(`Transcoding ${mp3FileName} to ${rawFileName}`);
    // https://hub.docker.com/r/bigpapoo/sox/
    // http://sox.sourceforge.net/sox.html
    const transcodeCommand = `docker run -v $(pwd):/work --rm bigpapoo/sox mysox ${mp3FileName} -t raw --channels=1 --bits=16 --rate=16000 --encoding=signed-integer --endian=little ${rawFileName}`
    execSync(transcodeCommand);
    await uploadFile(rawFileName);
    
    const gcsUrl = `gs://wonderley-transcription/${rawFileName}`;
    const transcription = await asyncRecognizeGCS(gcsUrl);
    const textFileName = rawFileName.replace(/.raw$/, '.txt');
    fs.writeFileSync(textFileName, transcription);
    await uploadFile(textFileName);
    await deleteFile(rawFileName);
  });
}

async function asyncRecognizeGCS(gcsUri, encoding,
                                 sampleRateHertz, languageCode) {
  if (!gcsUri) throw new Error('gcsUri is missing');
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  const config = {
    encoding: encoding || 'LINEAR16',
    sampleRateHertz: sampleRateHertz || 16000,
    languageCode: languageCode || 'en-US',
  };

  const audio = {
    uri: gcsUri,
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  console.log('Transcribing audio');
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}


if (require.main === module) {
  go();
}
