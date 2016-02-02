import { Entity }   from './entity';
import { Point }    from './geo';

export module Bullet {
    export function create(pos: Point, vel: Point): Entity {
        return {
            physics: {
                velocity: vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
            },
            position: pos,
            render: {
                color: '#40A0FF',
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.25,
                shape: 'circle',
            }
        }
    }
}