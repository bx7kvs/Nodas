import NdNodeStylesModel from '../classes/NdNodeStylesModel';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import {NdNumericArray2d} from '../../@types/types';

export default class NdModSize extends NdNodeStylesModel {
    size = new NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d | number, NdNumericArray2d>(
        1,
        [0, 0],
        (current) => {
            return [...current]
        },
        (value) => {
            if (typeof value === 'number') {
                if (value < 0) value = 0
                return [value, value]
            } else {
                return value.map(v => v < 0 ? 0 : v) as NdNumericArray2d
            }

        },
        (current, value, setStart, setEnd) => {
            setStart([...current])
            if (typeof value === 'number') {
                if (value < 0) value = 0
                setEnd([value, value])
            } else {
                setEnd(value.map(v => v < 0 ? 0 : v) as NdNumericArray2d)
            }
        },
        (value) => {
            return value
        }
    )
}