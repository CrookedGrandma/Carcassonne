import * as fs from "fs";
import {parse} from "csv-parse/sync";
import {download} from "./util";

const csvBuffer = fs.readFileSync('data/src.csv');
const records: any[][] = parse(csvBuffer, { delimiter: ';' });

Promise.all(records.slice(1).map(r => download(r[3])))
    .then(() => {
        console.log('all downloads done');
    })
    .catch(e => {
        console.error(`error: ${e}`);
    });

console.log('');
