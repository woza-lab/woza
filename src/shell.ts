/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as fs from 'fs';
import * as util from './util';
import { Scp } from './scp';

export class Shell {
    public host: string = 'localhost';
    public port: number = 2222;
    public user: string = 'root';
    public password?: string;

    public removeOnExist: boolean = false;

    constructor() {}

    public getFile(remotePath: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve: any, reject: any) => {
            if (fs.existsSync(localPath)) {
                if (!this.removeOnExist) {
                    reject(new Error(`local file existed : ${localPath}`));
                    return;
                }

                fs.unlinkSync(localPath);
            }

            let options: any = {
                file: remotePath,
                path: localPath,
                host: this.host,
                port: this.port,
                user: this.user,
            };
            if (this.password) {
                options.password = this.password;
            }

            Scp.get(options, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    public getDirectory(remotePath: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (fs.existsSync(localPath)) {
                if (!this.removeOnExist) {
                    reject(new Error(`local directory existed : ${localPath}`));
                    return;
                }

                util.rmdir(localPath);
            }

            let options: any = {
                file: remotePath,
                path: localPath,
                host: this.host,
                port: this.port,
                user: this.user,
                recursive: true,
            };
            if (this.password) {
                options.password = this.password;
            }

            Scp.get(options, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
