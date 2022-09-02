import NdNodeStylesModel from "../classes/NdNodeStylesModel";
import NdStylesProperty from "../classes/NdNodeStyleProperty";
import {NdNumericArray2d} from "../../@types/types";
import {NdPath, NdPathBezier} from "../@types/types";

export default class NdModEmitter extends NdNodeStylesModel {
    position = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (current) => current,
        (value) => [...value]
    )
    limit = new NdStylesProperty<number, number, number>(
        0,
        1000,
        (current) => current,
        (value) => {
            if (value < 0) value = 0
            return value
        }
    )
    intensity = new NdStylesProperty<number, number, number>(
        0,
        1,
        (current) => current,
        (value) => {
            return value < 1 ? 1 : value
        }
    )
    shape = new NdStylesProperty<number | NdPathBezier, number | NdPath, number | NdPath>(
        0,
        0,
        (current) => {
            return current instanceof Array ? NdModEmitter.convertComplexPath(current) : current
        },
        (value) => {
            return value instanceof Array ? NdModEmitter.convertSimplePath(value) as NdPathBezier : value < 0 ? 0 : value
        }
    )
}