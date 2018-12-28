/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as frida from 'frida';
import fs = require('fs');
import path = require('path');
import { Core } from './core';
import * as process from 'process';
import * as os from 'os';
import { IPA } from './ipa';
import { Shell } from './shell';
import * as util from './util';

export enum HammerMessageType {
    // result , called only once
    Succeed,
    Failed,

    // processing info
    Info,

    // special events
    AppPath, // string
    DumpItem, // {from: original-file, to: decrypted-file}
    DumpCompleted,
}
export declare type HammerMessage = (type: HammerMessageType, message: string, object: any) => void;
export class Hammer {
    // parameter
    public ipaPath?: string;

    // result
    public remoteAppPath?: string;
    public remoteDumpItems: any[] = [];

    // notifier
    public onMessage?: HammerMessage;

    // temp
    protected tmpDirPath?: string;
    protected tmpAppPath?: string;
    protected tmpIpaPath?: string;
    protected appDirName?: string;

    constructor() {}

    public async dumpApplicationInDevice(device: frida.Device, bundleID: string) {
        this.onInfo(`start dump bundle id: ${bundleID}`);

        try {
            const app = await Core.openApplication(device, bundleID);
            if (!app || !app.session) {
                return;
            }

            await this.dumpSession(app.session);
        } catch (e) {
            this.onFailed(`${e}`);
        }
    }

    protected readPayloadContent(): string | undefined {
        const jsPath = path.join(path.dirname(__dirname), 'payload.js');
        if (!fs.existsSync(jsPath) || !fs.lstatSync(jsPath).isFile()) {
            this.onFailed(`File payload.js not found : ${jsPath}`);
            return undefined;
        }
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        if (!jsContent) {
            this.onFailed(`Failed to read payload : ${jsPath}`);
            return undefined;
        }

        this.onInfo(`Read payload : ${jsPath}`);
        return jsContent.toString();
    }

    protected getACleanTmpDir() {
        this.tmpDirPath = path.join(os.tmpdir(), 'woza');
        if (fs.existsSync(this.tmpDirPath)) {
            util.rmdir(this.tmpDirPath);
        }
        fs.mkdirSync(this.tmpDirPath);
        this.onInfo(`tmp dir : ${this.tmpDirPath}`);
    }

    protected async dumpSession(session: frida.Session): Promise<void> {
        this.getACleanTmpDir();

        if (!this.ipaPath) {
            this.ipaPath = path.join(process.cwd(), 'output.ipa');
        }

        this.remoteAppPath = undefined;
        this.remoteDumpItems = [];

        const payloadContent = this.readPayloadContent();
        if (!payloadContent) {
            return;
        }

        const script: frida.Script = await session.createScript(payloadContent);
        script.message.connect((message: frida.Message, data: Buffer | null) => {
            if (message.type === frida.MessageType.Error) {
                this.onFailed(`Script error : ${message}`);
                return;
            }

            const msg = message as frida.SendMessage;
            if (msg.payload.dump) {
                const item = {
                    from: msg.payload.path,
                    to: msg.payload.dump,
                };
                this.remoteDumpItems.push(item);

                const info = `Dump from ${item.from} to ${item.to}`;
                this.onMsg(HammerMessageType.DumpItem, info, item);
            } else if (msg.payload.app) {
                this.remoteAppPath = msg.payload.app;

                this.onMsg(HammerMessageType.AppPath, `App path : ${this.remoteAppPath}`, this.remoteAppPath);
            } else if (msg.payload.done) {
                session.detach();

                this.onMsg(HammerMessageType.DumpCompleted, '', {});

                this.onDumpCompleted();
            }
        });
        await script.load();
        await script.post('dump');
    }

    protected async onDumpCompleted() {
        await this.copyApp();
        await this.copyDecryptedMacho();
        await this.genIpa();

        this.onSucceed();
    }

    protected async copyApp(): Promise<void> {
        this.onInfo(`start copy app`);

        if (!this.remoteAppPath) {
            throw new Error('No app path');
        }
        if (!this.tmpDirPath) {
            throw new Error('No tmp path');
        }
        this.appDirName = this.remoteAppPath.split('/').slice(-1)[0];
        if (!this.appDirName) {
            throw new Error('No app dir name');
        }
        this.tmpAppPath = path.join(this.tmpDirPath, this.appDirName);
        this.onInfo(`local app path is ${this.tmpAppPath}`);

        const shell = new Shell();
        shell.removeOnExist = true;
        await shell.getDirectory(this.remoteAppPath, this.tmpAppPath);

        fs.chmodSync(this.tmpAppPath, '755');

        this.onInfo(`succeed copy app : ${this.tmpAppPath}`);
    }

    protected fixPrivateVarPrefix(itemPath: string): string {
        const prefix = '/private';
        if (itemPath.startsWith(prefix)) {
            return itemPath.substring(prefix.length);
        }
        return itemPath;
    }
    protected async copyDecryptedMacho(): Promise<void> {
        this.onInfo(`start copy decrypted macho`);

        if (!this.remoteAppPath || !this.tmpAppPath) {
            return;
        }

        for (const item of this.remoteDumpItems) {
            const remoteOriginalPath: string = item.from;
            const remoteFilePath: string = item.to;

            const remoteRelativePath = this.fixPrivateVarPrefix(remoteOriginalPath).replace(this.remoteAppPath, '');
            const localFilePath = path.join(this.tmpAppPath, remoteRelativePath);

            this.onInfo(`get file from ${remoteFilePath} to ${localFilePath}`);

            const shell = new Shell();
            shell.removeOnExist = true;
            await shell.getFile(remoteFilePath, localFilePath);

            fs.chmodSync(localFilePath, '655');
        }

        this.onInfo(`succeed copy all decrypted machos`);
    }

    protected async genIpa(): Promise<void> {
        this.onInfo(`start generate ipa`);
        if (!this.tmpDirPath || !this.tmpAppPath || !this.ipaPath || !this.appDirName) {
            return;
        }

        this.tmpIpaPath = path.join(this.tmpDirPath, 'output.ipa');
        this.onInfo(`tmp ipa path : ${this.tmpIpaPath}`);

        const ipa = new IPA(this.tmpAppPath, this.tmpIpaPath);
        ipa.rootItemName = this.appDirName;
        ipa.makeIPA();

        // copy ipa to target
        fs.copyFileSync(this.tmpIpaPath, this.ipaPath);

        this.onInfo(`succeed generate ipa : ${this.ipaPath}`);
    }

    protected onSucceed() {
        this.onMsg(HammerMessageType.Succeed, 'Succeed', {});
    }
    protected onFailed(error: string) {
        this.onMsg(HammerMessageType.Failed, error, {});
    }
    protected onInfo(info: string) {
        this.onMsg(HammerMessageType.Info, info, {});
    }
    protected onMsg(type: HammerMessageType, message: string, object: any) {
        if (this.onMessage) {
            this.onMessage(type, message, object);
        }
    }
}
