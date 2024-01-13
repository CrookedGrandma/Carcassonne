import * as fs from 'fs';
import { JSDOM } from 'jsdom';

const baseUrl = 'https://wikicarpedia.com';

const src = fs.readFileSync('data/src.html').toString();
const dom = new JSDOM(src);
const $: ((selector: string | HTMLElement) => JQuery) = require('jquery')(dom.window);


const images = $("a.image").children();
for (const image of images) {
    const i = $(image);
    i.attr("srcset", baseUrl + i.attr("srcset"));
}

fs.writeFileSync('data/src_fix.html', dom.window.document.body.innerHTML);

console.log('');
