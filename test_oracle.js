import fs from 'node:fs';
import path from 'node:path';
import { callOracle } from './oracle.js';

// Test Data
const TESTS = [
    // Yellows
    { name: 'Yellow Suzuki Swift', src: 'static/suzuki_swift_yellow.jpg', expected: true },
    { name: 'Yellow BMW M4', src: 'static/bmw_m4_yellow.jpg', expected: true },
    { name: 'Renault Megane RS Liquid Yellow', src: 'static/renault_megane_rs_yellow.jpg', expected: true },
    { name: 'Audi S3 Python Yellow', src: 'static/audi_s3_yellow.jpg', expected: true },
    { name: 'Mercedes AMG GT Solarbeam Yellow', src: 'static/mercedes_amg_gt_yellow.jpg', expected: true },
    { name: 'Jeep Wrangler Hellayella', src: 'static/jeep_wrangler_yellow.jpg', expected: true },
    { name: 'Toyota Supra Lightning Yellow', src: 'static/toyota_supra_yellow.jpg', expected: true },
    { name: 'Fiat 500 Vanilla Yellow', src: 'static/fiat_500_vanilla.jpg', expected: true },

    // Non-Yellows
    { name: 'Hyundai Kona Acid Yellow', src: 'static/hyundai_kona_acid_yellow.jpg', expected: false },
    { name: 'Copper Cupra Formentor', src: 'static/cupra_formentor_copper.jpg', expected: false },
    { name: 'Gold Lexus ES', src: 'static/lexus_es_gold.jpg', expected: false },
    { name: 'Mint Fiat 500', src: 'static/fiat_500_mint.jpg', expected: false },
    { name: 'Kia Stinger Neon Orange', src: 'static/kia_stinger_orange.jpeg', expected: false },
    { name: 'Ford Mustang Twister Orange', src: 'static/ford_mustang_orange.jpeg', expected: false },
    { name: 'McLaren 720S Papaya Spark (Orange)', src: 'static/mclaren_720s_orange.jpg', expected: false },
    { name: 'BMW M3 Zanzibar (Gold/Bronze)', src: 'static/bmw_m3_gold.jpg', expected: false },
    { name: 'Toyota Camry Bronze Oxide', src: 'static/toyota_camry_bronze.jpg', expected: false },
    { name: 'Aston Martin Lime Essence', src: 'static/aston_martin_lime.jpg', expected: false },
    { name: 'Lamborghini Huracan Verde Mantis', src: 'static/lamborghini_huracan_green.jpg', expected: false },
    { name: 'Mini Cooper Pepper White', src: 'static/mini_cooper_cream.jpg', expected: false },
    
    // New Cream/Beige Tests (Expected False)
    { name: 'VW Beetle Harvest Moon Beige', src: 'static/vw_beetle_beige.jpg', expected: false },
    { name: 'Porsche 911 Cream White', src: 'static/porsche_911_cream.png', expected: false },
    { name: 'Fiat 500 Cappuccino Beige', src: 'static/fiat_500_cappuccino.jpg', expected: false },
    { name: 'Toyota FJ Cruiser Sand', src: 'static/toyota_fj_sand.jpg', expected: false },
];

function imageToBase64(filePath) {
    // Check if file exists with different extension if not found
    if (!fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const base = filePath.slice(0, -ext.length);
        const alts = ['.jpg', '.jpeg', '.png', '.webp'];
        for (const alt of alts) {
            if (fs.existsSync(base + alt)) {
                return imageToBase64(base + alt);
            }
        }
        throw new Error(`File not found: ${filePath}`);
    }
    
    const img = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1) || 'jpeg';
    return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${img.toString('base64')}`;
}

async function runTest(test) {
    try {
        const imageBase64 = imageToBase64(test.src);
        const result = await callOracle(imageBase64);
        
        const passed = result.answer === test.expected;
        return {
            ...test,
            passed,
            oracleAnswer: result.answer,
            reason: result.reason
        };
    } catch (e) {
        return {
            ...test,
            passed: false,
            error: e.message
        };
    }
}

async function main() {
    console.log(`Running ${TESTS.length} tests against The Oracle...
`);
    
    let passedCount = 0;
    
    // Run sequentially or in parallel - parallel is faster
    const promises = TESTS.map(test => runTest(test));
    const results = await Promise.all(promises);
    
    for (const res of results) {
        if (res.passed) passedCount++;
        
        const status = res.passed ? "\x1b[32m[PASSED]\x1b[0m" : "\x1b[31m[FAILED]\x1b[0m";
        console.log(`${status} ${res.name}`);
        console.log(`  Expected: ${res.expected}, Got: ${res.oracleAnswer ?? 'Error'}`);
        if (res.reason) console.log(`  Reason: ${res.reason}`);
        if (res.error) console.log(`  Error: ${res.error}`);
        console.log('');
    }
    
    console.log(`Summary: ${passedCount}/${TESTS.length} passed.`);
}

main();
