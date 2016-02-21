'use strict'
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Reaper }           from './reaper';
import { System }           from './system';

export enum DamageGroup {
    None = 0 | 0,
    Player = 1 << 0,
    Enemy = 1 << 1,
    All = 0x7fffffff | 0,
}

export interface HealthComponent {
    hp: number;
    maxHp: number;
    damageGroup: DamageGroup;
}

export class HealthController implements System {
    public deps = new HealthController.Dependencies();

    public init() {
        this.deps.entities.entityAdded.listen(e => { if (e.health) this._healthEntities.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._healthEntities.delete(e); });
    }

    public damageEntity(entity: Entity, damage: number, source?: Entity, damageGroup?: DamageGroup) {
        if (damageGroup == undefined) damageGroup = DamageGroup.All;

        if (entity.health == null) {
            return;
        }

        if (damageGroup & entity.health.damageGroup) {
            entity.health.hp -= damage;
            if (entity.health.hp <= 0) {
                this.deps.reaper.killEntity(entity, source);
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