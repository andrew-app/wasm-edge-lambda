const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'build/index.js');

fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }

    const result = data.replace(/export {[\s\S]*?};/g, '');

    fs.writeFile(filePath, result, 'utf8', function(err) {
        if (err) return console.log(err);
    });
});