'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';

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

const worldDrag = 4;
export class Physics {
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.physics) this._entities.add(e); });
        entities.entityRemoved.listen(e => { this._entities.delete(e); });
    }
    
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
            pos.x += vel.x * seconds;
            pos.y += vel.y * seconds;

            let dragCoeff = Math.pow(Math.E, -worldDrag * phys.drag * seconds);
            vel.x *= dragCoeff;
            vel.y *= dragCoeff;

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
            Math.sign((a.position.x - a.physics.radius) - (b.position.x - b.physics.radius))
        );
        
        // Sweep left-to-right through the entities.
        for (let i = 0; i < list.length; ++i) {
            let a = list[i];
            let rightEdge = a.position.x + a.physics.radius;

            // Check only entities to the right of a;
            for (let j = i + 1; j < list.length; ++j) {
                let b = list[j];
                if (b.position.x - b.physics.radius >= rightEdge) {
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
        let corrections = new Map<Entity, { x: number, y: number, mass: number }>();
        
        for (let i of intersections) {
            let a = i.a; let b = i.b;
            // Find the difference in position.
            let difP = Point.subtract(b.position, a.position);
            let len = Point.length(difP);
            // Normalize the difference.
            let normal = { x: difP.x / len, y: difP.y / len };
            
            // Find the difference in velocity.
            let difV = Point.subtract(b.physics.velocity, a.physics.velocity);
            let dot = Point.dot(difV, normal);
            
            let bounce = a.physics.bounce * b.physics.bounce;
            let dv = { x: normal.x * dot * bounce, y: normal.y * dot * bounce };
            
            let totalMass = a.physics.mass + b.physics.mass;
            
            a.physics.velocity.x += dv.x * b.physics.mass / totalMass;
            a.physics.velocity.y += dv.y * b.physics.mass / totalMass;
            
            b.physics.velocity.x -= dv.x * a.physics.mass / totalMass;
            b.physics.velocity.y -= dv.y * a.physics.mass / totalMass;
            
            
            // Displace the entities out of each other.
            let corA = corrections.get(a);
            if (corA == undefined) {
                corA = { x: 0, y: 0, mass: 0 }
                corrections.set(a, corA);
            }
            let corB = corrections.get(b);
            if (corB == undefined) {
                corB = { x: 0, y: 0, mass: 0 }
                corrections.set(b, corB);
            }
            
            let displace = (a.physics.radius + b.physics.radius) - len;
            let disX = normal.x * displace;
            let disY = normal.y * displace;
            
            corA.x -= disX * b.physics.mass;
            corA.y -= disY * b.physics.mass;
            corA.mass += totalMass;
            
            corB.x += disX * a.physics.mass;
            corB.y += disY * a.physics.mass;
            corB.mass += totalMass;
        }
        
        for (let kvp of corrections) {
            let e = kvp[0];
            let cor = kvp[1];
            
            let dx = cor.x / cor.mass * 1.05;
            let dy = cor.y / cor.mass * 1.05;
            
            e.position.x += dx;
            e.position.y += dy;
        }
    }
    
    public iterations = 4;

    public intersections = new Map<Entity, Intersection[]>();

    private _entities = new Set<Entity>();
}