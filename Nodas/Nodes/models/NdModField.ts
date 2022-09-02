import NdNodeStylesModel from "../classes/NdNodeStylesModel";
import NdStylesProperty from "../classes/NdNodeStyleProperty";
import {NdNumericArray2d} from "../../@types/types";

export default class NdModField extends NdNodeStylesModel {
    wind = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (current) => {
            return [...current]
        },
        (value) => {
            return [...value]
        }
    )

    gravity: NdStylesProperty<number, number, number> = new NdStylesProperty<number, number, number>(
        0,
        0,
        current => current,
        value => {
            if (isFinite(value)) {
                if (value < 0) value = 0
                return value
            }
            return this.gravity.protectedValue as number
        }
    )
    viscosity = new NdStylesProperty<number, number, number>(
        0,
        0,
        current => current,
        value => {
            if (isFinite(value)) return value
            if(value < 0) value = 0
            if(value > 1) value = 1
            return value
        }
    )

}