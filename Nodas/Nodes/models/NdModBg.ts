import {
    NdArrColor,
    NdBg,
    NdBgSize,
    NdColorStr,
    NdPercentStr,
    NdPosition,
    NdPositionArr,
    NdURLStr
} from '../@types/types';
import NdImage from '../../classes/NdImage';
import {NdNumericArray2d} from '../../@types/types';
import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NDB} from "../../Services/NodasDebug";

export default class NdModBg extends NdNodeStylesModel {

    static normalizeBgPosition(value: NdPosition): NdPercentStr | number {
        if (typeof value === 'string') {
            if (value === 'left' || value == 'top') return '0%'
            else if (value === 'bottom' || value === 'right') return '100%'
            else if (value === 'center' || value === 'middle') return '50%'
            else return value
        } else return value
    }

    static readBgPosition(boxSize: NdNumericArray2d, bgSize: NdBgSize, image: NdImage, dir: 0 | 1, value: NdPosition) {
        let positionValue = this.normalizeBgPosition(value)
        const bgSizeValue = this.readBgSize(boxSize, image, dir, bgSize[dir])
        if (typeof positionValue === 'number') {
            return positionValue
        } else {
            return (boxSize[dir] - bgSizeValue) * NdNodeStylesModel.extractPercentFraction(positionValue)
        }
    }

    static readBgSize(boxSize: NdNumericArray2d, bg: NdImage, dir: number, value: (NdPercentStr & string) | ('auto' & string) | number) {
        if (typeof value === 'string') {
            if (value !== 'auto') {
                return boxSize[dir] * NdModBg.extractPercentFraction(value)
            } else {
                if (bg) return bg.size[dir]
                return 0
            }
        } else {
            return value
        }
    }

