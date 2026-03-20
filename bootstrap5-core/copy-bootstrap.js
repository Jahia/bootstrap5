/**
 * Copies Bootstrap dist assets from node_modules into the Jahia resource directories.
 *
 * Called automatically by npm via the "postinstall" script after `npm install`.
 * The Maven build (frontend-maven-plugin) triggers `npm install`, which in turn
 * runs this script so the files are present before the OSGi bundle is assembled.
 *
 * Source:      node_modules/bootstrap/dist/css/  ->  src/main/resources/css/
 *              node_modules/bootstrap/dist/js/   ->  src/main/resources/javascript/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const root   = __dirname;
const srcCss = path.join(root, 'node_modules', 'bootstrap', 'dist', 'css');
const srcJs  = path.join(root, 'node_modules', 'bootstrap', 'dist', 'js');
const dstCss = path.join(root, 'src', 'main', 'resources', 'css');
const dstJs  = path.join(root, 'src', 'main', 'resources', 'javascript');

function copyDir(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    const files = fs.readdirSync(src);
    for (const file of files) {
        fs.copyFileSync(path.join(src, file), path.join(dst, file));
    }
    console.log(`[copy-bootstrap] ${files.length} files  ${src} -> ${dst}`);
}

copyDir(srcCss, dstCss);
copyDir(srcJs,  dstJs);
