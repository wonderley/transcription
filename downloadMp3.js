const http = require('http');
const fs = require('fs');
const request = require('request');
const parsePodcast = require('node-podcast-parser');
const Lame = require("node-lame").Lame;
const {Storage} = require('@google-cloud/storage');

function downloadRss() {
  const podcastUrl = 'https://thestartupchat.com/feed/podcast/';
  request(podcastUrl, (err, res, data) => {
    if (err) {
      console.error('Network error', err);
      return;
    }
  
    parsePodcast(data, (err, data) => {
      if (err) {
        console.error('Parsing error', err);
        return;
      }

      const enclosure = data.episodes[0].enclosure;
      const fileSize = enclosure.filesize;
      const type = enclosure.type;
      console.log(type);
      const url = enclosure.url;
      downloadFile(url);
    });
  });
}

function downloadFile(audioUrl) {
  console.log(`downloading url: ${audioUrl}`);
  const mp3FileName = 'podcastDownload.mp3';
  const file = fs.createWriteStream(mp3FileName);
  http.get(audioUrl, res => {
    if (res.statusCode === 302) {
      if (!res.headers.location) {
        console.error('Expected location header, but it was not found.');
      } else {
        console.log(`downloading url: ${res.headers.location}`);
        http.get(res.headers.location, res2 => {
          if (res2.statusCode === 200) {
            res2.pipe(file);
            file.on('finish', () => {
              console.log(`downloaded ${mp3FileName}`);
            });
          } else {
            console.error(`Expected response code 200 but got ${res2.statusCode}`);
          }
        });
      }
    } else {
      console.error(`Expected response code 302 but got ${res.statusCode}`);
    }
  });
}

// function convertToWav(file) {
//   const wavFileName = 'podcastDownload.wav';
//   // const decoder = new Lame({
//   //   output: wavFileName,
//   //   'to-mono': true,
//   // }).setFile(file);

//   const encoder = new Lame({
//     output: "./downsample.mp3",
//     sfreq: 16,
//     mp3Input: true,
//   }).setFile("./podcastDownload.mp3");
  
//   // decoder
//   //   .decode()
//   encoder
//     .encode()
//     .then(() => {
//       //uploadWavFile(wavFileName);
//     })
//     .catch(error => {
//       console.error(error);
//       // Something went wrong
//     });
// }

if (require.main === module) {
  downloadRss();
}
