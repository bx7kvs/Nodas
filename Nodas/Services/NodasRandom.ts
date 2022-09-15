import {NdNumericArray2d} from "../@types/types";
import {NDB} from "./NodasDebug";
import {NdSegmentBezier} from "../Nodes/@types/types";
import NdNodeStylesModel from "../Nodes/classes/NdNodeStylesModel";

class NodasRandom {
    number(range: NdNumericArray2d | number, precision?: number) {
        let min, max, delta, result;

        if (typeof range === "number") {
            min = 0;
            max = Math.abs(range);
        } else {
            min = range[0] < range[1] ? range[0] : range[1];
            max = range[0] < range[1] ? range[1] : range[0];
        }

        if (min === max) return min;
        delta = max - min;
        if (delta < 0) return min;
        result = Math.random() * delta + min;

        result = precision !== undefined ? parseFloat(result.toFixed(precision)) : result;
        return result;
    }

    point(randomVector: NdNumericArray2d, precision?: number): NdNumericArray2d {
        return [this.number(randomVector[0], precision), this.number(randomVector[1], precision)]
    }

    pointWithinCircle(r: number, precision?: number) {
        let angle = this.number(Math.PI * 2, 4),
            distance = this.number(r);

        return [parseFloat((distance * Math.cos(angle)).toFixed(precision)), parseFloat((distance * Math.sin(angle)).toFixed(precision))];
    }

    pointOnCircle(r: number, precision?: number): NdNumericArray2d {
        return [r * Math.sin(this.number(Math.PI * 2)), r * Math.cos(this.number(Math.PI * 2))]
    }

    pointOnPath(segment: NdSegmentBezier) {
        return NdNodeStylesModel.getPathSegmentTPoint(segment, this.number(1))
    }

    luck(probability: number) {
        if (probability <= 0) return false;
        if (probability > 1) return false;
        return Math.random() <= probability;
    }

    setItem<T>(set: T[], probabilities?: number[]): T {
        let sum = set.length,
            items: { item: T, probability: number, min?: number, max?: number }[] = [],
            i, number, result: T | undefined;

        if (!probabilities) return set[this.number([0, set.length - 1])]
        if (probabilities.length === set.length) {
            sum = 0;
            for (i = 0; i < set.length; i++) {
                sum += probabilities[i];
                items.push({
                    item: set[i],
                    probability: probabilities[i]
                });
            }
            items.sort(function (a, b) {
                return a.probability - b.probability;
            });
            for (i = 0; i < items.length; i++) {
                items[i].min = items[i - 1] ? items[i - 1].max : 0;
                items[i].max = <number>items[i].min + items[i].probability;
            }
        } else NDB.error('Probability length does not correspond items length')
        number = this.number([1, sum]);
        for (i = 0; i < items.length; i++) {
            if (number > <number>items[i].min && number <= <number>items[i].max) {
                result = items[i].item;
                break;
            }
        }
        return result as T;
    }
}

export default new NodasRandom()