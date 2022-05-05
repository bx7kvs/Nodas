import Config from "../Config/Config";
import {ReflectFontDescription, ReflectFontFormats} from "./types";
export default class Fonts {
    private element = document.createElement('style');
    private families:ReflectFontDescription[] = [];
    private fontsDefined = false;
    private config: Config;
    private format: ReflectFontFormats[] = ['eot', 'svg', 'ttf', 'woff']
    private path:string = './fonts';
    private appName:string
    private formatStr = {
        eot: function (url: string):string {
            return 'url("' + url + '.eot?#iefix") format("embedded-opentype")';
        },
        woff: function (url: string):string {
            return 'url("' + url + '.woff") format("woff")';
        },
        ttf: function (url: string):string {
            return 'url("' + url + '.ttf") format("truetype")';
        },
        svg: function (url: string, font: string, style: string):string {
            return 'url("' + url + '.svg#' + font + '-' + (style.charAt(0).toUpperCase() + style.slice(1)) + '") format("svg")';
        }
    }
    private formatFont(font:string) {
        return `${this.appName}-${font}`
    }

    private getFontString(font: ReflectFontDescription): string {
        if (!this.fontsDefined) return '';
        let result = '';
        font.weight.forEach((weight) => {
            font.style.forEach((style) => {
                let filterString = `${this.config.get<string>('fontDir')}/${font.name}-${weight}-${style}`;
                let string = `@font-face {\n font-family:"${this.formatFont(font.name)}=${weight}";\n src:`;
                this.format.forEach((v, key) => {
                    string += this.formatStr[v](filterString, font.name, style);
                    if (key < this.format.length - 1) {
                        string += ','
                    } else {
                        string += ';'
                    }
                })
                string +=`font-weight: ${weight};`;
                string += `font-style: ${style}';}`;
                result += string;
            })
        })

        return result;
    }

    private update () {
        let string = '';
        this.families.forEach((v) => {
            string += this.getFontString(v);
        })
        this.element.innerHTML = string;
    }

    constructor(name:string, config: Config) {
        this.config = config
        this.appName = name
        document.getElementsByTagName('head')[0].appendChild(this.element);
        this.config.define<ReflectFontFormats[]>('fontFormats', this.format, {
            isArray: true, custom: (v) => {
                let result = true
                if (v instanceof Array) {
                    v.forEach((v) => {
                        if (!result) return
                        if (typeof v === "string") {
                            if (v !== 'eot' || v !== 'svg' || v !== 'ttf' || v !== 'woff') {
                                result = false;
                            }
                        }
                    })
                }

                return result;
            }
        }).watch((v) => {
            this.format = v;
            this.fontsDefined = true;
            this.update();
        })
        this.config.define<string>('fontDir', './fonts', {isString: true}).watch((v) => {
            this.path = v;
            this.update()
        });
    }
    public font(font:ReflectFontDescription) {
        if (!this.families.find((v) => v.name == font.name)) {
            this.families.push(font)
        }
        this.update()
    }
    public formats():ReflectFontFormats[] {
        return  [...this.format]
    }
}