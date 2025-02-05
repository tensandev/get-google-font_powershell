const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');
const { promisify } = require('util');
const download = promisify(require('download-file'));

const API_KEY = 'AIzaSyBixxHrUlXnxvqnE96px8ZaynxCwG0xKp8';
const API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;
const OUTPUT_DIR = path.join(__dirname, 'google-fonts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

async function getFonts() {
    try {
        console.log("Fetching Google Fonts list...");
        const response = await axios.get(API_URL);
        const fonts = response.data.items;
        console.log("Starting font download...");

        // Download fonts in parallel
        await Promise.all(fonts.map(font => downloadFont(font)));
        console.log("All fonts have been downloaded! Saved to:", OUTPUT_DIR);
    } catch (error) {
        console.error('Error fetching fonts:', error);
    }
}

async function downloadFont(font) {
    const fontFamily = font.family;
    const encodedFontFamily = fontFamily.replace(/ /g, '+');
    const cssUrl = `https://fonts.googleapis.com/css?family=${encodedFontFamily}`;

    try {
        // Fetch the CSS content and extract font URLs
        const cssResponse = await axios.get(cssUrl);
        const $ = cheerio.load(cssResponse.data);
        const fontUrls = [];

        // Extract font URLs
        $('link[rel="stylesheet"]').each((i, element) => {
            const url = $(element).attr('href');
            if (url && url.includes('fonts.gstatic.com')) {
                fontUrls.push(url);
            }
        });

        // Download each font file in parallel
        await Promise.all(fontUrls.map(fontUrl => downloadFile(fontUrl)));
    } catch (error) {
        console.error(`Error downloading fonts for ${fontFamily}:`, error);
    }
}

async function downloadFile(fontUrl) {
    const fontFileName = path.basename(fontUrl);
    const filePath = path.join(OUTPUT_DIR, fontFileName);

    try {
        // Download the font file
        await download(fontUrl, { directory: OUTPUT_DIR, filename: fontFileName });
        console.log(`Downloaded: ${fontFileName}`);
    } catch (error) {
        console.error(`Error downloading file ${fontFileName}:`, error);
    }
}

getFonts();
