import {NdColorStr, NdTextPartialProps} from '../Nodes/@types/types';
import {NdFontSpecialValues, NdFontStyles, NdFontWeights} from '../@types/types';
import NdNodeStylesModel from '../Nodes/classes/NdNodeStylesModel';
import NodasFonts from '../Services/NodasFonts';
import NdDestroyableNode from "../Nodes/classes/NdDestroyableNode";
import NdStateEvent from "./NdStateEvent";
import {alive} from "../Nodes/decorators/alive";

export default abstract class NdTextPartial extends NdDestroyableNode<NdTextPartialProps & {destroy:NdStateEvent<NdTextPartial>, destroyed:NdStateEvent<NdTextPartial>}> implements NdTextPartialProps {
    private textColor: NdColorStr = 'rgba(0,0,0,1)'
    private fWeight: NdFontWeights = 400
    private fSize: number = 14
    private lHeight: number = 14
    private fStyle: NdFontStyles = 'normal'
    private ndFont: string | NdFontSpecialValues = 'system'
    abstract readonly width: number
    abstract readonly string: string
    abstract readonly length: number
    abstract render(context: CanvasRenderingContext2D, xPos: number, yPos: number): void
    freeze: {
        [K in keyof NdTextPartialProps]?: boolean
    } = {}

    @alive
    onPossibleSizeChange(callback: () => any) {
        this.on(['font', 'fontSize', 'weight', 'style', 'lineHeight'], callback)
    }

    @alive
    get font() {
        return this.ndFont
    }

    set font(font) {
        if (!this.freeze.font) {
            if(this.ndFont !== font) {
                this.ndFont = font
                this.cast('font', font)
            }
        }
    }

    @alive
    get lineHeight() {
        return this.lHeight
    }


    set lineHeight(value) {
        if (!this.freeze.lineHeight) {
            if (value < 0) value = 0
            if(value !== this.lHeight) {
                this.lHeight = value
                this.cast('lineHeight', this.lHeight)
            }
        }
    }

    @alive
    get weight() {
        return this.fWeight
    }

    set weight(value) {
        if (!this.freeze.weight) {
            if(this.fWeight !== value) {
                this.fWeight = value
                this.cast('weight', value)
            }
        }
    }

    @alive
    get color() {

        return this.textColor
    }

    set color(value) {
        if (!this.freeze.color) {
            const normalized = NdNodeStylesModel.arrayToColor(NdNodeStylesModel.normalizeColor(
                NdNodeStylesModel.colorToArray(value)
            ))
            if(normalized !== this.textColor) {
                this.textColor = normalized
                this.cast('color', this.textColor)
            }
        }
    }

    @alive
    get style() {
        return this.fStyle
    }

    set style(value) {
        if (!this.freeze.style) {
            if(this.fStyle !==value) {
                this.fStyle = value
                this.cast('style', value)
            }
        }
    }

    @alive
    get fontSize() {
        return this.fSize
    }

    set fontSize(value) {
        if (!this.freeze.style) {
            if (value < 0) value = 0
            if(this.fSize !== value) {
                this.fSize = value
                this.cast('fontSize', this.fSize)
            }
        }
    }

    @alive
    fontString (){
        if ((Object.values(NdFontSpecialValues) as string[]).includes(this.ndFont)) {
            return this.ndFont === 'system' ? `${this.style} ${this.weight} ${this.fSize}px serif` : this.fSize + 'px ' + this.ndFont
        } else {
            const font = NodasFonts.get(this.ndFont)
            if (font) {
                return font.string(this.fStyle, this.fWeight, this.fSize, this.lineHeight)
            } else {
                return ''
            }
        }
    }

}