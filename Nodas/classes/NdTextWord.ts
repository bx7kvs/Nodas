import NdTextPartial from './NdTextPartial';
import {NdFontSpecialValues} from '../@types/types';
import nodasFonts from '../Services/NodasFonts';
import {alive} from "../Nodes/decorators/alive";

export default class NdTextWord extends NdTextPartial {
    private str: string = ''
    private context? = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    private w: number = 0
    private resizeFlag: boolean = true
    private redrawFlag: boolean = true


    @alive
    private resize(){
        this.context!.font = this.fontString()
        const w = Math.ceil(this.context!.measureText(this.str).width)
        if(w !== this.w) {
            this.context!.canvas.width = w
            this.w = w
        }
        if(this.context!.canvas.height !== this.lineHeight) this.context!.canvas.height = this.lineHeight
        this.resizeFlag = false
    }

    @alive
    private redraw() {
        this.context!.clearRect(0, 0, this.context!.canvas.width, this.context!.canvas.height)
        this.context!.textBaseline = 'middle'
        this.context!.fillStyle = this.color
        this.context!.font = this.fontString()
        this.context!.fillText(this.str, 0, this.lineHeight / 2)
        this.redrawFlag = false
    }

    @alive
    get width() {
        if (this.resizeFlag) this.resize()
        return this.w
    }

    @alive
    get length() {
        return this.str.length
    }

    @alive
    get string() {
        return this.str
    }

    set string(value) {
        value = value.trim()
        if (this.str !== value) {
            this.resizeFlag = true
            this.redrawFlag = true
            this.str = value
        }
    }

    @alive
    render(context: CanvasRenderingContext2D, x: number, y: number){
        if (this.resizeFlag) this.resize()
        if (this.redrawFlag) this.redraw()
        context.drawImage(this.context!.canvas, x, y)
    }

    constructor(str: string) {
        super();
        this.string = str
        this.once('destroyed',() => this.context = undefined)
        this.on('font', () => {
            if(!Object.values(NdFontSpecialValues).includes(this.font as NdFontSpecialValues)) {
                const font = nodasFonts.get(this.font)
                if(font) {
                    if(!font.loaded) {
                        font.once('load', () => {
                            this.resizeFlag = true
                            this.redrawFlag = true
                        })
                    }
                }
            }
        })
        this.onPossibleSizeChange(() => {
            this.resizeFlag = true
            this.redrawFlag = true
        })
        this.on('color', () => {
            this.redrawFlag = true
        })

    }

}