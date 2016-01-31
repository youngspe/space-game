'use strict';

export const SIN_30 = 0.5;
export const COS_30 = 0.86603;

export interface Point {
    x: number;
    y: number;
}

export module Point {
    export function add(...points: Point[]): Point {
        let p = { x: 0, y: 0 }
        for (let p1 of points) {
            p.x += p1.x;
            p.y += p1.y;
        }
        return p;
    }
    
    export function subtract(p1: Point, p2: Point): Point {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    }
    
    export function length(p: Point): number {
        return Math.sqrt(lengthSquared(p));
    }
    
    export function lengthSquared(p: Point): number {
        return p.x ** 2 + p.y ** 2;
    }
}
