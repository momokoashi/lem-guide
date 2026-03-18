const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCMB0SH63kEPCghH-U3AWPspnYgiEt5Evw';
const MODEL = 'gemini-2.5-flash-image';
const OUTPUT_DIR = path.join(__dirname, 'images');

const images = [
  {
    name: 'sensation-kisses.png',
    prompt: 'Generate an image: A minimal clean illustration icon on white background. Soft pink lips blowing a gentle air kiss with tiny sparkle particles floating away. Delicate feminine pastel pink and gold color palette. Flat vector illustration style suitable as a card icon. No text. Square format.'
  },
  {
    name: 'sensation-waves.png',
    prompt: 'Generate an image: A minimal clean illustration icon on white background. Abstract rolling ocean waves in soft pink and gold gradient colors showing building intensity from left to right. Elegant minimal flat vector style. Feminine and warm. No text. Square format.'
  },
  {
    name: 'sensation-crescendo.png',
    prompt: 'Generate an image: A minimal clean illustration icon on white background. A starburst firework explosion in hot pink and gold colors radiating outward with sparkles and energy lines. Represents peak sensation. Flat vector illustration style. No text. Square format.'
  },
  {
    name: 'step-position.png',
    prompt: 'Generate an image: Clean instructional diagram on soft pink background showing a bright yellow lemon-shaped device (egg-shaped suction toy) being held between fingers like a small egg. The narrow top end has a small circular opening (suction nozzle) clearly highlighted with a label arrow. The nozzle opening faces downward toward the body. A dotted arrow shows the nozzle placed directly over the clitoris area. Clean friendly non-clinical illustration style. Warm feminine colors. Educational diagram. The suction hole at the narrow top is clearly the most important feature.'
  },
  {
    name: 'technique-tilt.png',
    prompt: 'Generate an image: Clean minimal illustration on soft pink background. A bright yellow lemon-shaped egg device with small circular opening at top. Two curved arrows on each side show it tilting left and right in rocking motion. The opening stays in contact with surface below. Instructional diagram style warm pastel colors friendly and non-clinical. No text. Square format.'
  },
  {
    name: 'technique-rock.png',
    prompt: 'Generate an image: Clean minimal illustration on soft pink background. A bright yellow lemon-shaped egg device with small circular opening at top. Curved back-and-forth arrow shows gentle rocking motion forward and backward. The opening stays in contact with surface. Instructional diagram style warm pastel colors. No text. Square format.'
  },
  {
    name: 'technique-circles.png',
    prompt: 'Generate an image: Clean minimal illustration on soft pink background. A bright yellow lemon-shaped egg device with small circular opening at top. Circular dotted arrow path around device shows it moving in small slow circles. Opening stays in contact with surface. Instructional diagram style warm pastel colors. No text. Square format.'
  },
  {
    name: 'technique-hover.png',
    prompt: 'Generate an image: Clean minimal illustration on soft pink background. A bright yellow lemon-shaped egg device with small circular opening at top. Device slightly lifted off surface with small gap shown. Wavy air pulse lines from opening downward. Shows hovering slightly above for lighter sensation. Instructional diagram style warm pastel colors. No text. Square format.'
  }
];

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['image', 'text'] }
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/' + MODEL + ':generateContent?key=' + API_KEY,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          if (data.error) return reject(new Error(JSON.stringify(data.error)));
          const parts = data.candidates?.[0]?.content?.parts || [];
          const imgPart = parts.find(p => p.inlineData);
          if (imgPart) resolve(Buffer.from(imgPart.inlineData.data, 'base64'));
          else reject(new Error('No image in response'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outPath = path.join(OUTPUT_DIR, img.name);
    if (fs.existsSync(outPath)) { console.log('[' + (i+1) + '/' + images.length + '] SKIP ' + img.name); continue; }
    console.log('[' + (i+1) + '/' + images.length + '] Generating ' + img.name + '...');
    try {
      const buf = await generateImage(img.prompt);
      fs.writeFileSync(outPath, buf);
      console.log('  -> Saved: ' + buf.length + ' bytes');
      if (i < images.length - 1) await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error('  -> FAILED: ' + err.message);
    }
  }
  console.log('\nDone!');
}
main();
