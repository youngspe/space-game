'use strict';

export const SIN_30 = 0.5;
export const COS_30 = 0.86603;

export interface Point {
    x: number;
    y: number;
}

export class GeoPoint implements Point {
    x: number;
    y: number;
    
    public constructor(x: number, y: number) {
        // comment
        this.x = x; this.y = y;
    }
    
    public plus(...points: Point[]): GeoPoint {
        return GeoPoint.add(this, ...points);
    }
    
    public times(scalar: number): GeoPoint {
        return new GeoPoint(this.x * scalar, this.y * scalar);
    }
    
    public length(): number {
        return Math.sqrt(this.lengthSquared());
    }
    
    public lengthSquared(): number {
        return this.x ** 2 + this.y ** 2;
    }
}

export module GeoPoint {
    export function add(...points: Point[]): GeoPoint {
        let p = new GeoPoint(0, 0);
        for (let p1 of points) {
            p.x += p1.x;
            p.y += p1.y;
        }
        return p;
    }
}
