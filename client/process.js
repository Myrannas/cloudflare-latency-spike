const fs = require('fs');
const path = require('path');
const percentile = require('percentile')

const files = fs.readdirSync('./output');
const output = fs.createWriteStream('./results.csv');

for (const file of files) {
  const outputFile = fs.readFileSync(path.join('output', file), 'utf-8');

  const lines = outputFile.split('\n').map(line => {
    const [sender, latency, sequence] = line.split(',');

    return {
      sender,
      latency,
      sequence
    }
  });

  const results = percentile([50, 90, 99, 99.9, 99.99], lines, line => line.latency)
    .map(o => o.latency)
    .join(',');

  output.write(`${file},${results}\n`)
}

output.close();
