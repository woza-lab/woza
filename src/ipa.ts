/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as fs from 'fs';
const AdmZip = require('adm-zip');

export class IPA {
    public rootItemName: string = '/';

    private appPath: string;
    private ipaPath: string;

    constructor(appPath: string, ipaPath: string) {
        this.appPath = appPath;
        this.ipaPath = ipaPath;
    }

    public makeIPA(): void {
        if (fs.existsSync(this.ipaPath)) {
            throw new Error(`file existed : ${this.ipaPath}`);
        }

        const zip = new AdmZip();
        zip.addLocalFolder(this.appPath, this.rootItemName);
        zip.writeZip(this.ipaPath);

        if (!fs.existsSync(this.ipaPath)) {
            throw new Error(`why not existed : ${this.ipaPath}`);
        }
    }
}
