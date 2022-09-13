import NdModBase from './models/NdModBase';
import NdModSprite from './models/NdModSprite';
import NdNodeBox from './classes/NdNodeBox';
import NdModAnchor from './models/NdModAnchor';
import {NdNumericArray2d} from '../@types/types';
import NdSprite from '../classes/NdSprite';
import Node from './Node';
import {alive} from "./decorators/alive";

type ImageNodeModel = NdModSprite & NdModAnchor & NdModBase
export default class Sprite extends Node<ImageNodeModel> {
    @alive
    export(date?: Date){
        if (!date) date = new Date
        if (this.data!.src.protectedValue) {
            return this.data!.src.protectedValue.export(date)
        }
    }
    @alive
    render(context:CanvasRenderingContext2D, time:Date) {
        if (this.data!.src.protectedValue) {
            Sprite.transformContext(this, context)
            const result = this.data!.src.protectedValue.export(time)
            if (result) {
                context.drawImage(result, 0, 0,
                    this.data!.size.protectedValue[0] === 'auto' ?
                        this.data!.src.protectedValue.width : this.data!.size.protectedValue[0],
                    this.data!.size.protectedValue[1] === 'auto' ?
                        this.data!.src.protectedValue.height : this.data!.size.protectedValue[1]
                )
            }

        }
        return context
    }

    @alive
    test(cursor: NdNumericArray2d){
        cursor = this.matrix.traceCursorToLocalSpace([...cursor], this)
        if (cursor[0] > 0 && cursor[0] < this.Box!.value.sprite.size[0]) {
            if (cursor[1] > 0 && cursor[1] < this.Box!.value.sprite.size[1]) {
                return this
            }
        }
        return false
    }

    protected Box?: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        const position = [...this.data!.position.protectedValue] as NdNumericArray2d
        const size = this.data!.size.protectedValue.map(
            (value: number | 'auto', key: number) => {
                if (value === 'auto') {
                    if (this.data!.src.protectedValue) {
                        return key === 0 ? this.data!.src.protectedValue.width : this.data!.src.protectedValue.height
                    } else return 0
                }
            }) as NdNumericArray2d
        Node.applyBoxAnchor(position, size[0], size[1], this.data!)
        return [position[0], position[1], size[0], size[1], 0, 0, 0, 0]
    })

    @alive
    pause() {
        if (this.data!.src.protectedValue instanceof NdSprite) {
            this.data!.src.protectedValue.pause()
        }
    }

    @alive
    play() {
        if (this.data!.src.protectedValue instanceof NdSprite) {
            this.data!.src.protectedValue.play()
        }
    }

    constructor(id: string) {
        super(id, {...new NdModSprite(), ...new NdModBase(), ...new NdModAnchor()});
        this.watch('src', () => {
            if (this.data!.src.protectedValue) {
                if (this.data!.src.protectedValue.loaded) {
                    this.Box!.purge()
                    this.matrixContainer.purge()
                } else {
                    this.data!.src.protectedValue.on('load', () => {
                        this.Box!.purge()
                        this.matrixContainer.purge()
                    })
                }
            }
        })
        this.watch('frames', () => {
            if (this.data!.src.protectedValue instanceof NdSprite) {
                this.data!.src.protectedValue.frames = this.data!.frames.protectedValue
            }
        })
        this.watch('fps', () => {
            if (this.data!.src.protectedValue instanceof NdSprite) {
                this.data!.src.protectedValue.fps = this.data!.fps.protectedValue
            }
        })
        this.watch('size', () => {
            this.Box!.purge()
            this.matrixContainer.purge()
            if (this.data!.src.protectedValue) this.data!.src.protectedValue.destroy()
            this.data!.src.set(false, this)
        })

    }
}