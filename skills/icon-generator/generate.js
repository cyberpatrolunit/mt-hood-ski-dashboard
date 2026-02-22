#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Parse arguments
const description = process.argv[2];
const outputPath = process.argv[3] || null;

if (!description) {
  console.error('Usage: node generate.js "icon description" [output-path]');
  process.exit(1);
}

// Style presets
const styleGuides = {
  tron: 'Use neon cyan (#00ffff) and blue (#0080ff) colors. Add glow effects with gradients. Geometric, futuristic design.',
  minimal: 'Simple geometric shapes, single solid color, clean lines, no gradients.',
  flat: 'Modern flat design, solid colors, slight shadows allowed, 2-3 colors max.',
  line: 'Outline/stroke only, 2px stroke width, no fill, clean paths.',
  duotone: 'Two colors only, use gradients between them, modern style.'
};

// Detect style from description
function detectStyle(desc) {
  const lower = desc.toLowerCase();
  for (const [style, guide] of Object.entries(styleGuides)) {
    if (lower.includes(style)) {
      return guide;
    }
  }
  return styleGuides.minimal; // default
}

// Generate SVG using Claude
async function generateSVG(description) {
  const styleGuide = detectStyle(description);
  
  const prompt = `You are an expert SVG icon designer. Create a professional SVG icon based on this description:

"${description}"

Style guide: ${styleGuide}

Requirements:
- Output ONLY valid SVG code (no explanations, no markdown)
- Use viewBox="0 0 24 24" for 24x24 pixel size
- Include xmlns="http://www.w3.org/2000/svg"
- Use clean, optimized paths
- Keep it simple and recognizable
- If multiple colors, use gradients with id references
- For glow effects, use filters with feGaussianBlur

Start your response with <svg and end with </svg>. Nothing else.`;

  try {
    // Use OpenClaw's Claude integration via curl to local API
    const result = await execAsync(`curl -s http://localhost:18789/api/chat/send \\
      -H "Content-Type: application/json" \\
      -d '{"message": ${JSON.stringify(prompt)}, "agent": "icon-generator"}'`);
    
    // If that fails, try direct OpenAI-compatible endpoint
    if (!result.stdout || result.stdout.includes('error')) {
      throw new Error('OpenClaw API unavailable, using fallback');
    }
    
    const response = JSON.parse(result.stdout);
    return extractSVG(response.reply || response.message);
    
  } catch (error) {
    // Fallback: Generate simple template-based SVG
    console.error('Claude API unavailable, generating template-based icon...');
    return generateTemplateSVG(description);
  }
}

// Extract SVG from response
function extractSVG(text) {
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (!svgMatch) {
    throw new Error('No valid SVG found in response');
  }
  return svgMatch[0];
}

// Fallback template generator
function generateTemplateSVG(description) {
  const lower = description.toLowerCase();
  let svg = '';
  
  // Simple pattern matching for common icons
  if (lower.includes('rocket')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="tron" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0080ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path fill="url(#tron)" d="M12 2L7 12h3v8l5-10h-3z"/>
  <circle cx="12" cy="20" r="1.5" fill="#00ffff" opacity="0.8"/>
</svg>`;
  } else if (lower.includes('cloud')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#00ffff" d="M19 12c0-1.1-.9-2-2-2h-.5c-.3-1.7-1.7-3-3.5-3-1.4 0-2.6.8-3.2 2-.6-.3-1.2-.5-1.8-.5-2.2 0-4 1.8-4 4 0 .4.1.8.2 1.2C3.5 14.1 3 14.9 3 16c0 1.7 1.3 3 3 3h12c2.2 0 4-1.8 4-4s-1.8-3-3-3z"/>
</svg>`;
  } else {
    // Generic geometric shape
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="8" fill="none" stroke="#00ffff" stroke-width="2"/>
  <circle cx="12" cy="12" r="4" fill="#00ffff" opacity="0.6"/>
</svg>`;
  }
  
  return svg;
}

// Main execution
(async () => {
  try {
    console.log(`🎨 Generating icon: "${description}"...`);
    
    const svg = await generateSVG(description);
    
    // Determine output path
    const timestamp = Date.now();
    const filename = outputPath || `output/icon-${timestamp}.svg`;
    const fullPath = path.resolve(__dirname, filename);
    
    // Ensure output directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write SVG
    fs.writeFileSync(fullPath, svg);
    
    console.log(`✅ Icon generated: ${fullPath}`);
    console.log(`📏 Size: ${svg.length} bytes`);
    
    // Output path for programmatic use
    console.log(fullPath);
    
  } catch (error) {
    console.error('❌ Error generating icon:', error.message);
    process.exit(1);
  }
})();
