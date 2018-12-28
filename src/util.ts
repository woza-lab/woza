/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as fs from 'fs';

export function rmdir(path: string) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        for (let file of files) {
            let curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                rmdir(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        }
        fs.rmdirSync(path);
    }
}
