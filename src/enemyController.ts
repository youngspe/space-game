'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';

export interface EnemyComponent { }

export module EnemyComponent {
    export function createFollower(pos: Point, vel: Point): Entity {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1.2,
                drag: 0.5,
                theta: 0,
                omega: 0,
                mass: 1,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#FF8000',
                alpha: 1,
                shape: 'circle',
                radius: 1.2,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 100,
                hp: 10,
                maxHp: 10,
                exhaust: {
                    rate: 3,
                    mass: 1.5,
                    radius: 0.4,
                },
            },
        }
        return e;
    }

    export function createTank(pos: Point, vel: Point): Entity {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 3,
                drag: 0.4,
                theta: 0,
                omega: 0,
                mass: 9,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#D00000',
                alpha: 1,
                shape: 'circle',
                radius: 3,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 1,
            },
            enemy: {},
            ship: {
                accel: 80,
                hp: 30,
                maxHp: 100,
                exhaust: {
                    rate: 4,
                    mass: 4,
                    radius: 0.8,
                },
            },
        }
        return e;
    }

    export function createSeeker(pos: Point, vel: Point): Entity {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1,
                drag: 0.25,
                theta: 0,
                omega: 0,
                mass: 0.8,
                bounce: 0.96,
                collide: true,
            },
            render: {
                color: '#80FF00',
                alpha: 1,
                shape: 'circle',
                radius: 0.9,
                lineWidth: 0.5,
                maxBlur: 3,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 150,
                hp: 5,
                maxHp: 5,
                exhaust: {
                    rate: 5,
                    mass: 1,
                    radius: 0.4,
                },
            },
        }
        return e;
    }
}

export class EnemyController {
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.enemy) this._enemies.add(e); });
        entities.entityRemoved.listen(e => { this._enemies.delete(e); });
    }

    public step(elapsedMs: number, player: Entity) {
        let seconds = elapsedMs / 1000;
        for (let e of this._enemies) {
            let dif = Point.subtract(player.position, e.position);
            let len = Point.length(dif);
            dif.x /= len;
            dif.y /= len;
            e.ship.direction = dif;
        }
    }

    private _enemies = new Set<Entity>();
}