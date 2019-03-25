const http = require('http');
const fs = require('fs');
const request = require('request');
const parsePodcast = require('node-podcast-parser');
const Lame = require("node-lame").Lame;

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
              convertToWav(mp3FileName);
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

function convertToWav(file) {
  const decoder = new Lame({
    output: `${file}.wav`
  }).setFile(file);
  
  decoder
    .decode()
    .then(() => {
      console.log('decoding done');
      // Decoding finished
    })
    .catch(error => {
      console.error(error);
      // Something went wrong
    });
}

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

if (require.main === module) {
  downloadRss();
}


// Had issues using this to get the data
// res2.setEncoding('utf8');
// let rawData = '';
// res2.on('data', (chunk, b, c) => {
//   debugger;
//   rawData += chunk.toString();
// });
// res2.on('end', () => {
//   try {
//     debugger;
//     fs.writeFileSync('podcast.mp3', rawData);
//   } catch (e) {
//     console.error(e.message);
//   }
// });