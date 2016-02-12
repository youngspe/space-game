'use strict';
import { Event } from './event';

export class EntityContainer<E extends { id?: number, isDead?: boolean }> {
    /**
     * Adds an entity to the container.
     * @param entity The entity to add.
     */
    public addEntity(entity: E): void {
        entity.id = ++this._nextId;
        this._entities.add(entity);
        this._index.set(entity.id, entity);
        this.entityAdded.emit(entity);
    }

    /**
     * Removes an entity from the container.
     * @param entity The entity to remove.
     */
    public removeEntity(entity: E): void {
        this._entities.delete(entity);
        this._index.delete(entity.id);
        this.entityRemoved.emit(entity);
    }
    
    /**
     * Marks an entity as dead.
     * The entity will be removed when reap() is called.
     * @param entity The entity to kill.
     */
    public killEntity(entity: E): void {
        entity.isDead = true;
        this._toKill.push(entity);
    }
    
    /**
     * Retrieves an entity with the given id.
     * @param id The id of the entity to retrieve.
     */
    public getById(id: number): E {
        return this._index.get(id);
    }
    
    /**
     * Removes dead entities.
     */
    public reap(): void {
        for (let e of this._toKill) {
            this.removeEntity(e);
        }
        this._toKill = [];
    }

    /**
     * Occurs after an entity is added to the container.
     * arg: The entity that was added.
     */
    public entityAdded = new Event<E, void>();
    
    /**
     * Occurs after an entity is removed from the container.
     * arg: The entity that was removed.
     */
    public entityRemoved = new Event<E, void>();

    private _toKill: E[] = [];
    private _entities = new Set<E>();
    private _nextId = 0;
    private _index = new Map<number, E>();
}