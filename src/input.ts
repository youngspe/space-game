'use strict';
import { Point }    from './geo';

export enum Key {
    UpLeft,
    Up,
    UpRight,
    DownLeft,
    Down,
    DownRight,
}

export enum KeyState {
    Pressing = 0,
    Down = 1,
    Releasing = 2,
    Up = 3,
}

export module KeyState {
    export function isDown(state: KeyState) {
        return state < 2;
    }
}

export class Input {
    public constructor() {
        let keyCount = Object.keys(Key).length / 2;
        this._keys = new Array<KeyState>(keyCount);
        for (let i = 0; i < keyCount; ++i) {
            this._keys[i] = KeyState.Up;
        }
    }

    public getKey(key: Key) {
        return this._keys[key];
    }

    public keyDown(key: Key) {
        if (this._keys[key] != KeyState.Down) {
            this._keys[key] = KeyState.Pressing;
        }
    }

    public keyUp(key: Key) {
        this._toRelease.push(key);
    }

    public postStep() {
        for (let i = 0; i < this._keys.length; ++i) {
            if (this._keys[i] == KeyState.Pressing) {
                this._keys[i] = KeyState.Down;
            }
            else if (this._keys[i] == KeyState.Releasing) {
                this._keys[i] = KeyState.Up;
            }
        }

        for (let key of this._toRelease) {
            if (this._keys[key] != KeyState.Up) {
                this._keys[key] = KeyState.Releasing;
            }
        }
        this._toRelease.length = 0;
    }

    public cursor: Point;

    private _toRelease: Key[] = [];
    private _keys: KeyState[];
}