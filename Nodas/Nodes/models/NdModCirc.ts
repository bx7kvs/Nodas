import NdStylesProperty from '../classes/NdNodeStyleProperty';
import {NdArrColor, NdColorStr, NdStrokeStyle} from '../@types/types';
import NdNodeStylePropertyAnimated from '../classes/NdNodeStylePropertyAnimated';
import NdNodeStylesModel from '../classes/NdNodeStylesModel';

export default class NdModCirc extends NdNodeStylesModel {

    radius = new NdNodeStylePropertyAnimated<number, number, number, number>(
        0,
        0,
        (current) => current,
        (value) => {
            if (value < 0) value = 0
            return value
        },
        (current, value, setStart, setEnd) => {
            if (value < 0) value = 0;
            setStart(current)
            setEnd(value)
        },
        (value) => {
            if (value < 0) value = 0;
            return value
        }
    )
    strokeWidth = new NdNodeStylePropertyAnimated<number, number, number, number>(
        0,
        1,
        (current) => current,
        (value) => value < 0 ? 0 : value,
        (current, value, setStart, setEnd) => {
            if (value < 0) value = 0;
            setStart(current)
            setEnd(value)
        },
        (value) => {
            if (value < 0) value = 0;
            return value
        }
    )
    strokeColor = new NdNodeStylePropertyAnimated<NdColorStr, NdColorStr, NdColorStr | NdArrColor, NdArrColor>(
        0,
        'rgba(0,0,0,1)',
        (current) => current,
        (value) => value instanceof Array ? NdModCirc.arrayToColor(value) : value,
        (current, value, setStart, setEnd) => {
            setStart(NdModCirc.colorToArray(current))
            setEnd(typeof value === 'string' ? NdModCirc.colorToArray(value) : value)
        },
        (value) => {
            return NdModCirc.normalizeColor(value)
        }
    )
    strokeStyle = new NdStylesProperty<NdStrokeStyle, NdStrokeStyle, NdStrokeStyle>(
        0,
        [0],
        (current) => [...current],
        (value) => value.map(v => v < 0 ? 0 : v)
    )
}