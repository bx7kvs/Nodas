import EventEmitter$1, { EventEmitter } from 'events';

declare type NdCanvasContext = CanvasRenderingContext2D | null;
declare type NdCanvasQueueCallbackArgs = [NdCanvasContext, Date, number];
declare type NdCanvasQueueCallback = (...args: NdCanvasQueueCallbackArgs) => void;
declare type NdNumericArray2d = [x: number, y: number];
declare type NdMainDrawingPipeFArgs = [context: CanvasRenderingContext2D, date: Date, frame: number];
declare type NdMainDrawingPipeF = (...args: NdMainDrawingPipeFArgs) => NdMainDrawingPipeFArgs[0] | false;
declare type NdRenderConditionPredicate = (...args: NdMainDrawingPipeFArgs) => boolean;
declare type NdFontFormats = 'eot' | 'svg' | 'ttf' | 'woff';
declare type NdSpecialFontWeights = 'light' | 'normal' | 'bold' | 'black';
declare type NdFontWeights = NdSpecialFontWeights | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 900 | 1000;
declare type NdFontStyles = 'normal' | 'italic';
declare type NdFontDescription = {
    name: string;
    weight: NdFontWeights[];
    style: NdFontStyles[];
};
declare type NdTickerFArgs = [Date, number];
declare type NdTickerF = (...args: NdTickerFArgs) => void;
declare type NdTickerQueueF = (a: NdTickerF | number, b?: NdTickerF) => void;
interface NdTickerEvents {
    fps: null;
    start: null;
    stop: null;
    error: null;
}
interface NdListenable<Scheme, K extends keyof Scheme = keyof Scheme> {
    on: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
    once: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
    off: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
}

