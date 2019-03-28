#! /bin/bash
set -e
node downloadMp3.js
# https://hub.docker.com/r/bigpapoo/sox/
# http://sox.sourceforge.net/sox.html
docker run -v $(pwd):/work --rm bigpapoo/sox mysox podcastDownload.mp3 -t raw --channels=1 --bits=16 --rate=16000 --encoding=signed-integer --endian=little podcastDownload.raw
node recognize.js stream podcastDownload.raw -e LINEAR16 -r 16000