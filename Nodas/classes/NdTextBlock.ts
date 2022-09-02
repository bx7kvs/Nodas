import NdTextPartial from './NdTextPartial';
import NdTextWord from './NdTextWord';
import {NdTagRegExpMatch, NdTextPartialProps} from '../Nodes/@types/types';
import NdTextSpace from './NdTextSpace';
import {NdFontSpecialValues} from '../@types/types';
import nodasFonts from '../Services/NodasFonts';
import {alive} from "../Nodes/decorators/alive";
import {TAGPATTERN, WORDPATTERN} from "../../constants";

export default class NdTextBlock extends NdTextPartial {
    private str: string = ''
    private l: number = Infinity
    private w: number = 0
    private h: number = 0
    private updated: boolean = true
    private words?: NdTextPartial[] = []


    constructor(str: string) {
        super();
        this.string = str
        this.bindWordsStyles()
        this.once('destroyed', () => {
            this.words!.forEach(v => v.destroy())
            this.words = undefined
        })
        this.on('font', () => {
            if (!this.destroyed) {
                if (!Object.values(NdFontSpecialValues).includes(this.font as NdFontSpecialValues)) {
                    const font = nodasFonts.get(this.font)
                    if (font) {
                        if (!font.loaded) {
                            font.once('load', () => {
                                this.updated = true
                            })
                        }
                    }
                }
            }
        })
    }

    @alive
    private updateSize() {
        this.w = Math.ceil(this.words!.reduce<number>((acc, word) => {
            return acc + word.width
        }, 0))
        this.w = this.l < this.w ? this.l : this.w
        if (this.w === 0) this.w = 1
        let x = 0,
            h = this.lineHeight,
            lines: number[] = [];
        this.words!.forEach((word, k) => {
            if (x + word.width > this.w) {
                h += this.lineHeight
                lines.push(x)
                x = 0
            }
            x += word.width
            if (k == this.words!.length - 1 && x !== 0) lines.push(x)
        })
        let maxLine = Math.max.apply(null, lines)
        if (maxLine < this.w) this.w = maxLine;
        this.h = Math.ceil(h)
        if (this.h === 0) this.h = 1
        this.updated = false
    }

    @alive
    private bindWordsStyles() {
        (['weight', 'style', 'color', 'font', 'fontSize', 'lineHeight'] as (keyof NdTextPartialProps)[]).forEach(prop => {
            this.on(prop, () => {
                this.words!.forEach(w => {
                    w[prop] = <never>this[prop]
                })
            })
        })
    }

    @alive
    private split(str: string = this.str, styles: NdTextPartialProps = {
        font: this.font,
        weight: this.weight,
        fontSize: this.fontSize,
        lineHeight: this.lineHeight,
        style: this.style,
        color: this.color
    }, frozen: { [K in keyof NdTextPartialProps]?: boolean } = {}, wordIndex = 0) {
        TAGPATTERN.lastIndex = 0
        let result: NdTextPartial[] = [];
        let currentMatch: NdTagRegExpMatch | null = null,
            currentWordIndex = wordIndex
        while (currentMatch = TAGPATTERN.exec(str) as NdTagRegExpMatch | null) {
            if (currentMatch.index === TAGPATTERN.lastIndex) {
                TAGPATTERN.lastIndex++;
            }
            TAGPATTERN.lastIndex = 0
            if (currentMatch.index) {
                const preMatchWords = str.substring(0, currentMatch.index).match(WORDPATTERN)
                if (preMatchWords) {
                    preMatchWords.forEach((v) => {
                        if (this.words![currentWordIndex]) {
                            this.words![currentWordIndex].freeze = {}
                            result.push(NdTextBlock.applyStylesToText(this.words![currentWordIndex], styles));
                            (<NdTextWord>result[currentWordIndex]).string = v
                        } else {
                            result.push(NdTextBlock.applyStylesToText(new NdTextWord(v), styles))
                        }
                        result[result.length - 1].freeze = {...frozen}
                        currentWordIndex++
                        if (this.words![currentWordIndex]) {
                            this.words![currentWordIndex].freeze = {}
                            result.push(NdTextBlock.applyStylesToText(this.words![currentWordIndex], styles))
                        } else {
                            result.push(NdTextBlock.applyStylesToText(new NdTextSpace(), styles))
                        }
                        result[result.length - 1].freeze = {...frozen}
                        currentWordIndex++
                    })
                }
            }
            if (currentMatch.groups.content) {
                result = [...result, ...this.split(
                    currentMatch.groups.content,
                    {
                        ...styles,
                        weight: currentMatch.groups.tagname === 'b' ? 'bold' : styles.weight,
                        color: currentMatch.groups.tagname === 'c' && currentMatch.groups.value ? currentMatch.groups.value : styles.color,
                        style: currentMatch.groups.tagname === 'i' ? 'italic' : styles.style
                    },
                    {
                        weight: currentMatch.groups.tagname === 'b' || frozen.weight,
                        color: currentMatch.groups.tagname === 'c' || frozen.color,
                        style: currentMatch.groups.tagname === 'i' || frozen.style
                    },
                    result.length
                )]
                currentWordIndex = result.length
            }
            str = str.slice(currentMatch.index + currentMatch[0].length)
        }
        if (str.length) {
            const words = str.match(WORDPATTERN)
            if (words) {
                words.forEach((v) => {
                    const word = this.words![currentWordIndex] ? this.words![currentWordIndex] :
                        new NdTextWord(v);

                    (<NdTextWord>word).freeze = {};
                    NdTextBlock.applyStylesToText(word, styles);
                    (<NdTextWord>word).string = v
                    word.freeze = {...frozen}
                    result.push(word)
                    currentWordIndex++

                    const space = this.words![currentWordIndex] ? NdTextBlock.applyStylesToText(this.words![currentWordIndex], styles) :
                        NdTextBlock.applyStylesToText(new NdTextSpace(), styles)
                    space.freeze = {...this.freeze}
                    result.push(space)
                    currentWordIndex++
                })
            }
        }
        return result
    }

    @alive
    get length() {
        return this.str.length
    }

    @alive
    get width() {
        if (this.updated) this.updateSize()
        return this.l < this.w ? this.l : this.w
    }

    @alive
    get limit() {
        return this.l
    }

    set limit(value) {
        this.l = value
        this.updated = true
    }

    @alive
    get height() {
        if (this.updated) this.updateSize()
        return this.h
    }

    @alive
    get string() {
        return this.str
    }

    set string(value) {
        if (value !== this.str) {
            this.str = value
            const words = this.split()
            words.pop() //pop last space symbol
            this.words = words
            this.updated = true
        }
    }


    export() {
    } //TODO:Text Block Caching

    @alive
    render(context: CanvasRenderingContext2D) {
        let x = 0, y = 0,
            limit = this.width

        this.words!.forEach((word) => {
            if (!word.destroyed) {
                if (x + word.width > limit) {
                    y += this.lineHeight
                    x = 0
                }
                if (!(word instanceof NdTextSpace && x === 0)) {
                    word.render(context, x, y)
                    x += word.width
                }
            }
        })
    }


    static applyStylesToText(symbol: NdTextPartial, styles: Partial<NdTextPartialProps>) {
        Object.assign(symbol, styles)
        return symbol
    }
}