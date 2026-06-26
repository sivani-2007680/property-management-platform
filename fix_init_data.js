const fs = require('fs');
const path = require('path');

const locations = {
  'New York City': [-74.0060, 40.7128],
  'Aspen': [-106.8175, 39.1911],
  'Florence': [11.2558, 43.7696],
  'Portland': [-122.6765, 45.5152],
  'Cancun': [-86.8515, 21.1619],
  'Lake Tahoe': [-120.0681, 39.0968],
  'Los Angeles': [-118.2437, 34.0522],
  'Verbier': [7.2289, 46.0961],
  'Serengeti National Park': [34.5899, -2.3333],
  'Amsterdam': [4.8952, 52.3702],
  'Fiji': [178.0654, -17.7134],
  'Cotswolds': [-1.8433, 51.8330],
  'Boston': [-71.0589, 42.3601],
  'Bali': [115.2128, -8.6705],
  'Banff': [-115.5708, 51.1784],
  'Miami': [-80.1918, 25.7617],
  'Phuket': [98.3923, 7.8804],
  'Scottish Highlands': [-4.5, 57.5],
  'Dubai': [55.2708, 25.2048],
  'Montana': [-109.6333, 47.0527],
  'Mykonos': [25.3268, 37.4467],
  'Costa Rica': [-83.7534, 9.7489],
  'Charleston': [-79.9312, 32.7765],
  'Tokyo': [139.6917, 35.6895],
  'New Hampshire': [-71.5653, 43.4525],
  'Maldives': [73.5081, 3.8667],
  'Malibu': [-118.6819, 34.0259],
};

const data = require('./init/data.js').data;

data.forEach(item => {
  const coords = locations[item.location] || [78.9629, 20.5937];
  item.geometry = { type: 'Point', coordinates: coords };
});

const output = `const sampleListings = ${JSON.stringify(data, null, 2)};

module.exports = { data: sampleListings };`;

fs.writeFileSync(path.join(__dirname, 'init', 'data.js'), output, 'utf-8');
console.log('Updated init/data.js with geometry coordinates');
