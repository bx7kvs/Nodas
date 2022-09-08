import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {
    NdArrColor,
    NdColorArrBox,
    NdColorBox,
    NdColorStr,
    NdPathBezier,
    NdStrokeStyle,
    NdStrokeWidthBox
} from '../@types/types';
import Rectangle from "../Rectangle";
import {CIRCLECONST} from "../../../constants";

export default class NdModRect extends NdNodeStylesModel {
    radius = new NdNodeStylePropertyAnimated<[number, number, number, number],
        [number, number, number, number],
        [number, number, number, number] | number,
        [number, number, number, number]>(
        0,
        [0, 0, 0, 0],
        (current) => {
            return [...current]
        },
        (value) => {
            if (typeof value === 'number') {
                return (value < 0 ? [0, 0, 0, 0] : [value, value, value, value])
            } else {
                return value.map(v => v < 0 ? 0 : v) as [number, number, number, number]
            }
        },
        (current, value, setStart, setEnd) => {
            setStart([...current])
            if (typeof value === 'number') {
                setEnd(value < 0 ? [0, 0, 0, 0] : [value, value, value, value])
            } else {
                setEnd(value.map(v => v < 0 ? 0 : v) as [number, number, number, number])
            }
        },
        (value) => {
            return value
        }
    )
    strokeColor = new NdNodeStylePropertyAnimated<NdColorBox,
        NdColorBox,
        NdColorBox | NdColorArrBox | NdArrColor | NdColorStr,
        NdColorArrBox>(
        1,
        ['rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)'],
        (current) => {
            return [...current]
        },
        (value) => {
            if (typeof value === 'string') {
                value = NdModRect.arrayToColor(
                    NdModRect.normalizeColor(
                        NdModRect.colorToArray(value)
                    )
                )
                return [value, value, value, value]
            } else if (typeof value[0] === 'number') {
                value =
                    NdModRect.arrayToColor(
                        NdModRect.normalizeColor(value as NdArrColor)
                    )
                return [value, value, value, value]
            } else {
                if (typeof value[0] === 'string') {
                    return (value as NdColorBox)
                        .map(
                            v => NdModRect.arrayToColor(
                                NdModRect.normalizeColor(
                                    NdModRect.colorToArray(v)
                                )
                            )
                        ) as NdColorBox
                } else {
                    return value
                        .map(
                            v => NdModRect.arrayToColor(
                                NdModRect.normalizeColor(
                                    v as NdArrColor
                                )
                            )
                        ) as NdColorBox
                }
            }
        },
        (
            current,
            value,
            setStart,
            setEnd) => {
            setStart(current.map(v => NdModRect.colorToArray(v)) as NdColorArrBox)
            if (typeof value === 'string') {
                let val = NdModRect.normalizeColor(NdModRect.colorToArray(value))
                setEnd([val, val, val, val])
            } else if (typeof value[0] === 'number') {
                let val = NdModRect.normalizeColor(value as NdArrColor)
                setEnd([val, val, val, val])
            } else {
                if (typeof value[0] === 'string') {
                    setEnd((value as NdColorBox).map(v => {
                        return NdModRect.normalizeColor(NdModRect.colorToArray(v))
                    }) as NdColorArrBox)
                } else {
                    setEnd((value as NdColorArrBox).map(v => {
                        return [...NdModRect.normalizeColor(v)]
                    }) as NdColorArrBox)
                }
            }
        },
        (value) => {
            return value
        }
    )
    strokeWidth = new NdNodeStylePropertyAnimated<NdStrokeWidthBox,
        NdStrokeWidthBox,
        NdStrokeWidthBox | number,
        NdStrokeWidthBox>(
        1,
        [1, 1, 1, 1],
        (current) => {
            return [...current]
        },
        (value) => {
            if (typeof value === 'number') {
                return value < 0 ? [0, 0, 0, 0] : [value, value, value, value]
            } else {
                return value.map(v => v < 0 ? 0 : v) as [number, number, number, number]
            }
        },
        (current, value, setStart, setEnd) => {
            setStart([...current])
            if (typeof value === 'number') {
                setEnd(value < 0 ? [0, 0, 0, 0] : [value, value, value, value])
            } else {
                setStart(value.map(v => v < 0 ? 0 : v) as [number, number, number, number])
            }
        },
        (value) => {
            return value
        }
    )
    strokeStyle = new NdStylesProperty<[NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle],
        [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle],
        [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle] | NdStrokeStyle>(
        1,
        [[0], [0], [0], [0]],
        (current) => {
            return current.map(v => [...v]) as [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle]
        },
        (value) => {
            if (typeof value[0] === 'number') {
                return [value, value, value, value] as [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle]
            } else {
                return (value).map(v => [...v as NdStrokeStyle]) as [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle]
            }
        }
    )

    static buildRectPath(node: Rectangle, model: NdModRect) {
        const [width, height] = model.size.protectedValue
        const [tl, tr, br, bl] = model.radius.protectedValue.map((v: number) => {
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
                    0, tl * CIRCLECONST,//cp1
                    tl - tl * CIRCLECONST, 0 //cp2
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
                    width - tr + (tr * CIRCLECONST), 0, //cp1
                    width, tr - tr * CIRCLECONST //cp2
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
                    width, height - br + (br * CIRCLECONST), //cp1
                    width - br + (br * CIRCLECONST), height //cp2
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
                    bl - bl * CIRCLECONST, height, //cp1
                    0, height - bl + bl * CIRCLECONST
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
    }
}