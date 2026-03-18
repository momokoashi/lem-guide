const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyCMB0SH63kEPCghH-U3AWPspnYgiEt5Evw';
const MODEL = 'gemini-2.5-flash-image';
const IMAGES_DIR = path.join(__dirname, 'images');

// Load reference product image
const refBase64 = fs.readFileSync(path.join(IMAGES_DIR, 'lem-reference.png')).toString('base64');

const imagePrompts = [
  {
    name: 'step1-anatomy.png',
    prompt: `Create an educational anatomy illustration for a product guide page. Style: clean, friendly, illustrated/cartoon style with soft warm skin tones on a cream #FCF7ED background.

Show a frontal view of female vulva anatomy as a simple, clean anatomical diagram (educational, non-pornographic, medical illustration style). The illustration should be oval-shaped with soft peach/tan skin tones.

Include these labeled parts with hot pink #FF30CC arrow callouts pointing to each:
- "Clitoral Hood" (top, with pink arrow pointing to the hood)
- "Clitoris" (right side, with pink arrow pointing to the small nub below the hood)
- "Inner Labia" (bottom left, with pink arrow)
- "Outer Labia" (bottom right, with pink arrow)

Add a bright lime green #CCFD28 glow/sparkle effect around the clitoris area to highlight it as the target zone.

At the bottom, add a lime green #CCFD28 banner/badge with hot pink text reading "Know Your Body, Love Your Body"

The overall style should be warm, friendly, body-positive, and educational - like a wellness brand illustration. NOT realistic/photographic. Think cute health diagram.`
  },
  {
    name: 'step2-lube.png',
    prompt: `Create a two-panel illustrated guide image for applying lubricant to a clitoral suction toy. Style: clean, warm, illustrated/cartoon style on a soft pink/cream background.

PANEL A (top):
Show the golden/yellow lemon-shaped Lem device (shown in reference image) being held at an angle. A hand is squeezing a small bottle labeled "Water-Based Lube" onto the device's suction nozzle opening (the round hole at the narrow bottom end). Show lube dripping around the nozzle rim. Add a pink arrow callout label: "Apply lube around the nozzle rim". Mark this panel with a large "A" in the top left.

PANEL B (bottom):
Show two fingers gently applying lube/moisture to the vulva area (tasteful, illustrated, non-explicit). Include a lime green #CCFD28 starburst badge saying "Optional but recommended!" and a pink arrow callout: "Apply lube here too for extra comfort". Mark with "B" in top left.

At the very bottom, add a lime green #CCFD28 banner with hot pink text: "Lube = Better Seal + Better Sensation"

Use warm, friendly illustration style with soft skin tones. Educational and body-positive.`
  },
  {
    name: 'step3-position.png',
    prompt: `Create a two-panel illustrated guide showing how to position the Lem clitoral suction toy. Style: clean, warm, cartoon/illustration style on cream/pink background.

PANEL 1 (top):
Show a close-up illustration of fingers gently spreading the labia to reveal the clitoris (shown as a small pink dot/nub). Add a lime green #CCFD28 starburst badge: "Pro-Tip: Gently spread to find your spot!" with a pink arrow pointing to the clitoris area. Label "Target area" nearby.

PANEL 2 (bottom):
Show the golden/yellow lemon-shaped Lem device (from reference image) positioned with its narrow end (nozzle) pointing downward, hovering just above/touching the target area. The device should be shown from the front with the "N" logo visible. Add pink concentric ring lines around the nozzle area to show the seal/suction. Add a dotted circle showing alignment. Label: "Align nozzle directly over the target"

Include a small circular inset/zoom showing the cross-section of the nozzle creating a seal.

At the bottom, add a lime green #CCFD28 banner: "Just rest it — do not push! Feel the gentle suction? That is the magic!"

Warm, educational, body-positive illustration style.`
  },
  {
    name: 'step4-startlow.png',
    prompt: `Create an illustrated guide image about starting at low intensity. Style: clean, warm cartoon/illustration on cream #FCF7ED background.

LEFT SIDE:
Show a feminine hand with pink nail polish holding the golden/yellow lemon-shaped Lem device (from reference image). The hand cups the device naturally with the suction nozzle (round hole) visible at the narrow bottom end, pointing downward. The "N" logo is visible on the body.

RIGHT SIDE:
Show a vertical intensity level meter/bar chart with approximately 12 horizontal bars. The bottom bar is highlighted in hot pink #FF30CC, the rest are light gray. An arrow points to the bottom bar with text "Start here" and a pink badge "Level 1 - Gentle".

BOTTOM:
Show a pink stopwatch/timer icon displaying "60 sec" with text: "Give your body at least 60 seconds to adjust before increasing"

At the very bottom, add a lime green #CCFD28 banner with hot pink text: "Good things come to those who wait ;)"

Warm, friendly, clean illustration style.`
  },
  {
    name: 'technique-tilt-rock.png',
    prompt: `Create a two-panel side-by-side illustration showing techniques for using the Lem clitoral suction toy. Style: clean, warm cartoon on pink #FF30CC background border/frame.

LEFT PANEL (on cream background):
Show the golden/yellow lemon-shaped Lem device positioned on the vulva area (tasteful illustration). Add curved hot pink double-headed arrows above the device showing a tilting/rocking side-to-side motion. The device's nozzle end is touching the body. Pink concentric rings around the nozzle area show the seal is maintained. Label or imply "Tilt" motion.

RIGHT PANEL (on cream background):
Show the same golden Lem device positioned on the body from a slightly different angle (more frontal/bird's eye view). Add horizontal olive/lime green double-headed arrows on both sides showing a side-to-side sliding motion. Below the device, show concentric circle lines in lime green suggesting circular motion patterns. Label or imply "Rock & Circles" motion.

Both panels should have rounded corners. The overall frame/border between and around panels is hot pink #FF30CC.

Warm, body-positive, educational illustration style. Non-explicit but clearly showing the device in use position.`
  }
];

async function generateImage(promptData) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        parts: [
          { text: promptData.prompt },
          { inlineData: { mimeType: 'image/png', data: refBase64 } }
        ]
      }],
      generationConfig: { responseModalities: ['image', 'text'] }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    console.log(`Generating ${promptData.name}...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            console.error(`ERROR for ${promptData.name}:`, json.error.message);
            reject(new Error(json.error.message));
            return;
          }
          const parts = json.candidates?.[0]?.content?.parts || [];
          const imgPart = parts.find(p => p.inlineData);
          if (imgPart) {
            const outPath = path.join(IMAGES_DIR, promptData.name);
            fs.writeFileSync(outPath, Buffer.from(imgPart.inlineData.data, 'base64'));
            const size = fs.statSync(outPath).size;
            console.log(`OK: ${promptData.name} (${(size/1024).toFixed(0)} KB)`);
            resolve(promptData.name);
          } else {
            console.error(`NO IMAGE in response for ${promptData.name}`);
            const textPart = parts.find(p => p.text);
            if (textPart) console.error('Text response:', textPart.text.substring(0, 200));
            reject(new Error('No image in response'));
          }
        } catch (e) {
          console.error(`Parse error for ${promptData.name}:`, e.message);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Generate images sequentially to avoid rate limits
async function main() {
  console.log('Starting image generation (5 images)...');
  console.log('Using Gemini 2.5 Flash Image with Lem reference photo\n');

  let success = 0;
  let failed = 0;

  for (const p of imagePrompts) {
    try {
      await generateImage(p);
      success++;
      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      failed++;
      console.error(`Failed: ${p.name} - ${e.message}\n`);
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`);
}

main();