declare class NdEmitter<Scheme, K extends keyof Scheme = keyof Scheme> implements NdListenable<Scheme, K> {
    private Emitter;
    protected cast(event: keyof Scheme, data: Scheme[K]): Scheme[K];
    protected removeAllListeners: (event?: string | symbol | undefined) => EventEmitter;
    on(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
    once(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
    off(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
}

declare class Ticker extends NdEmitter<NdTickerEvents> {
    private frameDuration;
    private q;
    private frame;
    private _fps;
    private args;
    private interval?;
    private init;
    private softPause;
    constructor();
    private tick;
    start(): this;
    queue: NdTickerQueueF;
    stop(): this;
    private draw;
    get frameTime(): number;
    set fps(fps: number);
    get fps(): number;
}

declare class NdBox {
    readonly container: {
        size: NdNumericArray2d;
        position: NdNumericArray2d;
    };
    readonly sprite: {
        margin: [number, number, number, number];
        position: NdNumericArray2d;
        size: NdNumericArray2d;
    };
    value(x: number, y: number, width: number, height: number, marginTop: number, marginRight: number, marginBottom: number, marginLeft: number): void;
}

declare class NdMatrix {
    private readonly traceBack;
    protected history: {
        translate?: NdNumericArray2d;
        skew?: NdNumericArray2d;
        scale?: NdNumericArray2d;
        rotate?: number;
    }[];
    protected _value: NdMatrixVal;
    protected _inversion: NdMatrixVal;
    constructor(trace?: boolean);
    invert(): NdMatrixVal | undefined;
    rotate(angle: number): this;
    translate(x: number, y: number): this;
    scale(...[x, y]: NdNumericArray2d): this;
    skew(...[x, y]: NdNumericArray2d): this;
    reset(): void;
    extract(): NdMatrixVal;
    extractInversion(): NdMatrixVal;
    tracePoint(point: NdNumericArray2d): NdNumericArray2d;
    protected static multiply(target: NdMatrixVal, multiplier: NdMatrixVal): void;
    protected static applyMatrixToPoint(matrix: NdMatrixVal, point: NdNumericArray2d): NdNumericArray2d;
}

declare class NdNodeMatrix extends NdMatrix {
    private _globalInversion;
    globalInversion: (node: Node<any>) => NdMatrixVal;
    purgeInversion: (node: Node<any>) => void;
    constructor();
    traceCursorToLocalSpace(point: NdNumericArray2d, node: Node<any>): NdNumericArray2d;
    reset(): void;
}

declare class NdCache {
    private values;
    register<T>(name: string, func: NdCacheGetter<T>): NdCacheRegisterFReturn<T>;
}

declare class NdNodeStylePropertyAnimated<StoreType, GetType, SetType, AniType extends SetType, Element extends NdStyledNode<any, any> = NdStyledNode<any, any>> extends NdStylesProperty<StoreType, GetType, SetType, Element> {
    private readonly starter;
    private readonly applier;
    private _start?;
    private _end?;
    constructor(order: number, initial: StoreType, getter: (current: StoreType) => GetType, setter: (value: SetType, element: Element) => StoreType, starter: NdStylePropAnimatedStarter<SetType, GetType, AniType>, applier: NdStylePropAnimatedApplier<AniType, Element>);
    get start(): false | AniType | undefined;
    private set start(value);
    get end(): false | AniType | undefined;
    private setStartValue;
    private setEndValue;
    init(value: SetType): this;
    apply(element: Element, progress: number, value: AniType): GetType;
}

declare class NdModBase extends NdNodeStylesModel {
    position: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    scale: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    rotate: NdNodeStylePropertyAnimated<number, number, number, number, NdStyledNode<any, any>>;
    translate: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    skew: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    opacity: NdNodeStylePropertyAnimated<number, number, number, number, NdStyledNode<any, any>>;
    origin: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    blending: NdStylesProperty<NdBlend, NdBlend, NdBlend, NdStyledNode<any, any>>;
}

declare class NdNodeMatrixContainer<Model extends NdModBase = NdModBase, N extends Node<Model> = Node<Model>> {
    private readonly getter;
    readonly purge: () => void;
    get value(): NdNodeMatrix;
    constructor(element: N, model: Model, cache: NdCache);
}

declare class NdCompiler<Props extends NdModBase, NodeType extends Node<Props> = Node<Props>> {
    private readonly resolver;
    private readonly node;
    private readonly props;
    private conditions;
    private drawerPipeBefore;
    private drawerPipeAfter;
    private beforePipeSize;
    private afterPipeSize;
    private isRenderAllowed;
    constructor(node: NodeType, model: Props, resolver: NdMainDrawingPipeF);
    filter(f: NdRenderConditionPredicate): void;
    pipe(f: NdMainDrawingPipeF, order?: number): NodeType;
    unpipe(f: NdMainDrawingPipeF): NodeType;
    render: NdMainDrawingPipeF;
}

declare class NdDestroyableNode<Scheme extends NdDestructibleEventScheme<NdDestroyableNode<Scheme>>> extends NdEmitter<Scheme> {
    private _destroyed;
    constructor();
    get destroyed(): boolean;
    destroy(): undefined;
}

declare class NdMouseConnector<Props extends NdModBase = NdModBase> extends NdDestroyableNode<NdDestructibleEventScheme<NdMouseConnector>> {
    private _disabled;
    test: NdNodePointerPredicate;
    private emit;
    constructor(emitter: Node<Props>['cast'], tester: NdNodePointerPredicate);
    cast(event: Parameters<Node<Props>['cast']>[0], data: Parameters<Node<Props>['cast']>[1]): ReturnType<Node<Props>['cast']> | false;
    get disabled(): boolean;
    disable(): void;
    enable(): void;
    destroy(): undefined;
}

declare class NdEvent<TargetType, DataType> {
    readonly time: Date;
    readonly data: DataType;
    readonly target: TargetType;
    protected _type: string;
    propagate: boolean;
    get type(): string;
    constructor(target: TargetType, data: DataType);
}

declare abstract class NdResource<T extends NdExportable> extends NdDestroyableNode<{
    load: NdEvent<NdResource<T>, null>;
    error: NdEvent<NdResource<T>, null>;
} & NdDestructibleEventScheme<NdResource<T>>> {
    private readonly src;
    private readonly resolve;
    protected status: number;
    private resolved;
    abstract export(time: Date): T | undefined;
    protected constructor(url: NdURLStr, resolve: () => NdResource<T>);
    get url(): NdURLStr;
    get loaded(): boolean;
    get error(): boolean;
    load(): NdResource<T>;
}

declare class NdImage extends NdResource<HTMLImageElement> {
    image?: HTMLImageElement;
    private _size;
    private defineImage;
    constructor(url: NdURLStr);
    export(): HTMLImageElement | undefined;
    get width(): number;
    get height(): number;
    get size(): number[];
    static isNdUrlStrRegex(str: string): boolean;
}

declare class NdModBg extends NdNodeStylesModel {
    static normalizeBgPosition(value: NdPosition): NdPercentStr | number;
    static readBgPosition(boxSize: NdNumericArray2d, bgSize: NdBgSize, image: NdImage, dir: 0 | 1, value: NdPosition): number;
    static readBgSize(boxSize: NdNumericArray2d, bg: NdImage, dir: number, value: (NdPercentStr & string) | ('auto' & string) | number): number;
    fill: NdNodeStylePropertyAnimated<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})` | NdArrColor, NdArrColor, NdStyledNode<any, any>>;
    bg: NdStylesProperty<NdImage[], NdURLStr[], false | NdBg | {
        [key: number]: NdURLStr | NdImage;
    }, NdStyledNode<any, any>>;
    backgroundSize: NdStylesProperty<NdBgSize[], NdBgSize[], number | `${number}%` | `${number}.${number}%` | `.${number}%` | NdBgSize | {
        [key: number]: NdBgSize;
    } | NdBgSize[], NdStyledNode<any, any>>;
    backgroundSizeNumeric: NdStylesProperty<[number, number][], [number, number][], void, NdStyledNode<any, any>>;
    backgroundPosition: NdStylesProperty<NdPositionArr[], NdPositionArr[], NdPositionArr | {
        [key: number]: NdPositionArr;
    } | NdPosition | NdPositionArr[], NdStyledNode<any, any>>;
    backgroundPositionNumeric: NdStylesProperty<[number, number][], [number, number][], void, NdStyledNode<any, any>>;
    static updateSizeAndPosition: (model: NdModBg, box: [number, number], key: number, value: NdImage) => void;
    static destroyBackground(data: NdModBg): void;
}

declare class NdModFreeStroke extends NdNodeStylesModel {
    path: NdStylesProperty<NdPathBezier, NdPath, NdPath>;
    constructor(closed?: boolean);
    interpolation: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    cap: NdStylesProperty<NdCap, NdCap, NdCap, NdStyledNode<any, any>>;
    strokeColor: NdStylesProperty<`rgba(${number},${number},${number},${number})`[], NdArrColor[], `rgba(${number},${number},${number},${number})` | NdArrColor | NdColorArr | NdArrColor[], NdStyledNode<any, any>>;
    strokeWidth: NdStylesProperty<NdStrokeWidthArr, NdStrokeWidthArr, NdStrokeWidthArr | number>;
    strokeStyle: NdStylesProperty<NdStrokeStyleArr, NdStrokeStyleArr, NdStrokeStyleArr | NdStrokeStyle>;
}

declare class NdNodeAssembler extends NdDestroyableNode<NdNodeAssemblerEventScheme<NdNodeAssembler>> {
    private output?;
    private pipe?;
    private layers?;
    private w;
    private h;
    private resized;
    private _ready;
    update: NodasAssemblerUpdateF<AssemblerLayerConfig[]>;
    constructor(layers: AssemblerLayerConfig[]);
    get ready(): boolean;
    get size(): NdNumericArray2d;
    get width(): number;
    get height(): number;
    private set size(value);
    export(node: Node<any>): HTMLCanvasElement;
    resize(): void;
}

declare class NdModAnchor extends NdNodeStylesModel {
    anchor: NdStylesProperty<NdAnchor, NdAnchor, NdAnchor, NdStyledNode<any, any>>;
}

declare const ndEasings: {
    default(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    linear(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    linearSoft(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    linearSoftOut(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    linearSoftIn(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInQuad(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutQuad(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutQuad(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInCubic(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutCubic(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutCubic(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInQuart(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutQuart(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutQuart(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInQuint(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutQuint(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutQuint(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInSine(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutSine(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutSine(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInExpo(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutExpo(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutExpo(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInCirc(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutCirc(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutCirc(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInBack(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutBack(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeInOutBack(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
    easeOutBounce(timeElapsedS: number, startValue: number, valueDelta: number, durationS: number): number;
};

declare class NdMorphine {
    private readonly easing;
    private readonly duration;
    private readonly repeat;
    private repeatCount;
    private start_time;
    private readonly callback;
    private readonly start;
    private readonly end;
    private progress;
    private _paused;
    private _done;
    constructor(startValue: number, endValue: number, duration: number, callback: (progress: number, value: number, startTime: number) => void, easingFunction: NdEasingF, repeat: number);
    get done(): boolean;
    stop(): void;
    pause(): void;
    get paused(): boolean;
    tick(time: number): void;
}

declare class NdAnimation<Model extends NdNodeStylesModel, N extends NdAnimatedNode<Model, any> = NdAnimatedNode<Model, any>> extends NdEmitter<{
    [key in 'step' | 'complete']: NdEvent<N, {
        progress: number;
        ease: number;
    }>;
}> {
    private readonly duration;
    private readonly easing;
    private stack;
    morphine?: NdMorphine;
    private readonly node;
    readonly target: null;
    private readonly _queue;
    private _active;
    private _done;
    constructor(node: N, stack: NdAnimationStack<Model>, duration?: number, easing?: keyof typeof ndEasings & string, queue?: boolean);
    get queue(): boolean;
    get active(): boolean;
    get done(): boolean;
    indexOf(property: string): number;
    get props(): (keyof Model)[];
    stop(property?: string): void;
    start(): void;
    private tick;
}

declare type ExtractAnimated<T extends NdNodeStylesModel, PT> = {
    [Key in keyof T]: T[Key] extends PT ? PT : never;
};
declare class NdAnimatedNode<Model extends NdNodeStylesModel, Scheme extends NdDestructibleEventScheme<NdAnimatedNode<Model, Scheme>> & {
    [key: string]: NdEvent<any, any>;
}> extends NdStyledNode<Model, Scheme> {
    protected animations?: NdAnimation<Model>[];
    private checkQueue;
    private findCompetitors;
    private tickElementAnimations;
    constructor(model: Model);
    get animated(): boolean;
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(props: {
        [Key in K]?: Parameters<Animated[Key]['set']>[0];
    }, duration?: number, easing?: keyof typeof ndEasings, queue?: boolean): NdAnimatedNode<Model, Scheme>;
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(props: {
        [Key in K]?: Parameters<Animated[Key]['set']>[0];
    }, config?: NodasAnimateConfig<NdAnimatedNode<Model, Scheme>>): NdAnimatedNode<Model, Scheme>;
    stop(prop?: keyof Extract<Model, NdNodeStylePropertyAnimated<any, any, any, any>>): this;
}

declare class Group extends Node<NdModBase> {
    protected Box: NdNodeBox;
    render: (context: CanvasRenderingContext2D, date: Date, frame: number) => CanvasRenderingContext2D;
    append: (node: Node<any> | Node<any>[]) => Group;
    prepend: (node: Node<any> | Node<any>[]) => Group;
    remove: (node: Node<any>) => Group;
    forEachChild: (cb: (e: Node<any>) => void) => Group;
    private appendChild;
    constructor(id: string);
    export(): HTMLCanvasElement;
    protected test: Node<NdModBase>['test'];
}

declare type NodeScheme<Model extends NdModBase> = {
    [key: string]: any;
} & NdNodeEventScheme<Node<Model, NodeScheme<Model>>>;
declare abstract class Node<Model extends NdModBase, Scheme extends NodeScheme<Model> = NodeScheme<Model>> extends NdAnimatedNode<Model, NodeScheme<Model>> {
    protected abstract render(...args: Parameters<NdMainDrawingPipeF>): ReturnType<NdMainDrawingPipeF>;
    protected abstract test(...args: Parameters<NdNodePointerPredicate>): ReturnType<NdNodePointerPredicate>;
    abstract export(...args: any[]): NdExportableReturn | undefined | void;
    protected app: Nodas | null;
    get mounted(): boolean;
    detach(soft?: boolean): this;
    attach(app: Nodas): this | undefined;
    renderTo(context: CanvasRenderingContext2D, time: Date): this;
    destroy(): undefined;
    get z(): number;
    set z(v: number);
    get id(): string;
    set id(v: string);
    private readonly treeConnector;
    protected mouseConnector: NdMouseConnector;
    pipe: NdCompiler<Model>['pipe'];
    unpipe: NdCompiler<Model>['unpipe'];
    condition: NdCompiler<Model>['filter'];
    protected cache: NdCache;
    protected compiler: NdCompiler<Model>;
    protected matrixContainer: NdNodeMatrixContainer;
    protected assembler?: NdNodeAssembler;
    protected constructor(id: string, model: Model);
    appendTo(node: Group): this;
    prependTo(node: Group): this;
    get parent(): Group | null;
    get matrix(): NdNodeMatrix;
    get width(): number;
    get height(): number;
    get left(): number;
    get top(): number | undefined;
    purgeBox(): Node<Model>;
    static transformContext(node: Node<any>, context: CanvasRenderingContext2D): void;
    static drawLinearPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdNodeAssembler): void;
    static drawBg<T extends NdModBg & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdNodeAssembler): void;
    static drawPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdNodeAssembler): void;
    static drawBezierPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdNodeAssembler): void;
    static clipBezierPath(path: NdPathBezier, context: CanvasRenderingContext2D, smooth?: boolean, closed?: boolean): void;
    static registerPath(path: NdPathBezier, context: CanvasRenderingContext2D, smooth?: boolean, closed?: boolean): void;
    static drawFill<T extends NdModBase & NdModBg & NdModFreeStroke>(styles: T, context: CanvasRenderingContext2D): void;
    static drawStroke<T extends NdModBase & NdModFreeStroke>(styles: T, context: CanvasRenderingContext2D): void;
    static applyBoxAnchor(position: [x: number, y: number], width: number, height: number, data: NdModAnchor): void;
}

declare class NdNodeBox {
    private readonly box;
    private readonly getter;
    purge: () => void;
    get value(): NdBox;
    constructor(node: Node<any>, Cache: NdCache, boxGetter: (n: typeof node) => Parameters<NdBox['value']>);
}

declare abstract class NdBaseNode<Scheme extends NdDestructibleEventScheme<NdBaseNode<Scheme>>, K extends keyof Scheme = keyof Scheme> extends NdDestroyableNode<Scheme> {
    protected abstract Box?: NdNodeBox;
    protected constructor();
    get box(): {
        size: NdNumericArray2d;
        position: NdNumericArray2d;
    } | undefined;
    get boundingRect(): {
        margin: [number, number, number, number];
        position: NdNumericArray2d;
        size: NdNumericArray2d;
    } | undefined;
}

declare class NdStyledNode<Model extends NdNodeStylesModel, Scheme extends NdDestructibleEventScheme<NdStyledNode<Model, Scheme>>> extends NdBaseNode<Scheme> {
    protected Box?: NdNodeBox;
    protected modelEmitter: EventEmitter$1;
    protected order: (keyof Model)[];
    protected data?: Model;
    constructor(styles: Model);
    style(prop: keyof Model): Model[keyof Model]['publicValue'];
    style<K extends keyof Model>(prop: K, value?: Parameters<Model[K]['set']>[0]): Model[keyof Model]['publicValue'];
    style(props: {
        [Prop in keyof Model]?: Parameters<Model[Prop]['set']>[0];
    }): NdStyledNode<Model, Scheme>;
    watch(prop: keyof Model | (keyof Model)[], callback: () => void): NdStyledNode<Model, Scheme>;
    unwatch(prop: keyof Model | (keyof Model)[], callback: () => void): NdStyledNode<Model, Scheme>;
}

declare type forkArray<T, True, False> = T extends any[] ? True : False;
declare type ModelPropertyValueCallback<T> = (itemIndex: number, itemValueIndex?: number) => T;
declare class NdStylesProperty<StoreType, GetType, SetType, Node extends NdStyledNode<any, any> = NdStyledNode<any, any>> {
    private _value;
    readonly default: StoreType;
    readonly ordering: number;
    get: () => GetType;
    set: (value: SetType, node: Node) => StoreType;
    reset: () => void;
    private value;
    get protectedValue(): StoreType;
    get publicValue(): GetType;
    sync<T extends StoreType & any[], K extends keyof T & number, M extends keyof T[K] & number>(model: any[], filler: T[K] | forkArray<T[K], ModelPropertyValueCallback<T[K][M]>[], ModelPropertyValueCallback<T[K]>>): void;
    constructor(order: number, initial: StoreType, get: (current: StoreType) => GetType, set?: (value: SetType, node: Node) => StoreType);
}

declare abstract class NdNodeStylesModel {
    [key: string]: NdStylesProperty<any, any, any> | NdNodeStylePropertyAnimated<any, any, any, any>;
    static degToRad(value: number): number;
    static radToDeg(value: number): number;
    static normalizeColor(color: NdColorStr | NdArrColor): NdArrColor;
    static colorToArray(value: NdColorStr): NdArrColor;
    static arrayToColor(value: NdArrColor): NdColorStr;
    static getControlPoints(...[x0, y0, x1, y1, x2, y2, t]: [number, number, number, number, number, number, number]): NDCpArr;
    static convertComplexPath(path: NdPathBezier): NdPath;
    static convertSimplePath: (path: NdPath, closed?: boolean) => NdPathBezier;
    static interpolate(path: NdPathBezier, smoothing: number, closed: boolean): void;
    static getPathSegmentTPoint([sx, sy, ex, ey, cp1x, cp1y, cp2x, cp2y]: NdSegmentBezier, t: number): NdNumericArray2d;
    static comparePaths(path1: NdPath | NdPathBezier, path2: NdPath | NdPathBezier): boolean;
    static extractPercentFraction(value: NdPercentStr): number;
    static syncArray<T extends any[], K extends keyof T, V extends any[]>(base: any[], array: T, filler: V): void;
}

declare class NdMouseEvent<Target> extends NdEvent<Target, NdMouseEventData> {
    constructor(target: Target, data: NdMouseEventData);
}

declare class NdStateEvent<Target, Data extends Nodas = Nodas> extends NdEvent<Target, Data> {
    constructor(target: Target, data: Data);
}

declare class NdSprite extends NdResource<HTMLCanvasElement | HTMLImageElement> {
    private frameCount;
    private refreshRate;
    private frameTime;
    private canvas?;
    private image?;
    private chunkSize;
    private chunkXYCount;
    private timeStart;
    private duration;
    private frozen;
    private defineImage;
    private setFrameData;
    constructor(url: NdUrlSpriteStr);
    get paused(): boolean;
    pause(): void;
    play(): void;
    get frames(): number;
    set frames(val: number);
    get width(): number;
    get height(): number;
    get size(): number[];
    get fps(): number;
    set fps(value: number);
    export(time: Date): HTMLCanvasElement | undefined;
    static isNdUrlSpriteStr(str: string): boolean;
}

declare class NdLayer extends NdDestroyableNode<NdDestructibleEventScheme<NdLayer>> {
    private canvas?;
    private width;
    private height;
    private f?;
    private ready;
    private ordering;
    constructor(resolver: NdAssemblerContextResolver);
    draw(context: CanvasRenderingContext2D): void;
    get resolver(): NdAssemblerContextResolver | undefined;
    get size(): NdNumericArray2d;
    set size([width, height]: NdNumericArray2d);
    get order(): number;
    set order(order: number);
    update(): void;
}

declare class NdDestroyEvent<Target> extends NdEvent<Target, null> {
    constructor(target: Target);
}

declare type GroupChildren = Node<any> | Node<any>[];
declare type NdAssemblerContextResolver = (context: CanvasRenderingContext2D) => void;
declare type NdCacheGetter<T> = () => T;
declare type NdExportableReturn = HTMLCanvasElement | HTMLImageElement;
declare type NdExportable = ((...args: any[]) => NdExportableReturn) | NdExportableReturn;
declare type NdCacheRegisterFReturn<T> = {
    purge: () => void;
    getter: () => T;
};
declare type NdNodePointerPredicate = (cursor: NdNumericArray2d) => Node<any> | false;
declare type NdMouseEventData = {
    page: NdNumericArray2d;
    screen: NdNumericArray2d;
    cursor: NdNumericArray2d;
};
declare type NdNodeMouseEventsScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
    mouseMove: NdMouseEvent<Class>;
    mouseLeave: NdMouseEvent<Class>;
    mouseEnter: NdMouseEvent<Class>;
    mouseUp: NdMouseEvent<Class>;
    mouseDown: NdMouseEvent<Class>;
    dragStart: NdMouseEvent<Class>;
    dragEnd: NdMouseEvent<Class>;
    dragMove: NdMouseEvent<Class>;
    focus: NdMouseEvent<Class>;
    blur: NdMouseEvent<Class>;
};
declare type NdDestructibleEventScheme<Class extends NdEmitter<any>> = {
    destroy: NdDestroyEvent<Class>;
    destroyed: NdDestroyEvent<Class>;
};
declare type NdNodeBasicEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
    mount: NdStateEvent<Class>;
    unmount: NdStateEvent<Class>;
};
declare type NdParticleEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
    ready: NdEvent<Class, null>;
};
declare type NdNodeAssemblerEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
    resize: NdStateEvent<Class>;
    update: NdStateEvent<Class>;
} & NdDestructibleEventScheme<Class>;
declare type NdNodeStateEventsScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
    export: NdStateEvent<Class>;
    update: NdStateEvent<Class>;
};
declare type NdNodeEventScheme<Class extends NdEmitter<any>> = {
    [key: string]: NdEvent<any, any>;
} & NdDestructibleEventScheme<Class> & NdNodeBasicEventScheme<Class> & NdNodeStateEventsScheme<Class> & NdNodeMouseEventsScheme<Class>;
declare type NdRootCanvasMouseEventsScheme = {
    [key: string]: NdEvent<any, any>;
    mouseEnter: NdMouseEvent<Canvas>;
    mouseLeave: NdMouseEvent<Canvas>;
    mouseMove: NdMouseEvent<Canvas>;
    mouseDown: NdMouseEvent<Canvas>;
    mouseUp: NdMouseEvent<Canvas>;
};
declare type NdRootCanvasStateEventsScheme = {
    [key: string]: NdEvent<any, any>;
    switch: NdEvent<Canvas, null>;
    resize: NdEvent<Canvas, null>;
};
declare type NdParticleModifier = (vector: NdParticleVector) => void;
declare type NdParticleArgs = [
    sprite: NdParticleSpriteResource | string,
    resolver: (vector: NdParticleVector, progress: number, time: Date) => boolean,
    initiator?: (vector: NdParticleVector, time: Date) => boolean
];
declare type NodasAssemblerUpdateF<T extends AssemblerLayerConfig[], K extends number = keyof T & number> = (name?: T[K]['name']) => void;
declare type AssemblerLayerConfig = {
    name: string;
    resolver: ConstructorParameters<typeof NdLayer>[0];
};
declare type NdStylePropAnimatedStarter<T, C, A> = (current: C, value: T, setStart: (val: A) => void, setEnd: (val: A) => void) => void;
declare type NdStylePropAnimatedApplier<T, E> = (value: T, node: E, progress: number) => T;
declare type NodasTickingType = number | NdPercentStr | NdTickingArr | NdTickingObj | NdTickingF;
declare type NdTickingObj = {
    [key: string]: NodasTickingType;
};
declare type NdTickingArr = NodasTickingType[];
declare type NdTickingF = () => NodasTickingType;
declare type NdEasingF = (timeElapsedS: number, startValue: number, valueDelta: number, durationS: number) => number;
declare type NdAnimationStack<Model extends NdNodeStylesModel> = {
    value: any;
    result?: NodasTickingType;
    name: string;
    ani: NdNodeStylePropertyAnimated<any, any, any, any>;
}[];
interface NodasAnimateConfig<Class extends NdAnimatedNode<any, any>> {
    easing?: keyof typeof ndEasings;
    queue?: boolean;
    duration?: number;
    step?: (event: NdEvent<Class, any>) => void;
    complete?: (event: NdEvent<Class, any>) => void;
}
declare type NdPercentStr = (`${number}%` | `${number}.${number}%` | `.${number}%`) & string;
declare type NdColorStr = `rgba(${number},${number},${number},${number})` & string;
declare type NdURLStr = `${string}.${('png' | 'jpg')}` | `data:image/${string};base64,${string}` & string;
declare type NdUrlSpriteStr = `${string}.${('png' | 'jpg' | 'font')}[${number}]` | `[${number}]data:image/${string};base64,${string}` & string;
declare type NdPosition = NdPercentStr | 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | number;
declare type NdSize = number | 'auto';
declare type NdSizeArr = [NdSize, NdSize];
declare type NdPositionArr = [NdPosition, NdPosition];
declare type NdBg = (NdImage | NdURLStr)[] | NdImage | NdURLStr;
declare type NdBgSize = [NdPercentStr | 'auto' | number, NdPercentStr | 'auto' | number];
declare type NdArrColor = [r: number, g: number, b: number, a: number];
declare type NDCpArr = [number, number, number, number];
declare type NdSegmentBezier = [x1: number, y1: number, x2: number, y2: number, cx1: number, cy1: number, cx2: number, cy2: number];
declare type NdPathBezier = NdSegmentBezier[];
declare type NdPath = NdNumericArray2d[];
declare type NdColorArr = NdColorStr[];
declare type NdColorBox = [NdColorStr, NdColorStr, NdColorStr, NdColorStr];
declare type NdColorArrBox = [NdArrColor, NdArrColor, NdArrColor, NdArrColor];
declare type NdStrokeWidthBox = [number, number, number, number];
declare type NdStrokeWidthArr = number[];
declare type NdStrokeStyle = number[];
declare type NdStrokeStyleArr = NdStrokeStyle[];
declare type NdAnchor = [x: 'left' | 'right' | 'center', y: 'top' | 'bottom' | 'middle'];
declare type NdCap = 'round' | 'butt' | 'square';
declare type NdBlend = 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
declare type NdParticleVector = [x: number, y: number, r: number, xsk: number, ysk: number, xsc: number, ysc: number, o: number];
declare type NdMatrixVal = [number, number, number, number, number, number];
declare type NdParticleSpriteResource = NdSprite | NdImage | HTMLCanvasElement | HTMLImageElement;

declare class Canvas extends NdEmitter<NdRootCanvasMouseEventsScheme & NdRootCanvasStateEventsScheme> {
    private e;
    private context;
    private s;
    private sNumeric;
    private resizeProcessTimeout;
    private q;
    private _ready;
    private _clear;
    private args;
    private scroll;
    private offset;
    private cursor;
    private updateEventData;
    private onCanvasMouseMove;
    private onCanvasMouseLeave;
    private onCanvasMouseEnter;
    private onCanvasMouseDown;
    private onCanvasMouseUp;
    private removeEventListeners;
    private addEventListeners;
    private recalculateOffset;
    private getMouseRelativePosition;
    private recalculateSize;
    private handleResize;
    private DrawScene;
    constructor(TickerModule: Ticker);
    element(target: HTMLCanvasElement | string): void;
    queue(a: NdCanvasQueueCallback | number, b?: NdCanvasQueueCallback): this;
    unQueue(callback: NdCanvasQueueCallback): void;
    size(width?: number | NdPercentStr, height?: number | NdPercentStr): number[] | undefined;
    forceResize(): void;
    get ready(): boolean;
    get clear(): boolean;
    set clear(value: boolean);
}

declare class NdNodeConnector {
    private _parent;
    private layers;
    private layer;
    private identifier;
    render: NdMainDrawingPipeF;
    zChild(node: Node<any>, z: number, prepend?: boolean): void;
    removeChild(node: Node<any>, z: number): void;
    constructor(id: string, render: NdMainDrawingPipeF);
    reset(): void;
    get z(): number;
    set z(value: number);
    get parent(): Group | null;
    set parent(value: Group | null);
    set id(id: string);
    get id(): string;
    forEachChild(callback: (e: Node<any>, index: number, layer: number) => void): void;
}

declare class Nodes {
    private _root;
    private clear;
    private ids;
    private nodes;
    private drawNodeTree;
    constructor(Canvas: Canvas);
    register(node: Node<any>, connector: NdNodeConnector): void;
    unregister(node: Node<any>): void;
    compile(node: Node<any>, context: CanvasRenderingContext2D, date: Date, frame: number): void;
    rename(id: string, newId: string): void;
    get(id: string): Node<any>;
    get root(): Group | undefined;
    static treeViolation(target: Group, node: Node<any>): boolean;
}

declare class Mouse {
    private Nodes;
    private currentHover;
    private currentFocus;
    private mouseDown;
    private dragging;
    private eventStack;
    private postponed;
    protected maxEventsPerQueue: number;
    protected maxEventsResolveTimePerFrame: number;
    constructor(Canvas: Canvas, Ticker: Ticker, Tree: Nodes);
    checkNode(node: Node<any>, cursor: NdNumericArray2d): Node<any> | false;
    private resolveStack;
    private getStackCallback;
    private resolveOrPostpone;
    register<Props extends NdModBase>(node: Node<any>, handler: NdMouseConnector<any>): NdMouseConnector<any>;
    unregister<Props extends NdModBase>(node: Node<any>): void;
}

declare type LineNodeModel = NdModFreeStroke & NdModAnchor & NdModBase;
declare class Line extends Node<LineNodeModel> {
    private xShift;
    private yShift;
    private strokeFix;
    private interpolationFix;
    private interpolated;
    private mouseTester?;
    protected Box?: NdNodeBox;
    protected assembler?: NdNodeAssembler;
    constructor(id: string);
    export(): HTMLCanvasElement | undefined;
    test(cursor: NdNumericArray2d): Line | false;
    render(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
}

declare class NdModCirc extends NdNodeStylesModel {
    radius: NdNodeStylePropertyAnimated<number, number, number, number, NdStyledNode<any, any>>;
    strokeWidth: NdNodeStylePropertyAnimated<number, number, number, number, NdStyledNode<any, any>>;
    strokeColor: NdNodeStylePropertyAnimated<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})` | NdArrColor, NdArrColor, NdStyledNode<any, any>>;
    strokeStyle: NdStylesProperty<NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStyledNode<any, any>>;
}

declare type CircleNodeModel = NdModCirc & NdModBg & NdModAnchor & NdModBase;
declare class Circle extends Node<CircleNodeModel> {
    protected Box?: NdNodeBox;
    private strokeFix;
    protected test: Node<CircleNodeModel>['test'];
    protected assembler?: NdNodeAssembler;
    constructor(id: string);
    render(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
    export(): HTMLCanvasElement | undefined;
}

declare class NdModSprite extends NdNodeStylesModel {
    src: NdStylesProperty<NdImage | NdSprite | false, NdUrlSpriteStr | NdURLStr | false, NdURLStr | NdUrlSpriteStr | false>;
    frames: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    fps: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    size: NdNodeStylePropertyAnimated<NdSizeArr, NdSizeArr, NdSize | NdSizeArr, NdNumericArray2d, NdStyledNode<any, any>>;
}

declare type ImageNodeModel = NdModSprite & NdModAnchor & NdModBase;
declare class Sprite extends Node<ImageNodeModel> {
    export(date?: Date): HTMLCanvasElement | HTMLImageElement | undefined;
    render(context: CanvasRenderingContext2D, time: Date): CanvasRenderingContext2D;
    test(cursor: NdNumericArray2d): false | this;
    protected Box?: NdNodeBox;
    pause(): void;
    play(): void;
    constructor(id: string);
}

declare type AreaStaticModel = NdModFreeStroke & NdModBg & NdModAnchor & NdModBase;
declare class Area extends Node<AreaStaticModel> {
    private xShift;
    private yShift;
    private strokeFix;
    private interpolationFix;
    private interpolated;
    private mouseTester?;
    protected Box: NdNodeBox;
    protected assembler?: NdNodeAssembler;
    protected test(cursor: NdNumericArray2d): Area | false;
    constructor(id: string);
    export(): HTMLCanvasElement;
    protected render(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
}

declare class NdModSize extends NdNodeStylesModel {
    size: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
}

declare class NdModRect extends NdNodeStylesModel {
    radius: NdNodeStylePropertyAnimated<[number, number, number, number], [number, number, number, number], number | [number, number, number, number], [number, number, number, number], NdStyledNode<any, any>>;
    strokeColor: NdNodeStylePropertyAnimated<NdColorBox, NdColorBox, `rgba(${number},${number},${number},${number})` | NdArrColor | NdColorBox | NdColorArrBox, NdColorArrBox, NdStyledNode<any, any>>;
    strokeWidth: NdNodeStylePropertyAnimated<NdStrokeWidthBox, NdStrokeWidthBox, number | NdStrokeWidthBox, NdStrokeWidthBox, NdStyledNode<any, any>>;
    strokeStyle: NdStylesProperty<[NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle], [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle], NdStrokeStyle | [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle], NdStyledNode<any, any>>;
    static buildRectPath(node: Rectangle, model: NdModRect): NdPathBezier;
}

declare type RectNodeModel = NdModRect & NdModSize & NdModAnchor & NdModBg & NdModBase;
declare class Rectangle extends Node<RectNodeModel> {
    private strokeFix;
    private readonly path;
    private readonly purgePath;
    protected Box?: NdNodeBox;
    protected assembler?: NdNodeAssembler;
    constructor(id: string);
    export(): HTMLCanvasElement | undefined;
    protected test(cursor: NdNumericArray2d): false | this;
    protected render(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
    private static drawCorner;
    private static drawBridge;
    private drawRectStroke;
}

declare class NdModEmitter extends NdNodeStylesModel {
    position: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    limit: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    intensity: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    shape: NdStylesProperty<number | NdPathBezier, number | NdPath, number | NdPath, NdStyledNode<any, any>>;
}

declare class NdModParticle extends NdNodeStylesModel {
    lifetime: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    blending: NdStylesProperty<NdBlend, NdBlend, NdBlend, NdStyledNode<any, any>>;
    opacity: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    origin: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    vector: NdStylesProperty<NdParticleVector, NdParticleVector, NdParticleVector, NdStyledNode<any, any>>;
    rotate: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    scale: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    skew: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    position: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
}

declare class Particle extends NdStyledNode<NdModParticle, NdParticleEventScheme<Particle> & NdDestructibleEventScheme<Particle>> {
    private sprite;
    private origin;
    private readonly _resolver;
    private readonly _initiator?;
    private _matrix?;
    private _initialised;
    private startTime;
    private resetMatrix;
    private updateOrigin;
    get startedAt(): number;
    opacify(amount: number): void;
    push(vector: NdNumericArray2d): this;
    turn(rad: number): this;
    explode(vector: NdParticleVector): this;
    jelly(vector: NdNumericArray2d): this;
    render(applyContext: (vector: NdParticleVector) => void, context: CanvasRenderingContext2D, time: Date): void;
    get initialized(): boolean;
    reset(): this;
    constructor(...[sprite, resolver, initiator]: NdParticleArgs);
}

declare class NdModField extends NdNodeStylesModel {
    wind: NdStylesProperty<NdNumericArray2d, NdNumericArray2d, NdNumericArray2d, NdStyledNode<any, any>>;
    gravity: NdStylesProperty<number, number, number>;
    viscosity: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
}

declare class Field extends Node<NdModField & NdModBase> {
    private fps;
    private active;
    private emitters?;
    private particles?;
    private modifiers?;
    private fieldFpsCallback;
    private self;
    ParticleEmitter: new (initiator: (time: Date) => Particle) => ParticleEmitter;
    Particle: new (...args: NdParticleArgs) => Particle;
    attach(app: Nodas): this | undefined;
    detach(): this;
    constructor(id: string);
    private applyFieldVector;
    export(): undefined;
    modify(modifier: NdParticleModifier | NdParticleModifier[]): this;
    simplify(modifier: NdParticleModifier): this;
    render(context: CanvasRenderingContext2D, time: Date): CanvasRenderingContext2D;
    test(): false;
    add(particle: Particle | Particle[]): Field;
    emitter(emitter: ParticleEmitter): ParticleEmitter;
    remove(particle: Particle | Particle[]): this;
    start(): this;
    stop(): this;
    static Particle: typeof Particle;
}

declare class ParticleEmitter extends NdStyledNode<NdModEmitter, NdNodeBasicEventScheme<ParticleEmitter> & NdDestructibleEventScheme<ParticleEmitter>> {
    private readonly initiator;
    private particles?;
    private emitTimeout;
    private lastEmittedAt;
    private _field;
    constructor(initiator: (time: Date) => Particle);
    field(field: Field): this;
    render(context: CanvasRenderingContext2D, time: Date): void;
}

declare class NdModText extends NdNodeStylesModel {
    str: NdStylesProperty<string, string, string, NdStyledNode<any, any>>;
    width: NdStylesProperty<number | "auto", number | "auto", number | "auto", NdStyledNode<any, any>>;
    font: NdStylesProperty<string, string, string, NdStyledNode<any, any>>;
    color: NdStylesProperty<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, NdStyledNode<any, any>>;
    weight: NdStylesProperty<NdFontWeights, NdFontWeights, NdFontWeights, NdStyledNode<any, any>>;
    lineHeight: NdStylesProperty<number, number, number, NdStyledNode<any, any>>;
    style: NdStylesProperty<NdFontStyles, NdFontStyles, NdFontStyles, NdStyledNode<any, any>>;
}

declare type TextNodeModel = NdModText & NdModAnchor & NdModBase;
declare class Text extends Node<TextNodeModel> {
    private textBlock?;
    protected assembler?: NdNodeAssembler;
    protected Box?: NdNodeBox;
    constructor(id: string);
    protected render(context: CanvasRenderingContext2D): CanvasRenderingContext2D;
    private syncStylesToBlock;
    private bindProps;
    export(): void;
    protected test(cursor: NdNumericArray2d): false | this;
}

declare class NdFont extends NdResource<HTMLCanvasElement> {
    private context?;
    private styles?;
    private str;
    private scheme;
    private fontMaxLoadTime;
    private fontLoadStart;
    private fontMeasureBuffer;
    private loadFont;
    private measureFont;
    private initMeasureBuffer;
    private formatStr;
    get name(): string;
    string(style: NdFontStyles, weight: NdFontWeights, size: number, lineHeight?: number): string;
    export: () => HTMLCanvasElement;
    constructor(root?: string, format?: NdFontFormats[], scheme?: NdFontDescription);
    static extractNumericWeight(word: NdFontWeights): 100 | 200 | 300 | 400 | 500 | 600 | 700 | 900 | 1000;
    static readonly CONSTFONTCHECKSTRING = "abcdefghijklmnopqrstuvwxyz 1234567890[!?,.<>\"\u00A3$%^&*()~@#-=]";
}

declare class NodasFonts {
    private fonts;
    private fontRootPath;
    private format;
    get root(): string;
    set root(value: string);
    get formats(): NdFontFormats[];
    set formats(value: NdFontFormats[]);
    add(font: NdFontDescription): NdFont;
    get(name: string): NdFont | null;
}
declare const _default$1: NodasFonts;

declare class NodasResources {
    private images;
    private hash;
    image(src: string, onLoad?: () => void, onError?: () => void, onReset?: () => void): HTMLImageElement;
    reset(): void;
    bulkLoad(resources: NdURLStr[]): void;
}
declare const NDR: NodasResources;

declare class NodasRandom {
    number(range: NdNumericArray2d | number, precision?: number): number;
    point(randomVector: NdNumericArray2d, precision?: number): NdNumericArray2d;
    pointWithinCircle(r: number, precision?: number): number[];
    pointOnCircle(r: number, precision?: number): NdNumericArray2d;
    pointOnPath(segment: NdSegmentBezier): NdNumericArray2d;
    luck(probability: number): boolean;
    setItem<T>(set: T[], probabilities?: number[]): T;
}
declare const _default: NodasRandom;

declare class NodasDebug extends NdEmitter<{
    message: string;
    error: string;
    info: string;
    important: string;
}> {
    private prefix;
    private warnings;
    private groupLevel;
    private currentLevel;
    private separatorMessages;
    verbose: boolean;
    constructor();
    private getMessage;
    error(message: string | Error): void;
    warn(message: string, verbose?: boolean): void;
    info(message: string): void;
    message(message: string): void;
    separator(message: string): void;
    separatorEnd(): void;
    positive(message: string): void;
    negative(message: string): void;
    group(message: string): void;
    groupEnd(): void;
}
declare const NDB: NodasDebug;

declare class Nodas {
    readonly ticker: Ticker;
    readonly canvas: Canvas;
    readonly nodes: Nodes;
    readonly mouse: Mouse;
    Sprite: new (id: string, src?: NdUrlSpriteStr | NdURLStr) => Sprite;
    Area: new (id: string, path?: NdPath) => Area;
    Rectangle: new (id: string, size?: NdNumericArray2d) => Rectangle;
    Line: new (id: string, path?: NdPath) => Line;
    Text: new (id: string, str?: string) => Text;
    Group: new (id: string, children?: GroupChildren) => Group;
    Circle: new (id: string, radius?: number) => Circle;
    Field: new (id: string, options?: {
        [key in keyof NdModField]?: Parameters<NdModField[key]['set']>[0];
    }) => Field;
    get(id: string): Node<any>;
    append: (node: Node<any> | Node<any>[]) => Nodas;
    setRoot(node: Group): this;
    Animation: typeof NdSprite;
    Image: typeof NdImage;
    constructor(canvas: HTMLCanvasElement | string);
}

declare const Fonts: typeof _default$1;
declare const Resources: typeof NDR;
declare const NodasImage: typeof NdImage;
declare const NodasSprite: typeof NdSprite;
declare const NodasRand: typeof _default;

export { Area, Circle, Field, Fonts, Group, Line, NDB, NdImage, NdSprite, NodasImage, NodasRand, NodasSprite, Node, Particle, ParticleEmitter, Rectangle, Resources, Sprite, Text, Nodas as default };
