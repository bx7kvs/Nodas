import Canvas from './Nodas/Canvas';
import Ticker from './Nodas/Ticker';
import Nodes from './Nodas/Nodes';
import Mouse from './Nodas/Mouse';
import Group from './Nodas/Nodes/Group';
import Line from './Nodas/Nodes/Line';
import Circle from './Nodas/Nodes/Circle';
import Sprite from './Nodas/Nodes/Sprite';
import Area from './Nodas/Nodes/Area';
import Rectangle from './Nodas/Nodes/Rectangle';
import Node from "./Nodas/Nodes/Node";
import ParticleEmitter from "./Nodas/Nodes/ParticleEmitter";
import Particle from "./Nodas/Nodes/Particle";
import {
    AssemblerLayerConfig,
    GroupChildren, NdBlend, NdColorStr, NdEasingF, NdNodeEventScheme, NdNodePointerPredicate,
    NdPath, NdPercentStr, NdSegmentBezier,
    NdUrlSpriteStr,
    NdURLStr, NodasTickingType
} from './Nodas/Nodes/@types/types.js';
import Text from './Nodas/Nodes/Text';
import NodasFonts from './Nodas/Services/NodasFonts';
import {NdMainDrawingPipeF, NdNumericArray2d} from './Nodas/@types/types';
import NodasResources from './Nodas/Services/NodasResources';
import NdImage from './Nodas/classes/NdImage';
import NdSprite from './Nodas/classes/NdSprite';
import NdModField from "./Nodas/Nodes/models/NdModField";
import Field from "./Nodas/Nodes/Field";
import NodasRandom from "./Nodas/Services/NodasRandom";
import {NDB} from "./Nodas/Services/NodasDebug";
import NdStateEvent from "./Nodas/classes/NdStateEvent";
import NdMouseEvent from "./Nodas/classes/NdMouseEvent";
import NdDestroyEvent from "./Nodas/classes/NdDestroyEvent";
import NdEvent from "./Nodas/classes/NdEvent";
import NdMorphine from "./Nodas/classes/NdMorphine";
import {ndEasings} from "./Nodas/classes/NdEasings";
import universalTicker from "./Nodas/classes/NdUniversalTicker";
import NdModBase from "./Nodas/Nodes/models/NdModBase";
import NdModAnchor from "./Nodas/Nodes/models/NdModAnchor";
import NdModBg from "./Nodas/Nodes/models/NdModBg";
import NdModCirc from "./Nodas/Nodes/models/NdModCirc";
import NdModEmitter from "./Nodas/Nodes/models/NdModEmitter";
import NdModFreeStroke from "./Nodas/Nodes/models/NdModFreeStroke";
import NdModParticle from "./Nodas/Nodes/models/NdModParticle";
import NdModRect from "./Nodas/Nodes/models/NdModRect";
import NdModSize from "./Nodas/Nodes/models/NdModSize";
import NdModSprite from "./Nodas/Nodes/models/NdModSprite";
import NdModText from "./Nodas/Nodes/models/NdModText";
import NdEmitter from "./Nodas/classes/NdEmitter";
import NdNodeAssembler from "./Nodas/Nodes/classes/NdNodeAssembler";
import NdStylesProperty from "./Nodas/Nodes/classes/NdNodeStyleProperty";
import NdNodeStylePropertyAnimated from "./Nodas/Nodes/classes/NdNodeStylePropertyAnimated";
import {NdExportableReturn} from "./Nodas/Nodes/@types/types.js";
import NdNodeStylesModel from "./Nodas/Nodes/classes/NdNodeStylesModel";

export default class Nodas {
    readonly ticker = new Ticker()
    readonly canvas: Canvas
    readonly nodes: Nodes
    readonly mouse: Mouse

    public Sprite: new(id: string, src?: NdUrlSpriteStr | NdURLStr) => Sprite
    public Area: new(id: string, path?: NdPath) => Area
    public Rectangle: new(id: string, size?: NdNumericArray2d) => Rectangle
    public Line: new(id: string, path?: NdPath) => Line
    public Text: new(id: string, str?: string) => Text
    public Group: new(id: string, children?: GroupChildren) => Group
    public Circle: new(id: string, radius?: number) => Circle
    public Field: new (id: string, options?: { [key in keyof NdModField]?: Parameters<NdModField[key]['set']>[0] }) => Field

    public get(id: string): Node<any> {
        return this.nodes.get(id)
    }

    public append: (node: Node<any> | Node<any>[]) => Nodas

    public setRoot(node: Group) {
        this.nodes.root?.detach()
        node.attach(this)
        return this
    }


    Animation = NdSprite
    Image = NdImage

