import NdModAnchor from './models/NdModAnchor';
import NdModBase from './models/NdModBase';
import NdNodeAssembler from './classes/NdNodeAssembler';
import NdNodeBox from './classes/NdNodeBox';
import NdModSize from './models/NdModSize';
import NdModRect from './models/NdModRect';
import {NdColorStr, NdPathBezier, NdSegmentBezier, NdStrokeWidthBox} from './@types/types';
import NdModBg from './models/NdModBg';
import {NdNumericArray2d} from '../@types/types';
import Node from './Node';
import Nodas from '../../Nodas';
import {alive} from "./decorators/alive";

type RectNodeModel = NdModRect & NdModSize & NdModAnchor & NdModBg & NdModBase
export default class Rectangle extends Node<RectNodeModel> {
    private strokeFix: [number, number, number, number]
    private readonly path: () => NdPathBezier
    private readonly purgePath: () => void

    protected Box?: NdNodeBox = new NdNodeBox(this, this.cache, () => {
        const position = [...this.data!.position.protectedValue] as NdNumericArray2d
        Node.applyBoxAnchor(position, this.data!.size.protectedValue[0], this.data!.size.protectedValue[1], this.data!)
        return [position[0], position[1], this.data!.size.protectedValue[0], this.data!.size.protectedValue[1], this.strokeFix[0], this.strokeFix[1], this.strokeFix[2], this.strokeFix[3]]
    });
    protected assembler?: NdNodeAssembler = new NdNodeAssembler([
        {
            name: 'fill',
            resolver: (context) => {
                context.translate(this.strokeFix[3], this.strokeFix[0])
                Rectangle.registerPath(this.path(), context, true)
                context.fillStyle = this.data!.fill.protectedValue
                context.fill()
            }
        },
        {
            name: 'bg',
            resolver: (context) => {
                if (this.assembler) {
                    context.translate(this.strokeFix[3], this.strokeFix[0])
                    Rectangle.clipBezierPath(this.path(), context)
                    Rectangle.drawBg(this.data!, context, this.assembler)
                }

            }
        },
        {
            name: 'stroke',
            resolver: (context) => {
                context.translate(this.strokeFix[3], this.strokeFix[0])
                this.drawRectStroke(context)
            }
        }
    ])

