import {NdColorStr, NdTextPartialProps} from '../Nodes/@types/types';
import {NdFontSpecialValues, NdFontStyles, NdFontWeights} from '../@types/types';
import NdEmitter from './NdEmitter';
import NdNodeStylesModel from '../Nodes/classes/NdNodeStylesModel';
import NodasFonts from '../Services/NodasFonts';

export default abstract class NdTextPartial extends NdEmitter<NdTextPartialProps> implements NdTextPartialProps {
    private textColor: NdColorStr = 'rgba(0,0,0,1)'
    private fWeight: NdFontWeights = 400
    private fSize: number = 14
    private lHeight: number = 14
    private fStyle: NdFontStyles = 'normal'
    private ndFont: string | NdFontSpecialValues = 'system'
    abstract readonly width: number
    abstract readonly string: string
    abstract readonly length: number
    abstract readonly render: (context: CanvasRenderingContext2D, xPos: number, yPos: number) => void
    freeze: {
        [K in keyof NdTextPartialProps]?: boolean
    } = {}

    onPossibleSizeChange = (callback: () => any) => {
        this.on(['font', 'fontSize', 'weight', 'style', 'lineHeight'], callback)
    }

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

    readonly fontString = (): string => {
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