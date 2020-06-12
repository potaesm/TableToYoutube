const request = require('request-promise');
const DOMParser = require('xmldom').DOMParser;
const fs = require('fs-extra')

const youtube = 'https://www.youtube.com';
const youtubeSearch = 'https://www.youtube.com/results?search_query=';
const title = 'The Most Extreme - ';
const headOffSet = 2;
const tailOffset = -5;

const fileName = 'TheMostExtreme.txt';

async function main() {
    await request('https://en.wikipedia.org/wiki/The_Most_Extreme#:~:text=The%20Most%20Extreme%20is%20a,aired%20on%20July%207%2C%202002.')
        .then(async function (htmlString) {
            const document = new DOMParser().parseFromString(htmlString, 'text/html');
            let length = document.getElementsByTagName("i").length;
            let results = [];

            for (let x = 0; x < length; x++) {
                const normalSearchQuery = encodeURI(title + document.getElementsByTagName("i")[x].textContent);
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
                        let line = '\n';
                        if (results[i] !== undefined || results[i] !== '') {
                            line = results[i] + '\n';
                        }
                        file.write(line);
                    }
                    file.end();
                });
            }
        })
        .catch(function (err) {
            return console.log(err);
        });
}

main();