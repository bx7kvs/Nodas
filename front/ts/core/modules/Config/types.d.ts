export type ReflectConfigPropertyCheckName =
    'isNumber'
    | 'isString'
    | 'isArray'
    | 'custom'
    | 'under'
    | 'greater'
    | 'eq'
    | 'isBool'
export type ReflectConfigPropertyCustomCheck = (v: ReflectConfigPropertyValue) => boolean
export type ReflectConfigPropertyWatcher<T> = (v: T) => void
export type ReflectConfigPropertyCheckValue = undefined | string | number | boolean | ReflectConfigPropertyCustomCheck;
export type ReflectConfigPropertyValue = string | [] | number | boolean | undefined | {} | null
export type ReflectConfig = {
    [key: string]: ReflectConfigPropertyValue
}
export type ReflectConfigPropertyCheckArrayItem = {
    f: ReflectConfigPropertyCheckName,
    value?: ReflectConfigPropertyCheckValue
}
export type ReflectConfigPropertyChecks = {
    [K in ReflectConfigPropertyCheckName]?: ReflectConfigPropertyCheckValue
}