import NdModBase from './models/NdModBase';
import NdModAnchor from './models/NdModAnchor';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdNodeBox from './classes/NdNodeBox';
import NdTextBlock from '../classes/NdTextBlock';
import NdModText from './models/NdModText';
import {NdFontSpecialValues, NdNumericArray2d} from '../@types/types';
import Node from './Node';
import {NdTextPartialProps} from './@types/types';
import nodasFonts from '../Services/NodasFonts';
import {alive} from "./decorators/alive";

type TextNodeModel = NdModText & NdModAnchor & NdModBase
export default class Text extends Node<TextNodeModel> {
    private textBlock?: NdTextBlock
    protected assembler?: NdNodeAssembler = new NdNodeAssembler([
        {
            name: 'text',
            resolver: (context) => {
                this.textBlock!.render(context)
            }
        }
    ])

    protected Box?: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        let position = [...this.data!.position.protectedValue] as NdNumericArray2d
        const width = this.textBlock!.width,
            height = this.textBlock!.height

        Node.applyBoxAnchor(position, width, height, this.data!)
        return [position[0], position[1], width, height, 0, 0, 0, 0]
    });

    constructor(id: string) {
        super(id, {...new NdModText(), ...new NdModAnchor(), ...new NdModBase()});
        this.textBlock = new NdTextBlock(this.data!.str.protectedValue)
        this.syncStylesToBlock()
        this.watch(['str', 'lineHeight', 'width', 'weight', 'style'], () => {
            this.Box!.purge()
            this.matrixContainer.purge()
        })
        this.watch('width', () => {
            if (typeof this.data!.width.protectedValue == 'number') {
                this.textBlock!.limit = this.data!.width.protectedValue
            } else {
                this.textBlock!.limit = Infinity
            }
        })
        this.watch(['str', 'lineHeight', 'weight', 'width', 'style'], () => {
            this.assembler!.update()
            this.assembler!.resize()
        })
        this.watch('font', () => {
            if (!Object.values(NdFontSpecialValues).includes(this.data!.font.protectedValue as NdFontSpecialValues)) {
                const font = nodasFonts.get(this.data!.font.protectedValue)
                if (font) {
                    if (!font.loaded) {
                        font.once('load', () => {
                            this.Box!.purge()
                            this.matrixContainer.purge()
                            this.assembler!.resize()
                            this.assembler!.update('text')
                        })
                        font.load()
                    }
                }
            }
        })
        this.once('destroyed', () => {
            this.textBlock = this.textBlock!.destroy()
        })
    }

    @alive
    protected render(context: CanvasRenderingContext2D) {
        const render = this.assembler!.export(this)
        if (render) {
            Node.transformContext(this, context)
            context.drawImage(render, 0, 0)
        }
        return context
    }

    @alive
    private syncStylesToBlock() {
        this.textBlock!.font = this.data!.font.protectedValue
        this.textBlock!.color = this.data!.color.protectedValue
        this.textBlock!.lineHeight = this.data!.lineHeight.protectedValue
        this.textBlock!.style = this.data!.style.protectedValue
        this.textBlock!.weight = this.data!.weight.protectedValue
        this.bindProps(['font', 'style', 'weight', 'fontSize', 'lineHeight', 'color'])
        this.watch('str', () => {
            this.textBlock!.string = this.data!.str.protectedValue
        })
    }

    @alive
    private bindProps(prop: (keyof NdTextPartialProps)[]) {
        prop.forEach((v) => {
            this.watch(v, () => {
                this.textBlock![v] = <never>this.data![v].protectedValue
            })
        })
    }

    @alive
    export() {
        return this.textBlock!.export()
    }

    @alive
    protected test(cursor: NdNumericArray2d) {
        cursor = this.matrixContainer.value.traceCursorToLocalSpace([...cursor], this)
        if (
            cursor[0] < this.Box!.value.sprite.size[0] && cursor[0] > 0 &&
            cursor[1] < this.Box!.value.sprite.size[1] && cursor[1] > 0) {
            return this
        }
        return false
    }
}