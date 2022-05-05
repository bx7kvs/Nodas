import ReflectElement from "../services/Graphics/ReflectElement";

export type ReflectPointArray2d = [number, number];
export type ReflectEmitterCallback<Data> = (data:Data)=>void;
export type ReflectMainDrawingPipeCallbackArguments<T extends ReflectElement<any>> = [element:T, context:CanvasRenderingContext2D, date:Date, frame:number]
export type ReflectMainDrawingPipeCallback<T extends ReflectElement<any>> = (...args:ReflectMainDrawingPipeCallbackArguments<T>) => CanvasRenderingContext2D
export type ReflectRenderConditionPredicate<T extends ReflectElement<any>> = (...args:ReflectMainDrawingPipeCallbackArguments<T>) => boolean