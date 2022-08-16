import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NdArrColor, NdColorArrBox, NdColorBox, NdColorStr, NdStrokeStyle, NdStrokeWidthBox} from '../@types/types';

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
}