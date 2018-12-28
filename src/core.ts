/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

import * as frida from 'frida';
import fs = require('fs');
import path = require('path');

export interface IOpenApplicationResult {
    session: frida.Session;
    pid: number;
    name: string | undefined;
}

export class Core {
    public static async getDeviceList(): Promise<frida.Device[]> {
        let results: frida.Device[] = [];
        const deviceManager = frida.getDeviceManager();
        const devices = await deviceManager.enumerateDevices();
        for (const device of devices) {
            if (device.type === 'usb') {
                results.push(device);
            }
        }
        return results;
    }

    public static async getApplicationList(device: frida.Device): Promise<frida.Application[]> {
        return await device.enumerateApplications();
    }

    public static async getFirstDevice(): Promise<frida.Device | null> {
        const deviceManager = frida.getDeviceManager();
        const devices = await deviceManager.enumerateDevices();
        for (const device of devices) {
            if (device.type === 'usb') {
                return device;
            }
        }
        return null;
    }

    public static async getFirstDeviceApplicationList(): Promise<frida.Application[]> {
        const device = await Core.getFirstDevice();
        if (!device) {
            return [];
        }
        return device.enumerateApplications();
    }

    public static async openApplication(device: frida.Device, bundleID: string): Promise<IOpenApplicationResult> {
        const apps = await device.enumerateApplications();
        let targetPid = 0;
        let targetName: string | undefined;
        for (const app of apps) {
            if (app.identifier === bundleID) {
                targetPid = app.pid;
                targetName = app.name;
                break;
            }
        }

        let session: frida.Session;
        if (targetPid === 0) {
            // app is not running, start app
            targetPid = await device.spawn(bundleID);
            if (targetPid === 0) {
                throw new Error(`Can not run app : ${bundleID}`);
            }

            session = await device.attach(targetPid);
            await device.resume(targetPid);
        } else {
            // app is running , attach
            // console.log(`found process id: ${targetPid}`);
            session = await device.attach(targetPid);
        }

        if (!session) {
            throw new Error('Failed to attach to process');
        }

        return { session: session, pid: targetPid, name: targetName };
    }
}
