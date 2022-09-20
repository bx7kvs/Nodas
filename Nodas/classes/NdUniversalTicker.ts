import {NdPercentStr, NdTickingObj, NodasTickingType} from "../Nodes/@types/types";

export default function universalTicker(complete: number, progress: number, start: NodasTickingType, end: NodasTickingType):
    NodasTickingType {
    while (typeof start === 'function') {
        start = start()
    }
    while (typeof end === 'function') {
        end = end()
    }
    let result: NodasTickingType = end;
    if (typeof start === typeof end) {
        if (typeof start === 'number') {
            if (progress >= 1) {
                result = end;
            } else {
                result = start + (((end as number) - start) * complete);
            }
        }
        if (typeof start === 'string') {
            const startVal = parseFloat(start)
            const endVal = parseFloat(end as NdPercentStr)
            result = (startVal + (((endVal as number) - startVal) * complete)) + '%' as NdPercentStr;
        }
        if (typeof start == 'object') {
            if (Array.isArray(start) && Array.isArray(end)) {
                if (start.length == end.length) {
                    result = start.map((v, key) => {
                        return universalTicker(complete, progress, v, (end as NodasTickingType[])[key])

                    })
                } else {
                    throw new Error('Start and end values are of different lengths')
                }
            } else {
                result = Object.fromEntries((Object.keys(start) as (keyof { [key: string]: NodasTickingType })[]).map((prop) => {
                    return [prop, universalTicker(complete, progress, (start as NdTickingObj)[prop], (end as NdTickingObj)[prop])]
                }))
            }
        }
    } else throw new Error('start value and end value are of different types')
    return result;
}