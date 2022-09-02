import NdModBase from './models/NdModBase';
import NdModAnchor from './models/NdModAnchor';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdNodeBox from './classes/NdNodeBox';
import NdTextBlock from '../classes/NdTextBlock';
import NdModText from './models/NdModText';
import {NdFontSpecialValues, NdNumericArray2d} from '../@types/types';
import Node from './Node';
import Nodas from '../../Nodas';
import {NdTextPartialProps} from './@types/types';
import nodasFonts from '../Services/NodasFonts';
import {alive} from "./decorators/alive";

type TextNodeModel = NdModText & NdModAnchor & NdModBase
export default class Text extends Node<TextNodeModel> {
    private textBlock?: NdTextBlock
    protected Assembler?: NdNodeAssembler = new NdNodeAssembler([
        {
            name: 'text',
            resolver: (context) => {
                this.textBlock!.render(context)
            }
        }
    ])

    protected Box?: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        let position = [...this.data!.position.protectedValue] as NdNumericArray2d
        const width = this.textBlock!.width,
            height = this.textBlock!.height

        Node.applyBoxAnchor(position, width, height, this.data!)
        return [position[0], position[1], width, height, 0, 0, 0, 0]
    });

    @alive
    protected render(context: CanvasRenderingContext2D) {
        const render = this.Assembler!.export(this)
        if (render) {
            Node.transformContext(this, context)
            context.drawImage(render, 0, 0)
        }
        return context
    }

    @alive
    protected test(cursor: NdNumericArray2d) {
        cursor = this.Matrix.value.traceCursorToLocalSpace([...cursor], this)
        if (
            cursor[0] < this.Box!.value.sprite.size[0] && cursor[0] > 0 &&
            cursor[1] < this.Box!.value.sprite.size[1] && cursor[1] > 0) {
            return this
        }
        return false
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

    constructor(id: string, app: Nodas) {
        super(id, {...new NdModText(), ...new NdModAnchor(), ...new NdModBase()}, app);
        this.textBlock = new NdTextBlock(this.data!.str.protectedValue)
        this.syncStylesToBlock()
        this.watch(['str', 'lineHeight', 'width', 'weight', 'style'], () => {
            this.Box!.purge()
            this.Matrix.purge()
        })
        this.watch('width', () => {
            if (typeof this.data!.width.protectedValue == 'number') {
                this.textBlock!.limit = this.data!.width.protectedValue
            } else {
                this.textBlock!.limit = Infinity
            }
        })
        this.watch(['str', 'lineHeight', 'weight', 'width', 'style'], () => {
            this.Assembler!.update()
            this.Assembler!.resize()
        })
        this.watch('font', () => {
            if (!Object.values(NdFontSpecialValues).includes(this.data!.font.protectedValue as NdFontSpecialValues)) {
                    const font = nodasFonts.get(this.data!.font.protectedValue)
                if (font) {
                    if (!font.loaded) {
                        font.once('load', () => {
                            this.Box!.purge()
                            this.Matrix.purge()
                            this.Assembler!.resize()
                            this.Assembler!.update('text')
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
}