'use strict';
import { Entity }           from './entity'
import { Game }             from './game';
import { Point }            from './geo';
import { SIN_30, COS_30 }   from './geo';

class Style {
    fill: string;
    stroke: string;
    lineWidth: number;
}

const VIEW_HEIGHT = 100;

export class Renderer {
    public constructor(game: Game) {
        game.entityAdded.listen(e => { if (e.physics && e.render) this._entities.add(e); });
        game.entityRemoved.listen(e => { this._entities.delete(e); })
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('2d');
    }

    public render(elapsedMs: number) {
        let ctx = this._context;
        let canvas = ctx.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.setTransform();

        for (let entity of this._entities) {
            /*
            this.drawCircle(
                entity.physics.position,
                entity.physics.radius,
                { fill: 'transparent', stroke: entity.render.color, lineWidth: 0.5 }
            );
            */
            ctx.save();
            let radius = entity.physics.radius;
            let pos = entity.physics.position;
            
            ctx.translate(pos.x, pos.y);
            ctx.scale(radius, radius);
            ctx.rotate(entity.physics.theta);
            let style = { fill: 'transparent', stroke: entity.render.color, lineWidth: 0.5 };
            this.setStyle(style);
            this.shapeFns[entity.render.shape](ctx);
            ctx.restore();
        }
    }

    private setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;

        let dx = -this.camera.pos.x * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos.y * scale + ctx.canvas.height / 2;

        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }

    private drawCircle(center: Point, radius: number, style: Style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    private setStyle(style: Style) {
        let ctx = this._context;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
        ctx.shadowColor = style.stroke;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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

    public camera = { pos: { x: 0, y: 0 }, zoom: 1 };

    private _context: CanvasRenderingContext2D;
    private _entities = new Set<Entity>();
}
