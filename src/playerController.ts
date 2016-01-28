'use strict';
import { Entity }       from './entity';
import { Game }         from './game';
import { GeoPoint }     from './geo';
import { Input, Key, KeyState }   from './input';

export class PlayerController {
    public constructor(game: Game) {
        game.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        })
    }
    
    public step(elapsedMs: number, input: Input) {
        let seconds = elapsedMs / 1000;
        let accel = 150; // 1 unit/s^2
        let dv = accel * seconds;
        
        let vx = this.player.physics.velocity.x;
        let vy = this.player.physics.velocity.y;
        
        if (KeyState.isDown(input.getKey(Key.Up))) vy -= dv;
        if (KeyState.isDown(input.getKey(Key.Down))) vy += dv;
        
        if (KeyState.isDown(input.getKey(Key.Left))) vx -= dv;
        if (KeyState.isDown(input.getKey(Key.Right))) vx += dv;
        
        this.player.physics.velocity = new GeoPoint(vx, vy);
    }
    
    public player: Entity;
}