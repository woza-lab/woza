/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as fs from 'fs';
import { IPA } from './../ipa';

test('ipa0', () => {
    expect(1).toBe(1);
});

// test('ipa', () => {
//     let apppath = '/Users/everettjf/Desktop/xxx.app';
//     let ipapath = '/Users/everettjf/Desktop/xxx.ipa';

//     if (fs.existsSync(ipapath)) {
//         fs.unlinkSync(ipapath);
//     }

//     const ipa = new IPA(apppath, ipapath);
//     ipa.makeIPA();
// });
