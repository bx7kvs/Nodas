import NdFont from '../classes/NdFont';
import {NdFontDescription, NdFontFormats, NdFontSpecialValues} from '../@types/types';
import {NDB} from './NodasDebug';

class NodasFonts {
    private fonts: { [key: string]: NdFont } = {}
    private fontRootPath: string = './fonts';
    private format: NdFontFormats[] = ['eot', 'svg', 'ttf', 'woff']

    get root() {
        return this.fontRootPath
    }

    set root(value) {
        this.fontRootPath = value;
    }

    get formats() {
        return [...this.format]
    }

    set formats(value) {
        this.format = value;
    }

    public add(font: NdFontDescription) {
        if (!this.fonts[font.name]) {
            if ((Object.values(NdFontSpecialValues) as string[]).includes(font.name)) {
                NDB.warn(
                    `You are not allowed to load fonts with names equal to system values [${Object.values(NdFontSpecialValues)}]. 
                    Ignored.`)
            } else {
                this.fonts[font.name] = new NdFont(this.root, this.format, font)
                NDB.positive(`Font ${font.name} registered.`)
            }

        } else {
            NDB.positive(`Font [${font.name}] already registered. Skip..`)
        }
        return this.fonts[font.name]
    }

    public get(name: string) {
        return this.fonts[name] ? this.fonts[name] : null
    }
}

export default new NodasFonts