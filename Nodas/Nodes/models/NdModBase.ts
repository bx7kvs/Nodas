import {NdNumericArray2d} from '../../@types/types';
import {NdBlend} from '../@types/types';
import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import NdStylesProperty from '../classes/NdNodeStyleProperty';

export default class NdModBase extends NdNodeStylesModel {

    position = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d>(
        2,
        [0, 0],
        (current) => [...current],
        (value) => value instanceof Array ? [...value] : [value, value],
        (current, value, setStart, setEnd) => {
            setStart(current)
            setEnd(typeof value === 'number' ? [value, value] : [value[0], value[1]])
        },
        (value) => {
            return [value[0], value[1]]
        }
    )

    scale = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d>(
        0,
        [1, 1],
        (current) => [...current],
        (value) => value instanceof Array ? [...value] : [value, value],
        (current, value, setStart, setEnd) => {
            setStart(current);
            if (typeof value === 'number') {
                if (value < 0) value = 0;
                setEnd([value, value]);
            } else {
                if (value[0] < 0) value[0] = 0
                if (value[1] < 0) value[1] = 0
                setEnd([value[0], value[1]]);
            }
        },
        (value) => {
            return [value[0], value[1]]
        }
    )

    rotate = new NdNodeStylePropertyAnimated<number, number, number, number>(
        0,
        0,
        (current) => NdNodeStylesModel.radToDeg(current),
        (value) => NdNodeStylesModel.degToRad(value),
        (current, value, setStart, setEnd) => {

            setStart(current);
            setEnd(value)
        },
        (value) => {
            return value
        }
    )

    translate = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (current) => [...current],
        (value) => value instanceof Array ? [...value] : [value, value],
        (current, value, setStart, setEnd) => {
            setStart(current)
            setEnd(typeof value === 'number' ? [value, value] : [value[0], value[1]])
        },
        (value) => {
            return [value[0], value[1]]
        }
    )

    skew = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (current) => [NdNodeStylesModel.radToDeg(current[0]), NdNodeStylesModel.radToDeg(current[1])],
        (value) => value instanceof Array ? [NdNodeStylesModel.degToRad(value[0]), NdNodeStylesModel.degToRad(value[1])] : [NdNodeStylesModel.degToRad(value), NdNodeStylesModel.degToRad(value)],
        (current, value, setStart, setEnd) => {
            if (typeof value == 'number') value = [value, value]
            setStart(current)
            setEnd([value[0], value[1]])
        },
        (value) => {
            return value
        }
    )

    opacity = new NdNodeStylePropertyAnimated<number, number, number, number>(
        0,
        1,
        (current) => current,
        (value) => {
            if (value > 1) return 1
            if (value < 0) return 0;
            return value
        },
        (current, value, setStart, setEnd) => {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            setStart(current)
            setEnd(value)
        },
        (value) => {
            if (value < 0) value = 0;
            if (value > 1) value = 1;
            return value
        }
    )

    origin = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d>(
        0,
        [.5, .5],
        (current) => [...current],
        (value) => value instanceof Array ? [...value] : [value, value],
        (current, value, setStart, setEnd) => {
            setStart(current)
            setEnd(typeof value == 'number' ? [value, value] : [value[0], value[1]])
        },
        (value) => {
            return [value[0], value[1]]
        }
    )

    blending = new NdStylesProperty<NdBlend, NdBlend, NdBlend>(
        0,
        NdBlend.SOURCE_OVER,
        (current) => current,
        (value) => value
    )

}