'use strict';
import { Event } from './event';

export class EntityContainer<E extends { id?: number }> {
    public addEntity(entity: E): void {
        entity.id = ++this._nextId;
        this._entities.add(entity);
        this.entityAdded.emit(entity);
    }

    public removeEntity(entity: E): void {
        this._entities.delete(entity);
        this.entityRemoved.emit(entity)
    }

    public entityAdded = new Event<E, void>();
    public entityRemoved = new Event<E, void>();
    
    private _entities = new Set<E>();
    private _nextId = 0;
}