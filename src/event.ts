'use strict';
export type Listener<T, U> = (value: T) => U | Promise<U>;

export class Event<T extends any, U extends any> {
    private _listeners: Array<Listener<T, U>> = [];
    public emit(value: T): (U | Promise<U>)[] {
        return this._listeners.map(l => l(value));
    }
    
    public emitAsync(value: T): Promise<U[]> {
        let results = this.emit(value);
        return Promise.all(results.map(v => v && (<Promise<U>>v).then ? v : Promise.resolve(v)));
    }
    
    public listen(listener: Listener<T, U>) {
        this._listeners.push(listener);
    }
}
