export type ReflectTickerCB = (date: Date, frame: number) => void
export type ReflectTickerQueueMethod = (a: ReflectTickerCB | number, b ?: ReflectTickerCB) => void
export type ReflectTickerQueueItem = {
    order: number,
    f: ReflectTickerCB
}
export type ReflectTickerCallArgs = [Date, number]

export type ReflectTickerEvents  = 'stop' | 'start' | 'error';

export type ReflectTickerEventCB = (data:Error | Ticker) => void

export interface ReflectTickerEventsContainer {
    stop :ReflectTickerEventCB[],
    start :ReflectTickerEventCB[],
    error : ReflectTickerEventCB[]
}