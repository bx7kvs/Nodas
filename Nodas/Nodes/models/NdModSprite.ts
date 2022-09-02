import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NdSize, NdSizeArr, NdUrlSpriteStr, NdURLStr} from '../@types/types';
import NdImage from '../../classes/NdImage';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import {NdNumericArray2d} from '../../@types/types';
import NdSprite from '../../classes/NdSprite';

export default class NdModSprite extends NdNodeStylesModel {
    src: NdStylesProperty<NdImage | NdSprite | false, NdUrlSpriteStr | NdURLStr | false, NdURLStr | NdUrlSpriteStr | false> =
        new NdStylesProperty<NdImage | NdSprite | false, NdUrlSpriteStr | NdURLStr | false, NdURLStr | NdUrlSpriteStr | false>(
            1,
            false,
            (value) => {
                return value ? value.url : value
            },
            (value, node) => {
                if (value === false) {
                    if (this.src.protectedValue) {
                        this.src.protectedValue.destroy()
                    }
                    return value
                }
                if (this.src.protectedValue) {
                    if (this.src.protectedValue.url === value) return this.src.protectedValue as NdSprite
                    this.src.protectedValue.destroy()
                }
                if (NdSprite.isNdUrlSpriteStr(value)) {
                    const sprite = new NdSprite(value as NdUrlSpriteStr) as NdSprite
                    sprite.on('load', () => {
                        sprite.fps = this.fps.protectedValue
                        this.frames.set(sprite.frames, node)
                    })
                    sprite.load()
                    return sprite as NdSprite
                } else {
                    return value ? new NdImage(value as NdURLStr).load() as NdImage : !!value as false
                }
            }
        )
    frames = new NdStylesProperty<number, number, number>(
        0,
        0,
        (value) => {
            return value
        },
        (value) => {
            return value
        }
    )
    fps = new NdStylesProperty<number, number, number>(
        0,
        12,
        (value) => {
            return value
        },
        (value) => {
            if (value < 0) value = 0
            return value
        }
    )
    size = new NdNodeStylePropertyAnimated<NdSizeArr, NdSizeArr, NdSizeArr | NdSize, NdNumericArray2d>(
        1,
        ['auto', 'auto'],
        (current) => {
            return [...current]
        },
        (value) => {
            if (typeof value === 'string' || typeof value === 'number') {
                return [value, value]
            } else {
                return [...value]
            }
        },
        (current, value, setStart, setEnd) => {
            const start = current.map((v, key) => {
                if (v === 'auto') {
                    if (!this.src.protectedValue) return 0
                    return key === 0 ? this.src.protectedValue.width : this.src.protectedValue.height
                }
            }) as NdNumericArray2d
            setStart(start)
            let endValue: NdSizeArr = typeof value === 'number' || value === 'auto' ? [value, value] : value
            const end = endValue.map((v, key) => {
                if (v === 'auto') {
                    if (!this.src.protectedValue) return 0
                    return key === 0 ? this.src.protectedValue.width : this.src.protectedValue.height
                }
                if (v < 0) v = 0
                return v
            }) as NdNumericArray2d
            setEnd(end)
        },
        (value) => {
            if (value[0] < 0) value[0] = 0
            if (value[1] < 0) value[1] = 0
            return value
        }
    )
}