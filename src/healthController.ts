'use strict'
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Reaper }           from './reaper';
import { System }           from './system';

export interface HealthComponent {
    hp: number;
    maxHp: number;
}

export class HealthController implements System {
    public deps = new HealthController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.health) this._healthEntities.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._healthEntities.delete(e); });
    }
    
    public damageEntity(entity: Entity, damage: number) {
        if (entity.health) {
            entity.health.hp -= damage;
            if (entity.health.hp <= 0) {
                this.deps.reaper.killEntity(entity);
            }
        }
    }

    private _healthEntities = new Set<Entity>();
}

export module HealthController {
    export class Dependencies extends System.Dependencies {
        reaper: Reaper = null;
        entities: EntityContainer<Entity> = null;
    }
}