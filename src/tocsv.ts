import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import {TileDescriptorRemote} from "./types";

const baseUrl = 'https://wikicarpedia.com';

const src = fs.readFileSync('data/src.html').toString();
const dom = new JSDOM(src);
const $: ((selector: string | HTMLElement) => JQuery) = require('jquery')(dom.window);


const tables = $('table.wikitable');
const rows = tables.find('tr')
    .filter((_, r) => r.style.display != 'none'
        && !!r.id);

const tiles: TileDescriptorRemote[] = [];
rows.each((_, r) => {
    const row = $(r);
    const edges = row.parents('table').siblings('h6').children('span.mw-headline').attr('id')?.substring(0, 4) ?? '';
    const td = row.children('td').filter((_, d) => d.align != 'center' && d.style.textAlign != 'center');
    const divs = td.find('div').filter((_, d) => d.id.includes('Tile'));
    divs.each((_, d) => {
        const div = $(d);
        const count = parseInt(div.find('span#_Tile_Counter_').text());
        const imageUrl = baseUrl + div.find('img').attr('srcset')?.replace(' 1.5x', '');
        const sectionDiv = div.parents('div').filter((_, d) => d.id.startsWith('section'));
        const typeId = sectionDiv.children('h5').children('span.mw-headline').attr('id') ?? '';
        tiles.push({
            edges,
            count,
            imageUrl,
            river: typeId.includes('River'),
            startTile: typeId.includes('Start')
        });
    });
});

const lines: string[] = [];
const tileProperties: (keyof TileDescriptorRemote)[] = ['edges', 'count', 'imageUrl', 'river', 'startTile'];
lines.push('id;' + tileProperties.join(';'));
tiles.forEach((tile, i) => {
    lines.push(`${i};` + tileProperties.map(p => tile[p]).join(';'));
});
const text = lines.join('\n');

fs.writeFileSync('data/src.csv', text);

console.log('');
