'use strict';
import { Point } from './geo';

export interface Entity {
    id?: number;
    
    render?: {
        color: string,
        alpha: number,
        shape: string,
        radius: number,
        lineWidth: number,
    };
    
    position?: Point;
    
    physics?: {
        radius: number,
        velocity: Point,
        drag: number,
        theta: number,
        omega: number,
        mass: number,
        bounce: number
    };
    
    player?: {};
    
    ship?: {
        direction?: Point,
        accel: number,
        hp: number,
        maxHp: number,
    };
    
    enemy?: {};
}