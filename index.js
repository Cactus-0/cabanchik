// @ts-check

const os = require('os');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

if (os.platform() !== 'win32') {
    console.log(`Cannot start cabanchik.exe on platform "${os.platform()}". Please install windows`);
    process.exit(1);
}

const url = 'https://youtu.be/lxWkk1bvOPE';
const source = './source.mp4';

function loadFromYoutube() {
    return new Promise((resolve, reject) => {
        ytdl(url)
            .on('error', () => {
                fs.rmSync(source);
                reject();
            })
            .pipe(fs.createWriteStream(source))
            .on('finish', resolve)
            .on('close', resolve);
    });
}

function copy(from, to) {
    return new Promise(resolve => {
        fs.createReadStream(from)
            .pipe(fs.createWriteStream(to))
            .on('finish', resolve);
    });
}

function* getAllDirs(start = './') {
    const dirs = fs.readdirSync(start, { encoding: 'utf-8' })
        .filter(object => {
            try {
                return fs.statSync(path.join(start, object)).isDirectory();
            } catch {
                return false;
            }
        });

    for (let dir of dirs) {
        dir = path.join(start, dir);
        yield dir;
        for (const sd of getAllDirs(dir))
            yield sd;
    }

    return;
}

async function main() {
    while (true) {
        try {
            console.log('loading кабанчик...');
            await loadFromYoutube();
            console.log('кабанчик loaded, writing files');
            break;
        } catch {
            console.log('loading failed');
            continue;
        }
    }
    
    for (const dir of getAllDirs('./')) {
        console.log(`writing кабанчик into ${dir}`);
        await copy(source, path.join(dir, 'кабанчик.mp4')).catch(() => console.log('failed. skipped.'));
    }
}

main().then(() => process.exit(0));
