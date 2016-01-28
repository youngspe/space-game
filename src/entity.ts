'use strict';
import { GeoPoint } from './geo';

export interface Entity {
    id?: number;
    
    render?: {
        color: string,
    };
    
    physics?: {
        radius: number,
        position: GeoPoint,
        velocity: GeoPoint,
        drag: number,
    };
    
    player?: {};
}