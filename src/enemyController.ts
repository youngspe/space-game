'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';
import { PlayerController } from './playerController';
import { System }           from './system';

const X = 0; const Y = 1;

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

export class EnemyController implements System {
    public deps = new EnemyController.Dependencies();
    
    public constructor(entities: EntityContainer<Entity>) {
        entities.entityAdded.listen(e => { if (e.enemy) this.enemies.add(e); });
        entities.entityRemoved.listen(e => { this.enemies.delete(e); });
    }
    
    public init() { }

    public step(elapsedMs: number, player: Entity) {
        let seconds = elapsedMs / 1000;
        for (let e of this.enemies) {
            if (e.isDead) {
                continue;
            }
            
            if (player) {
                let dif = Point.subtract(player.position, e.position);
                let len = Point.length(dif);
                dif[X] /= len;
                dif[Y] /= len;
                e.ship.direction = dif;
            } else {
                e.ship.direction = null;
            }
        }
    }

    public enemies = new Set<Entity>();
}

export module EnemyController {
    export class Dependencies extends System.Dependencies {
        playerController: PlayerController;
    }
}