    constructor(id: string, app: Nodas) {
        super(id, {...new NdModRect(), ...new NdModSize(), ...new NdModAnchor(), ...new NdModBg(), ...new NdModBase()}, app);
        this.strokeFix = [...this.data!.strokeWidth.protectedValue] as [number, number, number, number]
        const {
            getter,
            purge
        } = this.cache.register<NdPathBezier>('path', () => NdModRect.buildRectPath(this, this.data!))
        this.path = getter
        this.purgePath = purge
        this.watch('size', () => {
            this.assembler!.resize()
            this.assembler!.update('fill')
            this.assembler!.update('bg')
            this.assembler!.update('stroke')
            this.matrixContainer.purge()
            this.Box!.purge()
            this.purgePath()

        })
        this.watch('radius', () => {
            if (this.assembler) {
                this.assembler.update('fill')
                this.assembler.update('bg')
                this.assembler.update('stroke')
                this.purgePath()
            }
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = [...this.data!.strokeWidth.protectedValue] as NdStrokeWidthBox
            this.Box!.purge()
            this.assembler!.resize()
            this.matrixContainer.purge()
            this.assembler!.update('fill')
            this.assembler!.update('bg')
            this.assembler!.update('stroke')

        })
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => {
            this.assembler!.update('bg')
        })
        this.watch(['strokeColor', 'strokeStyle'], () => {
            this.assembler!.update('stroke')
        })
        this.watch('fill', () => {
            this.assembler!.update('fill')
        })
    }

    @alive
    export(): HTMLCanvasElement | undefined {
        return this.assembler!.export(this)
    }

    @alive
    protected test(cursor: NdNumericArray2d) {
        const [x, y] = this.matrixContainer.value.traceCursorToLocalSpace([...cursor], this)
        if (x < this.Box!.value.sprite.size[0] && x > 0 && y < this.Box!.value.sprite.size[1] && y > 0) {
            return this
        }
        return false
    }

    @alive
    protected render(context: CanvasRenderingContext2D) {
        const render = this.assembler!.export(this)
        if (render) {
            Rectangle.transformContext(this, context)
            context.drawImage(render, 0, 0)
        }
        return context
    }

    private static drawCorner(rectSegment: number, context: CanvasRenderingContext2D, segment: NdSegmentBezier, color1: NdColorStr, color2: NdColorStr, width1: number, width2: number) {
        context.save()
        context.beginPath()
        context.lineWidth = Math.max(width1, width2)
        let [px1, py1, px2, py2, cpx1, cpy1, cpx2, cpy2] = segment
        if (rectSegment === 0) {
            if (width1 < width2) {
                const diff = (width2 - width1) / 2
                px1 += diff
                cpx1 += diff
            }
            if (width1 > width2) {
                const diff = (width1 - width2) / 2
                py2 += diff
                cpy2 += diff
            }
        }
        if (rectSegment == 1) {
            if (width1 < width2) {
                const diff = (width2 - width1) / 2
                py1 += diff
                cpy1 += diff
            }
            if (width2 < width1) {
                const diff = (width1 - width2) / 2
                px2 -= diff
                cpx2 -= diff
            }
        }
        if (rectSegment == 2) {
            if (width1 < width2) {
                const diff = (width2 - width1) / 2
                px1 -= diff
                cpx1 -= diff
            }
            if (width1 > width2) {
                const diff = (width1 - width2) / 2
                py2 -= diff
                cpy2 -= diff
            }
        }
        if (rectSegment == 3) {
            if (width2 < width1) {
                const diff = (width1 - width2) / 2
                px2 += diff
                cpx2 += diff
            }
            if (width1 < width2) {
                const diff = (width2 - width1) / 2
                py1 -= diff
                cpy1 -= diff
            }
        }
        context.moveTo(px1, py1)
        if (color1 !== color2) {
            const grad = context.createConicGradient(
                -Math.PI - (1 / 180) + (Math.PI / 2 * rectSegment),
                rectSegment % 2 ? px1 : px2,
                rectSegment % 2 ? py2 : py1
            )
            grad.addColorStop(0, color1)
            grad.addColorStop(.25, color2)
            context.strokeStyle = grad
        } else context.strokeStyle = color1
        context.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, px2, py2)
        context.stroke()
        context.restore()
    }

    private static drawBridge(context: CanvasRenderingContext2D, segment: NdSegmentBezier, color: NdColorStr, width: number) {
        context.beginPath()
        context.lineCap = 'round'
        context.moveTo(segment[0], segment[1])
        context.strokeStyle = color
        context.lineWidth = width
        context.lineTo(segment[2], segment[3])
        context.stroke()
    }

    private drawRectStroke(context: CanvasRenderingContext2D) {
        const path = this.path()
        const segmentStops = [0, 1, 2, 3] // segment stop keys
        if (path.length) {
            let currentSegment = 0
            //segment stop keys fix depending on corresponding corner presence
            this.data!.radius.protectedValue.forEach((v, key) => {
                if (v > 0) {
                    for (let i = key; i < segmentStops.length; i++) {
                        segmentStops[i] += 1
                    }
                }
            })
            path.forEach((v, n) => {
                    const corner = v[0] !== v[2] && v[1] !== v[3]
                    if (corner) {
                        Rectangle.drawCorner(
                            currentSegment,
                            context,
                            v,
                            currentSegment > 0 ? this.data!.strokeColor.protectedValue[currentSegment - 1] : this.data!.strokeColor.protectedValue[3],
                            this.data!.strokeColor.protectedValue[currentSegment],
                            currentSegment > 0 ? this.data!.strokeWidth.protectedValue[currentSegment - 1] : this.data!.strokeWidth.protectedValue[3],
                            this.data!.strokeWidth.protectedValue[currentSegment]
                        )
                    } else {
                        Rectangle.drawBridge(context, v, this.data!.strokeColor.protectedValue[currentSegment], this.data!.strokeWidth.protectedValue[currentSegment])
                    }
                    if (segmentStops.indexOf(n) > -1) currentSegment++;
                }
            )
            currentSegment = 0
        }
    }


}