import {NdArrColor, NdColorArr, NdColorStr, NdPath, NdPathBezier, NdStrokeStyle, NdStrokeStyleArr, NdStrokeWidthArr} from '../@types/types';
import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdStylesProperty from '../classes/NdNodeStyleProperty';

export default class NdModFreeStroke extends NdNodeStylesModel {

    path : NdStylesProperty<NdPathBezier, NdPath, NdPath>
    constructor(closed:boolean = false) {
        super();
        this.path = new NdStylesProperty<NdPathBezier, NdPath, NdPath>(
            1,
            [],
            (current) => NdModFreeStroke.convertComplexPath(current),
            (value) => {
                const result = NdModFreeStroke.convertSimplePath(value, closed)
                if (this.path.protectedValue.length !== result.length) {
                    this.strokeStyle.sync(result, [0])
                    this.strokeWidth.sync(result, 1)
                    this.strokeColor.sync(result, 'rgba(0,0,0,1')
                }
                return result
            }
        )
    }
    interpolation = new NdStylesProperty<number, number, number>(
        0,
        0,
        (current) => {
            return current / .4 * 100
        },
        (value) => {
            if (value > 100) value = 100
            if (value < 0) value = 0
            value = .4 * (value / 100)
            return value
        }
    )

    strokeColor = new NdStylesProperty<NdColorStr[], NdArrColor[], NdArrColor[] | NdColorArr | NdColorStr | NdArrColor>(
        2,
        [],
        (current) => current.map((v) => NdModFreeStroke.colorToArray(v)),
        (value) => {
            let result: NdColorStr[] = []
            if (typeof value == 'string') {
                result = this.path.protectedValue.map(() => {
                    return value
                })
            }
            if (value instanceof Array) {
                //['rgba(0,0,0,1)',...]
                if (typeof value[0] === 'string') {
                    result = (this.path.protectedValue.map((v, key) => {
                        if (value[key]) {
                            return value[key]
                        } else if (this.strokeColor.protectedValue[key]) {
                            return this.strokeColor.protectedValue[key]
                        } else {
                            return this.strokeColor.protectedValue[this.strokeColor.protectedValue.length - 1] ? this.strokeColor.protectedValue[this.strokeColor.protectedValue.length - 1] : 'rgba(0,0,0,1)'
                        }

                    }) as NdColorArr)
                }
                //[[0,0,0,1]...]
                if (value[0] instanceof Array) {
                    result = (this.path.protectedValue.map((v, key) => {
                        if (value[key]) {
                            return NdModFreeStroke.arrayToColor((value[key] as NdArrColor))
                        } else if (this.strokeColor.protectedValue[key]) {
                            return this.strokeColor.protectedValue[key]
                        } else {
                            return this.strokeColor.protectedValue[this.strokeColor.protectedValue.length - 1] ?
                                this.strokeColor.protectedValue[this.strokeColor.protectedValue.length - 1] :
                                'rgba(0,0,0,1)'
                        }

                    }) as NdColorArr)
                }
                //[0,0,0,1]
                if (typeof value[0] === 'number') {
                    result = this.path.protectedValue.map(() => (NdModFreeStroke.arrayToColor((value as NdArrColor))))
                }
            }
            return result
        }
    )
    strokeWidth: NdStylesProperty<NdStrokeWidthArr, NdStrokeWidthArr, NdStrokeWidthArr | number> =
        new NdStylesProperty<NdStrokeWidthArr, NdStrokeWidthArr, NdStrokeWidthArr | number>(
            2,
            [],
            (current) => [...current],
            (value) => {
                if (typeof value === 'number') {
                    return this.path.protectedValue.map(() => value) as NdStrokeWidthArr
                } else {
                    return this.path.protectedValue.map((v, key) => {
                        if (typeof value[key] === 'number') {
                            return value[key]
                        } else {
                            if (typeof this.strokeWidth.protectedValue[key] === 'number') {
                                return this.strokeWidth.protectedValue[key]
                            } else {
                                return typeof this.strokeWidth.protectedValue[this.strokeWidth.protectedValue.length - 1] === 'number' ?
                                    this.strokeWidth.protectedValue[this.strokeWidth.protectedValue.length - 1] :
                                    1
                            }
                        }
                    }) as NdStrokeWidthArr
                }
            }
        )

    strokeStyle: NdStylesProperty<NdStrokeStyleArr, NdStrokeStyleArr, NdStrokeStyleArr | NdStrokeStyle> =
        new NdStylesProperty<NdStrokeStyleArr, NdStrokeStyleArr, NdStrokeStyleArr | NdStrokeStyle>(
            2,
            [],
            (current) => current.map(v => [...v]),
            (value) => {
                if (value[0] instanceof Array) {
                    return this.path.protectedValue.map(() => {
                        return [...value]
                    }) as NdStrokeStyleArr
                } else {
                    return this.path.protectedValue.map(() => {
                        return [...value]
                    }) as NdStrokeStyleArr
                }
            }
        )
}