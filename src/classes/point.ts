import { Point as FaceApiPoint } from 'face-api.js';

export default class Point {
    private _x: number = 0;
    private _y: number = 0;

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public set x(x: number) {
        this._x = x;
    }

    public set y(y: number) {
        this._y = y;
    }

    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }

    public static fromFaceApiPoint(faceApiPoint: FaceApiPoint) {
        return new Point(faceApiPoint.x, faceApiPoint.y);
    }

    public add(point: Point) {
        const newX = this._x + point.x;
        const newY = this._y + point.y;
        return new Point(newX, newY);
    }

    public subtract(point: Point) {
        const newX = this._x - point.x;
        const newY = this._y - point.y;
        return new Point(newX, newY);
    }

    public scalarMult(val: number) {
        const newX = this._x * val;
        const newY = this._y * val;
        return new Point(newX, newY);
    }

    public magnitude() {
        return Point.magnitude(this);
    }

    public rotate(angle: number) {
        return Point.rotate(this, angle);
    }

    public reflectXAxis() {
        const newX = this.x;
        const newY = -this.y;

        return new Point(newX, newY);
    }

    public static getMinMaxForPoints(points: Point[]): MinMax {
        const absoluteMax = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        const absoluteMin = new Point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        return points.reduce<MinMax>(([currentMin, currentMax], currentPoint) => {
            const newMinX = Math.min(currentPoint.x, currentMin.x);
            const newMinY = Math.min(currentPoint.y, currentMin.y);
            const newMin = new Point(newMinX, newMinY);

            const newMaxX = Math.max(currentPoint.x, currentMax.x);
            const newMaxY = Math.max(currentPoint.y, currentMax.y);
            const newMax = new Point(newMaxX, newMaxY);

            return [newMin, newMax];
        }, [absoluteMax, absoluteMin]);
    }

    public static getCenter(points: Point[]) {
        const sumPoints = points.reduce((currentSum, currentPoint) => {
            currentSum = currentSum.add(currentPoint);
            return currentSum;
        }, new Point());

        return sumPoints.scalarMult(1 / points.length);
    }

    public static dotProduct(a: Point, b: Point) {
        return a.x * b.x + a.y * b.y;
    }

    public static crossProduct(a: Point, b: Point) {
        return a.x * b.y - a.y * b.x;
    }

    public static magnitude(point: Point) {
        return Math.sqrt(point.x * point.x + point.y * point.y);
    }

    public static angleBetween(a: Point, b: Point) {
        const vectBetween = b.subtract(a);
        return Math.atan(vectBetween.y / vectBetween.x);
    }

    public static distanceBetween(a: Point, b: Point) {
        const xDiff = (b.x - a.x);
        const xDiffSquared = xDiff * xDiff;

        const yDiff = (b.y - a.y);
        const yDiffSquared = yDiff * yDiff;

        const distance = Math.sqrt(
            xDiffSquared + yDiffSquared
        );

        return distance;
    }

    public static rotate(point: Point, angle: number) {
        const newX = point.x * Math.cos(angle)
            - point.y * Math.sin(angle);

        const newY = point.x * Math.sin(angle)
            + point.y * Math.cos(angle);

        return new Point(newX, newY);
    }
}

export abstract class Min extends Point {};
export abstract class Max extends Point {};

export type MinMax = readonly [Min, Max];
