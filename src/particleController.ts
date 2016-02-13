'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Point }            from './geo';
import { System }           from './system';

export interface ParticleComponent {
    lifespan: number;
    timeRemaining: number;
    count: boolean;
}

export module ParticleComponent {
    export function createParticle(pos: Point, vel: Point, color: string, mass: number, radius: number, lifespan: number): Entity {
        return {
            position: pos,
            physics: {
                velocity: vel,
                bounce: 0.96,
                drag: 0.5,
                mass: mass,
                omega: 0,
                theta: 0,
                radius: 0.25,
                collide: false,
            },
            render: {
                alpha: 1,
                color: color,
                lineWidth: 0.1,
                radius: radius,
                shape: 'circle',
                maxBlur: 1,
                glow: 0,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: true,
            },
        }
    }
}

export class ParticleController implements System {
    public deps: System.Dependencies = {};

    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => {
            if (e.particle) {
                this._particles.add(e);
                if (e.particle.count) {
                    ++this._particleCount;
                    if (this._particleCount > this.maxParticles) {
                        let toDelete: Entity;
                        for (let e2 of this._particles) {
                            if (e2.particle.count) {
                                toDelete = e2;
                                break;
                            }
                        }
                        if (toDelete) {
                            this._entities.removeEntity(toDelete);
                        }
                    }
                }
            }
        });
        entities.entityRemoved.listen(e => {
            if (e.particle) {
                this._particles.delete(e);
                if (e.particle.count) {
                    --this._particleCount;
                }
            }
        });
        this._entities = entities;
    }

    public init() { }

    public step(elapsedMs: number) {
        let seconds = elapsedMs / 1000;
        for (let e of this._particles) {
            if (e.particle.timeRemaining <= 0) {
                this._entities.removeEntity(e);
                continue;
            }
            e.render.alpha = e.particle.timeRemaining / e.particle.lifespan;
            e.particle.timeRemaining -= seconds;
        }
    }

    public maxParticles = 200;

    private _particleCount = 0;
    private _entities: EntityContainer<Entity>;
    private _particles = new Set<Entity>();
}