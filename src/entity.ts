'use strict';
import { Point } from './geo';

export interface Entity {
    id?: number;
    
    render?: {
        color: string,
        shape: string,
    };
    
    physics?: {
        radius: number,
        position: Point,
        velocity: Point,
        drag: number,
        theta: number,
        omega: number,
    };
    
    player?: {};
    
    ship?: {
        direction?: Point,
        accel: number,
    };
    
    enemy?: {};
}