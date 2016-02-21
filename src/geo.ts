'use strict';

export const SIN_30 = 0.5;
export const COS_30 = 0.86603;
const X = 0;
const Y = 1;

export type Point = [number, number];

export module Point {
    export function add(...points: Point[]): Point {
        let p: Point = [0, 0]
        for (let p1 of points) {
            p[X] += p1[X];
            p[Y] += p1[Y];
        }
        return p;
    }

    export function subtract(p1: Point, p2: Point): Point {
        return [p1[X] - p2[X], p1[Y] - p2[Y]];
    }

    export function length(p: Point): number {
        return Math.sqrt(lengthSquared(p));
    }

    export function lengthSquared(p: Point): number {
        return p[X] ** 2 + p[Y] ** 2;
    }

    export function dist(p1: Point, p2: Point): number {
        return Math.sqrt(distSquared(p1, p2));
    }

    export function distSquared(p1: Point, p2: Point): number {
        return (p1[X] - p2[X]) ** 2 + (p1[Y] - p2[Y]) ** 2;
    }

    export function dot(p1: Point, p2: Point): number {
        return p1[X] * p2[X] + p1[Y] * p2[Y];
    }

    export function clone(p: Point): Point {
        return [p[X], p[Y]];
    }

    export function normalize(p: Point): Point {
        let len = length(p);
        return [p[X] / len, p[Y] / len];
    }

    export function zero(): Point {
        return [0, 0];
    }

    export function plus(self: Point, p: Point): void {
        self[X] += p[X]; self[Y] += p[Y];
    }
}

export type Matrix = [
    [number, number],
    [number, number]
];

export module Matrix {
    export function mul(a: Matrix, b: Matrix): Matrix {
        let vecX = pointMul(a, [b[X][X], b[Y][X]]);
        let vecY = pointMul(a, [b[X][Y], b[Y][Y]]);

        return [
            [vecX[X], vecY[X]],
            [vecX[Y], vecY[Y]],
        ];
    }

    export function pointMul(a: Matrix, b: Point): Point {
        return [
            Point.dot(a[X], b),
            Point.dot(a[Y], b),
        ];
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
                    return [
                        x * radius + center[X],
                        y * radius + center[Y],
                    ];
                }
            }
        }
        
        // Approx. using sum of 3 uniform random numbers.
        export function randGauss(mean: number, dev: number): number {
            return (Math.random() + Math.random() + Math.random() - 1.5) * 0.67 * dev + mean;
        }

        export function randGauss2d(center: Point, dev: number): Point {
            return [
                randGauss(center[X], dev),
                randGauss(center[Y], dev),
            ];
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