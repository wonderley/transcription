const http = require('http');
const fs = require('fs');
const request = require('request');
const parsePodcast = require('node-podcast-parser');

function downloadMp3() {
  return new Promise(function(resolve, reject) {
    const podcastUrl = 'https://thestartupchat.com/feed/podcast/';
    request(podcastUrl, (err, res, data) => {
      if (err) {
        console.error('Network error', err);
        return reject(err);
      }
    
      parsePodcast(data, (err, data) => {
        if (err) {
          console.error('Parsing error', err);
          return reject(err);
        }
  
        const episode = data.episodes[0];
        const enclosure = episode.enclosure;
        const type = enclosure.type;
        if (type !== 'audio/mpeg') {
          return reject(new Error(`Unexpected audio type ${type}`));
        }
        const url = enclosure.url;
        downloadFile(url, resolve, reject);
      });
    });
  });
}

function downloadFile(audioUrl, resolve, reject) {
  const urlSplitBySlashes = audioUrl.split('/');
  const fileName = urlSplitBySlashes[urlSplitBySlashes.length - 1];
  console.log(`downloading url ${audioUrl} to ${fileName}`);
  const file = fs.createWriteStream(fileName);
  http.get(audioUrl, res => {
    if (res.statusCode === 302) {
      if (!res.headers.location) {
        console.error('Expected location header, but it was not found.');
        return reject();
      } else {
        console.log(`downloading url: ${res.headers.location}`);
        http.get(res.headers.location, res2 => {
          if (res2.statusCode === 200) {
            res2.pipe(file);
            file.on('finish', () => {
              console.log(`downloaded ${fileName}`);
              return resolve(fileName);
            });
          } else {
            console.error(`Expected response code 200 but got ${res2.statusCode}`);
            return reject();
          }
        });
      }
    } else {
      console.error(`Expected response code 302 but got ${res.statusCode}`);
      return reject();
    }
  });
}

if (require.main === module) {
  downloadMp3();
}

module.exports = {
  downloadMp3,
};
