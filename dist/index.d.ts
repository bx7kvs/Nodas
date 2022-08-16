declare class Ticker {
    private frameDuration;
    private q;
    private frame;
    private args;
    private interval?;
    private eventsCb;
    private draw;
    private tick;
    private resolve;
    queue: NdTickerQueueF;
    on(event: NdTickerEvents, cb: NdTickerEventCb): void;
    stop(): this;
    start(): this;
    get frameTime(): number;
    fps(fps: number): this;
}

declare type NdCanvasContext = CanvasRenderingContext2D | null;
declare type NdCanvasQueueCallbackArgs = [NdCanvasContext, Date, number];
declare type NdCanvasQueueCallback = (...args: NdCanvasQueueCallbackArgs) => void;
declare type NdNumericArray2d = [x: number, y: number];
declare type NdMainDrawingPipeFArgs = [context: CanvasRenderingContext2D, date: Date, frame: number];
declare type NdMainDrawingPipeF = (...args: NdMainDrawingPipeFArgs) => NdMainDrawingPipeFArgs[0] | false;
declare type NdRenderConditionPredicate = (...args: NdMainDrawingPipeFArgs) => boolean;
declare type NdConfigPropertyCheckName = 'isNumber' | 'isString' | 'isArray' | 'custom' | 'under' | 'greater' | 'eq' | 'isBool';
declare type NdConfigPropertyCustomCheck = (v: NdConfigPropertyValue) => boolean;
declare type NdConfigPropertyWatcher<T> = (v: T) => void;
declare type NdConfigPropertyCheckValue = undefined | string | number | boolean | NdConfigPropertyCustomCheck;
declare type NdConfigPropertyValue = string | [] | number | boolean | undefined | {} | null;
declare type NdConfigPropertyChecks = {
    [K in NdConfigPropertyCheckName]?: NdConfigPropertyCheckValue;
};
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
declare type NdTickerEvents = 'stop' | 'start' | 'error';
declare type NdTickerEventCb = (data: Error | Ticker) => void;
interface NdListenable<Scheme, K extends keyof Scheme = keyof Scheme> {
    on: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
    once: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
    off: (event: K | K[], callback: (event: Scheme[K]) => any) => any;
}

declare class NdMatrix {
    private _element;
    private _value;
    private _inversion;
    private _globalInversion;
    private history;
    constructor(element: Node<any>);
    invert(): void;
    rotate(angle: number): this;
    translate(x: number, y: number): this;
    scale(...[x, y]: NdNumericArray2d): this;
    skew(...[x, y]: NdNumericArray2d): this;
    globalInversion(): NdMatrixVal;
    traceCursorToLocalSpace(point: NdNumericArray2d): NdNumericArray2d;
    reset(): void;
    purgeInversion(): void;
    extract(): NdMatrixVal;
    extractInversion(): NdMatrixVal;
    private static multiply;
    private static applyMatrixToPoint;
}

declare class NdNodeStylePropertyAnimated<StoreType, GetType, SetType, AniType extends SetType, Element extends Node<any> = Node<any>> extends NdStylesProperty<StoreType, GetType, SetType> {
    private readonly starter;
    private readonly applier;
    private _start?;
    private _end?;
    constructor(order: number, initial: StoreType, getter: (current: StoreType) => GetType, setter: (value: SetType, element: Node<any>) => StoreType, starter: NdStylePropAnimatedStarter<SetType, GetType, AniType>, applier: NdStylePropAnimatedApplier<AniType, Element>);
    get start(): false | AniType | undefined;
    private set start(value);
    get end(): false | AniType | undefined;
    private setStartValue;
    private setEndValue;
    init(value: SetType): this;
    apply(element: Element, progress: number, value: AniType): GetType;
}

