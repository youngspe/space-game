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

    export function dist(p1: Point, p2: Point): number {
        return Math.sqrt(distSquared(p1, p2));
    }

    export function distSquared(p1: Point, p2: Point): number {
        return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
    }

    export function dot(p1: Point, p2: Point): number {
        return p1.x * p2.x + p1.y * p2.y;
    }

    export function clone(p: Point): Point {
        return { x: p.x, y: p.y };
    }

    export function normalize(p: Point): Point {
        let len = length(p);
        return { x: p.x / len, y: p.y / len };
    }
    
    export function zero() {
        return { x: 0, y: 0 };
    }
}

export module geo {
    export module math {
        export function randBetween(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        }

        export function randCircle(center: Point, radius: number): Point {
            // Repeat until (x,y) is inside the unit circle.
            while (true) {
                let x = randBetween(-1, 1);
                let y = randBetween(-1, 1);
                if (x ** 2 + y ** 2 <= 1) {
                    return {
                        x: x * radius + center.x,
                        y: y * radius + center.y,
                    };
                }
            }
        }
        
        // Approx. using sum of 3 uniform random numbers.
        export function randGauss(mean: number, dev: number): number {
            return (Math.random() + Math.random() + Math.random() - 1.5) * 0.67 * dev + mean;
        }

        export function randGauss2d(center: Point, dev: number): Point {
            return {
                x: randGauss(center.x, dev),
                y: randGauss(center.y, dev),
            };
        }

        export function lerp(min: number, max: number, x: number): number {
            return x * (max - min) + min;
        }

        export function clamp(min: number, x: number, max: number): number {
            return Math.min(Math.max(min, x), max);
        }
    }
}

export default geo;