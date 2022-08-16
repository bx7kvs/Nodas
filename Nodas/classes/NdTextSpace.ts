import NdTextPartial from './NdTextPartial';
import {NdFontSpecialValues} from '../@types/types';
import nodasFonts from '../Services/NodasFonts';

export default class NdTextSpace extends NdTextPartial {
    private w: number = 0
    private context = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    private measured: boolean = false

    constructor() {
        super();
        this.on('font', () => {
            if(!Object.values(NdFontSpecialValues).includes(this.font as NdFontSpecialValues)) {
                const font = nodasFonts.get(this.font)
                if(font) {
                    if(!font.loaded) {
                        font.once('load', () => {
                            this.measured = false
                        })
                    }
                }
            }
        })
    }
    get length() {
        return 1
    }

    get string() {
        return ' '
    }

    render = () => {
    }
    forceRedraw() {
        this.measured = false
    }

    get width() {
        if (!this.measured) {
            this.context.font = this.fontString()
            this.w = this.context.measureText(' ').width
        }
        return this.w
    }
}