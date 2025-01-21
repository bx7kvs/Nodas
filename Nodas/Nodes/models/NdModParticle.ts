import NdNodeStylesModel from "../classes/NdNodeStylesModel";
import NdStylesProperty from "../classes/NdNodeStyleProperty";
import {NdNumericArray2d} from "../../@types/types";
import {NdBlend, NdParticleVector} from "../@types/types";

export default class NdModParticle extends NdNodeStylesModel {
    lifetime = new NdStylesProperty<number, number, number>(
        0,
        Infinity,
        (current) => current,
        (value) => value
    )
    blending = new NdStylesProperty<NdBlend, NdBlend, NdBlend>(
        0,
        NdBlend.SOURCE_OVER,
        (current) => current,
        (value) => value
    )
    opacity = new NdStylesProperty<number, number, number>(
        0,
        1,
        (current) => current,
        (value) => {
            if (value < 0) value = 0
            if (value > 1) value = 1
            return value
        }
    )
    origin = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [.5, .5],
        (current) => [...current],
        (value) => [...value]
    )
    vector = new NdStylesProperty<NdParticleVector, NdParticleVector, NdParticleVector>(
        0,
        [0, 0, 0, 0, 0, 0, 0, 0],
        (current) => [...current],
        (value) => [...value]
    )
    rotate = new NdStylesProperty<number, number, number>(
        0,
        0,
        (current) => current,
        (value) => value
    )
    scale = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [1, 1],
        (value) => [...value],
        (value) => [...value]
    )
    skew = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (value) => [...value],
        (value) => {
            if (value[0] > 360) value[0] = 360 - value[0]
            if (value[0] < -360) value[0] += 360
            if (value[1] > 360) value[1] = 360 - value[1]
            if (value[1] < -360) value[1] += 360

            return [NdModParticle.degToRad(value[0]), NdModParticle.degToRad(value[1])]
        }
    )
    position = new NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d>(
        0,
        [0, 0],
        (current) => [...current],
        (value) => [...value]
    )
}