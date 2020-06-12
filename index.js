const request = require('request-promise');
const DOMParser = require('xmldom').DOMParser;
const fs = require('fs-extra')

const sourceLink = 'https://en.wikipedia.org/wiki/List_of_Mystery_Hunters_episodes';

const youtube = 'https://www.youtube.com';
const youtubeSearch = 'https://www.youtube.com/results?search_query=';
const title = 'Mystery Hunters - ';
const headOffSet = 0;
const tailOffset = 0;

const fileName = 'MysteryHunters.txt';

async function main() {
    await request(sourceLink)
        .then(async function (htmlString) {
            const document = new DOMParser().parseFromString(htmlString, 'text/html');
            let length = document.getElementsByTagName("b").length;
            let results = [];

            for (let x = 0; x < length; x++) {
                const episodeName = document.getElementsByTagName("b")[x].getElementsByTagName("a")[0];
                if (episodeName !== undefined) {
                    const normalSearchQuery = encodeURI(title + episodeName.textContent);
                    const promise = await request(youtubeSearch + normalSearchQuery)
                        .then(async function (innerHtmlString) {
                            const innerDocument = new DOMParser().parseFromString(innerHtmlString, 'text/html');
                            const search_query_47 = innerDocument.getElementsByTagName("a")[47];
                            if (search_query_47 === undefined) {
                                results[x] = youtubeSearch + normalSearchQuery;
                            } else {
                                const watchEndpoint = search_query_47.attributes[1].value;
                                if (watchEndpoint === '_blank' || watchEndpoint.substring(watchEndpoint.length - 9, watchEndpoint.length - 1) === 'spf-link') {
                                    results[x] = youtubeSearch + normalSearchQuery;
                                } else {
                                    results[x] = youtubeSearch + normalSearchQuery + ' or ' + youtube + watchEndpoint;
                                }
                            }
                        })
                        .catch(function (err) {
                            return console.log(err);
                        });
                    Promise.all([promise]).then(() => {
                        let file = fs.createWriteStream(fileName);
                        file.on('error', function (err) { console.log(err) });
                        for (let i = 0 + headOffSet; i < results.length + tailOffset; i++) {
                            file.write((results[i] === undefined || results[i] === '') ? '\n' : results[i] + '\n');
                        }
                        file.end();
                    });
                }
            }
        })
        .catch(function (err) {
            return console.log(err);
        });
}

main();