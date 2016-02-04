'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Intersection }     from './physics';
import { Point }            from './geo';

export interface BulletComponent {
    damage: number,
    isAlive: boolean,
}

export module BulletComponent {
    export function createBullet(pos: Point, vel: Point, damage: number, lifespan: number): Entity {
        return {
            physics: {
                velocity: vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
                collide: true,
            },
            position: pos,
            render: {
                color: '#40A0FF',
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.1,
                shape: 'circle',
                maxBlur: 5,
                glow: 0,
            },
            bullet: {
                damage: damage,
                isAlive: true,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: false,
            }
        }
    }
}

export class BulletController {
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.bullet) this._bullets.add(e); });
        entities.entityRemoved.listen(e => { this._bullets.delete(e); });
        this._entities = entities;
    }

    public step(elapsedMs: number, intersections: Map<Entity, Intersection[]>) {
        let seconds = elapsedMs / 1000;

        for (let b of this._bullets) {

            if (b.bullet.isAlive) {
                let inters = intersections.get(b);
                if (inters && inters.length > 0) {
                    for (let i of inters) {
                        let other = i.b;
                        if (other.ship) {
                            other.ship.hp -= b.bullet.damage;
                            b.bullet.isAlive = false;
                            break;
                        }
                    }
                }
            } else {
                b.render.color = "#808080";
            }
        }
    }

    private _entities: EntityContainer<Entity>;
    private _bullets = new Set<Entity>();
}