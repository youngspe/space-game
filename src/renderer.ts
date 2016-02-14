'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';
import { SIN_30, COS_30 }   from './geo';
import { System }           from './system';

const X = 0; const Y = 1;

export interface RenderComponent {
    color: string;
    alpha: number;
    shape: string;
    radius: number;
    lineWidth: number;
    maxBlur: number;
    glow: number;
}

class Style {
    fill: string;
    stroke: string;
    lineWidth: number;
    alpha: number;
    glow: number;
}

const VIEW_HEIGHT = 75;

export class Renderer implements System {
    public deps = new Renderer.Dependencies();
    
    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.render) this._renderObjects.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._renderObjects.delete(e); })
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('2d');
    }

    public render(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        let ctx = this._context;
        let canvas = ctx.canvas;
        canvas.width = canvas.clientWidth * this.dpiScale;
        canvas.height = canvas.clientHeight * this.dpiScale;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.setTransform();

        for (let entity of this._renderObjects) {
            if (entity.physics) {
                const MAX_BLUR_COUNT = 5;
                let dir = Point.normalize(entity.physics.velocity);
                let speed = Point.length(entity.physics.velocity);
                let blurCount = Math.floor(speed * seconds / entity.render.radius + 1);
                blurCount = Math.min(blurCount, MAX_BLUR_COUNT, entity.render.maxBlur);

                for (let i = 0; i < blurCount; ++i) {
                    let pos = Point.add(
                        entity.position,
                        [
                            -entity.physics.velocity[X] * seconds * i / blurCount,
                            -entity.physics.velocity[Y] * seconds * i / blurCount,
                        ]
                    );
                    this.renderEntity(entity, pos, Math.sqrt(1.0 / blurCount),
                        {
                            dir: dir,
                            factor: speed * seconds / (blurCount + 1) / entity.render.radius + 1,
                        });
                }
            } else {
                this.renderEntity(entity, entity.position, 1, null);
            }
        }
    }

    private renderEntity(e: Entity, pos: Point, alpha: number, stretch: { dir: Point, factor: number }) {
        let ctx = this._context;
        ctx.save();
        let radius = e.render.radius;

        ctx.translate(pos[X], pos[Y]);
        ctx.scale(radius, radius);
        if (stretch) {
            this.stretch(stretch.dir, stretch.factor);
        }

        if (e.physics) {
            ctx.rotate(e.physics.theta);
        }
        let style = {
            fill: 'transparent',
            stroke: e.render.color,
            lineWidth: e.render.lineWidth / e.render.radius,
            alpha: e.render.alpha * alpha,
            glow: e.render.glow,
        };
        this.setStyle(style);
        this.shapeFns[e.render.shape](ctx);
        ctx.restore();
    }

    private stretch(dir: Point, factor: number) {
        let ab: Point = [1, 0];
        let abDot = Point.dot(ab, dir);
        let abAmount = abDot * (factor - 1);
        ab[X] += dir[X] * abAmount;
        ab[Y] += dir[Y] * abAmount;

        let bc: Point = [0, 1];
        let bcDot = Point.dot(bc, dir);
        let bcAmount = bcDot * (factor - 1);
        bc[X] += dir[X] * bcAmount;
        bc[Y] += dir[Y] * bcAmount;

        this._context.transform(ab[X], ab[Y], bc[X], bc[Y], 0, 0);
    }

    private setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;

        let dx = -this.camera.pos[X] * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos[Y] * scale + ctx.canvas.height / 2;

        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }

    private drawCircle(center: Point, radius: number, style: Style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center[X], center[Y], radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    private setStyle(style: Style) {
        let ctx = this._context;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
        ctx.globalAlpha = style.alpha;

        if (style.glow > 0) {
            ctx.shadowColor = style.stroke;
            ctx.shadowBlur = 10 * style.glow;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    public shapeFns: { [s: string]: (ctx: CanvasRenderingContext2D) => void } = {
        'circle': (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        },
        'hexagon': (ctx) => {
            ctx.beginPath();
            ctx.moveTo(0, -1);
            ctx.lineTo(+COS_30, -SIN_30);
            ctx.lineTo(+COS_30, +SIN_30);
            ctx.lineTo(0, 1);
            ctx.lineTo(-COS_30, +SIN_30);
            ctx.lineTo(-COS_30, -SIN_30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    };

    public screenToWorld(p: Point): Point {
        let ctx = this._context;
        let x = p[X]; let y = p[Y];
        x -= ctx.canvas.clientWidth / 2;
        y -= ctx.canvas.clientHeight / 2;
        let fac = VIEW_HEIGHT / ctx.canvas.clientHeight;
        x *= fac; y *= fac;
        return [x, y];
    }

    public dpiScale = 1;
    public glow = 10;

    public camera = { pos: [0, 0], zoom: 1 };

    private _context: CanvasRenderingContext2D;
    private _renderObjects = new Set<Entity>();
}

export module Renderer {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
    }
}
