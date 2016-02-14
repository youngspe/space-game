'use strict';
import { Entity }           from './entity';
import { EntityContainer }  from './entityContainer';
import { Game }             from './game';
import { Point }            from './geo';
import { Input }            from './input';
import { PlayerController } from './playerController';
import { System }           from './system';

const X = 0; const Y = 1;

export interface HudDisplayBinding {
    setValue(value: string): void;
}

export interface HudDisplayController {
    score: HudDisplayBinding;
}

export class Hud implements System {
    public deps = new Hud.Dependencies();

    public init() { }

    public step(elapsedMs: number) {
        if (this._cursorDisplay == null) {
            this._cursorDisplay = {
                position: [0, 0],
                render: {
                    color: '#808080',
                    alpha: 0.3,
                    radius: 3,
                    shape: 'hexagon',
                    lineWidth: 0.125,
                    maxBlur: 1,
                    glow: 1,
                },
            };
            this.deps.entities.addEntity(this._cursorDisplay);
        }

        let cursor = this.deps.input.cursor;
        if (cursor) {
            this._cursorDisplay.position = Point.clone(cursor);
        }

        if (this._displayController != null) {
            this.displayScore(this.deps.playerController.player);
        }
    }

    private displayScore(player: Entity) {
        if (player == null) {
            return;
        }

        this._displayController.score.setValue(player.player.score.toString());
    }

    public setDisplayController(hdc: HudDisplayController) {
        this._displayController = hdc;
    }

    private _displayController: HudDisplayController;
    private _cursorDisplay: Entity;
}

export module Hud {
    export class Dependencies extends System.Dependencies {
        entities: EntityContainer<Entity> = null;
        playerController: PlayerController = null;
        input: Input = null;
    }
}