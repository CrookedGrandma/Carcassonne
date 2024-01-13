import fs from "fs";
import {parse} from "csv-parse/sync";
import {stringify} from "csv-stringify/sync";

const csvBuffer = fs.readFileSync('data/src.csv');
const records: any[][] = parse(csvBuffer, { delimiter: ';' });

records[0][3] = "imageName";
records.slice(1).forEach(r => {
    r[3] = (r[3] as string).split('/').slice(-1)[0];
});

const output = stringify(records, { delimiter: ';' });
fs.writeFileSync('data/src_fix.csv', output);
