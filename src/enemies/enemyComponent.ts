'use strict';
import { Entity }           from '../entity';
import { EnemyBehavior }    from './enemyBehavior';
import { Point }            from '../geo';
import { DamageGroup }      from '../healthController';

export interface EnemyComponent {
    behaviors: EnemyBehavior[];
}

export module EnemyComponent {
    export function createFollower(pos: Point, vel: Point): Entity {
        let e: Entity = {
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
            enemy: {
                behaviors: [
                    {
                        mode: EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 2,
                            direction: EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                ],
            },
            ship: {
                accel: 100,
                exhaust: {
                    rate: 3,
                    mass: 1.5,
                    radius: 0.4,
                },
            },
            health: {
                hp: 10,
                maxHp: 10,
                damageGroup: DamageGroup.Enemy,
            },
            scoring: {
                value: 10,
            },
        }
        return e;
    }

    export function createTank(pos: Point, vel: Point): Entity {
        let e: Entity = {
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
            enemy: {
                behaviors: [
                    {
                        mode: EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 15,
                            direction: EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                ],
            },
            ship: {
                accel: 80,
                exhaust: {
                    rate: 4,
                    mass: 4,
                    radius: 0.8,
                },
            },
            health: {
                hp: 30,
                maxHp: 30,
                damageGroup: DamageGroup.Enemy,
            },
            scoring: {
                value: 20,
            },
        }
        return e;
    }

    export function createSeeker(pos: Point, vel: Point): Entity {
        let e: Entity = {
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
            enemy: {
                behaviors: [
                    {
                        mode: EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 6,
                            direction: EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                    {
                        mode: EnemyBehavior.Mode.Shoot,
                        data: {
                            minDistance: 10,
                            maxDistance: 40,
                        },
                    },
                ],
            },
            ship: {
                accel: 150,
                exhaust: {
                    rate: 5,
                    mass: 1,
                    radius: 0.4,
                },
            },
            gunner: {
                rate: 3,
                direction: null,
                timeLeft: 0,
                damage: 4,
                damageGroup: DamageGroup.All & ~DamageGroup.Enemy,
                bulletSpeed: 200,
            },
            health: {
                hp: 5,
                maxHp: 5,
                damageGroup: DamageGroup.Enemy,
            },
            scoring: {
                value: 5,
            },
        }
        return e;
    }
}