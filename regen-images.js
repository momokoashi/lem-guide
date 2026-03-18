const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCMB0SH63kEPCghH-U3AWPspnYgiEt5Evw';
const MODEL = 'gemini-2.5-flash-image';
const OUTPUT_DIR = path.join(__dirname, 'images');
const REF_IMAGE = path.join(OUTPUT_DIR, 'lem-reference.png');

// Read reference image as base64
const refBase64 = fs.readFileSync(REF_IMAGE).toString('base64');

const images = [
  {
    name: 'step-position.png',
    prompt: 'Generate an image: A detailed instructional illustration in warm feminine style on cream/beige background. Shows step-by-step how to position the yellow lemon-shaped suction device (shown in the reference photo). The device should be shown from the side with the NOZZLE (circular suction opening) at the BOTTOM narrow end pointing DOWN. Top panel shows fingers gently spreading to find the clitoris with a "Pro-Tip" callout. Bottom panel shows the yellow lemon device being placed nozzle-down directly over the clitoris, with pink suction wave rings around the contact point. Label says "Align nozzle directly over the target". Include a small cross-section diagram showing the suction seal. Style: warm illustrated educational diagram with hot pink text labels and lime green callout badges. Annotation arrows in hot pink.'
  },
  {
    name: 'step-lube.png',
    prompt: 'Generate an image: A detailed instructional illustration in warm feminine style on cream/beige background. Shows how to apply water-based lube to the yellow lemon-shaped suction device (shown in reference photo). Panel A shows a close-up of the device nozzle (circular opening at the narrow bottom end) with lube being dripped around the rim from a small bottle labeled "Water-Based Lube". Pink arrow label says "Apply lube around the nozzle rim". Panel B shows optional lube application on the body. Lime green badge says "Optional but recommended!". Bottom banner says "Lube = Better Seal + Better Sensation" on lime green background. Style: warm illustrated educational diagram with hot pink text and lime green accents.'
  },
  {
    name: 'step-startlow.png',
    prompt: 'Generate an image: A detailed instructional illustration in warm feminine style on cream/beige background. Shows a feminine hand holding the yellow lemon-shaped suction device (shown in reference) cupped in the palm with the nozzle pointing down. The device has a cursive N logo. Next to it is an intensity meter/bar chart showing 12 levels, with level 1 highlighted and labeled "Level 1 - Gentle" in hot pink. An arrow points to level 1 saying "Start here". Below shows a pink stopwatch icon showing "60 sec" with text "Give your body at least 60 seconds to adjust before increasing". Bottom lime green banner says "Good things come to those who wait ;)". Style: warm illustrated educational diagram.'
  },
  {
    name: 'technique-tilt.png',
    prompt: 'Generate an image: Clean minimal instructional illustration on soft pink/cream background. Shows the bright yellow lemon-shaped suction device (from reference photo) with nozzle at bottom touching a surface. Two curved pink arrows show it tilting gently left and right while maintaining nozzle contact. The device has the N logo visible. Motion lines show the tilting movement. Warm pastel educational diagram style. No text. Square format.'
  },
  {
    name: 'technique-rock.png',
    prompt: 'Generate an image: Clean minimal instructional illustration on soft pink/cream background. Shows the bright yellow lemon-shaped suction device (from reference photo) with nozzle at bottom touching a surface. Curved pink arrows show it rocking forward and backward in a gentle see-saw motion while nozzle stays in contact. The device has the N logo. Warm pastel educational diagram style. No text. Square format.'
  },
  {
    name: 'technique-circles.png',
    prompt: 'Generate an image: Clean minimal instructional illustration on soft pink/cream background. Shows the bright yellow lemon-shaped suction device (from reference photo) from above, with nozzle at bottom touching surface. A circular dotted pink arrow path around the device shows small circular motion. The device has the N logo. Warm pastel educational diagram style. No text. Square format.'
  },
  {
    name: 'technique-hover.png',
    prompt: 'Generate an image: Clean minimal instructional illustration on soft pink/cream background. Shows the bright yellow lemon-shaped suction device (from reference photo) slightly lifted above a surface with a visible gap. Wavy air pulse lines emanate from the nozzle opening at the bottom. Shows the concept of hovering for lighter teasing sensation. The device has the N logo. Warm pastel educational diagram style. No text. Square format.'
  }
];

function generateWithReference(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: refBase64 } }
        ]
      }],
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
          else reject(new Error('No image in response. Text: ' + (parts.find(p=>p.text)?.text || 'none')));
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const outPath = path.join(OUTPUT_DIR, img.name);
    if (fs.existsSync(outPath)) { console.log('[' + (i+1) + '/' + images.length + '] SKIP ' + img.name); continue; }
    console.log('[' + (i+1) + '/' + images.length + '] Generating ' + img.name + '...');
    try {
      const buf = await generateWithReference(img.prompt);
      fs.writeFileSync(outPath, buf);
      console.log('  -> Saved: ' + buf.length + ' bytes');
      if (i < images.length - 1) await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error('  -> FAILED: ' + err.message.substring(0, 300));
    }
  }
  console.log('\nDone!');
}
main();
