/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as fs from 'fs';
import { Shell } from './../shell';
import { rmdir } from './../util';

test('shell0', () => {
    expect(1).toBe(1);
});

// test('download-file', async done => {
//     // let remotefile = '/var/mobile/Containers/Data/Application/1992E5C6-FCF0-4A62-B249-85B8B8C45691/Documents/QVKeyboardApp.woza';
//     let remotefile = '/var/containers/Bundle/Application/701F8719-B9D5-4E8A-978A-44DE92FFF77A/Time.app/Time';
//     let localdir = '/Users/everettjf/Desktop/aaa.macho';

//     if (fs.existsSync(localdir)) {
//         fs.unlinkSync(localdir);
//     }

//     try {
//         const shell = new Shell();
//         await shell.getFile(remotefile, localdir);
//         done();
//     } catch (e) {
//         console.log(`Exception: ${e}`);
//     }
// });

// test('download-directory', async done => {
//     let remotefile = '/var/containers/Bundle/Application/701F8719-B9D5-4E8A-978A-44DE92FFF77A/Time.app';
//     let localdir = '/Users/everettjf/Desktop/xxx.app';

//     if (fs.existsSync(localdir)) {
//         rmdir(localdir);
//     }

//     try {
//         const shell = new Shell();
//         await shell.getDirectory(remotefile, localdir);
//         done();
//     } catch (e) {
//         console.log(e);
//     }
// });
