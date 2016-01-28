'use strict';
export interface Point {
    x: number;
    y: number;
}

export class GeoPoint implements Point {
    x: number;
    y: number;
    
    public constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }
    
    public plus(...points: Point[]): GeoPoint {
        return GeoPoint.add(this, ...points);
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