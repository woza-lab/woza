/*
 * author: everettjf
 * site: https://everettjf.github.io
 * created: 2018-12-23
 */

/*
 * node-scp
 * <cam@onswipe.com>
 */
const exec = require('child_process').exec;

export class Scp {
    public static send(options: any, cb: any) {
        let command = [
            'scp',
            options.recursive === true ? '-r' : '',
            '-P',
            options.port === undefined ? '22' : options.port,
            options.file,
            (options.user === undefined ? '' : options.user + '@') + options.host + ':' + options.path,
        ];
        exec(command.join(' '), (err: any, stdout: any, stderr: any) => {
            if (cb) {
                cb(err, stdout, stderr);
            } else {
                if (err) {
                    throw new Error(err);
                }
            }
        });
    }

    /*
     * Grab a file from a remote host
     */
    public static get(options: any, cb: any) {
        let command = [
            'scp',
            options.recursive === true ? '-r' : '',
            '-P',
            options.port === undefined ? '22' : options.port,
            (options.user === undefined ? '' : options.user + '@') + options.host + ':' + options.file,
            options.path,
        ];
        exec(command.join(' '), (err: any, stdout: any, stderr: any) => {
            if (cb) {
                cb(err, stdout, stderr);
            } else {
                if (err) {
                    throw new Error(err);
                }
            }
        });
    }
}