    fill = new NdNodeStylePropertyAnimated<NdColorStr, NdColorStr, NdColorStr | NdArrColor, NdArrColor>
    (
        0,
        'rgba(0,0,0,0)',
        (current) => current,
        (value) =>
            value instanceof Array ? NdNodeStylesModel.arrayToColor(value) : value,
        (current, value, setStart, setEnd) => {
            setStart(NdNodeStylesModel.colorToArray(current))
            if (typeof value === 'string') {
                setEnd(NdNodeStylesModel.colorToArray(value))
            } else {
                setEnd(value)
            }
        },
        (value) => {
            return NdNodeStylesModel.normalizeColor(value)
        }
    )
    bg = new NdStylesProperty<NdImage[],
        NdURLStr[],
        NdBg | { [key: number]: NdURLStr | NdImage } | false>(
        0,
        [],
        (current) => current.map(v => v.url),
        (value, node) => {
            if (!node.box) {
                NDB.error('Background  can not be applied to nodes without box')
                return []
            } else {
                let result: NdImage[] = [...this.bg.protectedValue]
                if (typeof value == 'string') {
                    NdModBg.destroyBackground(this)
                    const image = new NdImage(value)
                    image.once('load', () => {
                        if (this.bg.protectedValue[0] === image) {
                            if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, 0, image)
                        }
                    })
                    image.load()
                    result = [image]
                } else if (value instanceof Array) {
                    NdModBg.destroyBackground(this)
                    if (typeof value[0] === 'string') {

                        result = (value as NdURLStr[]).map(
                            (v, key) => {
                                const image = new NdImage(v)
                                if (!image.loaded) {
                                    image.once('load', () => {
                                        if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, key, image)
                                    })
                                    image.load()
                                } else if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, key, image)
                                return image
                            })
                    } else {
                        result = [...(value as NdImage[]).map(
                            (v, key) => {
                                if (!v.loaded) {
                                    v.once('load', () => {
                                        if (this.bg.protectedValue[key] === v) {
                                            if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, key, v)
                                        }
                                    })
                                    v.load()
                                }
                                if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, key, v)
                                return v
                            }
                        )]
                    }
                } else {
                    if (value instanceof NdImage) {
                        NdModBg.destroyBackground(this)
                        result = [value]
                        if (!value.loaded) {
                            value.once('load', () => {
                                if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, 0, value)
                            })
                            value.load()
                        } else {
                            NdModBg.updateSizeAndPosition(this, node.box.size, 0, value)
                        }
                    } else if (typeof value === 'object') {
                        for (let prop in (value as { [key: number]: NdURLStr | NdImage })) {
                            if (result[prop]) {
                                if (typeof value[prop] == 'string') {
                                    if (value[prop] !== result[prop].url) {
                                        result[prop].destroy()
                                        const image = new NdImage((value[prop] as NdURLStr))
                                        image.once('load', () => {
                                            if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, parseInt(prop), image)
                                        })
                                        image.load()
                                        result[prop] = image
                                    }
                                }

                            } else {
                                result[prop].destroy()
                                const image = value[prop] as NdImage
                                if (!image.loaded) {
                                    image.once('load', () => {
                                        if (node.box) NdModBg.updateSizeAndPosition(this, node.box.size, parseInt(prop), image)
                                    })
                                    image.load()
                                } else NdModBg.updateSizeAndPosition(this, node.box.size, parseInt(prop), image)
                                result.push(value[prop] as NdImage)
                            }
                        }
                    } else {
                        NdModBg.destroyBackground(this)
                        result = []
                    }
                }
                this.backgroundPosition.sync(result, [0, 0])
                this.backgroundPositionNumeric.sync(result, [0, 0])
                this.backgroundSize.sync(result, ['auto', 'auto'])
                this.backgroundSizeNumeric.sync(result, [
                    (key: number) => node.box ? NdModBg.readBgSize(node.box.size, this.bg.protectedValue[key], 0, 'auto') : 0,
                    (key: number) => node.box ? NdModBg.readBgSize(node.box.size, this.bg.protectedValue[key], 1, 'auto') : 0
                ])
                return result
            }
        }
    )
    backgroundSize = new NdStylesProperty<NdBgSize[],
        NdBgSize[],
        NdBgSize | NdBgSize[] | { [key: number]: NdBgSize } | (NdPercentStr & string) | number>(
        1,
        [],
        (current) => current.map((v) => [v[0], v[1]]),
        (value, node) => {
            let result: NdBgSize[] = this.backgroundSize.protectedValue
            if (typeof value == 'string' || typeof value == 'number') {
                value = typeof value === 'number' ? value < 0 ? 0 : value : value;
                result = this.bg.protectedValue.map(() => ([value, value] as NdBgSize))

            } else if (value instanceof Array) {
                if (typeof value[0] == 'string' || typeof value[0] === 'number') {
                    const val = value as NdBgSize
                    result = this.bg.protectedValue.map(() => [val[0], val[1]])
                } else {
                    const val = (value as NdBgSize[])
                    result = this.bg.protectedValue.map((v, key) => {
                        return val[key] ?
                            [val[key][0], val[key][1]] :
                            this.bg.protectedValue[key] ?
                                this.bg.protectedValue[key] : ['auto', 'auto']
                    }) as NdBgSize[]
                }
            } else {
                for (let key in (value as { [key: number]: NdBgSize })) {
                    if (result[key]) result[key] = [value[key][0], value[key][1]]
                }
            }
            this.backgroundSizeNumeric.sync(result, [
                (key) => node.box ? NdModBg.readBgSize(node.box.size, this.bg.protectedValue[key], 0, result[key][0]) : 0,
                (key) => node.box ? NdModBg.readBgSize(node.box.size, this.bg.protectedValue[key], 1, result[key][1]) : 0
            ])
            this.backgroundPosition.sync(result, [0, 0])
            this.backgroundPositionNumeric.sync(result, [0, 0])
            return result
        }
    )
    backgroundSizeNumeric = new NdStylesProperty<[number, number][], [number, number][], void>(
        1,
        [],
        (current) => [...current]
    )
    backgroundPosition = new NdStylesProperty<NdPositionArr[], NdPositionArr[], NdPositionArr[] | NdPositionArr | { [key: number]: NdPositionArr } | NdPosition>(
        2,
        [],
        (current) => current.map(v => [v[0], v[1]]),
        (value, node) => {
            let result: NdPositionArr[] = this.backgroundPosition.protectedValue
            if (typeof value === 'string') {
                if (/^[\d.]+%$/.test(value)) {
                    result = this.bg.protectedValue.map(() => ([value, value] as [NdPercentStr, NdPercentStr]))
                }
                if (/^(left|center|right)$/.test(value)) {
                    result = this.bg.protectedValue.map((val, key) =>
                        [
                            value,
                            this.backgroundPosition.protectedValue[key] ? this.backgroundPosition.protectedValue[key][1] : 0
                        ]
                    )
                }
                if (/^(top|middle|bottom)$/.test(value)) {
                    result = this.bg.protectedValue.map((val, key) =>
                        [
                            this.backgroundPosition.protectedValue[key] ? this.backgroundPosition.protectedValue[key][0] : 0,
                            value
                        ]
                    )
                }

            } else if (typeof value === 'number') {
                result = this.bg.protectedValue.map(() => [value, value])
            } else if (value instanceof Array) {
                if (value[0] instanceof Array) {
                    const val = (value as NdPositionArr[])
                    result = this.bg.protectedValue.map((v, key) => {
                        return val[key] ?
                            [val[key][0], val[key][1]] :
                            this.backgroundPosition.protectedValue[key] ?
                                this.backgroundPosition.protectedValue[key] : [0, 0]
                    })
                }
                if (typeof value[0] == 'string' || typeof value[0] == 'number') {
                    const val = (value as NdPositionArr)
                    result = this.bg.protectedValue.map(() => [val[0], val[1]])
                }
            } else {
                for (let key in (value as { [key: number]: NdPositionArr })) {
                    if (result[key]) {
                        result[key] = [value[key][0], value[key][1]]
                    }
                }
            }
            this.backgroundPositionNumeric.sync(result, [
                (key) => node.box ? NdModBg.readBgPosition(node.box.size, this.backgroundSize.protectedValue[key], this.bg.protectedValue[key], 0, result[key][0]) : 0,
                (key) => node.box ? NdModBg.readBgPosition(node.box.size, this.backgroundSize.protectedValue[key], this.bg.protectedValue[key], 0, result[key][1]) : 0
            ])
            return result
        }
    )
    backgroundPositionNumeric = new NdStylesProperty<[number, number][], [number, number][], void>(
        2,
        [],
        (current) => [...current]
    )
    static updateSizeAndPosition = (model: NdModBg, box: [number, number], key: number, value: NdImage) => {
        if (typeof model.backgroundSize.protectedValue[key][0] === 'string') {
            model.backgroundSizeNumeric.protectedValue[key][0] = NdModBg.readBgSize(box, value, 0, model.backgroundSize.protectedValue[key][0])
        }
        if (typeof model.backgroundSize.protectedValue[key][1] === 'string') {
            model.backgroundSizeNumeric.protectedValue[key][1] = NdModBg.readBgSize(box, value, 1, model.backgroundSize.protectedValue[key][1])
        }
        if (typeof model.backgroundPosition.protectedValue[key][0] == 'string') {
            model.backgroundPositionNumeric.protectedValue[key][0] = NdModBg.readBgPosition(
                box,
                model.backgroundSize.protectedValue[key],
                model.bg.protectedValue[key], 0, model.backgroundPosition.protectedValue[key][0])

        }
        if (typeof model.backgroundPosition.protectedValue[key][1] == 'string') {
            model.backgroundPositionNumeric.protectedValue[key][1] = NdModBg.readBgPosition(
                box,
                model.backgroundSize.protectedValue[key],
                model.bg.protectedValue[key], 1, model.backgroundPosition.protectedValue[key][1])
        }
    }

    static destroyBackground(data: NdModBg) {
        if (data.bg.protectedValue.length) {
            data.bg.protectedValue.forEach(v => v.destroy())
        }
    }
}