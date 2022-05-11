import {ReflectElementModelScheme} from "../../@types/types";
import Emitter from "../../../../core/classes/Emitter";

export default class ReflectElementModel<T extends ReflectElementModelScheme>
    extends Emitter<keyof T, ReflectElementModel<T>> {
    private model: T

    constructor(scheme: T) {
        this.model = scheme
    }

    protected value(key: keyof T) {
        return this.model[key]
    }

    export() {

    }
}