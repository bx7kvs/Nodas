import NdResource from './NdResource';
import {NdFontDescription, NdFontFormats, NdFontStyles, NdFontWeights} from '../@types/types';
import {NdURLStr} from '../Nodes/@types/types';
import {NDB} from '../Services/NodasDebug';
import {alive} from "../Nodes/decorators/alive";
import NdEvent from "./NdEvent";

export default class NdFont extends NdResource<HTMLCanvasElement> {

    private context ? = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    private styles ? = document.createElement('style')
    private str: string[]
    private scheme: NdFontDescription
    private fontMaxLoadTime = 10000
    private fontLoadStart: number = 0
    private fontMeasureBuffer: number[][] = []

    private loadFont(onLoad: () => any, onError: () => any) {
        const checkResultBuffer = this.scheme.weight.map(weight => {
            return this.scheme.style.map(style => {
                return this.measureFont(style, weight)
            })
        })
        let result = true
        for (let w = 0; w < this.scheme.weight.length; w++) {
            for (let s = 0; s < this.scheme.style.length; s++) {
                if (checkResultBuffer[w][s] === this.fontMeasureBuffer[w][s]) {
                    result = false
                    break
                }
            }
            if (!result) break
        }
        if (result) {
            onLoad()
        } else if (new Date().getTime() - this.fontLoadStart > this.fontMaxLoadTime) {
            NDB.negative(`Gave up trying to load ${this.name}. Timeout.`)
            onError()
        } else {
            setTimeout(() => this.loadFont(onLoad, onError), 500)
        }
    }

    @alive
    private measureFont(style: NdFontStyles, weight: NdFontWeights, customFamily?: string): number {
        this.context!.font = customFamily ? `${style} ${NdFont.extractNumericWeight(weight)} 12px/12px "${customFamily}"` : this.string(style, NdFont.extractNumericWeight(weight), 12)
        return this.context!.measureText(NdFont.CONSTFONTCHECKSTRING).width
    }

    @alive
    private initMeasureBuffer() {
        this.fontLoadStart = new Date().getTime()
        this.fontMeasureBuffer = this.scheme.weight.map(weight => {
            return this.scheme.style.map(style => {
                return this.measureFont(style, weight, 'sans-serif')
            })
        })
    }

    private formatStr = {
        eot: function (url: string): string {
            return 'url("' + url + '.eot?#iefix") format("embedded-opentype")';
        },
        woff: function (url: string): string {
            return 'url("' + url + '.woff") format("woff")';
        },
        ttf: function (url: string): string {
            return 'url("' + url + '.ttf") format("truetype")';
        },
        svg: function (url: string, font: string, style: string): string {
            return 'url("' + url + '.svg#' + font + '-' + (style.charAt(0).toUpperCase() + style.slice(1)) + '") format("svg")';
        }
    }

    get name() {
        return this.scheme.name
    }


    @alive
    string(style: NdFontStyles, weight: NdFontWeights, size: number, lineHeight = size) {
        return `${style} ${NdFont.extractNumericWeight(weight)} ${size}px/${lineHeight}px "${this.scheme.name}"`
    }

    export = () => {
        return this.context!.canvas
    }

    constructor(root?: string, format?: NdFontFormats[], scheme?: NdFontDescription) {
        super(`\\${scheme ? scheme.name : 'default'}.font` as NdURLStr, () => {
            if (format && scheme) {
                this.initMeasureBuffer()
                this.loadFont(() => {
                    NDB.positive(`Font ${this.name} loaded`)
                    this.cast('load', new NdEvent(this, null))
                }, () => {
                    NDB.negative(`Unable to load font ${this.name}`)
                    this.cast('error', new NdEvent(this, null))
                })
                this.styles!.innerHTML = this.str.reduce<string>((result, current) => result + current, '')
                document.head.appendChild(this.styles!)
                return this
            } else {
                NDB.positive(`Font ${this.url} loaded`)
                this.cast('load', new NdEvent(this, null))
                return this
            }
        })
        if (format && scheme) {
            this.scheme = scheme
            this.str = scheme.weight.map<string>((weight) => {
                return scheme.style.reduce<string>((styleStr, style) => {
                    return styleStr + `@font-face {\n font-family:"${scheme.name}";\n src:` +
                        format.reduce<string>(
                            (formatStr, formatExt, fIndex) => {
                                return formatStr + this.formatStr[formatExt](`${root}/${scheme.name}-${weight}-${style}`, scheme.name, style) + (
                                    (fIndex < format.length - 1) ? ',\n' : ';')
                            }, '') + `\nfont-weight: ${NdFont.extractNumericWeight(weight)};\nfont-style: ${style};\n}\n`
                }, '')
            }, '')
        } else {
            this.str = []
            this.scheme = {name: 'default', weight: [], style: []}
        }
    }

    static extractNumericWeight(word: NdFontWeights) {
        if (word === 'normal') return 400
        if (word === 'black') return 900
        if (word === 'light') return 300
        if (word === 'bold') return 600
        else return word
    }

    static readonly CONSTFONTCHECKSTRING = 'abcdefghijklmnopqrstuvwxyz 1234567890[!?,.<>"£$%^&*()~@#-=]'
}