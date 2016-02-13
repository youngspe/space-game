'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';
import { System }           from './system';

const X = 0; const Y = 1;

export interface PhysicsComponent {
    radius: number;
    velocity: Point;
    drag: number;
    theta: number;
    omega: number;
    mass: number;
    bounce: number;
    collide: boolean;
}

export interface Intersection {
    a: Entity,
    b: Entity,
}

const WORLD_DRAG = 4;
export class Physics implements System {
    public deps: System.Dependencies = {};

    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.physics) this._entities.add(e); });
        entities.entityRemoved.listen(e => { this._entities.delete(e); });
    }

    public init() { }

    public step(elapsedMs: number) {
        this.intersections.clear();
        for (let i = 0; i < this.iterations; ++i) {
            let intersections = this.stepInternal(elapsedMs / this.iterations);
            for (let inter of intersections) {
                this.addIntersection(inter.a, inter.b);
                this.addIntersection(inter.b, inter.a);
            }
        }
    }

    private addIntersection(a: Entity, b: Entity) {
        let inters = this.intersections.get(a);
        if (inters == undefined) {
            inters = [];
            this.intersections.set(a, inters);
        }
        inters.push({ a: a, b: b });
    }

    private stepInternal(elapsedMs: number): Intersection[] {
        let seconds = elapsedMs / 1000;
        for (let entity of this._entities) {
            let phys = entity.physics;
            let pos = entity.position;
            let vel = phys.velocity;
            pos[X] += vel[X] * seconds;
            pos[Y] += vel[Y] * seconds;

            let dragCoeff = Math.pow(Math.E, -WORLD_DRAG * phys.drag * seconds);
            vel[X] *= dragCoeff;
            vel[Y] *= dragCoeff;

            phys.theta += phys.omega * seconds;
        }

        let intersections = this.findIntersections();

        this.correctCollisions(intersections);
        return intersections;
    }

    private findIntersections(): Intersection[] {
        let intersections: Intersection[] = [];

        var list: Entity[] = [];

        {
            for (let e of this._entities) {
                if (e.physics.collide) { list.push(e); }
            }
        }
        
        // Sort by leftmost bound of circle.
        list.sort((a, b) =>
            Math.sign((a.position[X] - a.physics.radius) - (b.position[X] - b.physics.radius))
        );
        
        // Sweep left-to-right through the entities.
        for (let i = 0; i < list.length; ++i) {
            let a = list[i];
            let rightEdge = a.position[X] + a.physics.radius;

            // Check only entities to the right of a;
            for (let j = i + 1; j < list.length; ++j) {
                let b = list[j];
                if (b.position[X] - b.physics.radius >= rightEdge) {
                    // No intersections are possible after this.
                    break;
                }

                let radSqr = (a.physics.radius + b.physics.radius) ** 2;
                let distSqr = Point.distSquared(a.position, b.position);
                if (distSqr < radSqr) {
                    intersections.push({ a: a, b: b });
                }
            }
        }

        return intersections;
    }

    private correctCollisions(intersections: Intersection[]) {
        let corrections = new Map<Entity, { d: Point, mass: number }>();

        for (let i of intersections) {
            let a = i.a; let b = i.b;
            // Find the difference in position.
            let difP = Point.subtract(b.position, a.position);
            let len = Point.length(difP);
            // Normalize the difference.
            let normal: Point = [difP[X] / len, difP[Y] / len];
            
            // Find the difference in velocity.
            let difV = Point.subtract(b.physics.velocity, a.physics.velocity);
            let dot = Point.dot(difV, normal);

            let bounce = a.physics.bounce * b.physics.bounce;
            let dv = [normal[X] * dot * bounce, normal[Y] * dot * bounce];

            let totalMass = a.physics.mass + b.physics.mass;

            a.physics.velocity[X] += dv[X] * b.physics.mass / totalMass;
            a.physics.velocity[Y] += dv[Y] * b.physics.mass / totalMass;

            b.physics.velocity[X] -= dv[X] * a.physics.mass / totalMass;
            b.physics.velocity[Y] -= dv[Y] * a.physics.mass / totalMass;
            
            
            // Displace the entities out of each other.
            let corA = corrections.get(a);
            if (corA == undefined) {
                corA = { d: [0, 0], mass: 0 }
                corrections.set(a, corA);
            }
            let corB = corrections.get(b);
            if (corB == undefined) {
                corB = { d: [0, 0], mass: 0 }
                corrections.set(b, corB);
            }

            let displace = (a.physics.radius + b.physics.radius) - len;
            let disX = normal[X] * displace;
            let disY = normal[Y] * displace;

            corA.d[X] -= disX * b.physics.mass;
            corA.d[Y] -= disY * b.physics.mass;
            corA.mass += totalMass;

            corB.d[X] += disX * a.physics.mass;
            corB.d[Y] += disY * a.physics.mass;
            corB.mass += totalMass;
        }

        for (let kvp of corrections) {
            let e = kvp[0];
            let cor = kvp[1];

            let dx = cor.d[X] / cor.mass * 1.05;
            let dy = cor.d[Y] / cor.mass * 1.05;

            e.position[X] += dx;
            e.position[Y] += dy;
        }
    }

    public iterations = 4;

    public intersections = new Map<Entity, Intersection[]>();

    private _entities = new Set<Entity>();
}