(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var BulletComponent;
(function (BulletComponent) {
    function createBullet(pos, vel, damage, lifespan) {
        return {
            physics: {
                velocity: vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
            },
            position: pos,
            render: {
                color: '#40A0FF',
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.1,
                shape: 'circle',
            },
            bullet: {
                damage: damage,
                timeRemaining: lifespan,
                isAlive: true,
            }
        };
    }
    BulletComponent.createBullet = createBullet;
})(BulletComponent = exports.BulletComponent || (exports.BulletComponent = {}));
class BulletController {
    constructor(entities) {
        this._bullets = new Set();
        entities.entityAdded.listen(e => { if (e.bullet)
            this._bullets.add(e); });
        entities.entityRemoved.listen(e => { this._bullets.delete(e); });
        this._entities = entities;
    }
    step(elapsedMs, intersections) {
        let seconds = elapsedMs / 1000;
        for (let b of this._bullets) {
            if (b.bullet.timeRemaining <= 0) {
                this._entities.removeEntity(b);
                continue;
            }
            if (b.bullet.isAlive) {
                let inters = intersections.get(b);
                if (inters && inters.length > 0) {
                    for (let i of inters) {
                        let other = i.b;
                        if (other.ship) {
                            other.ship.hp -= b.bullet.damage;
                            b.bullet.isAlive = false;
                            break;
                        }
                    }
                }
            }
            else {
                b.render.color = "#808080";
            }
            b.bullet.timeRemaining -= seconds;
        }
    }
}
exports.BulletController = BulletController;

},{}],2:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var EnemyComponent;
(function (EnemyComponent) {
    function createFollower(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1.2,
                drag: 0.5,
                theta: 0,
                omega: 0,
                mass: 1,
                bounce: 0.96,
            },
            render: {
                color: '#FF8000',
                alpha: 1,
                shape: 'circle',
                radius: 1.2,
                lineWidth: 0.5,
            },
            enemy: {},
            ship: {
                accel: 100,
                hp: 10,
                maxHp: 10,
            },
        };
        return e;
    }
    EnemyComponent.createFollower = createFollower;
    function createTank(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 3,
                drag: 0.4,
                theta: 0,
                omega: 0,
                mass: 9,
                bounce: 0.96,
            },
            render: {
                color: '#D00000',
                alpha: 1,
                shape: 'circle',
                radius: 3,
                lineWidth: 0.5,
            },
            enemy: {},
            ship: {
                accel: 80,
                hp: 30,
                maxHp: 100,
            },
        };
        return e;
    }
    EnemyComponent.createTank = createTank;
    function createSeeker(pos, vel) {
        let e = {
            position: pos,
            physics: {
                velocity: vel,
                radius: 1,
                drag: 0.25,
                theta: 0,
                omega: 0,
                mass: 0.8,
                bounce: 0.96,
            },
            render: {
                color: '#80FF00',
                alpha: 1,
                shape: 'circle',
                radius: 0.9,
                lineWidth: 0.5,
            },
            enemy: {},
            ship: {
                accel: 150,
                hp: 5,
                maxHp: 5,
            },
        };
        return e;
    }
    EnemyComponent.createSeeker = createSeeker;
})(EnemyComponent = exports.EnemyComponent || (exports.EnemyComponent = {}));
class EnemyController {
    constructor(entities) {
        this._enemies = new Set();
        entities.entityAdded.listen(e => { if (e.enemy)
            this._enemies.add(e); });
        entities.entityRemoved.listen(e => { this._enemies.delete(e); });
    }
    step(elapsedMs, player) {
        let seconds = elapsedMs / 1000;
        for (let e of this._enemies) {
            let dif = geo_1.Point.subtract(player.position, e.position);
            let len = geo_1.Point.length(dif);
            dif.x /= len;
            dif.y /= len;
            e.ship.direction = dif;
        }
    }
}
exports.EnemyController = EnemyController;

},{"./geo":6}],3:[function(require,module,exports){
'use strict';
var event_1 = require('./event');
class EntityContainer {
    constructor() {
        this.entityAdded = new event_1.Event();
        this.entityRemoved = new event_1.Event();
        this._entities = new Set();
        this._nextId = 0;
    }
    addEntity(entity) {
        entity.id = ++this._nextId;
        this._entities.add(entity);
        this.entityAdded.emit(entity);
    }
    removeEntity(entity) {
        this._entities.delete(entity);
        this.entityRemoved.emit(entity);
    }
}
exports.EntityContainer = EntityContainer;

},{"./event":4}],4:[function(require,module,exports){
'use strict';
class Event {
    constructor() {
        this._listeners = [];
    }
    emit(value) {
        return this._listeners.map(l => l(value));
    }
    emitAsync(value) {
        let results = this.emit(value);
        return Promise.all(results.map(v => v && v.then ? v : Promise.resolve(v)));
    }
    listen(listener) {
        this._listeners.push(listener);
    }
}
exports.Event = Event;

},{}],5:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var enemyController_1 = require('./enemyController');
var entityContainer_1 = require('./entityContainer');
var hud_1 = require('./hud');
var input_1 = require('./input');
var physics_1 = require('./physics');
var playerController_1 = require('./playerController');
var renderer_1 = require('./renderer');
var shipController_1 = require('./shipController');
class BaseGame {
    constructor() {
        this.entities = new entityContainer_1.EntityContainer();
        this._nextId = 0;
    }
}
exports.BaseGame = BaseGame;
class Game extends BaseGame {
    constructor(...args) {
        super(...args);
        this.physics = new physics_1.Physics(this.entities);
        this.renderer = new renderer_1.Renderer(this.entities);
        this.playerController = new playerController_1.PlayerController(this.entities);
        this.shipController = new shipController_1.ShipController(this.entities);
        this.enemyController = new enemyController_1.EnemyController(this.entities);
        this.bulletController = new bulletController_1.BulletController(this.entities);
        this.hud = new hud_1.Hud(this.entities);
        this.input = new input_1.Input();
    }
    step(elapsedMs) {
        this.playerController.step(elapsedMs, this.input);
        this.enemyController.step(elapsedMs, this.playerController.player);
        this.shipController.step(elapsedMs);
        this.bulletController.step(elapsedMs, this.physics.intersections);
        this.physics.step(elapsedMs);
        this.hud.step(this.input);
        this.input.postStep();
    }
}
exports.Game = Game;

},{"./bulletController":1,"./enemyController":2,"./entityContainer":3,"./hud":7,"./input":9,"./physics":10,"./playerController":11,"./renderer":12,"./shipController":13}],6:[function(require,module,exports){
'use strict';
exports.SIN_30 = 0.5;
exports.COS_30 = 0.86603;
var Point;
(function (Point) {
    function add(...points) {
        let p = { x: 0, y: 0 };
        for (let p1 of points) {
            p.x += p1.x;
            p.y += p1.y;
        }
        return p;
    }
    Point.add = add;
    function subtract(p1, p2) {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    }
    Point.subtract = subtract;
    function length(p) {
        return Math.sqrt(lengthSquared(p));
    }
    Point.length = length;
    function lengthSquared(p) {
        return Math.pow(p.x, 2) + Math.pow(p.y, 2);
    }
    Point.lengthSquared = lengthSquared;
    function dist(p1, p2) {
        return Math.sqrt(distSquared(p1, p2));
    }
    Point.dist = dist;
    function distSquared(p1, p2) {
        return Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2);
    }
    Point.distSquared = distSquared;
    function dot(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
    }
    Point.dot = dot;
    function clone(p) {
        return { x: p.x, y: p.y };
    }
    Point.clone = clone;
    function normalize(p) {
        let len = length(p);
        return { x: p.x / len, y: p.y / len };
    }
    Point.normalize = normalize;
})(Point = exports.Point || (exports.Point = {}));

},{}],7:[function(require,module,exports){
'use strict';
class Hud {
    constructor(entities) {
        this._cursorDisplay = {
            position: { x: 0, y: 0 },
            render: {
                color: '#808080',
                alpha: 0.3,
                radius: 3,
                shape: 'hexagon',
                lineWidth: 0.125,
            },
        };
        entities.addEntity(this._cursorDisplay);
    }
    step(input) {
        if (input.cursor) {
            this._cursorDisplay.position = { x: input.cursor.x, y: input.cursor.y };
        }
    }
}
exports.Hud = Hud;

},{}],8:[function(require,module,exports){
/// <reference path="../typings/node/node.d.ts" />
'use strict';
var enemyController_1 = require('./enemyController');
var game_1 = require('./game');
var input_1 = require('./input');
let mainCanvas = document.getElementById('mainCanvas');
let game = new game_1.Game();
game.renderer.setCanvas(mainCanvas);
let lastStepTime = performance.now();
let timescale = 1;
setTimeout(function step() {
    try {
        let stepTime = performance.now();
        game.step((stepTime - lastStepTime) * timescale);
        lastStepTime = stepTime;
    }
    catch (err) {
        console.log(err);
    }
    setTimeout(step, 30);
}, 30);
game.entities.addEntity({
    position: { x: 0, y: 0 },
    physics: {
        velocity: { x: 0, y: 0 },
        radius: 1,
        drag: 2,
        theta: 0,
        omega: 0,
        mass: 1,
        bounce: 0.96,
    },
    render: {
        color: '#00A0FF',
        alpha: 1,
        shape: 'hexagon',
        radius: 1.2,
        lineWidth: 0.25,
    },
    player: {},
    ship: {
        accel: 600,
        hp: 10,
        maxHp: 10,
    },
});
for (let i = 0; i < 30; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(enemyController_1.EnemyComponent.createFollower({ x: x, y: y }, { x: 0, y: 0 }));
}
for (let i = 0; i < 6; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(enemyController_1.EnemyComponent.createTank({ x: x, y: y }, { x: 0, y: 0 }));
}
for (let i = 0; i < 30; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(enemyController_1.EnemyComponent.createSeeker({ x: x, y: y }, { x: 0, y: 0 }));
}
let keyMap = {
    81: input_1.Key.UpLeft,
    87: input_1.Key.Up,
    69: input_1.Key.UpRight,
    65: input_1.Key.DownLeft,
    83: input_1.Key.Down,
    68: input_1.Key.DownRight,
};
window.addEventListener('keydown', (e) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.input.keyDown(key);
    }
});
window.addEventListener('keyup', (e) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.input.keyUp(key);
    }
});
window.addEventListener('mousemove', (e) => {
    let rect = mainCanvas.getBoundingClientRect();
    let p = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    game.input.cursor = game.renderer.screenToWorld(p);
});
window.addEventListener('mousedown', (e) => {
    game.input.keyDown(input_1.Key.Fire);
});
window.addEventListener('mouseup', (e) => {
    game.input.keyUp(input_1.Key.Fire);
});
let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.renderer.render(renderTime - lastRenderTime);
    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});

},{"./enemyController":2,"./game":5,"./input":9}],9:[function(require,module,exports){
'use strict';
(function (Key) {
    Key[Key["UpLeft"] = 0] = "UpLeft";
    Key[Key["Up"] = 1] = "Up";
    Key[Key["UpRight"] = 2] = "UpRight";
    Key[Key["DownLeft"] = 3] = "DownLeft";
    Key[Key["Down"] = 4] = "Down";
    Key[Key["DownRight"] = 5] = "DownRight";
    Key[Key["Fire"] = 6] = "Fire";
})(exports.Key || (exports.Key = {}));
var Key = exports.Key;
(function (KeyState) {
    KeyState[KeyState["Pressing"] = 0] = "Pressing";
    KeyState[KeyState["Down"] = 1] = "Down";
    KeyState[KeyState["Releasing"] = 2] = "Releasing";
    KeyState[KeyState["Up"] = 3] = "Up";
})(exports.KeyState || (exports.KeyState = {}));
var KeyState = exports.KeyState;
var KeyState;
(function (KeyState) {
    function isDown(state) {
        return state < 2;
    }
    KeyState.isDown = isDown;
})(KeyState = exports.KeyState || (exports.KeyState = {}));
class Input {
    constructor() {
        this._toRelease = [];
        let keyCount = Object.keys(Key).length / 2;
        this._keys = new Array(keyCount);
        for (let i = 0; i < keyCount; ++i) {
            this._keys[i] = KeyState.Up;
        }
    }
    getKey(key) {
        return this._keys[key];
    }
    keyDown(key) {
        if (this._keys[key] != KeyState.Down) {
            this._keys[key] = KeyState.Pressing;
        }
    }
    keyUp(key) {
        this._toRelease.push(key);
    }
    postStep() {
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
}
exports.Input = Input;

},{}],10:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
const worldDrag = 4;
class Physics {
    constructor(entities) {
        this.iterations = 4;
        this.intersections = new Map();
        this._entities = new Set();
        entities.entityAdded.listen(e => { if (e.physics)
            this._entities.add(e); });
        entities.entityRemoved.listen(e => { this._entities.delete(e); });
    }
    step(elapsedMs) {
        this.intersections.clear();
        for (let i = 0; i < this.iterations; ++i) {
            let intersections = this.stepInternal(elapsedMs / this.iterations);
            for (let inter of intersections) {
                this.addIntersection(inter.a, inter.b);
                this.addIntersection(inter.b, inter.a);
            }
        }
    }
    addIntersection(a, b) {
        let inters = this.intersections.get(a);
        if (inters == undefined) {
            inters = [];
            this.intersections.set(a, inters);
        }
        inters.push({ a: a, b: b });
    }
    stepInternal(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let entity of this._entities) {
            let phys = entity.physics;
            let pos = entity.position;
            let vel = phys.velocity;
            pos.x += vel.x * seconds;
            pos.y += vel.y * seconds;
            let dragCoeff = Math.pow(Math.E, -worldDrag * phys.drag * seconds);
            vel.x *= dragCoeff;
            vel.y *= dragCoeff;
            phys.theta += phys.omega * seconds;
        }
        let intersections = this.findIntersections();
        this.correctCollisions(intersections);
        return intersections;
    }
    findIntersections() {
        let intersections = [];
        var list = new Array(this._entities.size);
        {
            let i = 0;
            for (let e of this._entities) {
                list[i] = e;
                ++i;
            }
        }
        // Sort by leftmost bound of circle.
        list.sort((a, b) => Math.sign((a.position.x - a.physics.radius) - (b.position.x - b.physics.radius)));
        // Sweep left-to-right through the entities.
        for (let i = 0; i < list.length; ++i) {
            let a = list[i];
            let rightEdge = a.position.x + a.physics.radius;
            // Check only entities to the right of a;
            for (let j = i + 1; j < list.length; ++j) {
                let b = list[j];
                if (b.position.x - b.physics.radius >= rightEdge) {
                    // No intersections are possible after this.
                    break;
                }
                let radSqr = Math.pow((a.physics.radius + b.physics.radius), 2);
                let distSqr = geo_1.Point.distSquared(a.position, b.position);
                if (distSqr < radSqr) {
                    intersections.push({ a: a, b: b });
                }
            }
        }
        return intersections;
    }
    correctCollisions(intersections) {
        let corrections = new Map();
        for (let i of intersections) {
            let a = i.a;
            let b = i.b;
            // Find the difference in position.
            let difP = geo_1.Point.subtract(b.position, a.position);
            let len = geo_1.Point.length(difP);
            // Normalize the difference.
            let normal = { x: difP.x / len, y: difP.y / len };
            // Find the difference in velocity.
            let difV = geo_1.Point.subtract(b.physics.velocity, a.physics.velocity);
            let dot = geo_1.Point.dot(difV, normal);
            let bounce = a.physics.bounce * b.physics.bounce;
            let dv = { x: normal.x * dot * bounce, y: normal.y * dot * bounce };
            let totalMass = a.physics.mass + b.physics.mass;
            a.physics.velocity.x += dv.x * b.physics.mass / totalMass;
            a.physics.velocity.y += dv.y * b.physics.mass / totalMass;
            b.physics.velocity.x -= dv.x * a.physics.mass / totalMass;
            b.physics.velocity.y -= dv.y * a.physics.mass / totalMass;
            // Displace the entities out of each other.
            let corA = corrections.get(a);
            if (corA == undefined) {
                corA = { x: 0, y: 0, mass: 0 };
                corrections.set(a, corA);
            }
            let corB = corrections.get(b);
            if (corB == undefined) {
                corB = { x: 0, y: 0, mass: 0 };
                corrections.set(b, corB);
            }
            let displace = (a.physics.radius + b.physics.radius) - len;
            let disX = normal.x * displace;
            let disY = normal.y * displace;
            corA.x -= disX * b.physics.mass;
            corA.y -= disY * b.physics.mass;
            corA.mass += totalMass;
            corB.x += disX * a.physics.mass;
            corB.y += disY * a.physics.mass;
            corB.mass += totalMass;
        }
        for (let kvp of corrections) {
            let e = kvp[0];
            let cor = kvp[1];
            let dx = cor.x / cor.mass * 1.05;
            let dy = cor.y / cor.mass * 1.05;
            e.position.x += dx;
            e.position.y += dy;
        }
    }
}
exports.Physics = Physics;

},{"./geo":6}],11:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var geo_1 = require('./geo');
var geo_2 = require('./geo');
var input_1 = require('./input');
class PlayerController {
    constructor(entities) {
        this.player = null;
        this.bulletTime = 0.1;
        this.bulletLifespan = 4;
        this.bulletDamage = 6;
        this._bulletTimeLeft = 0;
        entities.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        });
        entities.entityRemoved.listen(e => {
            if (e == this.player) {
                this.player = null;
            }
        });
        this._entities = entities;
    }
    step(elapsedMs, input) {
        let seconds = elapsedMs / 1000;
        if (this.player == null) {
            return;
        }
        let dvx = 0;
        let dvy = 0;
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.Up)))
            dvy -= 1;
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.Down)))
            dvy += 1;
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.UpLeft))) {
            dvx -= geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.UpRight))) {
            dvx += geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.DownLeft))) {
            dvx -= geo_2.COS_30;
            dvy += geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(input.getKey(input_1.Key.DownRight))) {
            dvx += geo_2.COS_30;
            dvy += geo_2.SIN_30;
        }
        let len = Math.sqrt(Math.pow(dvx, 2) + Math.pow(dvy, 2));
        if (len <= 0.05) {
            // either zero or there's a rounding error.
            this.player.ship.direction = null;
        }
        else {
            dvx /= len;
            dvy /= len;
        }
        this.player.ship.direction = { x: dvx, y: dvy };
        // Bullets:
        if (this._bulletTimeLeft <= 0 && input_1.KeyState.isDown(input.getKey(input_1.Key.Fire))) {
            let normal = geo_1.Point.subtract(input.cursor, this.player.position);
            let len = geo_1.Point.length(normal);
            normal.x /= len;
            normal.y /= len;
            let newPos = geo_1.Point.clone(this.player.position);
            newPos.x += normal.x * this.player.physics.radius * 1.5;
            newPos.y += normal.y * this.player.physics.radius * 1.5;
            let newVel = geo_1.Point.clone(this.player.physics.velocity);
            newVel.x += normal.x * 200;
            newVel.y += normal.y * 200;
            let newBullet = bulletController_1.BulletComponent.createBullet(newPos, newVel, this.bulletDamage, this.bulletLifespan);
            this._entities.addEntity(newBullet);
            this._bulletTimeLeft += this.bulletTime;
        }
        if (this._bulletTimeLeft > 0) {
            this._bulletTimeLeft -= seconds;
        }
    }
}
exports.PlayerController = PlayerController;

},{"./bulletController":1,"./geo":6,"./input":9}],12:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var geo_2 = require('./geo');
class Style {
}
const VIEW_HEIGHT = 75;
class Renderer {
    constructor(entities) {
        this.shapeFns = {
            'circle': (ctx) => {
                ctx.beginPath();
                ctx.arc(0, 0, 1, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            },
            'hexagon': (ctx) => {
                ctx.beginPath();
                ctx.moveTo(0, -1);
                ctx.lineTo(+geo_2.COS_30, -geo_2.SIN_30);
                ctx.lineTo(+geo_2.COS_30, +geo_2.SIN_30);
                ctx.lineTo(0, 1);
                ctx.lineTo(-geo_2.COS_30, +geo_2.SIN_30);
                ctx.lineTo(-geo_2.COS_30, -geo_2.SIN_30);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        };
        this.dpiScale = 1;
        this.camera = { pos: { x: 0, y: 0 }, zoom: 1 };
        this._entities = new Set();
        entities.entityAdded.listen(e => { if (e.render)
            this._entities.add(e); });
        entities.entityRemoved.listen(e => { this._entities.delete(e); });
    }
    setCanvas(canvas) {
        this._context = canvas.getContext('2d');
    }
    render(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let ctx = this._context;
        let canvas = ctx.canvas;
        canvas.width = canvas.clientWidth * this.dpiScale;
        canvas.height = canvas.clientHeight * this.dpiScale;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.setTransform();
        for (let entity of this._entities) {
            if (entity.physics) {
                const MAX_BLUR_COUNT = 5;
                let dir = geo_1.Point.normalize(entity.physics.velocity);
                let speed = geo_1.Point.length(entity.physics.velocity);
                let blurCount = Math.floor(speed * seconds / entity.render.radius + 1);
                blurCount = Math.min(blurCount, MAX_BLUR_COUNT);
                for (let i = 0; i < blurCount; ++i) {
                    let pos = geo_1.Point.add(entity.position, {
                        x: -entity.physics.velocity.x * seconds * i / blurCount,
                        y: -entity.physics.velocity.y * seconds * i / blurCount,
                    });
                    this.renderEntity(entity, pos, Math.sqrt(1.0 / blurCount), {
                        dir: dir,
                        factor: speed * seconds / (blurCount + 1) / entity.render.radius + 1,
                    });
                }
            }
            else {
                this.renderEntity(entity, entity.position, 1, null);
            }
        }
    }
    renderEntity(e, pos, alpha, stretch) {
        let ctx = this._context;
        ctx.save();
        let radius = e.render.radius;
        ctx.translate(pos.x, pos.y);
        ctx.scale(radius, radius);
        if (stretch) {
            this.stretch(stretch.dir, stretch.factor);
        }
        if (e.physics) {
            ctx.rotate(e.physics.theta);
        }
        let style = {
            fill: 'transparent',
            stroke: e.render.color,
            lineWidth: e.render.lineWidth / e.render.radius,
            alpha: e.render.alpha * alpha,
        };
        this.setStyle(style);
        this.shapeFns[e.render.shape](ctx);
        ctx.restore();
    }
    stretch(dir, factor) {
        let ab = { x: 1, y: 0 };
        let abDot = geo_1.Point.dot(ab, dir);
        let abAmount = abDot * (factor - 1);
        ab.x += dir.x * abAmount;
        ab.y += dir.y * abAmount;
        let bc = { x: 0, y: 1 };
        let bcDot = geo_1.Point.dot(bc, dir);
        let bcAmount = bcDot * (factor - 1);
        bc.x += dir.x * bcAmount;
        bc.y += dir.y * bcAmount;
        this._context.transform(ab.x, ab.y, bc.x, bc.y, 0, 0);
    }
    setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;
        let dx = -this.camera.pos.x * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos.y * scale + ctx.canvas.height / 2;
        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }
    drawCircle(center, radius, style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    setStyle(style) {
        let ctx = this._context;
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
        ctx.globalAlpha = style.alpha;
        ctx.shadowColor = style.stroke;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    screenToWorld(p) {
        let ctx = this._context;
        let x = p.x;
        let y = p.y;
        x -= ctx.canvas.clientWidth / 2;
        y -= ctx.canvas.clientHeight / 2;
        let fac = VIEW_HEIGHT / ctx.canvas.clientHeight;
        x *= fac;
        y *= fac;
        return { x: x, y: y };
    }
}
exports.Renderer = Renderer;

},{"./geo":6}],13:[function(require,module,exports){
'use strict';
class ShipController {
    constructor(entities) {
        this._ships = new Set();
        entities.entityAdded.listen(e => { if (e.ship)
            this._ships.add(e); });
        entities.entityRemoved.listen(e => { this._ships.delete(e); });
        this._entities = entities;
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._ships) {
            if (e.ship.hp <= 0) {
                this._entities.removeEntity(e);
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction.x * dvAmount;
                let dvy = e.ship.direction.y * dvAmount;
                e.physics.velocity.x += dvx;
                e.physics.velocity.y += dvy;
            }
        }
    }
}
exports.ShipController = ShipController;

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVteUNvbnRyb2xsZXIuanMiLCJiaW4vZW50aXR5Q29udGFpbmVyLmpzIiwiYmluL2V2ZW50LmpzIiwiYmluL2dhbWUuanMiLCJiaW4vZ2VvLmpzIiwiYmluL2h1ZC5qcyIsImJpbi9pbmRleC5qcyIsImJpbi9pbnB1dC5qcyIsImJpbi9waHlzaWNzLmpzIiwiYmluL3BsYXllckNvbnRyb2xsZXIuanMiLCJiaW4vcmVuZGVyZXIuanMiLCJiaW4vc2hpcENvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxudmFyIEJ1bGxldENvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChCdWxsZXRDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJ1bGxldChwb3MsIHZlbCwgZGFtYWdlLCBsaWZlc3Bhbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuNixcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMSxcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuMTI1LFxyXG4gICAgICAgICAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIG1hc3M6IDAuNSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM0MEEwRkYnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC4xLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBidWxsZXQ6IHtcclxuICAgICAgICAgICAgICAgIGRhbWFnZTogZGFtYWdlLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICBpc0FsaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIEJ1bGxldENvbXBvbmVudC5jcmVhdGVCdWxsZXQgPSBjcmVhdGVCdWxsZXQ7XHJcbn0pKEJ1bGxldENvbXBvbmVudCA9IGV4cG9ydHMuQnVsbGV0Q29tcG9uZW50IHx8IChleHBvcnRzLkJ1bGxldENvbXBvbmVudCA9IHt9KSk7XHJcbmNsYXNzIEJ1bGxldENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoZW50aXRpZXMpIHtcclxuICAgICAgICB0aGlzLl9idWxsZXRzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuYnVsbGV0KVxyXG4gICAgICAgICAgICB0aGlzLl9idWxsZXRzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2J1bGxldHMuZGVsZXRlKGUpOyB9KTtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcyA9IGVudGl0aWVzO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMsIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgYiBvZiB0aGlzLl9idWxsZXRzKSB7XHJcbiAgICAgICAgICAgIGlmIChiLmJ1bGxldC50aW1lUmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzLnJlbW92ZUVudGl0eShiKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChiLmJ1bGxldC5pc0FsaXZlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW50ZXJzID0gaW50ZXJzZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJzICYmIGludGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSBvZiBpbnRlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG90aGVyID0gaS5iO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXIuc2hpcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXIuc2hpcC5ocCAtPSBiLmJ1bGxldC5kYW1hZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLmJ1bGxldC5pc0FsaXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGIucmVuZGVyLmNvbG9yID0gXCIjODA4MDgwXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYi5idWxsZXQudGltZVJlbWFpbmluZyAtPSBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSBCdWxsZXRDb250cm9sbGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWxsZXRDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIEVuZW15Q29tcG9uZW50O1xyXG4oZnVuY3Rpb24gKEVuZW15Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGb2xsb3dlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjUsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNGRjgwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbmVteToge30sXHJcbiAgICAgICAgICAgIHNoaXA6IHtcclxuICAgICAgICAgICAgICAgIGFjY2VsOiAxMDAsXHJcbiAgICAgICAgICAgICAgICBocDogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogMTAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZUZvbGxvd2VyID0gY3JlYXRlRm9sbG93ZXI7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVUYW5rKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogOSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNEMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHt9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogODAsXHJcbiAgICAgICAgICAgICAgICBocDogMzAsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogMTAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rID0gY3JlYXRlVGFuaztcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNlZWtlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC4yNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjODBGRjAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjksXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHt9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogMTUwLFxyXG4gICAgICAgICAgICAgICAgaHA6IDUsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogNSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBlO1xyXG4gICAgfVxyXG4gICAgRW5lbXlDb21wb25lbnQuY3JlYXRlU2Vla2VyID0gY3JlYXRlU2Vla2VyO1xyXG59KShFbmVteUNvbXBvbmVudCA9IGV4cG9ydHMuRW5lbXlDb21wb25lbnQgfHwgKGV4cG9ydHMuRW5lbXlDb21wb25lbnQgPSB7fSkpO1xyXG5jbGFzcyBFbmVteUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoZW50aXRpZXMpIHtcclxuICAgICAgICB0aGlzLl9lbmVtaWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuZW5lbXkpXHJcbiAgICAgICAgICAgIHRoaXMuX2VuZW1pZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fZW5lbWllcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMsIHBsYXllcikge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX2VuZW1pZXMpIHtcclxuICAgICAgICAgICAgbGV0IGRpZiA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHBsYXllci5wb3NpdGlvbiwgZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBnZW9fMS5Qb2ludC5sZW5ndGgoZGlmKTtcclxuICAgICAgICAgICAgZGlmLnggLz0gbGVuO1xyXG4gICAgICAgICAgICBkaWYueSAvPSBsZW47XHJcbiAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaWY7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRW5lbXlDb250cm9sbGVyID0gRW5lbXlDb250cm9sbGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVteUNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZXZlbnRfMSA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxuY2xhc3MgRW50aXR5Q29udGFpbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5QWRkZWQgPSBuZXcgZXZlbnRfMS5FdmVudCgpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV4dElkID0gMDtcclxuICAgIH1cclxuICAgIGFkZEVudGl0eShlbnRpdHkpIHtcclxuICAgICAgICBlbnRpdHkuaWQgPSArK3RoaXMuX25leHRJZDtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGQoZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eUFkZGVkLmVtaXQoZW50aXR5KTtcclxuICAgIH1cclxuICAgIHJlbW92ZUVudGl0eShlbnRpdHkpIHtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcy5kZWxldGUoZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eVJlbW92ZWQuZW1pdChlbnRpdHkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRW50aXR5Q29udGFpbmVyID0gRW50aXR5Q29udGFpbmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbnRpdHlDb250YWluZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG5jbGFzcyBFdmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcclxuICAgIH1cclxuICAgIGVtaXQodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGlzdGVuZXJzLm1hcChsID0+IGwodmFsdWUpKTtcclxuICAgIH1cclxuICAgIGVtaXRBc3luYyh2YWx1ZSkge1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5lbWl0KHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cy5tYXAodiA9PiB2ICYmIHYudGhlbiA/IHYgOiBQcm9taXNlLnJlc29sdmUodikpKTtcclxuICAgIH1cclxuICAgIGxpc3RlbihsaXN0ZW5lcikge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkV2ZW50ID0gRXZlbnQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgZW5lbXlDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2VuZW15Q29udHJvbGxlcicpO1xyXG52YXIgZW50aXR5Q29udGFpbmVyXzEgPSByZXF1aXJlKCcuL2VudGl0eUNvbnRhaW5lcicpO1xyXG52YXIgaHVkXzEgPSByZXF1aXJlKCcuL2h1ZCcpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxudmFyIHBoeXNpY3NfMSA9IHJlcXVpcmUoJy4vcGh5c2ljcycpO1xyXG52YXIgcGxheWVyQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9wbGF5ZXJDb250cm9sbGVyJyk7XHJcbnZhciByZW5kZXJlcl8xID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpO1xyXG52YXIgc2hpcENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vc2hpcENvbnRyb2xsZXInKTtcclxuY2xhc3MgQmFzZUdhbWUge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IG5ldyBlbnRpdHlDb250YWluZXJfMS5FbnRpdHlDb250YWluZXIoKTtcclxuICAgICAgICB0aGlzLl9uZXh0SWQgPSAwO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuQmFzZUdhbWUgPSBCYXNlR2FtZTtcclxuY2xhc3MgR2FtZSBleHRlbmRzIEJhc2VHYW1lIHtcclxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICB0aGlzLnBoeXNpY3MgPSBuZXcgcGh5c2ljc18xLlBoeXNpY3ModGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyByZW5kZXJlcl8xLlJlbmRlcmVyKHRoaXMuZW50aXRpZXMpO1xyXG4gICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IG5ldyBwbGF5ZXJDb250cm9sbGVyXzEuUGxheWVyQ29udHJvbGxlcih0aGlzLmVudGl0aWVzKTtcclxuICAgICAgICB0aGlzLnNoaXBDb250cm9sbGVyID0gbmV3IHNoaXBDb250cm9sbGVyXzEuU2hpcENvbnRyb2xsZXIodGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy5lbmVteUNvbnRyb2xsZXIgPSBuZXcgZW5lbXlDb250cm9sbGVyXzEuRW5lbXlDb250cm9sbGVyKHRoaXMuZW50aXRpZXMpO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0Q29udHJvbGxlciA9IG5ldyBidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29udHJvbGxlcih0aGlzLmVudGl0aWVzKTtcclxuICAgICAgICB0aGlzLmh1ZCA9IG5ldyBodWRfMS5IdWQodGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBpbnB1dF8xLklucHV0KCk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlci5zdGVwKGVsYXBzZWRNcywgdGhpcy5pbnB1dCk7XHJcbiAgICAgICAgdGhpcy5lbmVteUNvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMsIHRoaXMucGxheWVyQ29udHJvbGxlci5wbGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuc2hpcENvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcywgdGhpcy5waHlzaWNzLmludGVyc2VjdGlvbnMpO1xyXG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5odWQuc3RlcCh0aGlzLmlucHV0KTtcclxuICAgICAgICB0aGlzLmlucHV0LnBvc3RTdGVwKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HYW1lID0gR2FtZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2FtZS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbmV4cG9ydHMuU0lOXzMwID0gMC41O1xyXG5leHBvcnRzLkNPU18zMCA9IDAuODY2MDM7XHJcbnZhciBQb2ludDtcclxuKGZ1bmN0aW9uIChQb2ludCkge1xyXG4gICAgZnVuY3Rpb24gYWRkKC4uLnBvaW50cykge1xyXG4gICAgICAgIGxldCBwID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICAgICAgZm9yIChsZXQgcDEgb2YgcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHAueCArPSBwMS54O1xyXG4gICAgICAgICAgICBwLnkgKz0gcDEueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcbiAgICB9XHJcbiAgICBQb2ludC5hZGQgPSBhZGQ7XHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4geyB4OiBwMS54IC0gcDIueCwgeTogcDEueSAtIHAyLnkgfTtcclxuICAgIH1cclxuICAgIFBvaW50LnN1YnRyYWN0ID0gc3VidHJhY3Q7XHJcbiAgICBmdW5jdGlvbiBsZW5ndGgocCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQobGVuZ3RoU3F1YXJlZChwKSk7XHJcbiAgICB9XHJcbiAgICBQb2ludC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICBmdW5jdGlvbiBsZW5ndGhTcXVhcmVkKHApIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5wb3cocC54LCAyKSArIE1hdGgucG93KHAueSwgMik7XHJcbiAgICB9XHJcbiAgICBQb2ludC5sZW5ndGhTcXVhcmVkID0gbGVuZ3RoU3F1YXJlZDtcclxuICAgIGZ1bmN0aW9uIGRpc3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChkaXN0U3F1YXJlZChwMSwgcDIpKTtcclxuICAgIH1cclxuICAgIFBvaW50LmRpc3QgPSBkaXN0O1xyXG4gICAgZnVuY3Rpb24gZGlzdFNxdWFyZWQocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KChwMS54IC0gcDIueCksIDIpICsgTWF0aC5wb3coKHAxLnkgLSBwMi55KSwgMik7XHJcbiAgICB9XHJcbiAgICBQb2ludC5kaXN0U3F1YXJlZCA9IGRpc3RTcXVhcmVkO1xyXG4gICAgZnVuY3Rpb24gZG90KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBwMS54ICogcDIueCArIHAxLnkgKiBwMi55O1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZG90ID0gZG90O1xyXG4gICAgZnVuY3Rpb24gY2xvbmUocCkge1xyXG4gICAgICAgIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XHJcbiAgICB9XHJcbiAgICBQb2ludC5jbG9uZSA9IGNsb25lO1xyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKHApIHtcclxuICAgICAgICBsZXQgbGVuID0gbGVuZ3RoKHApO1xyXG4gICAgICAgIHJldHVybiB7IHg6IHAueCAvIGxlbiwgeTogcC55IC8gbGVuIH07XHJcbiAgICB9XHJcbiAgICBQb2ludC5ub3JtYWxpemUgPSBub3JtYWxpemU7XHJcbn0pKFBvaW50ID0gZXhwb3J0cy5Qb2ludCB8fCAoZXhwb3J0cy5Qb2ludCA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdlby5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbmNsYXNzIEh1ZCB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdGllcykge1xyXG4gICAgICAgIHRoaXMuX2N1cnNvckRpc3BsYXkgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7IHg6IDAsIHk6IDAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM4MDgwODAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDAuMyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnaGV4YWdvbicsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMTI1LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZW50aXRpZXMuYWRkRW50aXR5KHRoaXMuX2N1cnNvckRpc3BsYXkpO1xyXG4gICAgfVxyXG4gICAgc3RlcChpbnB1dCkge1xyXG4gICAgICAgIGlmIChpbnB1dC5jdXJzb3IpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3Vyc29yRGlzcGxheS5wb3NpdGlvbiA9IHsgeDogaW5wdXQuY3Vyc29yLngsIHk6IGlucHV0LmN1cnNvci55IH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSHVkID0gSHVkO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1odWQuanMubWFwIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3Mvbm9kZS9ub2RlLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcbnZhciBlbmVteUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vZW5lbXlDb250cm9sbGVyJyk7XHJcbnZhciBnYW1lXzEgPSByZXF1aXJlKCcuL2dhbWUnKTtcclxudmFyIGlucHV0XzEgPSByZXF1aXJlKCcuL2lucHV0Jyk7XHJcbmxldCBtYWluQ2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5DYW52YXMnKTtcclxubGV0IGdhbWUgPSBuZXcgZ2FtZV8xLkdhbWUoKTtcclxuZ2FtZS5yZW5kZXJlci5zZXRDYW52YXMobWFpbkNhbnZhcyk7XHJcbmxldCBsYXN0U3RlcFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxubGV0IHRpbWVzY2FsZSA9IDE7XHJcbnNldFRpbWVvdXQoZnVuY3Rpb24gc3RlcCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHN0ZXBUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgZ2FtZS5zdGVwKChzdGVwVGltZSAtIGxhc3RTdGVwVGltZSkgKiB0aW1lc2NhbGUpO1xyXG4gICAgICAgIGxhc3RTdGVwVGltZSA9IHN0ZXBUaW1lO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KHN0ZXAsIDMwKTtcclxufSwgMzApO1xyXG5nYW1lLmVudGl0aWVzLmFkZEVudGl0eSh7XHJcbiAgICBwb3NpdGlvbjogeyB4OiAwLCB5OiAwIH0sXHJcbiAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgdmVsb2NpdHk6IHsgeDogMCwgeTogMCB9LFxyXG4gICAgICAgIHJhZGl1czogMSxcclxuICAgICAgICBkcmFnOiAyLFxyXG4gICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgfSxcclxuICAgIHJlbmRlcjoge1xyXG4gICAgICAgIGNvbG9yOiAnIzAwQTBGRicsXHJcbiAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICBsaW5lV2lkdGg6IDAuMjUsXHJcbiAgICB9LFxyXG4gICAgcGxheWVyOiB7fSxcclxuICAgIHNoaXA6IHtcclxuICAgICAgICBhY2NlbDogNjAwLFxyXG4gICAgICAgIGhwOiAxMCxcclxuICAgICAgICBtYXhIcDogMTAsXHJcbiAgICB9LFxyXG59KTtcclxuZm9yIChsZXQgaSA9IDA7IGkgPCAzMDsgKytpKSB7XHJcbiAgICBsZXQgeCA9IE1hdGgucmFuZG9tKCkgKiAzMjAgLSAxNjA7XHJcbiAgICBsZXQgeSA9IE1hdGgucmFuZG9tKCkgKiAzMjAgLSAxNjA7XHJcbiAgICBnYW1lLmVudGl0aWVzLmFkZEVudGl0eShlbmVteUNvbnRyb2xsZXJfMS5FbmVteUNvbXBvbmVudC5jcmVhdGVGb2xsb3dlcih7IHg6IHgsIHk6IHkgfSwgeyB4OiAwLCB5OiAwIH0pKTtcclxufVxyXG5mb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xyXG4gICAgbGV0IHggPSBNYXRoLnJhbmRvbSgpICogMzIwIC0gMTYwO1xyXG4gICAgbGV0IHkgPSBNYXRoLnJhbmRvbSgpICogMzIwIC0gMTYwO1xyXG4gICAgZ2FtZS5lbnRpdGllcy5hZGRFbnRpdHkoZW5lbXlDb250cm9sbGVyXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlVGFuayh7IHg6IHgsIHk6IHkgfSwgeyB4OiAwLCB5OiAwIH0pKTtcclxufVxyXG5mb3IgKGxldCBpID0gMDsgaSA8IDMwOyArK2kpIHtcclxuICAgIGxldCB4ID0gTWF0aC5yYW5kb20oKSAqIDMyMCAtIDE2MDtcclxuICAgIGxldCB5ID0gTWF0aC5yYW5kb20oKSAqIDMyMCAtIDE2MDtcclxuICAgIGdhbWUuZW50aXRpZXMuYWRkRW50aXR5KGVuZW15Q29udHJvbGxlcl8xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVNlZWtlcih7IHg6IHgsIHk6IHkgfSwgeyB4OiAwLCB5OiAwIH0pKTtcclxufVxyXG5sZXQga2V5TWFwID0ge1xyXG4gICAgODE6IGlucHV0XzEuS2V5LlVwTGVmdCxcclxuICAgIDg3OiBpbnB1dF8xLktleS5VcCxcclxuICAgIDY5OiBpbnB1dF8xLktleS5VcFJpZ2h0LFxyXG4gICAgNjU6IGlucHV0XzEuS2V5LkRvd25MZWZ0LFxyXG4gICAgODM6IGlucHV0XzEuS2V5LkRvd24sXHJcbiAgICA2ODogaW5wdXRfMS5LZXkuRG93blJpZ2h0LFxyXG59O1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XHJcbiAgICBsZXQga2V5ID0ga2V5TWFwW2Uua2V5Q29kZV07XHJcbiAgICBpZiAoa2V5ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdhbWUuaW5wdXQua2V5RG93bihrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgIGxldCBrZXkgPSBrZXlNYXBbZS5rZXlDb2RlXTtcclxuICAgIGlmIChrZXkgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2FtZS5pbnB1dC5rZXlVcChrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICBsZXQgcmVjdCA9IG1haW5DYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgcCA9IHtcclxuICAgICAgICB4OiBlLmNsaWVudFggLSByZWN0LmxlZnQsXHJcbiAgICAgICAgeTogZS5jbGllbnRZIC0gcmVjdC50b3BcclxuICAgIH07XHJcbiAgICBnYW1lLmlucHV0LmN1cnNvciA9IGdhbWUucmVuZGVyZXIuc2NyZWVuVG9Xb3JsZChwKTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4ge1xyXG4gICAgZ2FtZS5pbnB1dC5rZXlEb3duKGlucHV0XzEuS2V5LkZpcmUpO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4ge1xyXG4gICAgZ2FtZS5pbnB1dC5rZXlVcChpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbmxldCBsYXN0UmVuZGVyVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgbGV0IHJlbmRlclRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIGdhbWUucmVuZGVyZXIucmVuZGVyKHJlbmRlclRpbWUgLSBsYXN0UmVuZGVyVGltZSk7XHJcbiAgICBsYXN0UmVuZGVyVGltZSA9IHJlbmRlclRpbWU7XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcclxufSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuKGZ1bmN0aW9uIChLZXkpIHtcclxuICAgIEtleVtLZXlbXCJVcExlZnRcIl0gPSAwXSA9IFwiVXBMZWZ0XCI7XHJcbiAgICBLZXlbS2V5W1wiVXBcIl0gPSAxXSA9IFwiVXBcIjtcclxuICAgIEtleVtLZXlbXCJVcFJpZ2h0XCJdID0gMl0gPSBcIlVwUmlnaHRcIjtcclxuICAgIEtleVtLZXlbXCJEb3duTGVmdFwiXSA9IDNdID0gXCJEb3duTGVmdFwiO1xyXG4gICAgS2V5W0tleVtcIkRvd25cIl0gPSA0XSA9IFwiRG93blwiO1xyXG4gICAgS2V5W0tleVtcIkRvd25SaWdodFwiXSA9IDVdID0gXCJEb3duUmlnaHRcIjtcclxuICAgIEtleVtLZXlbXCJGaXJlXCJdID0gNl0gPSBcIkZpcmVcIjtcclxufSkoZXhwb3J0cy5LZXkgfHwgKGV4cG9ydHMuS2V5ID0ge30pKTtcclxudmFyIEtleSA9IGV4cG9ydHMuS2V5O1xyXG4oZnVuY3Rpb24gKEtleVN0YXRlKSB7XHJcbiAgICBLZXlTdGF0ZVtLZXlTdGF0ZVtcIlByZXNzaW5nXCJdID0gMF0gPSBcIlByZXNzaW5nXCI7XHJcbiAgICBLZXlTdGF0ZVtLZXlTdGF0ZVtcIkRvd25cIl0gPSAxXSA9IFwiRG93blwiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJSZWxlYXNpbmdcIl0gPSAyXSA9IFwiUmVsZWFzaW5nXCI7XHJcbiAgICBLZXlTdGF0ZVtLZXlTdGF0ZVtcIlVwXCJdID0gM10gPSBcIlVwXCI7XHJcbn0pKGV4cG9ydHMuS2V5U3RhdGUgfHwgKGV4cG9ydHMuS2V5U3RhdGUgPSB7fSkpO1xyXG52YXIgS2V5U3RhdGUgPSBleHBvcnRzLktleVN0YXRlO1xyXG52YXIgS2V5U3RhdGU7XHJcbihmdW5jdGlvbiAoS2V5U3RhdGUpIHtcclxuICAgIGZ1bmN0aW9uIGlzRG93bihzdGF0ZSkge1xyXG4gICAgICAgIHJldHVybiBzdGF0ZSA8IDI7XHJcbiAgICB9XHJcbiAgICBLZXlTdGF0ZS5pc0Rvd24gPSBpc0Rvd247XHJcbn0pKEtleVN0YXRlID0gZXhwb3J0cy5LZXlTdGF0ZSB8fCAoZXhwb3J0cy5LZXlTdGF0ZSA9IHt9KSk7XHJcbmNsYXNzIElucHV0IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZSA9IFtdO1xyXG4gICAgICAgIGxldCBrZXlDb3VudCA9IE9iamVjdC5rZXlzKEtleSkubGVuZ3RoIC8gMjtcclxuICAgICAgICB0aGlzLl9rZXlzID0gbmV3IEFycmF5KGtleUNvdW50KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUNvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2V5c1tpXSA9IEtleVN0YXRlLlVwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEtleShrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2V5c1trZXldO1xyXG4gICAgfVxyXG4gICAga2V5RG93bihrZXkpIHtcclxuICAgICAgICBpZiAodGhpcy5fa2V5c1trZXldICE9IEtleVN0YXRlLkRvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5fa2V5c1trZXldID0gS2V5U3RhdGUuUHJlc3Npbmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAga2V5VXAoa2V5KSB7XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlLnB1c2goa2V5KTtcclxuICAgIH1cclxuICAgIHBvc3RTdGVwKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fa2V5cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fa2V5c1tpXSA9PSBLZXlTdGF0ZS5QcmVzc2luZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5c1tpXSA9IEtleVN0YXRlLkRvd247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fa2V5c1tpXSA9PSBLZXlTdGF0ZS5SZWxlYXNpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5VcDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgdGhpcy5fdG9SZWxlYXNlKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9rZXlzW2tleV0gIT0gS2V5U3RhdGUuVXApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNba2V5XSA9IEtleVN0YXRlLlJlbGVhc2luZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UubGVuZ3RoID0gMDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLklucHV0ID0gSW5wdXQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlucHV0LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxuY29uc3Qgd29ybGREcmFnID0gNDtcclxuY2xhc3MgUGh5c2ljcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdGllcykge1xyXG4gICAgICAgIHRoaXMuaXRlcmF0aW9ucyA9IDQ7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUucGh5c2ljcylcclxuICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fZW50aXRpZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZXJhdGlvbnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuc3RlcEludGVybmFsKGVsYXBzZWRNcyAvIHRoaXMuaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGludGVyIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSW50ZXJzZWN0aW9uKGludGVyLmEsIGludGVyLmIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYiwgaW50ZXIuYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRJbnRlcnNlY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGxldCBpbnRlcnMgPSB0aGlzLmludGVyc2VjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgIGlmIChpbnRlcnMgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGludGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuc2V0KGEsIGludGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGludGVycy5wdXNoKHsgYTogYSwgYjogYiB9KTtcclxuICAgIH1cclxuICAgIHN0ZXBJbnRlcm5hbChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX2VudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBwaHlzID0gZW50aXR5LnBoeXNpY3M7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBlbnRpdHkucG9zaXRpb247XHJcbiAgICAgICAgICAgIGxldCB2ZWwgPSBwaHlzLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBwb3MueCArPSB2ZWwueCAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgIHBvcy55ICs9IHZlbC55ICogc2Vjb25kcztcclxuICAgICAgICAgICAgbGV0IGRyYWdDb2VmZiA9IE1hdGgucG93KE1hdGguRSwgLXdvcmxkRHJhZyAqIHBoeXMuZHJhZyAqIHNlY29uZHMpO1xyXG4gICAgICAgICAgICB2ZWwueCAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHZlbC55ICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgcGh5cy50aGV0YSArPSBwaHlzLm9tZWdhICogc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSB0aGlzLmZpbmRJbnRlcnNlY3Rpb25zKCk7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKTtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH1cclxuICAgIGZpbmRJbnRlcnNlY3Rpb25zKCkge1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgdmFyIGxpc3QgPSBuZXcgQXJyYXkodGhpcy5fZW50aXRpZXMuc2l6ZSk7XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RbaV0gPSBlO1xyXG4gICAgICAgICAgICAgICAgKytpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFNvcnQgYnkgbGVmdG1vc3QgYm91bmQgb2YgY2lyY2xlLlxyXG4gICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4gTWF0aC5zaWduKChhLnBvc2l0aW9uLnggLSBhLnBoeXNpY3MucmFkaXVzKSAtIChiLnBvc2l0aW9uLnggLSBiLnBoeXNpY3MucmFkaXVzKSkpO1xyXG4gICAgICAgIC8vIFN3ZWVwIGxlZnQtdG8tcmlnaHQgdGhyb3VnaCB0aGUgZW50aXRpZXMuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBhID0gbGlzdFtpXTtcclxuICAgICAgICAgICAgbGV0IHJpZ2h0RWRnZSA9IGEucG9zaXRpb24ueCArIGEucGh5c2ljcy5yYWRpdXM7XHJcbiAgICAgICAgICAgIC8vIENoZWNrIG9ubHkgZW50aXRpZXMgdG8gdGhlIHJpZ2h0IG9mIGE7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGxpc3QubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIGxldCBiID0gbGlzdFtqXTtcclxuICAgICAgICAgICAgICAgIGlmIChiLnBvc2l0aW9uLnggLSBiLnBoeXNpY3MucmFkaXVzID49IHJpZ2h0RWRnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGludGVyc2VjdGlvbnMgYXJlIHBvc3NpYmxlIGFmdGVyIHRoaXMuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFkU3FyID0gTWF0aC5wb3coKGEucGh5c2ljcy5yYWRpdXMgKyBiLnBoeXNpY3MucmFkaXVzKSwgMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzdFNxciA9IGdlb18xLlBvaW50LmRpc3RTcXVhcmVkKGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3RTcXIgPCByYWRTcXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goeyBhOiBhLCBiOiBiIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xyXG4gICAgfVxyXG4gICAgY29ycmVjdENvbGxpc2lvbnMoaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgIGxldCBjb3JyZWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGxldCBpIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGEgPSBpLmE7XHJcbiAgICAgICAgICAgIGxldCBiID0gaS5iO1xyXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBkaWZmZXJlbmNlIGluIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBsZXQgZGlmUCA9IGdlb18xLlBvaW50LnN1YnRyYWN0KGIucG9zaXRpb24sIGEucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpZlApO1xyXG4gICAgICAgICAgICAvLyBOb3JtYWxpemUgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgICAgICAgIGxldCBub3JtYWwgPSB7IHg6IGRpZlAueCAvIGxlbiwgeTogZGlmUC55IC8gbGVuIH07XHJcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGRpZmZlcmVuY2UgaW4gdmVsb2NpdHkuXHJcbiAgICAgICAgICAgIGxldCBkaWZWID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QoYi5waHlzaWNzLnZlbG9jaXR5LCBhLnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBsZXQgZG90ID0gZ2VvXzEuUG9pbnQuZG90KGRpZlYsIG5vcm1hbCk7XHJcbiAgICAgICAgICAgIGxldCBib3VuY2UgPSBhLnBoeXNpY3MuYm91bmNlICogYi5waHlzaWNzLmJvdW5jZTtcclxuICAgICAgICAgICAgbGV0IGR2ID0geyB4OiBub3JtYWwueCAqIGRvdCAqIGJvdW5jZSwgeTogbm9ybWFsLnkgKiBkb3QgKiBib3VuY2UgfTtcclxuICAgICAgICAgICAgbGV0IHRvdGFsTWFzcyA9IGEucGh5c2ljcy5tYXNzICsgYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eS54ICs9IGR2LnggKiBiLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYS5waHlzaWNzLnZlbG9jaXR5LnkgKz0gZHYueSAqIGIucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBiLnBoeXNpY3MudmVsb2NpdHkueCAtPSBkdi54ICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGIucGh5c2ljcy52ZWxvY2l0eS55IC09IGR2LnkgKiBhLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgLy8gRGlzcGxhY2UgdGhlIGVudGl0aWVzIG91dCBvZiBlYWNoIG90aGVyLlxyXG4gICAgICAgICAgICBsZXQgY29yQSA9IGNvcnJlY3Rpb25zLmdldChhKTtcclxuICAgICAgICAgICAgaWYgKGNvckEgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb3JBID0geyB4OiAwLCB5OiAwLCBtYXNzOiAwIH07XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9ucy5zZXQoYSwgY29yQSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGNvckIgPSBjb3JyZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgIGlmIChjb3JCID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQiA9IHsgeDogMCwgeTogMCwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGIsIGNvckIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBkaXNwbGFjZSA9IChhLnBoeXNpY3MucmFkaXVzICsgYi5waHlzaWNzLnJhZGl1cykgLSBsZW47XHJcbiAgICAgICAgICAgIGxldCBkaXNYID0gbm9ybWFsLnggKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgbGV0IGRpc1kgPSBub3JtYWwueSAqIGRpc3BsYWNlO1xyXG4gICAgICAgICAgICBjb3JBLnggLT0gZGlzWCAqIGIucGh5c2ljcy5tYXNzO1xyXG4gICAgICAgICAgICBjb3JBLnkgLT0gZGlzWSAqIGIucGh5c2ljcy5tYXNzO1xyXG4gICAgICAgICAgICBjb3JBLm1hc3MgKz0gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBjb3JCLnggKz0gZGlzWCAqIGEucGh5c2ljcy5tYXNzO1xyXG4gICAgICAgICAgICBjb3JCLnkgKz0gZGlzWSAqIGEucGh5c2ljcy5tYXNzO1xyXG4gICAgICAgICAgICBjb3JCLm1hc3MgKz0gdG90YWxNYXNzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrdnAgb2YgY29ycmVjdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGUgPSBrdnBbMF07XHJcbiAgICAgICAgICAgIGxldCBjb3IgPSBrdnBbMV07XHJcbiAgICAgICAgICAgIGxldCBkeCA9IGNvci54IC8gY29yLm1hc3MgKiAxLjA1O1xyXG4gICAgICAgICAgICBsZXQgZHkgPSBjb3IueSAvIGNvci5tYXNzICogMS4wNTtcclxuICAgICAgICAgICAgZS5wb3NpdGlvbi54ICs9IGR4O1xyXG4gICAgICAgICAgICBlLnBvc2l0aW9uLnkgKz0gZHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGh5c2ljcyA9IFBoeXNpY3M7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBoeXNpY3MuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgYnVsbGV0Q29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9idWxsZXRDb250cm9sbGVyJyk7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG5jbGFzcyBQbGF5ZXJDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0VGltZSA9IDAuMTtcclxuICAgICAgICB0aGlzLmJ1bGxldExpZmVzcGFuID0gNDtcclxuICAgICAgICB0aGlzLmJ1bGxldERhbWFnZSA9IDY7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgPSAwO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUucGxheWVyICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyID0gZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZSA9PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBlbnRpdGllcztcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zLCBpbnB1dCkge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkdnggPSAwO1xyXG4gICAgICAgIGxldCBkdnkgPSAwO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXApKSlcclxuICAgICAgICAgICAgZHZ5IC09IDE7XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKGlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duKSkpXHJcbiAgICAgICAgICAgIGR2eSArPSAxO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXBMZWZ0KSkpIHtcclxuICAgICAgICAgICAgZHZ4IC09IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5IC09IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKGlucHV0LmdldEtleShpbnB1dF8xLktleS5VcFJpZ2h0KSkpIHtcclxuICAgICAgICAgICAgZHZ4ICs9IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5IC09IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKGlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93blJpZ2h0KSkpIHtcclxuICAgICAgICAgICAgZHZ4ICs9IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5ICs9IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydChNYXRoLnBvdyhkdngsIDIpICsgTWF0aC5wb3coZHZ5LCAyKSk7XHJcbiAgICAgICAgaWYgKGxlbiA8PSAwLjA1KSB7XHJcbiAgICAgICAgICAgIC8vIGVpdGhlciB6ZXJvIG9yIHRoZXJlJ3MgYSByb3VuZGluZyBlcnJvci5cclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2hpcC5kaXJlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZHZ4IC89IGxlbjtcclxuICAgICAgICAgICAgZHZ5IC89IGxlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIuc2hpcC5kaXJlY3Rpb24gPSB7IHg6IGR2eCwgeTogZHZ5IH07XHJcbiAgICAgICAgLy8gQnVsbGV0czpcclxuICAgICAgICBpZiAodGhpcy5fYnVsbGV0VGltZUxlZnQgPD0gMCAmJiBpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRmlyZSkpKSB7XHJcbiAgICAgICAgICAgIGxldCBub3JtYWwgPSBnZW9fMS5Qb2ludC5zdWJ0cmFjdChpbnB1dC5jdXJzb3IsIHRoaXMucGxheWVyLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGdlb18xLlBvaW50Lmxlbmd0aChub3JtYWwpO1xyXG4gICAgICAgICAgICBub3JtYWwueCAvPSBsZW47XHJcbiAgICAgICAgICAgIG5vcm1hbC55IC89IGxlbjtcclxuICAgICAgICAgICAgbGV0IG5ld1BvcyA9IGdlb18xLlBvaW50LmNsb25lKHRoaXMucGxheWVyLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgbmV3UG9zLnggKz0gbm9ybWFsLnggKiB0aGlzLnBsYXllci5waHlzaWNzLnJhZGl1cyAqIDEuNTtcclxuICAgICAgICAgICAgbmV3UG9zLnkgKz0gbm9ybWFsLnkgKiB0aGlzLnBsYXllci5waHlzaWNzLnJhZGl1cyAqIDEuNTtcclxuICAgICAgICAgICAgbGV0IG5ld1ZlbCA9IGdlb18xLlBvaW50LmNsb25lKHRoaXMucGxheWVyLnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBuZXdWZWwueCArPSBub3JtYWwueCAqIDIwMDtcclxuICAgICAgICAgICAgbmV3VmVsLnkgKz0gbm9ybWFsLnkgKiAyMDA7XHJcbiAgICAgICAgICAgIGxldCBuZXdCdWxsZXQgPSBidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29tcG9uZW50LmNyZWF0ZUJ1bGxldChuZXdQb3MsIG5ld1ZlbCwgdGhpcy5idWxsZXREYW1hZ2UsIHRoaXMuYnVsbGV0TGlmZXNwYW4pO1xyXG4gICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGRFbnRpdHkobmV3QnVsbGV0KTtcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgKz0gdGhpcy5idWxsZXRUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYnVsbGV0VGltZUxlZnQgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldFRpbWVMZWZ0IC09IHNlY29uZHM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGxheWVyQ29udHJvbGxlciA9IFBsYXllckNvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBsYXllckNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG5jbGFzcyBTdHlsZSB7XHJcbn1cclxuY29uc3QgVklFV19IRUlHSFQgPSA3NTtcclxuY2xhc3MgUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoZW50aXRpZXMpIHtcclxuICAgICAgICB0aGlzLnNoYXBlRm5zID0ge1xyXG4gICAgICAgICAgICAnY2lyY2xlJzogKGN0eCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCAxLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnaGV4YWdvbic6IChjdHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgLTEpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygrZ2VvXzIuQ09TXzMwLCAtZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oK2dlb18yLkNPU18zMCwgK2dlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygtZ2VvXzIuQ09TXzMwLCArZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oLWdlb18yLkNPU18zMCwgLWdlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmRwaVNjYWxlID0gMTtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IHsgcG9zOiB7IHg6IDAsIHk6IDAgfSwgem9vbTogMSB9O1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUucmVuZGVyKVxyXG4gICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9lbnRpdGllcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc2V0Q2FudmFzKGNhbnZhcykge1xyXG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIH1cclxuICAgIHJlbmRlcihlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGN0eC5jYW52YXM7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoICogdGhpcy5kcGlTY2FsZTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodCAqIHRoaXMuZHBpU2NhbGU7XHJcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldFRyYW5zZm9ybSgpO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLl9lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IE1BWF9CTFVSX0NPVU5UID0gNTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBnZW9fMS5Qb2ludC5ub3JtYWxpemUoZW50aXR5LnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGVudGl0eS5waHlzaWNzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgICAgIGxldCBibHVyQ291bnQgPSBNYXRoLmZsb29yKHNwZWVkICogc2Vjb25kcyAvIGVudGl0eS5yZW5kZXIucmFkaXVzICsgMSk7XHJcbiAgICAgICAgICAgICAgICBibHVyQ291bnQgPSBNYXRoLm1pbihibHVyQ291bnQsIE1BWF9CTFVSX0NPVU5UKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmx1ckNvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZ2VvXzEuUG9pbnQuYWRkKGVudGl0eS5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4OiAtZW50aXR5LnBoeXNpY3MudmVsb2NpdHkueCAqIHNlY29uZHMgKiBpIC8gYmx1ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAtZW50aXR5LnBoeXNpY3MudmVsb2NpdHkueSAqIHNlY29uZHMgKiBpIC8gYmx1ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW50aXR5KGVudGl0eSwgcG9zLCBNYXRoLnNxcnQoMS4wIC8gYmx1ckNvdW50KSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXI6IGRpcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFjdG9yOiBzcGVlZCAqIHNlY29uZHMgLyAoYmx1ckNvdW50ICsgMSkgLyBlbnRpdHkucmVuZGVyLnJhZGl1cyArIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVudGl0eShlbnRpdHksIGVudGl0eS5wb3NpdGlvbiwgMSwgbnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW5kZXJFbnRpdHkoZSwgcG9zLCBhbHBoYSwgc3RyZXRjaCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IGUucmVuZGVyLnJhZGl1cztcclxuICAgICAgICBjdHgudHJhbnNsYXRlKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgY3R4LnNjYWxlKHJhZGl1cywgcmFkaXVzKTtcclxuICAgICAgICBpZiAoc3RyZXRjaCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0cmV0Y2goc3RyZXRjaC5kaXIsIHN0cmV0Y2guZmFjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUucGh5c2ljcykge1xyXG4gICAgICAgICAgICBjdHgucm90YXRlKGUucGh5c2ljcy50aGV0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdHlsZSA9IHtcclxuICAgICAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgc3Ryb2tlOiBlLnJlbmRlci5jb2xvcixcclxuICAgICAgICAgICAgbGluZVdpZHRoOiBlLnJlbmRlci5saW5lV2lkdGggLyBlLnJlbmRlci5yYWRpdXMsXHJcbiAgICAgICAgICAgIGFscGhhOiBlLnJlbmRlci5hbHBoYSAqIGFscGhhLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZShzdHlsZSk7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZuc1tlLnJlbmRlci5zaGFwZV0oY3R4KTtcclxuICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgc3RyZXRjaChkaXIsIGZhY3Rvcikge1xyXG4gICAgICAgIGxldCBhYiA9IHsgeDogMSwgeTogMCB9O1xyXG4gICAgICAgIGxldCBhYkRvdCA9IGdlb18xLlBvaW50LmRvdChhYiwgZGlyKTtcclxuICAgICAgICBsZXQgYWJBbW91bnQgPSBhYkRvdCAqIChmYWN0b3IgLSAxKTtcclxuICAgICAgICBhYi54ICs9IGRpci54ICogYWJBbW91bnQ7XHJcbiAgICAgICAgYWIueSArPSBkaXIueSAqIGFiQW1vdW50O1xyXG4gICAgICAgIGxldCBiYyA9IHsgeDogMCwgeTogMSB9O1xyXG4gICAgICAgIGxldCBiY0RvdCA9IGdlb18xLlBvaW50LmRvdChiYywgZGlyKTtcclxuICAgICAgICBsZXQgYmNBbW91bnQgPSBiY0RvdCAqIChmYWN0b3IgLSAxKTtcclxuICAgICAgICBiYy54ICs9IGRpci54ICogYmNBbW91bnQ7XHJcbiAgICAgICAgYmMueSArPSBkaXIueSAqIGJjQW1vdW50O1xyXG4gICAgICAgIHRoaXMuX2NvbnRleHQudHJhbnNmb3JtKGFiLngsIGFiLnksIGJjLngsIGJjLnksIDAsIDApO1xyXG4gICAgfVxyXG4gICAgc2V0VHJhbnNmb3JtKCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGxldCBzY2FsZSA9IHRoaXMuY2FtZXJhLnpvb20gKiBjdHguY2FudmFzLmhlaWdodCAvIFZJRVdfSEVJR0hUO1xyXG4gICAgICAgIGxldCBkeCA9IC10aGlzLmNhbWVyYS5wb3MueCAqIHNjYWxlICsgY3R4LmNhbnZhcy53aWR0aCAvIDI7XHJcbiAgICAgICAgbGV0IGR5ID0gLXRoaXMuY2FtZXJhLnBvcy55ICogc2NhbGUgKyBjdHguY2FudmFzLmhlaWdodCAvIDI7XHJcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybShzY2FsZSwgMCwgMCwgc2NhbGUsIGR4LCBkeSk7XHJcbiAgICB9XHJcbiAgICBkcmF3Q2lyY2xlKGNlbnRlciwgcmFkaXVzLCBzdHlsZSkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGUoc3R5bGUpO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKGNlbnRlci54LCBjZW50ZXIueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRTdHlsZShzdHlsZSkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBzdHlsZS5maWxsO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0eWxlLnN0cm9rZTtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLmFscGhhO1xyXG4gICAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHN0eWxlLnN0cm9rZTtcclxuICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDEwO1xyXG4gICAgICAgIGN0eC5zaGFkb3dPZmZzZXRYID0gMDtcclxuICAgICAgICBjdHguc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICB9XHJcbiAgICBzY3JlZW5Ub1dvcmxkKHApIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgeCA9IHAueDtcclxuICAgICAgICBsZXQgeSA9IHAueTtcclxuICAgICAgICB4IC09IGN0eC5jYW52YXMuY2xpZW50V2lkdGggLyAyO1xyXG4gICAgICAgIHkgLT0gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQgLyAyO1xyXG4gICAgICAgIGxldCBmYWMgPSBWSUVXX0hFSUdIVCAvIGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHggKj0gZmFjO1xyXG4gICAgICAgIHkgKj0gZmFjO1xyXG4gICAgICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlJlbmRlcmVyID0gUmVuZGVyZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlbmRlcmVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgU2hpcENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoZW50aXRpZXMpIHtcclxuICAgICAgICB0aGlzLl9zaGlwcyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnNoaXApXHJcbiAgICAgICAgICAgIHRoaXMuX3NoaXBzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX3NoaXBzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBlbnRpdGllcztcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fc2hpcHMpIHtcclxuICAgICAgICAgICAgaWYgKGUuc2hpcC5ocCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGUuc2hpcC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBkdkFtb3VudCA9IGUuc2hpcC5hY2NlbCAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ4ID0gZS5zaGlwLmRpcmVjdGlvbi54ICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ5ID0gZS5zaGlwLmRpcmVjdGlvbi55ICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHkueCArPSBkdng7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHkueSArPSBkdnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5TaGlwQ29udHJvbGxlciA9IFNoaXBDb250cm9sbGVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGlwQ29udHJvbGxlci5qcy5tYXAiXX0=
