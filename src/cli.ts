#!/usr/bin/env node
/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import { Core } from './core';
import { Hammer, HammerMessage, HammerMessageType } from './hammer';
const Table = require('easy-table');

class Startup {
    public static async listApps(): Promise<void> {
        const apps = await Core.getFirstDeviceApplicationList();
        console.log(`Found ${apps.length} apps`);
        if (apps.length === 0) {
            return;
        }

        const table = new Table();
        for (const app of apps) {
            table.cell('PID', `${app.pid}`);
            table.cell('Identifier', `${app.identifier}`);
            table.cell('Name', `${app.name}`);
            table.newRow();
        }
        console.log(table.toString());
    }

    public static async dumpApp(id: string, ipapath?: string): Promise<void> {
        const device = await Core.getFirstDevice();
        if (!device) {
            console.log('Found no device');
            return;
        }
        const hammer = new Hammer();
        if (ipapath) {
            hammer.ipaPath = ipapath;
        }
        hammer.onMessage = (type: HammerMessageType, message: string, object: any): void => {
            console.log(`${message}`);

            // if (type === HammerMessageType.DumpCompleted) {
            // console.log('---------BEGIN-----------------');
            // console.log(hammer.remoteAppPath);
            // console.log(hammer.remoteDumpItems);
            // console.log('---------END-------------------');
            // }
        };
        await hammer.dumpApplicationInDevice(device, id);
    }

    public static async main() {
        const process = require('process');

        const len = process.argv.length;
        if (len === 2) {
            this.listApps();
        } else if (len === 3) {
            if (
                process.argv[2] === '--help' ||
                process.argv[2] === '-h' ||
                process.argv[2] === '--bangzhu' ||
                process.argv[2] === '--jiuwo'
            ) {
                this.usage();
                return;
            }
            const bundleid = process.argv[2];
            this.dumpApp(bundleid);
        } else if (len === 4) {
            const bundleid = process.argv[2];
            const ipapath = process.argv[3];

            this.dumpApp(bundleid, ipapath);
        } else {
            this.usage();
        }
    }

    public static usage() {
        console.log('Usage:');
        console.log('  List applications : woza');
        console.log('  Dump application  : woza com.xxx.bundleid');
        console.log('                      woza com.xxx.bundleid ~/Desktop/xxx.ipa');
        console.log('  Help              : woza --help');
    }
}

Startup.main();
