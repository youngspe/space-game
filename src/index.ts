/// <reference path="../typings/node/node.d.ts" />
'use strict';
import { Entity }   from './entity';
import { Game }     from './game';
import { GeoPoint}  from './geo';
import { Key }      from './input';

let mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;

let game = new Game();
game.renderer.setCanvas(mainCanvas);

setInterval(() => {
    game.step(30);
}, 30);

game.addEntity({
    physics: {
        position: new GeoPoint(0, 0),
        velocity: new GeoPoint(0, 0),
        radius: 1,
        drag: 1,
    },
    render: {
        color: 'blue',
    },
    player: {}
});

let keyMap: { [s: string]: Key } = {
    "KeyW": Key.Up,
    "KeyA": Key.Left,
    "KeyS": Key.Down,
    "KeyD": Key.Right,
}

document.addEventListener('keydown', (e: any) => {
    let key = keyMap[e.code];
    if (key != undefined) {
        console.log(Key[key]);
        game.input.keyDown(key);
    }
});

document.addEventListener('keyup', (e: any) => {
    let key = keyMap[e.code];
    if (key != undefined) {
        game.input.keyUp(key);
    }
});

let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.renderer.render(renderTime - lastRenderTime);

    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});