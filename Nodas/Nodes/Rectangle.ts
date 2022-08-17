import NdModAnchor from './models/NdModAnchor';
import NdModBase from './models/NdModBase';
import NdModeAssembler from './classes/NdModeAssembler';
import NdNodeBox from './classes/NdNodeBox';
import NdModSize from './models/NdModSize';
import NdModRect from './models/NdModRect';
import {NdColorStr, NdPathBezier, NdSegmentBezier, NdStrokeWidthBox} from './@types/types';
import NdModBg from './models/NdModBg';
import {NdNumericArray2d} from '../@types/types';
import Node from './Node';
import Nodas from '../../Nodas';

type RectNodeModel = NdModRect & NdModSize & NdModAnchor & NdModBg & NdModBase
export default class Rectangle extends Node<RectNodeModel> {
    private strokeFix: [number, number, number, number]
    private readonly path: () => NdPathBezier
    private readonly purgePath: () => void
    private readonly CIRCLECONST = 0.5522847498
    protected Assembler: NdModeAssembler = new NdModeAssembler([
        {
            name: 'fill',
            resolver: (context) => {
                context.translate(this.strokeFix[3], this.strokeFix[0])
                Rectangle.registerPath(this.path(), context, true)
                context.fillStyle = this.data.fill.protectedValue
                context.fill()
            }
        },
        {
            name: 'bg',
            resolver: (context) => {
                context.translate(this.strokeFix[3], this.strokeFix[0])
                Rectangle.clipBezierPath(this.path(), context)
                Rectangle.drawBg(this.data, context, this.Assembler)
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
    export: Node<RectNodeModel>['export'] = () => this.Assembler.export(this);
    protected test: Node<RectNodeModel>['test'] = (cursor: NdNumericArray2d) => {
        const [x,y] = this.Matrix.value.traceCursorToLocalSpace([...cursor])
        if (x < this.Box.value.sprite.size[0] && x > 0 && y < this.Box.value.sprite.size[1] && y > 0) {
            return this
        }
        return false
    }
    protected render: Node<RectNodeModel>['render'] = (context) => {
        Rectangle.transformContext(this, context)
        context.drawImage(this.Assembler.export(this), 0, 0)
        return context
    }
    protected Box: NdNodeBox = new NdNodeBox(this, this.Cache, () => {
        const position = [...this.data.position.protectedValue] as NdNumericArray2d
        Node.applyBoxAnchor(position, this.data.size.protectedValue[0], this.data.size.protectedValue[1], this.data)
        return [position[0], position[1], this.data.size.protectedValue[0], this.data.size.protectedValue[1], this.strokeFix[0], this.strokeFix[1], this.strokeFix[2], this.strokeFix[3]]
    });

    constructor(id: string, app: Nodas) {
        super(id, {...new NdModRect(), ...new NdModSize(), ...new NdModAnchor(), ...new NdModBg(), ...new NdModBase()}, app);
        this.strokeFix = [...this.data.strokeWidth.protectedValue] as [number, number, number, number]
        const {getter, purge} = this.Cache.register<NdPathBezier>('path', () => {
            const [width, height] = this.data.size.protectedValue
            const [tl, tr, br, bl] = this.data.radius.protectedValue.map((v: number) => {
                if (v > width / 2) v = width / 2
                if (v > height / 2) v = height / 2
                return v
            })
            if (width && height) {
                const result: NdPathBezier = []
                if (tl) {
                    result.push([
                        0, tl,//p1
                        tl, 0, //p2
                        0, tl * this.CIRCLECONST,//cp1
                        tl - tl * this.CIRCLECONST, 0 //cp2
                    ])
                    result.push([
                        result[0][2], result[0][3],//p1
                        width, 0, //p2
                        result[0][2], result[0][3], //cp1
                        width, 0 //cp2
                    ])
                } else {
                    result.push([
                        0, 0,//p1
                        width, 0, //p2
                        0, 0, //cp1
                        width, 0 //cp2
                    ])
                }

                if (tr) {
                    result[result.length - 1][2] -= tr
                    result[result.length - 1][6] -= tr
                    result.push([
                        width - tr, 0,//p1
                        width, tr, //p2
                        width - tr + (tr * this.CIRCLECONST), 0, //cp1
                        width, tr - tr * this.CIRCLECONST//cp2
                    ])
                    result.push([
                        width, tr, //p1
                        width, height, //p2
                        width, tr, //cp1
                        width, height//cp2
                    ])
                } else {
                    result.push([
                        width, 0,
                        width, height,
                        width, 0,
                        width, height
                    ])
                }

                if (br) {
                    result[result.length - 1][3] -= br
                    result[result.length - 1][7] -= br
                    result.push([
                        width, height - br, //p1
                        width - br, height, //p2
                        width, height - br + (br * this.CIRCLECONST), //cp1
                        width - br + (br * this.CIRCLECONST), height //cp2
                    ])
                    result.push([
                        width - br, height,//p1
                        0, height,//p2
                        width - br, height,//cp1
                        0, height//cp2
                    ])
                } else {
                    result.push([
                        width, height,
                        0, height,
                        width, height,
                        0, height
                    ])
                }
                if (bl) {
                    result[result.length - 1][2] += bl
                    result[result.length - 1][6] += bl
                    result.push([
                        bl, height,//p1
                        0, height - bl,//p2
                        bl - bl * this.CIRCLECONST, height, //cp1
                        0, height - bl + bl * this.CIRCLECONST
                    ])
                    result.push(
                        [
                            0, height - bl,
                            result[0][0], result[0][1],
                            0, height - bl,
                            result[0][0], result[0][1]
                        ]
                    )
                } else {
                    result.push([
                        0, height - bl,
                        result[0][0], result[0][1],
                        0, height - bl,
                        result[0][0], result[0][1]
                    ])
                }
                return result

            } else {
                return []
            }

        })
        this.path = getter
        this.purgePath = purge
        this.watch('size', () => {
            this.Assembler.resize()
            this.Assembler.update('fill')
            this.Assembler.update('bg')
            this.Assembler.update('stroke')
            this.Matrix.purge()
            this.Box.purge()
            this.purgePath()
        })
        this.watch('radius', () => {
            this.Assembler.update('fill')
            this.Assembler.update('bg')
            this.Assembler.update('stroke')
            this.purgePath()
        })
        this.watch('strokeWidth', () => {
            this.strokeFix = [...this.data.strokeWidth.protectedValue] as NdStrokeWidthBox
            this.Box.purge()
            this.Assembler.resize()
            this.Matrix.purge()
            this.Assembler.update('fill')
            this.Assembler.update('bg')
            this.Assembler.update('stroke')
        })
        this.watch(['bg', 'backgroundSize', 'backgroundPosition'], () => {
            this.Assembler.update('bg')
        })
        this.watch(['strokeColor', 'strokeStyle'], () => {
            this.Assembler.update('stroke')
        })
        this.watch('fill', () => {
            this.Assembler.update('fill')
        })
        this.on('destroy', () => {
            NdModBg.destroyBackground(this.data)
        })
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
        context.lineCap ='round'
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
            this.data.radius.protectedValue.forEach((v, key) => {
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
                            currentSegment > 0 ? this.data.strokeColor.protectedValue[currentSegment - 1] : this.data.strokeColor.protectedValue[3],
                            this.data.strokeColor.protectedValue[currentSegment],
                            currentSegment > 0 ? this.data.strokeWidth.protectedValue[currentSegment - 1] : this.data.strokeWidth.protectedValue[3],
                            this.data.strokeWidth.protectedValue[currentSegment]
                        )
                    } else {
                        Rectangle.drawBridge(context, v, this.data.strokeColor.protectedValue[currentSegment], this.data.strokeWidth.protectedValue[currentSegment])
                    }
                    if (segmentStops.indexOf(n) > -1) currentSegment++;
                }
            )
            currentSegment = 0
        }
    }


}