declare class NdModBase extends NdNodeStylesModel {
    position: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
    scale: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
    rotate: NdNodeStylePropertyAnimated<number, number, number, number, Node<any>>;
    translate: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
    skew: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
    opacity: NdNodeStylePropertyAnimated<number, number, number, number, Node<any>>;
    origin: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
    cap: NdStylesProperty<NdCap, NdCap, NdCap>;
    blending: NdStylesProperty<NdBlend, NdBlend, NdBlend>;
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

declare class NdCache {
    private values;
    register<T>(name: string, func: NdCacheGetter<T>): NdCacheRegisterFReturn<T>;
}

declare class NdNodeBox {
    private box;
    private getter;
    purge: () => void;
    get value(): NdBox;
    constructor(element: Node<any>, Cache: NdCache, boxGetter: (e: typeof element) => Parameters<NdBox['value']>);
}

declare class Group extends Node<NdModBase> {
    protected Box: NdNodeBox;
    protected render: Node<NdModBase>['render'];
    protected test: Node<NdModBase>['test'];
    export: Node<NdModBase>['export'];
    constructor(id: string, app: Nodas);
    forEachChild(cb: (e: Node<any>) => void): void;
    append(node: Node<any> | Node<any>[]): this;
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

declare class NdEmitter<Scheme, K extends keyof Scheme = keyof Scheme> implements NdListenable<Scheme, K> {
    private Emitter;
    protected cast(event: keyof Scheme, data: Scheme[K]): Scheme[K];
    protected reset(): void;
    on(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
    once(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
    off(event: K | (K)[], callback: (event: Scheme[K]) => void): void;
}

declare class NdNodeMatrix<Model extends NdModBase = NdModBase, N extends Node<Model> = Node<Model>> {
    private getter;
    purge: () => void;
    get value(): NdMatrix;
    constructor(element: N, model: Model, cache: NdCache);
}

declare class Nodes {
    private _root;
    private clear;
    private ids;
    private elements;
    private drawNodeTree;
    constructor(Canvas: Canvas);
    private treeViolation;
    register(id: string, element: Node<any>, render: NdMainDrawingPipeF): NdNodeConnector;
    unregister(element: Node<any>): void;
    unmount(element: Node<any>): void;
    compile(element: Node<any>, context: CanvasRenderingContext2D, date: Date, frame: number): void;
    rename(id: string, newId: string): void;
    z(element: Node<any>, z: number): void;
    get(id: string): Node<any>;
    get root(): Group | undefined;
    append(target: Group, id: string, prepend?: boolean): void;
}

declare class NdNodeConnector {
    private _parent;
    private _layers;
    private _layer;
    private _identifier;
    readonly tree: Nodes;
    constructor(id: string, tree: Nodes);
    get z(): number;
    set z(value: number);
    get parent(): Group | null;
    set parent(value: Group | null);
    set id(id: string);
    get id(): string;
    forEachLayer(callback: (e: Node<any>, index: number, layer: number) => void): void;
    zChild(element: Node<any>, z: number, prepend?: boolean): void;
    removeChild(element: Node<any>, z: number): void;
}

declare class NdCompiler<Props extends NdModBase, Element extends Node<Props> = Node<Props>> {
    private readonly resolver;
    private readonly element;
    private readonly props;
    private conditions;
    private drawerPipeBefore;
    private drawerPipeAfter;
    private beforePipeSize;
    private afterPipeSize;
    private isRenderAllowed;
    constructor(element: Element, model: Props, resolver: NdMainDrawingPipeF);
    filter(f: NdRenderConditionPredicate): void;
    pipe(f: NdMainDrawingPipeF, order?: number): Element;
    unpipe(f: NdMainDrawingPipeF): Element;
    render: NdMainDrawingPipeF;
}

declare class NdNodeMouseDispatcher<Props extends NdModBase = NdModBase> {
    private _disabled;
    readonly test: NdNodePointerPredicate;
    readonly transform?: NdNodePointerTransformF;
    private emit;
    constructor(emitter: Node<Props>['cast'], tester: NdNodePointerPredicate, transformer?: NdNodePointerTransformF);
    cast(event: Parameters<Node<Props>['cast']>[0], data: Parameters<Node<Props>['cast']>[1]): ReturnType<Node<Props>['cast']> | false;
    get disabled(): boolean;
    disable(): void;
    enable(): void;
}

declare abstract class NdResource<T extends NdExportable> extends NdEmitter<{
    load: null;
    error: null;
}> {
    private readonly src;
    private readonly resolve;
    protected _status: number;
    protected resolved: boolean;
    abstract readonly export: T | ((...args: any) => void);
    constructor(url: NdURLStr, resolve: () => NdResource<T>);
    get url(): NdURLStr;
    get loaded(): boolean;
    get error(): boolean;
    load(): NdResource<T>;
}

declare class NdImage extends NdResource<() => HTMLImageElement> {
    readonly image: HTMLImageElement;
    private _size;
    constructor(url: NdURLStr);
    export: () => HTMLImageElement;
    get width(): number;
    get height(): number;
    get size(): number[];
    static NdUrlStrRegex: RegExp;
    static isNdUrlStrRegex(str: string): boolean;
}

declare class NdModBg extends NdNodeStylesModel {
    static normalizeBgPosition(value: NdPosition): NdPercentStr | number;
    static readBgPosition(boxSize: NdNumericArray2d, bgSize: NdBgSize, image: NdImage, dir: 0 | 1, value: NdPosition): number;
    static readBgSize(boxSize: NdNumericArray2d, bg: NdImage, dir: number, value: (NdPercentStr & string) | ('auto' & string) | number): number;
    fill: NdNodeStylePropertyAnimated<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})` | NdArrColor, NdArrColor, Node<any>>;
    bg: NdStylesProperty<NdImage[], NdURLStr[], NdBg | {
        [key: number]: NdURLStr | NdImage;
    }>;
    backgroundSize: NdStylesProperty<NdBgSize[], NdBgSize[], number | `${number}%` | `${number}.${number}%` | `.${number}%` | NdBgSize | {
        [key: number]: NdBgSize;
    } | NdBgSize[]>;
    backgroundSizeNumeric: NdStylesProperty<[number, number][], [number, number][], void>;
    backgroundPosition: NdStylesProperty<NdPositionArr[], NdPositionArr[], NdPositionArr | {
        [key: number]: NdPositionArr;
    } | NdPosition | NdPositionArr[]>;
    backgroundPositionNumeric: NdStylesProperty<[number, number][], [number, number][], void>;
    static updateSizeAndPosition: (model: NdModBg, box: [number, number], key: number, value: NdImage) => void;
}

declare class NdModFreeStroke extends NdNodeStylesModel {
    path: NdStylesProperty<NdPathBezier, NdPath, NdPath>;
    constructor(closed?: boolean);
    interpolation: NdStylesProperty<number, number, number>;
    strokeColor: NdStylesProperty<`rgba(${number},${number},${number},${number})`[], NdArrColor[], `rgba(${number},${number},${number},${number})` | NdArrColor | NdColorArr | NdArrColor[]>;
    strokeWidth: NdStylesProperty<NdStrokeWidthArr, NdStrokeWidthArr, NdStrokeWidthArr | number>;
    strokeStyle: NdStylesProperty<NdStrokeStyleArr, NdStrokeStyleArr, NdStrokeStyleArr | NdStrokeStyle>;
}

declare class NdLayer {
    private canvas;
    private width;
    private height;
    private f;
    private ready;
    private ordering;
    constructor(resolver: NdAssemblerContextResolver);
    draw(context: CanvasRenderingContext2D): void;
    get resolver(): NdAssemblerContextResolver | null;
    get size(): NdNumericArray2d;
    set size([width, height]: NdNumericArray2d);
    get order(): number;
    set order(order: number);
    update(): void;
}

declare type AssemblerLayerConfig = {
    name: string;
    resolver: ConstructorParameters<typeof NdLayer>[0];
};
declare type ReflectAssemblerUpdate<T extends AssemblerLayerConfig[], K extends number = keyof T & number> = (name?: T[K]['name']) => void;
declare class NdModeAssembler extends NdEmitter<{
    [key in 'resize' | 'update']: undefined;
}> {
    private output;
    private pipe;
    private readonly layers;
    private w;
    private h;
    private resized;
    private _ready;
    update: ReflectAssemblerUpdate<AssemblerLayerConfig[]>;
    constructor(layers: AssemblerLayerConfig[]);
    get ready(): boolean;
    get size(): NdNumericArray2d;
    get width(): number;
    get height(): number;
    private set size(value);
    export(element: Node<any>): HTMLCanvasElement;
    resize(): void;
}

declare class NdModAnchor extends NdNodeStylesModel {
    anchor: NdStylesProperty<NdAnchor, NdAnchor, NdAnchor>;
}

declare type ExtractAnimated<T extends NdNodeStylesModel, PT> = {
    [Key in keyof T]: T[Key] extends PT ? PT : never;
};
declare abstract class Node<Model extends NdModBase> extends NdEmitter<NdNodeStateEventsScheme<Model> & NdNodeMouseEventsScheme<Model>> {
    protected abstract Box: NdNodeBox;
    protected abstract render: NdMainDrawingPipeF;
    protected abstract test: NdNodePointerPredicate;
    abstract export: (...args: any[]) => NdExportableReturn | undefined;
    protected TreeConnector: NdNodeConnector;
    protected Cache: NdCache;
    protected Compiler: NdCompiler<Model>;
    protected Matrix: NdNodeMatrix;
    protected Mouse: NdNodeMouseDispatcher<Model>;
    protected data: Model;
    pipe: NdCompiler<Model>['pipe'];
    unpipe: NdCompiler<Model>['unpipe'];
    condition: NdCompiler<Model>['filter'];
    private modelEmitter;
    private order;
    private animations;
    private checkQueue;
    private findCompetitors;
    private tickElementAnimations;
    protected constructor(id: string, model: Model, app: Nodas);
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(props: {
        [Key in K]?: Parameters<Animated[Key]['set']>[0];
    }, duration?: number, easing?: keyof typeof ndEasings, queue?: boolean): Node<Model>;
    animate<Animated extends ExtractAnimated<Model, NdNodeStylePropertyAnimated<any, any, any, any>>, K extends keyof Animated>(props: {
        [Key in K]?: Parameters<Animated[Key]['set']>[0];
    }, config?: ReflectAnimateConfig<Node<Model>>): Node<Model>;
    stop(prop?: keyof Extract<Model, NdNodeStylePropertyAnimated<any, any, any, any>>): this;
    style(prop: keyof Model): Model[keyof Model]['publicValue'];
    style<K extends keyof Model>(prop: K, value?: Parameters<Model[K]['set']>[0]): Model[keyof Model]['publicValue'];
    style(props: {
        [Prop in keyof Model]?: Parameters<Model[Prop]['set']>[0];
    }): Node<Model>;
    watch(prop: keyof Model | (keyof Model)[], callback: () => void): this;
    unwatch(prop: keyof Model | (keyof Model)[], callback: () => void): this;
    get id(): string;
    set id(id: string);
    get z(): number;
    set z(value: number);
    get box(): {
        size: NdNumericArray2d;
        position: NdNumericArray2d;
    };
    get boundingRect(): {
        margin: [number, number, number, number];
        position: NdNumericArray2d;
        size: NdNumericArray2d;
    };
    get parent(): Group | null;
    get matrix(): NdMatrix;
    get width(): number;
    get height(): number;
    get left(): number;
    get top(): number;
    get animated(): boolean;
    purgeBox(): this;
    static transformContext(element: Node<any>, context: CanvasRenderingContext2D): void;
    static drawLinearPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdModeAssembler): void;
    static drawBg<T extends NdModBg & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdModeAssembler): void;
    static drawPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdModeAssembler): void;
    static drawBezierPathBg<T extends NdModBg & NdModFreeStroke & NdModBase>(styles: T, context: CanvasRenderingContext2D, assembler: NdModeAssembler): void;
    static clipBezierPath(path: NdPathBezier, context: CanvasRenderingContext2D, smooth?: boolean, closed?: boolean): void;
    static registerPath(path: NdPathBezier, context: CanvasRenderingContext2D, smooth?: boolean, closed?: boolean): void;
    static drawFill<T extends NdModBase & NdModBg & NdModFreeStroke>(styles: T, context: CanvasRenderingContext2D): void;
    static drawStroke<T extends NdModBase & NdModFreeStroke>(styles: T, context: CanvasRenderingContext2D): void;
    static applyBoxAnchor(position: [x: number, y: number], width: number, height: number, data: NdModAnchor): void;
}

declare type forkArray<T, True, False> = T extends any[] ? True : False;
declare type ModelPropertyValueCallback<T> = (itemIndex: number, itemValueIndex?: number) => T;
declare class NdStylesProperty<StoreType, GetType, SetType> {
    private _value;
    readonly default: StoreType;
    readonly ordering: number;
    get: () => GetType;
    set: (value: SetType, element: Node<any>) => StoreType;
    private value;
    get protectedValue(): StoreType;
    get publicValue(): GetType;
    sync<T extends StoreType & any[], K extends keyof T & number, M extends keyof T[K] & number>(model: any[], filler: T[K] | forkArray<T[K], ModelPropertyValueCallback<T[K][M]>[], ModelPropertyValueCallback<T[K]>>): void;
    constructor(order: number, initial: StoreType, get: (current: StoreType) => GetType, set?: (value: SetType, element: Node<any>) => StoreType);
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
    static comparePaths(path1: NdPath | NdPathBezier, path2: NdPath | NdPathBezier): boolean;
    static extractPercentFraction(value: NdPercentStr): number;
    static syncArray<T extends any[], K extends keyof T, V extends any[]>(base: any[], array: T, filler: V): void;
}

declare class NdEvent<TargetType, DataType> {
    readonly time: Date;
    readonly data: DataType;
    readonly target: TargetType;
    propagate: boolean;
    constructor(target: TargetType, data: DataType);
}

declare class NdMouseEvent<Target> extends NdEvent<Target, NdMouseEventData> {
}

declare class NdStateEvent<Target> extends NdEvent<Target, null> {
}

declare class Mouse {
    private elements;
    private currentHover;
    private currentFocus;
    private mouseDown;
    private dragging;
    private eventStack;
    private postponed;
    protected maxEventsPerQueue: number;
    protected maxEventsResolveTimePerFrame: number;
    constructor(Canvas: Canvas, Ticker: Ticker, Tree: Nodes);
    checkNode(e: Node<any>, cursor: NdNumericArray2d): false | Node<any>;
    private resolveStack;
    private getStackCallback;
    private resolveOrPostpone;
    register<Props extends NdModBase>(element: Node<any>, emitter: Node<any>['cast'], test: NdNodePointerPredicate, transform?: NdNodePointerTransformF): NdNodeMouseDispatcher<any>;
}

declare type NdNodeGetter<Type extends Node<any>> = (id: string) => Type;
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
declare type NdNodePointerTransformF = (cursor: NdNumericArray2d) => NdNumericArray2d;
declare type NdMouseEventData = {
    page: NdNumericArray2d;
    screen: NdNumericArray2d;
    cursor: NdNumericArray2d;
};
declare type NdNodeMouseEventsScheme<Props extends NdModBase> = {
    mouseMove: NdMouseEvent<Node<Props>>;
    mouseLeave: NdMouseEvent<Node<Props>>;
    mouseEnter: NdMouseEvent<Node<Props>>;
    mouseUp: NdMouseEvent<Node<Props>>;
    mouseDown: NdMouseEvent<Node<Props>>;
    dragStart: NdMouseEvent<Node<Props>>;
    dragEnd: NdMouseEvent<Node<Props>>;
    dragMove: NdMouseEvent<Node<Props>>;
    focus: NdMouseEvent<Node<Props>>;
    blur: NdMouseEvent<Node<Props>>;
};
declare type NdNodeStateEventsScheme<Props extends NdModBase> = {
    unmount: NdStateEvent<Node<Props>>;
    mount: NdStateEvent<Node<Props>>;
    destroy: NdStateEvent<Node<Props>>;
    export: NdStateEvent<Node<Props>>;
    update: NdStateEvent<Node<Props>>;
};
declare type NdRootCanvasMouseEventsScheme = {
    mouseEnter: NdMouseEvent<Canvas>;
    mouseLeave: NdMouseEvent<Canvas>;
    mouseMove: NdMouseEvent<Canvas>;
    mouseDown: NdMouseEvent<Canvas>;
    mouseUp: NdMouseEvent<Canvas>;
};
declare type NdRootCanvasStateEventsScheme = {
    switch: NdStateEvent<Canvas>;
    resize: NdStateEvent<Canvas>;
};
declare type NdStylePropAnimatedStarter<T, C, A> = (current: C, value: T, setStart: (val: A) => void, setEnd: (val: A) => void) => void;
declare type NdStylePropAnimatedApplier<T, E> = (value: T, element: E, progress: number) => T;
interface ReflectAnimateConfig<Element extends Node<any> = Node<any>> {
    easing?: keyof typeof ndEasings;
    queue?: boolean;
    duration?: number;
    step?: (event: NdEvent<Element, any>) => void;
    complete?: (event: NdEvent<Element, any>) => void;
}
declare type NdPercentStr = (`${number}%` | `${number}.${number}%` | `.${number}%`) & string;
declare type NdColorStr = `rgba(${number},${number},${number},${number})` & string;
declare type NdURLStr = `${string}.${('png' | 'jpg')}` & string;
declare type NdUrlSpriteStr = `${string}.${('png' | 'jpg' | 'font')}[${number}]` & string;
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
declare type NdMatrixVal = [number, number, number, number, number, number];

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
    get ready(): boolean;
    get clear(): boolean;
    set clear(value: boolean);
}

declare class NdConfigProperty<T> {
    private checkArray;
    private cb;
    private val;
    private checkValue;
    private check;
    constructor(property: string, value: T, config: NdConfigPropertyChecks);
    value(): T;
    define(n: T): NdConfigProperty<T>;
    watch(f: NdConfigPropertyWatcher<T>): NdConfigProperty<T>;
}

declare class Config {
    private properties;
    define<T>(property: string, value: T, cfg: NdConfigPropertyChecks): NdConfigProperty<T>;
    set<T>(name: string, value: T): Config;
    get<T>(name: string): T;
    watch<T>(name: string, f: NdConfigPropertyWatcher<T>): NdConfigProperty<any>;
}

declare type LineNodeModel = NdModFreeStroke & NdModAnchor & NdModBase;
declare class Line extends Node<LineNodeModel> {
    private xShift;
    private yShift;
    private strokeFix;
    private interpolationFix;
    private interpolated;
    private mouseTester;
    protected Assembler: NdModeAssembler;
    protected Box: NdNodeBox;
    export: Node<LineNodeModel>['export'];
    render: Node<LineNodeModel>['render'];
    test: Node<LineNodeModel>['test'];
    constructor(id: string, app: Nodas);
}

declare class NdModCirc extends NdNodeStylesModel {
    radius: NdNodeStylePropertyAnimated<number, number, number, number, Node<any>>;
    strokeWidth: NdNodeStylePropertyAnimated<number, number, number, number, Node<any>>;
    strokeColor: NdNodeStylePropertyAnimated<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})` | NdArrColor, NdArrColor, Node<any>>;
    strokeStyle: NdStylesProperty<NdStrokeStyle, NdStrokeStyle, NdStrokeStyle>;
}

declare type CircleElementModel = NdModCirc & NdModBg & NdModAnchor & NdModBase;
declare class Circle extends Node<CircleElementModel> {
    protected Box: NdNodeBox;
    render: (context: CanvasRenderingContext2D) => CanvasRenderingContext2D;
    export: Node<CircleElementModel>['export'];
    private strokeFix;
    protected test: Node<CircleElementModel>['test'];
    protected Assembler: NdModeAssembler;
    constructor(id: string, App: Nodas);
}

declare class NdSprite extends NdResource<(time: Date) => HTMLCanvasElement | HTMLImageElement> {
    private frameCount;
    private refreshRate;
    private frameTime;
    private canvas;
    private image;
    private chunkSize;
    private chunkXYCount;
    private timeStart;
    private duration;
    private frozen;
    private setFrameData;
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
    readonly export: (time: Date) => HTMLCanvasElement | undefined;
    constructor(url: NdUrlSpriteStr);
    static NdUrlSpriteStrRegex: RegExp;
    static isNdUrlSpriteStr(str: string): boolean;
}

declare class NdModSprite extends NdNodeStylesModel {
    src: NdStylesProperty<false | NdImage | NdSprite, false | NdURLStr | NdUrlSpriteStr, NdURLStr | NdUrlSpriteStr>;
    frames: NdStylesProperty<number, number, number>;
    fps: NdStylesProperty<number, number, number>;
    size: NdNodeStylePropertyAnimated<NdSizeArr, NdSizeArr, NdSize | NdSizeArr, NdNumericArray2d, Node<any>>;
}

declare type ImageNodeModel = NdModSprite & NdModAnchor & NdModBase;
declare class Sprite extends Node<ImageNodeModel> {
    export: Node<ImageNodeModel>['export'];
    render: Node<ImageNodeModel>['render'];
    test: Node<ImageNodeModel>['test'];
    protected Box: NdNodeBox;
    pause(): void;
    play(): void;
    constructor(id: string, app: Nodas);
}

declare type AreaStaticModel = NdModFreeStroke & NdModBg & NdModAnchor & NdModBase;
declare class Area extends Node<AreaStaticModel> {
    private xShift;
    private yShift;
    private strokeFix;
    private interpolationFix;
    private interpolated;
    private mouseTester;
    protected Box: NdNodeBox;
    protected Assembler: NdModeAssembler;
    protected test: Node<AreaStaticModel>['test'];
    protected render: Node<AreaStaticModel>['render'];
    export: Node<AreaStaticModel>['export'];
    constructor(id: string, app: Nodas);
}

declare class NdModSize extends NdNodeStylesModel {
    size: NdNodeStylePropertyAnimated<NdNumericArray2d, NdNumericArray2d, number | NdNumericArray2d, NdNumericArray2d, Node<any>>;
}

declare class NdModRect extends NdNodeStylesModel {
    radius: NdNodeStylePropertyAnimated<[number, number, number, number], [number, number, number, number], number | [number, number, number, number], [number, number, number, number], Node<any>>;
    strokeColor: NdNodeStylePropertyAnimated<NdColorBox, NdColorBox, `rgba(${number},${number},${number},${number})` | NdArrColor | NdColorBox | NdColorArrBox, NdColorArrBox, Node<any>>;
    strokeWidth: NdNodeStylePropertyAnimated<NdStrokeWidthBox, NdStrokeWidthBox, number | NdStrokeWidthBox, NdStrokeWidthBox, Node<any>>;
    strokeStyle: NdStylesProperty<[NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle], [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle], NdStrokeStyle | [NdStrokeStyle, NdStrokeStyle, NdStrokeStyle, NdStrokeStyle]>;
}

declare type RectNodeModel = NdModRect & NdModSize & NdModAnchor & NdModBg & NdModBase;
declare class Rectangle extends Node<RectNodeModel> {
    private strokeFix;
    private readonly path;
    private readonly purgePath;
    private readonly CIRCLECONST;
    protected Assembler: NdModeAssembler;
    export: Node<RectNodeModel>['export'];
    protected test: Node<RectNodeModel>['test'];
    protected render: Node<RectNodeModel>['render'];
    protected Box: NdNodeBox;
    constructor(id: string, app: Nodas);
    private static drawCorner;
    private static drawBridge;
    private drawRectStroke;
}

declare class NdModText extends NdNodeStylesModel {
    str: NdStylesProperty<string, string, string>;
    width: NdStylesProperty<number | "auto", number | "auto", number | "auto">;
    font: NdStylesProperty<string, string, string>;
    color: NdStylesProperty<`rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`, `rgba(${number},${number},${number},${number})`>;
    weight: NdStylesProperty<NdFontWeights, NdFontWeights, NdFontWeights>;
    lineHeight: NdStylesProperty<number, number, number>;
    style: NdStylesProperty<NdFontStyles, NdFontStyles, NdFontStyles>;
}

declare type TextNodeModel = NdModText & NdModAnchor & NdModBase;
declare class Text extends Node<TextNodeModel> {
    private readonly textBlock;
    protected Assembler: NdModeAssembler;
    protected Box: NdNodeBox;
    protected render: Node<TextNodeModel>['render'];
    protected test: Node<TextNodeModel>['test'];
    private syncStylesToBlock;
    private bindProps;
    export: Node<TextNodeModel>['export'];
    constructor(id: string, app: Nodas);
}

declare class NdFont extends NdResource<HTMLCanvasElement> {
    private context;
    private styles;
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
    export: HTMLCanvasElement;
    constructor(root?: string, format?: NdFontFormats[], scheme?: NdFontDescription);
    static extractNumericWeight(word: NdFontWeights): 1000 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 900;
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
declare const _default: NodasFonts;

declare class Nodas {
    readonly Ticker: Ticker;
    readonly Canvas: Canvas;
    readonly Tree: Nodes;
    readonly Mouse: Mouse;
    protected readonly Config: Config;
    readonly area: NdNodeGetter<Area>;
    readonly rect: NdNodeGetter<Rectangle>;
    readonly text: NdNodeGetter<Text>;
    readonly sprite: NdNodeGetter<Sprite>;
    readonly circle: NdNodeGetter<Circle>;
    readonly line: NdNodeGetter<Line>;
    readonly group: (id: string, children?: GroupChildren) => Group;
    constructor(canvas: HTMLCanvasElement | string);
}
declare const Fonts: typeof _default;

export { Fonts, Nodas as default };