    constructor(canvas: HTMLCanvasElement | string) {
        const TickerSrv = new Ticker()
        const CanvasSrv = new Canvas(TickerSrv)
        const TreeSrv = new Nodes(CanvasSrv)
        const MouseSrv = new Mouse(CanvasSrv, TickerSrv, TreeSrv)
        CanvasSrv.element(canvas)
        this.ticker = TickerSrv
        this.canvas = CanvasSrv
        this.mouse = MouseSrv
        this.nodes = TreeSrv


        const root = new Group('NODE_TREE_DEFAULT_ROOT')
        root.attach(this)

        this.append = (node: Node<any> | Node<any>[]) => {
            root.append(node)
            return this
        }
        this.Text = class NodasText extends Text {
            constructor(id: string, str?: string) {
                super(id);
                if (str) this.style('str', str)
                root.append(this)
            }
        }
        this.Area = class NodasArea extends Area {
            constructor(id: string, path?: NdPath) {
                super(id);
                if (path) this.style('path', path)
                root.append(this)
            }
        }
        this.Rectangle = class NodasRectangle extends Rectangle {
            constructor(id: string, size?: NdNumericArray2d) {
                super(id);
                if (size) this.style('size', size)
                root.append(this)
            }
        }
        this.Line = class NodasLine extends Line {
            constructor(id: string, path?: NdPath) {
                super(id);
                if (path) this.style('path', path)
                root.append(this)
            }
        }
        this.Sprite = class NodasSprite extends Sprite {
            constructor(id: string, url?: NdURLStr | NdUrlSpriteStr) {
                super(id);
                if (url) this.style('src', url)
                root.append(this)
            }
        }
        this.Circle = class NodasCircle extends Circle {
            constructor(id: string, radius?: number) {
                super(id);
                if (radius) this.style('radius', radius)
                root.append(this)
            }
        }
        this.Group = class NodasGroup extends Group {
            constructor(id: string, children?: GroupChildren) {
                super(id);
                if (children) this.append(children)
                root.append(this)
            }
        }

        this.Field = class NodasField extends Field {
            constructor(id: string, options?: { [key in keyof NdModField]?: Parameters<NdModField[key]['set']>[0] }) {
                super(id);
                if (options) this.style(options)
                root.append(this)
            }
        }


    }
}
export {
    Area as Area,
    Circle as Circle,
    Field as Field,
    Group as Group,
    Line as Line,
    Node as Node,
    ParticleEmitter as ParticleEmitter,
    Particle as Particle,
    Rectangle as Rectangle,
    Sprite as Sprite,
    Text as Text,
    NdImage as NdImage,
    NdSprite as NdSprite,
    NdEvent as NdEvent,
    NdEmitter as NdEmitter,
    NdStateEvent as NdStateEvent,
    NdMouseEvent as NdMouseEvent,
    NdDestroyEvent as NdDestroyEvent,
    NdMorphine as Morphine,
    ndEasings as Easings,
    universalTicker as morphineTicker,
    NDB as NDB,
    NdNodeAssembler as NodeAssembler,
    NdStylesProperty as NodeStaticProperty,
    NdNodeStylePropertyAnimated as NodeAnimatedProperty,
    NdModBase as NodasModelBase,
    NdModAnchor as NodasModelAnchor,
    NdModBg as NodasModelBg,
    NdModCirc as NodasModelCirc,
    NdModEmitter as NodasModelEmitter,
    NdModField as NodasModelField,
    NdModFreeStroke as NodasModelStroke,
    NdModParticle as NodasModelParticle,
    NdModRect as NodasModelRect,
    NdModSize as NodasModelSize,
    NdModSprite as NodasModelSprite,
    NdModText as NodasModelText,
    NdNodeStylesModel as NodeModel,
    NdBlend as NodasBlending
}
export type NodasRenderCallback = NdMainDrawingPipeF
export type NodeExportReturn = NdExportableReturn
export type NodasAnimatableValues = NodasTickingType
export type NodasEasingCallback = NdEasingF
export type NodasPercentStr = NdPercentStr
export type NodasSpriteURL = NdPercentStr
export type NodasHoverPredicate = NdNodePointerPredicate
export type NodasColor = NdColorStr
export type NodasBezierSegment = NdSegmentBezier
export type NodasPath = NdPath
export type NodasPathBezier = NodasBezierSegment[]
export type NodasAssemblerLayerConfig = AssemblerLayerConfig
export type EventScheme<Class extends NdEmitter<Class>> = NdNodeEventScheme<Class>
export const Fonts: typeof NodasFonts = NodasFonts
export const Resources: typeof NodasResources = NodasResources
export const NodasImage = NdImage
export const NodasSprite = NdSprite
export const NodasRand: typeof NodasRandom = NodasRandom