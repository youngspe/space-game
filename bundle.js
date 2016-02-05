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
                collide: true,
            },
            position: pos,
            render: {
                color: '#40A0FF',
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.1,
                shape: 'circle',
                maxBlur: 5,
                glow: 0,
            },
            bullet: {
                damage: damage,
                isAlive: true,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: false,
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
                collide: true,
            },
            render: {
                color: '#FF8000',
                alpha: 1,
                shape: 'circle',
                radius: 1.2,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 100,
                hp: 10,
                maxHp: 10,
                exhaust: {
                    rate: 3,
                    mass: 1.5,
                    radius: 0.4,
                },
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
                collide: true,
            },
            render: {
                color: '#D00000',
                alpha: 1,
                shape: 'circle',
                radius: 3,
                lineWidth: 0.5,
                maxBlur: 2,
                glow: 1,
            },
            enemy: {},
            ship: {
                accel: 80,
                hp: 30,
                maxHp: 100,
                exhaust: {
                    rate: 4,
                    mass: 4,
                    radius: 0.8,
                },
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
                collide: true,
            },
            render: {
                color: '#80FF00',
                alpha: 1,
                shape: 'circle',
                radius: 0.9,
                lineWidth: 0.5,
                maxBlur: 3,
                glow: 0,
            },
            enemy: {},
            ship: {
                accel: 150,
                hp: 5,
                maxHp: 5,
                exhaust: {
                    rate: 5,
                    mass: 1,
                    radius: 0.4,
                },
            },
        };
        return e;
    }
    EnemyComponent.createSeeker = createSeeker;
})(EnemyComponent = exports.EnemyComponent || (exports.EnemyComponent = {}));
class EnemyController {
    constructor(entities) {
        this.enemies = new Set();
        entities.entityAdded.listen(e => { if (e.enemy)
            this.enemies.add(e); });
        entities.entityRemoved.listen(e => { this.enemies.delete(e); });
    }
    step(elapsedMs, player) {
        let seconds = elapsedMs / 1000;
        for (let e of this.enemies) {
            if (player) {
                let dif = geo_1.Point.subtract(player.position, e.position);
                let len = geo_1.Point.length(dif);
                dif.x /= len;
                dif.y /= len;
                e.ship.direction = dif;
            }
            else {
                e.ship.direction = null;
            }
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
var particleController_1 = require('./particleController');
var playerController_1 = require('./playerController');
var renderer_1 = require('./renderer');
var shipController_1 = require('./shipController');
var waveGenerator_1 = require('./waveGenerator');
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
        this.particleControler = new particleController_1.ParticleController(this.entities);
        this.waveGenerator = new waveGenerator_1.WaveGenerator(this.entities);
        this.hud = new hud_1.Hud(this.entities);
        this.input = new input_1.Input();
    }
    step(elapsedMs) {
        this.waveGenerator.step(elapsedMs, this.enemyController.enemies);
        this.playerController.step(elapsedMs, this.input);
        this.enemyController.step(elapsedMs, this.playerController.player);
        this.shipController.step(elapsedMs);
        this.bulletController.step(elapsedMs, this.physics.intersections);
        this.particleControler.step(elapsedMs);
        this.physics.step(elapsedMs);
        this.hud.step(this.input);
        this.input.postStep();
    }
}
exports.Game = Game;

},{"./bulletController":1,"./enemyController":2,"./entityContainer":3,"./hud":7,"./input":9,"./particleController":10,"./physics":11,"./playerController":12,"./renderer":13,"./shipController":14,"./waveGenerator":15}],6:[function(require,module,exports){
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
    function zero() {
        return { x: 0, y: 0 };
    }
    Point.zero = zero;
})(Point = exports.Point || (exports.Point = {}));
var geo;
(function (geo) {
    var math;
    (function (math) {
        function randBetween(min, max) {
            return Math.random() * (max - min) + min;
        }
        math.randBetween = randBetween;
        function randCircle(center, radius) {
            // Repeat until (x,y) is inside the unit circle.
            while (true) {
                let x = randBetween(-1, 1);
                let y = randBetween(-1, 1);
                if (Math.pow(x, 2) + Math.pow(y, 2) <= 1) {
                    return {
                        x: x * radius + center.x,
                        y: y * radius + center.y,
                    };
                }
            }
        }
        math.randCircle = randCircle;
        // Approx. using sum of 3 uniform random numbers.
        function randGauss(mean, dev) {
            return (Math.random() + Math.random() + Math.random() - 1.5) * 0.67 * dev + mean;
        }
        math.randGauss = randGauss;
        function randGauss2d(center, dev) {
            return {
                x: randGauss(center.x, dev),
                y: randGauss(center.y, dev),
            };
        }
        math.randGauss2d = randGauss2d;
        function lerp(min, max, x) {
            return x * (max - min) + min;
        }
        math.lerp = lerp;
        function clamp(min, x, max) {
            return Math.min(Math.max(min, x), max);
        }
        math.clamp = clamp;
    })(math = geo.math || (geo.math = {}));
})(geo = exports.geo || (exports.geo = {}));
exports.default = geo;

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
                maxBlur: 1,
                glow: 1,
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
        collide: true,
    },
    render: {
        color: '#00A0FF',
        alpha: 1,
        shape: 'hexagon',
        radius: 1.2,
        lineWidth: 0.25,
        maxBlur: 3,
        glow: 1,
    },
    player: {},
    ship: {
        accel: 600,
        hp: 10,
        maxHp: 10,
        exhaust: {
            rate: 80,
            mass: 0.6,
            radius: 0.3,
        },
    },
});
/*
for (let i = 0; i < 30; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(
        EnemyComponent.createFollower({ x: x, y: y }, { x: 0, y: 0 })
    );
}

for (let i = 0; i < 6; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(
        EnemyComponent.createTank({ x: x, y: y }, { x: 0, y: 0 })
    );
}

for (let i = 0; i < 30; ++i) {
    let x = Math.random() * 320 - 160;
    let y = Math.random() * 320 - 160;
    game.entities.addEntity(
        EnemyComponent.createSeeker({ x: x, y: y }, { x: 0, y: 0 })
    );
}
*/
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

},{"./game":5,"./input":9}],9:[function(require,module,exports){
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
var ParticleComponent;
(function (ParticleComponent) {
    function createParticle(pos, vel, color, mass, radius, lifespan) {
        return {
            position: pos,
            physics: {
                velocity: vel,
                bounce: 0.96,
                drag: 0.5,
                mass: mass,
                omega: 0,
                theta: 0,
                radius: 0.25,
                collide: false,
            },
            render: {
                alpha: 1,
                color: color,
                lineWidth: 0.1,
                radius: radius,
                shape: 'circle',
                maxBlur: 1,
                glow: 0,
            },
            particle: {
                lifespan: lifespan,
                timeRemaining: lifespan,
                count: true,
            },
        };
    }
    ParticleComponent.createParticle = createParticle;
})(ParticleComponent = exports.ParticleComponent || (exports.ParticleComponent = {}));
class ParticleController {
    constructor(entities) {
        this.maxParticles = 200;
        this._particleCount = 0;
        this._particles = new Set();
        entities.entityAdded.listen(e => {
            if (e.particle) {
                this._particles.add(e);
                if (e.particle.count) {
                    ++this._particleCount;
                    if (this._particleCount > this.maxParticles) {
                        let toDelete;
                        for (let e2 of this._particles) {
                            if (e2.particle.count) {
                                toDelete = e2;
                                break;
                            }
                        }
                        if (toDelete) {
                            this._entities.removeEntity(toDelete);
                        }
                    }
                }
            }
        });
        entities.entityRemoved.listen(e => {
            if (e.particle) {
                this._particles.delete(e);
                if (e.particle.count) {
                    --this._particleCount;
                }
            }
        });
        this._entities = entities;
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._particles) {
            if (e.particle.timeRemaining <= 0) {
                this._entities.removeEntity(e);
                continue;
            }
            e.render.alpha = e.particle.timeRemaining / e.particle.lifespan;
            e.particle.timeRemaining -= seconds;
        }
    }
}
exports.ParticleController = ParticleController;

},{}],11:[function(require,module,exports){
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
        var list = [];
        {
            for (let e of this._entities) {
                if (e.physics.collide) {
                    list.push(e);
                }
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

},{"./geo":6}],12:[function(require,module,exports){
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
            this.player.ship.direction = { x: dvx, y: dvy };
        }
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

},{"./bulletController":1,"./geo":6,"./input":9}],13:[function(require,module,exports){
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
        this.glow = 10;
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
                blurCount = Math.min(blurCount, MAX_BLUR_COUNT, entity.render.maxBlur);
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
            glow: e.render.glow,
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
        if (style.glow > 0) {
            ctx.shadowColor = style.stroke;
            ctx.shadowBlur = 10 * style.glow;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
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

},{"./geo":6}],14:[function(require,module,exports){
'use strict';
var particleController_1 = require('./particleController');
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
                continue;
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction.x * dvAmount;
                let dvy = e.ship.direction.y * dvAmount;
                e.physics.velocity.x += dvx;
                e.physics.velocity.y += dvy;
                // exhaust:
                if (e.ship.exhaust) {
                    let exhaust = e.ship.exhaust;
                    let probableAmount = exhaust.rate * seconds;
                    let actualAmount;
                    if (probableAmount < 1) {
                        actualAmount = Math.random() < probableAmount ? 1 : 0;
                    }
                    else {
                        actualAmount = Math.ceil(Math.random() * probableAmount * 2);
                    }
                    let pSpeed = e.ship.accel * e.physics.mass / exhaust.mass / exhaust.rate;
                    for (let i = 0; i < actualAmount; ++i) {
                        let speedFactor = Math.random() * 0.5 + 0.75;
                        let pvx = (e.ship.direction.x * -pSpeed * speedFactor) + e.physics.velocity.x;
                        let pvy = (e.ship.direction.y * -pSpeed * speedFactor) + e.physics.velocity.y;
                        let px = e.position.x - e.ship.direction.x * e.physics.radius * 1.2;
                        let py = e.position.y - e.ship.direction.y * e.physics.radius * 1.2;
                        this._entities.addEntity(particleController_1.ParticleComponent.createParticle({ x: px, y: py }, { x: pvx, y: pvy }, e.render.color, exhaust.mass, exhaust.radius, 0.3));
                    }
                }
            }
        }
    }
}
exports.ShipController = ShipController;

},{"./particleController":10}],15:[function(require,module,exports){
'use strict';
var enemyController_1 = require('./enemyController');
var geo_1 = require('./geo');
const WAVE_PERIOD = 3;
const GEN_RADIUS = 200;
class WaveGenerator {
    constructor(entities) {
        this._entities = entities;
        this.reset();
    }
    reset() {
        this._waveTime = WAVE_PERIOD;
    }
    step(elapsedMs, enemies) {
        let seconds = elapsedMs / 1000;
        if (this._waveTime < 0) {
            if (enemies.size <= 10) {
                this.generateWave();
            }
            this._waveTime += WAVE_PERIOD;
        }
        this._waveTime -= seconds;
    }
    generateWave() {
        let followers = 12;
        let tanks = 2;
        let seekers = 8;
        for (let i = 0; i < followers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this._entities.addEntity(enemyController_1.EnemyComponent.createFollower(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < tanks; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this._entities.addEntity(enemyController_1.EnemyComponent.createTank(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < seekers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this._entities.addEntity(enemyController_1.EnemyComponent.createSeeker(p, geo_1.Point.zero()));
        }
    }
}
exports.WaveGenerator = WaveGenerator;

},{"./enemyController":2,"./geo":6}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVteUNvbnRyb2xsZXIuanMiLCJiaW4vZW50aXR5Q29udGFpbmVyLmpzIiwiYmluL2V2ZW50LmpzIiwiYmluL2dhbWUuanMiLCJiaW4vZ2VvLmpzIiwiYmluL2h1ZC5qcyIsImJpbi9pbmRleC5qcyIsImJpbi9pbnB1dC5qcyIsImJpbi9wYXJ0aWNsZUNvbnRyb2xsZXIuanMiLCJiaW4vcGh5c2ljcy5qcyIsImJpbi9wbGF5ZXJDb250cm9sbGVyLmpzIiwiYmluL3JlbmRlcmVyLmpzIiwiYmluL3NoaXBDb250cm9sbGVyLmpzIiwiYmluL3dhdmVHZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcbnZhciBCdWxsZXRDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoQnVsbGV0Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVCdWxsZXQocG9zLCB2ZWwsIGRhbWFnZSwgbGlmZXNwYW4pIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjYsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDEsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjEyNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzQwQTBGRicsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC40LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiA1LFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnVsbGV0OiB7XHJcbiAgICAgICAgICAgICAgICBkYW1hZ2U6IGRhbWFnZSxcclxuICAgICAgICAgICAgICAgIGlzQWxpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhcnRpY2xlOiB7XHJcbiAgICAgICAgICAgICAgICBsaWZlc3BhbjogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nOiBsaWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiBmYWxzZSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBCdWxsZXRDb21wb25lbnQuY3JlYXRlQnVsbGV0ID0gY3JlYXRlQnVsbGV0O1xyXG59KShCdWxsZXRDb21wb25lbnQgPSBleHBvcnRzLkJ1bGxldENvbXBvbmVudCB8fCAoZXhwb3J0cy5CdWxsZXRDb21wb25lbnQgPSB7fSkpO1xyXG5jbGFzcyBCdWxsZXRDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0cyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLmJ1bGxldClcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0cy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9idWxsZXRzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBlbnRpdGllcztcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zLCBpbnRlcnNlY3Rpb25zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGZvciAobGV0IGIgb2YgdGhpcy5fYnVsbGV0cykge1xyXG4gICAgICAgICAgICBpZiAoYi5idWxsZXQuaXNBbGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGludGVycyA9IGludGVyc2VjdGlvbnMuZ2V0KGIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludGVycyAmJiBpbnRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgb2YgaW50ZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvdGhlciA9IGkuYjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVyLnNoaXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyLnNoaXAuaHAgLT0gYi5idWxsZXQuZGFtYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYi5idWxsZXQuaXNBbGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBiLnJlbmRlci5jb2xvciA9IFwiIzgwODA4MFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuQnVsbGV0Q29udHJvbGxlciA9IEJ1bGxldENvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJ1bGxldENvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgRW5lbXlDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoRW5lbXlDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZvbGxvd2VyKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgICAgICAgICAgYm91bmNlOiAwLjk2LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNGRjgwMDAnLFxyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMixcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7fSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDEwMCxcclxuICAgICAgICAgICAgICAgIGhwOiAxMCxcclxuICAgICAgICAgICAgICAgIG1heEhwOiAxMCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEuNSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZUZvbGxvd2VyID0gY3JlYXRlRm9sbG93ZXI7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVUYW5rKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDMsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogOSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjRDAwMDAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAyLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHt9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogODAsXHJcbiAgICAgICAgICAgICAgICBocDogMzAsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogMTAwLFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogNCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuOCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZVRhbmsgPSBjcmVhdGVUYW5rO1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlU2Vla2VyKHBvcywgdmVsKSB7XHJcbiAgICAgICAgbGV0IGUgPSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIG1hc3M6IDAuOCxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjODBGRjAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjksXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDMsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbmVteToge30sXHJcbiAgICAgICAgICAgIHNoaXA6IHtcclxuICAgICAgICAgICAgICAgIGFjY2VsOiAxNTAsXHJcbiAgICAgICAgICAgICAgICBocDogNSxcclxuICAgICAgICAgICAgICAgIG1heEhwOiA1LFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZVNlZWtlciA9IGNyZWF0ZVNlZWtlcjtcclxufSkoRW5lbXlDb21wb25lbnQgPSBleHBvcnRzLkVuZW15Q29tcG9uZW50IHx8IChleHBvcnRzLkVuZW15Q29tcG9uZW50ID0ge30pKTtcclxuY2xhc3MgRW5lbXlDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuZW5lbXkpXHJcbiAgICAgICAgICAgIHRoaXMuZW5lbWllcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLmVuZW1pZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zLCBwbGF5ZXIpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLmVuZW1pZXMpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZiA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHBsYXllci5wb3NpdGlvbiwgZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpZik7XHJcbiAgICAgICAgICAgICAgICBkaWYueCAvPSBsZW47XHJcbiAgICAgICAgICAgICAgICBkaWYueSAvPSBsZW47XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gZGlmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZS5zaGlwLmRpcmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FbmVteUNvbnRyb2xsZXIgPSBFbmVteUNvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZW15Q29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBldmVudF8xID0gcmVxdWlyZSgnLi9ldmVudCcpO1xyXG5jbGFzcyBFbnRpdHlDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlBZGRlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlSZW1vdmVkID0gbmV3IGV2ZW50XzEuRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcyA9IG5ldyBTZXQoKTtcclxuICAgICAgICB0aGlzLl9uZXh0SWQgPSAwO1xyXG4gICAgfVxyXG4gICAgYWRkRW50aXR5KGVudGl0eSkge1xyXG4gICAgICAgIGVudGl0eS5pZCA9ICsrdGhpcy5fbmV4dElkO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzLmFkZChlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5QWRkZWQuZW1pdChlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzLmRlbGV0ZShlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZC5lbWl0KGVudGl0eSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FbnRpdHlDb250YWluZXIgPSBFbnRpdHlDb250YWluZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVudGl0eUNvbnRhaW5lci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbmNsYXNzIEV2ZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xyXG4gICAgfVxyXG4gICAgZW1pdCh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9saXN0ZW5lcnMubWFwKGwgPT4gbCh2YWx1ZSkpO1xyXG4gICAgfVxyXG4gICAgZW1pdEFzeW5jKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSB0aGlzLmVtaXQodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRzLm1hcCh2ID0+IHYgJiYgdi50aGVuID8gdiA6IFByb21pc2UucmVzb2x2ZSh2KSkpO1xyXG4gICAgfVxyXG4gICAgbGlzdGVuKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRXZlbnQgPSBFdmVudDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgYnVsbGV0Q29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9idWxsZXRDb250cm9sbGVyJyk7XHJcbnZhciBlbmVteUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vZW5lbXlDb250cm9sbGVyJyk7XHJcbnZhciBlbnRpdHlDb250YWluZXJfMSA9IHJlcXVpcmUoJy4vZW50aXR5Q29udGFpbmVyJyk7XHJcbnZhciBodWRfMSA9IHJlcXVpcmUoJy4vaHVkJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG52YXIgcGh5c2ljc18xID0gcmVxdWlyZSgnLi9waHlzaWNzJyk7XHJcbnZhciBwYXJ0aWNsZUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGFydGljbGVDb250cm9sbGVyJyk7XHJcbnZhciBwbGF5ZXJDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3BsYXllckNvbnRyb2xsZXInKTtcclxudmFyIHJlbmRlcmVyXzEgPSByZXF1aXJlKCcuL3JlbmRlcmVyJyk7XHJcbnZhciBzaGlwQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9zaGlwQ29udHJvbGxlcicpO1xyXG52YXIgd2F2ZUdlbmVyYXRvcl8xID0gcmVxdWlyZSgnLi93YXZlR2VuZXJhdG9yJyk7XHJcbmNsYXNzIEJhc2VHYW1lIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBuZXcgZW50aXR5Q29udGFpbmVyXzEuRW50aXR5Q29udGFpbmVyKCk7XHJcbiAgICAgICAgdGhpcy5fbmV4dElkID0gMDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJhc2VHYW1lID0gQmFzZUdhbWU7XHJcbmNsYXNzIEdhbWUgZXh0ZW5kcyBCYXNlR2FtZSB7XHJcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5waHlzaWNzID0gbmV3IHBoeXNpY3NfMS5QaHlzaWNzKHRoaXMuZW50aXRpZXMpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgcmVuZGVyZXJfMS5SZW5kZXJlcih0aGlzLmVudGl0aWVzKTtcclxuICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBuZXcgcGxheWVyQ29udHJvbGxlcl8xLlBsYXllckNvbnRyb2xsZXIodGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy5zaGlwQ29udHJvbGxlciA9IG5ldyBzaGlwQ29udHJvbGxlcl8xLlNoaXBDb250cm9sbGVyKHRoaXMuZW50aXRpZXMpO1xyXG4gICAgICAgIHRoaXMuZW5lbXlDb250cm9sbGVyID0gbmV3IGVuZW15Q29udHJvbGxlcl8xLkVuZW15Q29udHJvbGxlcih0aGlzLmVudGl0aWVzKTtcclxuICAgICAgICB0aGlzLmJ1bGxldENvbnRyb2xsZXIgPSBuZXcgYnVsbGV0Q29udHJvbGxlcl8xLkJ1bGxldENvbnRyb2xsZXIodGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUNvbnRyb2xlciA9IG5ldyBwYXJ0aWNsZUNvbnRyb2xsZXJfMS5QYXJ0aWNsZUNvbnRyb2xsZXIodGhpcy5lbnRpdGllcyk7XHJcbiAgICAgICAgdGhpcy53YXZlR2VuZXJhdG9yID0gbmV3IHdhdmVHZW5lcmF0b3JfMS5XYXZlR2VuZXJhdG9yKHRoaXMuZW50aXRpZXMpO1xyXG4gICAgICAgIHRoaXMuaHVkID0gbmV3IGh1ZF8xLkh1ZCh0aGlzLmVudGl0aWVzKTtcclxuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IGlucHV0XzEuSW5wdXQoKTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy53YXZlR2VuZXJhdG9yLnN0ZXAoZWxhcHNlZE1zLCB0aGlzLmVuZW15Q29udHJvbGxlci5lbmVtaWVzKTtcclxuICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMsIHRoaXMuaW5wdXQpO1xyXG4gICAgICAgIHRoaXMuZW5lbXlDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zLCB0aGlzLnBsYXllckNvbnRyb2xsZXIucGxheWVyKTtcclxuICAgICAgICB0aGlzLnNoaXBDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLmJ1bGxldENvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMsIHRoaXMucGh5c2ljcy5pbnRlcnNlY3Rpb25zKTtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlQ29udHJvbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnBoeXNpY3Muc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuaHVkLnN0ZXAodGhpcy5pbnB1dCk7XHJcbiAgICAgICAgdGhpcy5pbnB1dC5wb3N0U3RlcCgpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuR2FtZSA9IEdhbWU7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdhbWUuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG5leHBvcnRzLlNJTl8zMCA9IDAuNTtcclxuZXhwb3J0cy5DT1NfMzAgPSAwLjg2NjAzO1xyXG52YXIgUG9pbnQ7XHJcbihmdW5jdGlvbiAoUG9pbnQpIHtcclxuICAgIGZ1bmN0aW9uIGFkZCguLi5wb2ludHMpIHtcclxuICAgICAgICBsZXQgcCA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICAgIGZvciAobGV0IHAxIG9mIHBvaW50cykge1xyXG4gICAgICAgICAgICBwLnggKz0gcDEueDtcclxuICAgICAgICAgICAgcC55ICs9IHAxLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuYWRkID0gYWRkO1xyXG4gICAgZnVuY3Rpb24gc3VidHJhY3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgeDogcDEueCAtIHAyLngsIHk6IHAxLnkgLSBwMi55IH07XHJcbiAgICB9XHJcbiAgICBQb2ludC5zdWJ0cmFjdCA9IHN1YnRyYWN0O1xyXG4gICAgZnVuY3Rpb24gbGVuZ3RoKHApIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGxlbmd0aFNxdWFyZWQocCkpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubGVuZ3RoID0gbGVuZ3RoO1xyXG4gICAgZnVuY3Rpb24gbGVuZ3RoU3F1YXJlZChwKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KHAueCwgMikgKyBNYXRoLnBvdyhwLnksIDIpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubGVuZ3RoU3F1YXJlZCA9IGxlbmd0aFNxdWFyZWQ7XHJcbiAgICBmdW5jdGlvbiBkaXN0KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGlzdFNxdWFyZWQocDEsIHAyKSk7XHJcbiAgICB9XHJcbiAgICBQb2ludC5kaXN0ID0gZGlzdDtcclxuICAgIGZ1bmN0aW9uIGRpc3RTcXVhcmVkKHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdygocDEueCAtIHAyLngpLCAyKSArIE1hdGgucG93KChwMS55IC0gcDIueSksIDIpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZGlzdFNxdWFyZWQgPSBkaXN0U3F1YXJlZDtcclxuICAgIGZ1bmN0aW9uIGRvdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gcDEueCAqIHAyLnggKyBwMS55ICogcDIueTtcclxuICAgIH1cclxuICAgIFBvaW50LmRvdCA9IGRvdDtcclxuICAgIGZ1bmN0aW9uIGNsb25lKHApIHtcclxuICAgICAgICByZXR1cm4geyB4OiBwLngsIHk6IHAueSB9O1xyXG4gICAgfVxyXG4gICAgUG9pbnQuY2xvbmUgPSBjbG9uZTtcclxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShwKSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IGxlbmd0aChwKTtcclxuICAgICAgICByZXR1cm4geyB4OiBwLnggLyBsZW4sIHk6IHAueSAvIGxlbiB9O1xyXG4gICAgfVxyXG4gICAgUG9pbnQubm9ybWFsaXplID0gbm9ybWFsaXplO1xyXG4gICAgZnVuY3Rpb24gemVybygpIHtcclxuICAgICAgICByZXR1cm4geyB4OiAwLCB5OiAwIH07XHJcbiAgICB9XHJcbiAgICBQb2ludC56ZXJvID0gemVybztcclxufSkoUG9pbnQgPSBleHBvcnRzLlBvaW50IHx8IChleHBvcnRzLlBvaW50ID0ge30pKTtcclxudmFyIGdlbztcclxuKGZ1bmN0aW9uIChnZW8pIHtcclxuICAgIHZhciBtYXRoO1xyXG4gICAgKGZ1bmN0aW9uIChtYXRoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEJldHdlZW4obWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kQmV0d2VlbiA9IHJhbmRCZXR3ZWVuO1xyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRDaXJjbGUoY2VudGVyLCByYWRpdXMpIHtcclxuICAgICAgICAgICAgLy8gUmVwZWF0IHVudGlsICh4LHkpIGlzIGluc2lkZSB0aGUgdW5pdCBjaXJjbGUuXHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHJhbmRCZXR3ZWVuKC0xLCAxKTtcclxuICAgICAgICAgICAgICAgIGxldCB5ID0gcmFuZEJldHdlZW4oLTEsIDEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGgucG93KHgsIDIpICsgTWF0aC5wb3coeSwgMikgPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHggKiByYWRpdXMgKyBjZW50ZXIueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogeSAqIHJhZGl1cyArIGNlbnRlci55LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kQ2lyY2xlID0gcmFuZENpcmNsZTtcclxuICAgICAgICAvLyBBcHByb3guIHVzaW5nIHN1bSBvZiAzIHVuaWZvcm0gcmFuZG9tIG51bWJlcnMuXHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzKG1lYW4sIGRldikge1xyXG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKyBNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKSAtIDEuNSkgKiAwLjY3ICogZGV2ICsgbWVhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MgPSByYW5kR2F1c3M7XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzMmQoY2VudGVyLCBkZXYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHg6IHJhbmRHYXVzcyhjZW50ZXIueCwgZGV2KSxcclxuICAgICAgICAgICAgICAgIHk6IHJhbmRHYXVzcyhjZW50ZXIueSwgZGV2KSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MyZCA9IHJhbmRHYXVzczJkO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxlcnAobWluLCBtYXgsIHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHggKiAobWF4IC0gbWluKSArIG1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5sZXJwID0gbGVycDtcclxuICAgICAgICBmdW5jdGlvbiBjbGFtcChtaW4sIHgsIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCB4KSwgbWF4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5jbGFtcCA9IGNsYW1wO1xyXG4gICAgfSkobWF0aCA9IGdlby5tYXRoIHx8IChnZW8ubWF0aCA9IHt9KSk7XHJcbn0pKGdlbyA9IGV4cG9ydHMuZ2VvIHx8IChleHBvcnRzLmdlbyA9IHt9KSk7XHJcbmV4cG9ydHMuZGVmYXVsdCA9IGdlbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VvLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgSHVkIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5fY3Vyc29yRGlzcGxheSA9IHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHsgeDogMCwgeTogMCB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwODA4MCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMC4zLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC4xMjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAxLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGVudGl0aWVzLmFkZEVudGl0eSh0aGlzLl9jdXJzb3JEaXNwbGF5KTtcclxuICAgIH1cclxuICAgIHN0ZXAoaW5wdXQpIHtcclxuICAgICAgICBpZiAoaW5wdXQuY3Vyc29yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnNvckRpc3BsYXkucG9zaXRpb24gPSB7IHg6IGlucHV0LmN1cnNvci54LCB5OiBpbnB1dC5jdXJzb3IueSB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkh1ZCA9IEh1ZDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHVkLmpzLm1hcCIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL25vZGUvbm9kZS5kLnRzXCIgLz5cclxuJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2FtZV8xID0gcmVxdWlyZSgnLi9nYW1lJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG5sZXQgbWFpbkNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluQ2FudmFzJyk7XHJcbmxldCBnYW1lID0gbmV3IGdhbWVfMS5HYW1lKCk7XHJcbmdhbWUucmVuZGVyZXIuc2V0Q2FudmFzKG1haW5DYW52YXMpO1xyXG5sZXQgbGFzdFN0ZXBUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbmxldCB0aW1lc2NhbGUgPSAxO1xyXG5zZXRUaW1lb3V0KGZ1bmN0aW9uIHN0ZXAoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBzdGVwVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGdhbWUuc3RlcCgoc3RlcFRpbWUgLSBsYXN0U3RlcFRpbWUpICogdGltZXNjYWxlKTtcclxuICAgICAgICBsYXN0U3RlcFRpbWUgPSBzdGVwVGltZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG4gICAgc2V0VGltZW91dChzdGVwLCAzMCk7XHJcbn0sIDMwKTtcclxuZ2FtZS5lbnRpdGllcy5hZGRFbnRpdHkoe1xyXG4gICAgcG9zaXRpb246IHsgeDogMCwgeTogMCB9LFxyXG4gICAgcGh5c2ljczoge1xyXG4gICAgICAgIHZlbG9jaXR5OiB7IHg6IDAsIHk6IDAgfSxcclxuICAgICAgICByYWRpdXM6IDEsXHJcbiAgICAgICAgZHJhZzogMixcclxuICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJlbmRlcjoge1xyXG4gICAgICAgIGNvbG9yOiAnIzAwQTBGRicsXHJcbiAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICBsaW5lV2lkdGg6IDAuMjUsXHJcbiAgICAgICAgbWF4Qmx1cjogMyxcclxuICAgICAgICBnbG93OiAxLFxyXG4gICAgfSxcclxuICAgIHBsYXllcjoge30sXHJcbiAgICBzaGlwOiB7XHJcbiAgICAgICAgYWNjZWw6IDYwMCxcclxuICAgICAgICBocDogMTAsXHJcbiAgICAgICAgbWF4SHA6IDEwLFxyXG4gICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgcmF0ZTogODAsXHJcbiAgICAgICAgICAgIG1hc3M6IDAuNixcclxuICAgICAgICAgICAgcmFkaXVzOiAwLjMsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4vKlxyXG5mb3IgKGxldCBpID0gMDsgaSA8IDMwOyArK2kpIHtcclxuICAgIGxldCB4ID0gTWF0aC5yYW5kb20oKSAqIDMyMCAtIDE2MDtcclxuICAgIGxldCB5ID0gTWF0aC5yYW5kb20oKSAqIDMyMCAtIDE2MDtcclxuICAgIGdhbWUuZW50aXRpZXMuYWRkRW50aXR5KFxyXG4gICAgICAgIEVuZW15Q29tcG9uZW50LmNyZWF0ZUZvbGxvd2VyKHsgeDogeCwgeTogeSB9LCB7IHg6IDAsIHk6IDAgfSlcclxuICAgICk7XHJcbn1cclxuXHJcbmZvciAobGV0IGkgPSAwOyBpIDwgNjsgKytpKSB7XHJcbiAgICBsZXQgeCA9IE1hdGgucmFuZG9tKCkgKiAzMjAgLSAxNjA7XHJcbiAgICBsZXQgeSA9IE1hdGgucmFuZG9tKCkgKiAzMjAgLSAxNjA7XHJcbiAgICBnYW1lLmVudGl0aWVzLmFkZEVudGl0eShcclxuICAgICAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rKHsgeDogeCwgeTogeSB9LCB7IHg6IDAsIHk6IDAgfSlcclxuICAgICk7XHJcbn1cclxuXHJcbmZvciAobGV0IGkgPSAwOyBpIDwgMzA7ICsraSkge1xyXG4gICAgbGV0IHggPSBNYXRoLnJhbmRvbSgpICogMzIwIC0gMTYwO1xyXG4gICAgbGV0IHkgPSBNYXRoLnJhbmRvbSgpICogMzIwIC0gMTYwO1xyXG4gICAgZ2FtZS5lbnRpdGllcy5hZGRFbnRpdHkoXHJcbiAgICAgICAgRW5lbXlDb21wb25lbnQuY3JlYXRlU2Vla2VyKHsgeDogeCwgeTogeSB9LCB7IHg6IDAsIHk6IDAgfSlcclxuICAgICk7XHJcbn1cclxuKi9cclxubGV0IGtleU1hcCA9IHtcclxuICAgIDgxOiBpbnB1dF8xLktleS5VcExlZnQsXHJcbiAgICA4NzogaW5wdXRfMS5LZXkuVXAsXHJcbiAgICA2OTogaW5wdXRfMS5LZXkuVXBSaWdodCxcclxuICAgIDY1OiBpbnB1dF8xLktleS5Eb3duTGVmdCxcclxuICAgIDgzOiBpbnB1dF8xLktleS5Eb3duLFxyXG4gICAgNjg6IGlucHV0XzEuS2V5LkRvd25SaWdodCxcclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgbGV0IGtleSA9IGtleU1hcFtlLmtleUNvZGVdO1xyXG4gICAgaWYgKGtleSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBnYW1lLmlucHV0LmtleURvd24oa2V5KTtcclxuICAgIH1cclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICBsZXQga2V5ID0ga2V5TWFwW2Uua2V5Q29kZV07XHJcbiAgICBpZiAoa2V5ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdhbWUuaW5wdXQua2V5VXAoa2V5KTtcclxuICAgIH1cclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge1xyXG4gICAgbGV0IHJlY3QgPSBtYWluQ2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgbGV0IHAgPSB7XHJcbiAgICAgICAgeDogZS5jbGllbnRYIC0gcmVjdC5sZWZ0LFxyXG4gICAgICAgIHk6IGUuY2xpZW50WSAtIHJlY3QudG9wXHJcbiAgICB9O1xyXG4gICAgZ2FtZS5pbnB1dC5jdXJzb3IgPSBnYW1lLnJlbmRlcmVyLnNjcmVlblRvV29ybGQocCk7XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgIGdhbWUuaW5wdXQua2V5RG93bihpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcclxuICAgIGdhbWUuaW5wdXQua2V5VXAoaW5wdXRfMS5LZXkuRmlyZSk7XHJcbn0pO1xyXG5sZXQgbGFzdFJlbmRlclRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICAgIGxldCByZW5kZXJUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBnYW1lLnJlbmRlcmVyLnJlbmRlcihyZW5kZXJUaW1lIC0gbGFzdFJlbmRlclRpbWUpO1xyXG4gICAgbGFzdFJlbmRlclRpbWUgPSByZW5kZXJUaW1lO1xyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbihmdW5jdGlvbiAoS2V5KSB7XHJcbiAgICBLZXlbS2V5W1wiVXBMZWZ0XCJdID0gMF0gPSBcIlVwTGVmdFwiO1xyXG4gICAgS2V5W0tleVtcIlVwXCJdID0gMV0gPSBcIlVwXCI7XHJcbiAgICBLZXlbS2V5W1wiVXBSaWdodFwiXSA9IDJdID0gXCJVcFJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRG93bkxlZnRcIl0gPSAzXSA9IFwiRG93bkxlZnRcIjtcclxuICAgIEtleVtLZXlbXCJEb3duXCJdID0gNF0gPSBcIkRvd25cIjtcclxuICAgIEtleVtLZXlbXCJEb3duUmlnaHRcIl0gPSA1XSA9IFwiRG93blJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRmlyZVwiXSA9IDZdID0gXCJGaXJlXCI7XHJcbn0pKGV4cG9ydHMuS2V5IHx8IChleHBvcnRzLktleSA9IHt9KSk7XHJcbnZhciBLZXkgPSBleHBvcnRzLktleTtcclxuKGZ1bmN0aW9uIChLZXlTdGF0ZSkge1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJQcmVzc2luZ1wiXSA9IDBdID0gXCJQcmVzc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiUmVsZWFzaW5nXCJdID0gMl0gPSBcIlJlbGVhc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJVcFwiXSA9IDNdID0gXCJVcFwiO1xyXG59KShleHBvcnRzLktleVN0YXRlIHx8IChleHBvcnRzLktleVN0YXRlID0ge30pKTtcclxudmFyIEtleVN0YXRlID0gZXhwb3J0cy5LZXlTdGF0ZTtcclxudmFyIEtleVN0YXRlO1xyXG4oZnVuY3Rpb24gKEtleVN0YXRlKSB7XHJcbiAgICBmdW5jdGlvbiBpc0Rvd24oc3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGUgPCAyO1xyXG4gICAgfVxyXG4gICAgS2V5U3RhdGUuaXNEb3duID0gaXNEb3duO1xyXG59KShLZXlTdGF0ZSA9IGV4cG9ydHMuS2V5U3RhdGUgfHwgKGV4cG9ydHMuS2V5U3RhdGUgPSB7fSkpO1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UgPSBbXTtcclxuICAgICAgICBsZXQga2V5Q291bnQgPSBPYmplY3Qua2V5cyhLZXkpLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5fa2V5cyA9IG5ldyBBcnJheShrZXlDb3VudCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5VcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRLZXkoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleXNba2V5XTtcclxuICAgIH1cclxuICAgIGtleURvd24oa2V5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tleXNba2V5XSAhPSBLZXlTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNba2V5XSA9IEtleVN0YXRlLlByZXNzaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGtleVVwKGtleSkge1xyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZS5wdXNoKGtleSk7XHJcbiAgICB9XHJcbiAgICBwb3N0U3RlcCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2tleXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUHJlc3NpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5Eb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUmVsZWFzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuVXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHRoaXMuX3RvUmVsZWFzZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fa2V5c1trZXldICE9IEtleVN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2tleV0gPSBLZXlTdGF0ZS5SZWxlYXNpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlLmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5JbnB1dCA9IElucHV0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnB1dC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBQYXJ0aWNsZUNvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChQYXJ0aWNsZUNvbXBvbmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlUGFydGljbGUocG9zLCB2ZWwsIGNvbG9yLCBtYXNzLCByYWRpdXMsIGxpZmVzcGFuKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlbCxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1hc3M6IG1hc3MsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMSxcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhcnRpY2xlOiB7XHJcbiAgICAgICAgICAgICAgICBsaWZlc3BhbjogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nOiBsaWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNsZUNvbXBvbmVudC5jcmVhdGVQYXJ0aWNsZSA9IGNyZWF0ZVBhcnRpY2xlO1xyXG59KShQYXJ0aWNsZUNvbXBvbmVudCA9IGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgfHwgKGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgPSB7fSkpO1xyXG5jbGFzcyBQYXJ0aWNsZUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoZW50aXRpZXMpIHtcclxuICAgICAgICB0aGlzLm1heFBhcnRpY2xlcyA9IDIwMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZUNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGljbGVzLmFkZChlKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKyt0aGlzLl9wYXJ0aWNsZUNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYXJ0aWNsZUNvdW50ID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRvRGVsZXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlMiBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlMi5wYXJ0aWNsZS5jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvRGVsZXRlID0gZTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5yZW1vdmVFbnRpdHkodG9EZWxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0aWNsZXMuZGVsZXRlKGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGUucGFydGljbGUuY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAtLXRoaXMuX3BhcnRpY2xlQ291bnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcyA9IGVudGl0aWVzO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgaWYgKGUucGFydGljbGUudGltZVJlbWFpbmluZyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnJlbmRlci5hbHBoYSA9IGUucGFydGljbGUudGltZVJlbWFpbmluZyAvIGUucGFydGljbGUubGlmZXNwYW47XHJcbiAgICAgICAgICAgIGUucGFydGljbGUudGltZVJlbWFpbmluZyAtPSBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciA9IFBhcnRpY2xlQ29udHJvbGxlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFydGljbGVDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxuY29uc3Qgd29ybGREcmFnID0gNDtcclxuY2xhc3MgUGh5c2ljcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdGllcykge1xyXG4gICAgICAgIHRoaXMuaXRlcmF0aW9ucyA9IDQ7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUucGh5c2ljcylcclxuICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fZW50aXRpZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZXJhdGlvbnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuc3RlcEludGVybmFsKGVsYXBzZWRNcyAvIHRoaXMuaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGludGVyIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSW50ZXJzZWN0aW9uKGludGVyLmEsIGludGVyLmIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYiwgaW50ZXIuYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRJbnRlcnNlY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGxldCBpbnRlcnMgPSB0aGlzLmludGVyc2VjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgIGlmIChpbnRlcnMgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGludGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuc2V0KGEsIGludGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGludGVycy5wdXNoKHsgYTogYSwgYjogYiB9KTtcclxuICAgIH1cclxuICAgIHN0ZXBJbnRlcm5hbChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX2VudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBwaHlzID0gZW50aXR5LnBoeXNpY3M7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBlbnRpdHkucG9zaXRpb247XHJcbiAgICAgICAgICAgIGxldCB2ZWwgPSBwaHlzLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBwb3MueCArPSB2ZWwueCAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgIHBvcy55ICs9IHZlbC55ICogc2Vjb25kcztcclxuICAgICAgICAgICAgbGV0IGRyYWdDb2VmZiA9IE1hdGgucG93KE1hdGguRSwgLXdvcmxkRHJhZyAqIHBoeXMuZHJhZyAqIHNlY29uZHMpO1xyXG4gICAgICAgICAgICB2ZWwueCAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHZlbC55ICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgcGh5cy50aGV0YSArPSBwaHlzLm9tZWdhICogc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSB0aGlzLmZpbmRJbnRlcnNlY3Rpb25zKCk7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKTtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH1cclxuICAgIGZpbmRJbnRlcnNlY3Rpb25zKCkge1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBoeXNpY3MuY29sbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTb3J0IGJ5IGxlZnRtb3N0IGJvdW5kIG9mIGNpcmNsZS5cclxuICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IE1hdGguc2lnbigoYS5wb3NpdGlvbi54IC0gYS5waHlzaWNzLnJhZGl1cykgLSAoYi5wb3NpdGlvbi54IC0gYi5waHlzaWNzLnJhZGl1cykpKTtcclxuICAgICAgICAvLyBTd2VlcCBsZWZ0LXRvLXJpZ2h0IHRocm91Z2ggdGhlIGVudGl0aWVzLlxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgYSA9IGxpc3RbaV07XHJcbiAgICAgICAgICAgIGxldCByaWdodEVkZ2UgPSBhLnBvc2l0aW9uLnggKyBhLnBoeXNpY3MucmFkaXVzO1xyXG4gICAgICAgICAgICAvLyBDaGVjayBvbmx5IGVudGl0aWVzIHRvIHRoZSByaWdodCBvZiBhO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsaXN0Lmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGxpc3Rbal07XHJcbiAgICAgICAgICAgICAgICBpZiAoYi5wb3NpdGlvbi54IC0gYi5waHlzaWNzLnJhZGl1cyA+PSByaWdodEVkZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBObyBpbnRlcnNlY3Rpb25zIGFyZSBwb3NzaWJsZSBhZnRlciB0aGlzLlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IHJhZFNxciA9IE1hdGgucG93KChhLnBoeXNpY3MucmFkaXVzICsgYi5waHlzaWNzLnJhZGl1cyksIDIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpc3RTcXIgPSBnZW9fMS5Qb2ludC5kaXN0U3F1YXJlZChhLnBvc2l0aW9uLCBiLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChkaXN0U3FyIDwgcmFkU3FyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKHsgYTogYSwgYjogYiB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH1cclxuICAgIGNvcnJlY3RDb2xsaXNpb25zKGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICBsZXQgY29ycmVjdGlvbnMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSBvZiBpbnRlcnNlY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCBhID0gaS5hO1xyXG4gICAgICAgICAgICBsZXQgYiA9IGkuYjtcclxuICAgICAgICAgICAgLy8gRmluZCB0aGUgZGlmZmVyZW5jZSBpbiBwb3NpdGlvbi5cclxuICAgICAgICAgICAgbGV0IGRpZlAgPSBnZW9fMS5Qb2ludC5zdWJ0cmFjdChiLnBvc2l0aW9uLCBhLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGdlb18xLlBvaW50Lmxlbmd0aChkaWZQKTtcclxuICAgICAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBkaWZmZXJlbmNlLlxyXG4gICAgICAgICAgICBsZXQgbm9ybWFsID0geyB4OiBkaWZQLnggLyBsZW4sIHk6IGRpZlAueSAvIGxlbiB9O1xyXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBkaWZmZXJlbmNlIGluIHZlbG9jaXR5LlxyXG4gICAgICAgICAgICBsZXQgZGlmViA9IGdlb18xLlBvaW50LnN1YnRyYWN0KGIucGh5c2ljcy52ZWxvY2l0eSwgYS5waHlzaWNzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgbGV0IGRvdCA9IGdlb18xLlBvaW50LmRvdChkaWZWLCBub3JtYWwpO1xyXG4gICAgICAgICAgICBsZXQgYm91bmNlID0gYS5waHlzaWNzLmJvdW5jZSAqIGIucGh5c2ljcy5ib3VuY2U7XHJcbiAgICAgICAgICAgIGxldCBkdiA9IHsgeDogbm9ybWFsLnggKiBkb3QgKiBib3VuY2UsIHk6IG5vcm1hbC55ICogZG90ICogYm91bmNlIH07XHJcbiAgICAgICAgICAgIGxldCB0b3RhbE1hc3MgPSBhLnBoeXNpY3MubWFzcyArIGIucGh5c2ljcy5tYXNzO1xyXG4gICAgICAgICAgICBhLnBoeXNpY3MudmVsb2NpdHkueCArPSBkdi54ICogYi5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eS55ICs9IGR2LnkgKiBiLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYi5waHlzaWNzLnZlbG9jaXR5LnggLT0gZHYueCAqIGEucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBiLnBoeXNpY3MudmVsb2NpdHkueSAtPSBkdi55ICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYWNlIHRoZSBlbnRpdGllcyBvdXQgb2YgZWFjaCBvdGhlci5cclxuICAgICAgICAgICAgbGV0IGNvckEgPSBjb3JyZWN0aW9ucy5nZXQoYSk7XHJcbiAgICAgICAgICAgIGlmIChjb3JBID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQSA9IHsgeDogMCwgeTogMCwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGEsIGNvckEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBjb3JCID0gY29ycmVjdGlvbnMuZ2V0KGIpO1xyXG4gICAgICAgICAgICBpZiAoY29yQiA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvckIgPSB7IHg6IDAsIHk6IDAsIG1hc3M6IDAgfTtcclxuICAgICAgICAgICAgICAgIGNvcnJlY3Rpb25zLnNldChiLCBjb3JCKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZGlzcGxhY2UgPSAoYS5waHlzaWNzLnJhZGl1cyArIGIucGh5c2ljcy5yYWRpdXMpIC0gbGVuO1xyXG4gICAgICAgICAgICBsZXQgZGlzWCA9IG5vcm1hbC54ICogZGlzcGxhY2U7XHJcbiAgICAgICAgICAgIGxldCBkaXNZID0gbm9ybWFsLnkgKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgY29yQS54IC09IGRpc1ggKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS55IC09IGRpc1kgKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICAgICAgY29yQi54ICs9IGRpc1ggKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi55ICs9IGRpc1kgKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga3ZwIG9mIGNvcnJlY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCBlID0ga3ZwWzBdO1xyXG4gICAgICAgICAgICBsZXQgY29yID0ga3ZwWzFdO1xyXG4gICAgICAgICAgICBsZXQgZHggPSBjb3IueCAvIGNvci5tYXNzICogMS4wNTtcclxuICAgICAgICAgICAgbGV0IGR5ID0gY29yLnkgLyBjb3IubWFzcyAqIDEuMDU7XHJcbiAgICAgICAgICAgIGUucG9zaXRpb24ueCArPSBkeDtcclxuICAgICAgICAgICAgZS5wb3NpdGlvbi55ICs9IGR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBoeXNpY3MgPSBQaHlzaWNzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waHlzaWNzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxuY2xhc3MgUGxheWVyQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdGllcykge1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmJ1bGxldFRpbWUgPSAwLjE7XHJcbiAgICAgICAgdGhpcy5idWxsZXRMaWZlc3BhbiA9IDQ7XHJcbiAgICAgICAgdGhpcy5idWxsZXREYW1hZ2UgPSA2O1xyXG4gICAgICAgIHRoaXMuX2J1bGxldFRpbWVMZWZ0ID0gMDtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnBsYXllciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllciA9IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBlbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUgPT0gdGhpcy5wbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gZW50aXRpZXM7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcywgaW5wdXQpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZHZ4ID0gMDtcclxuICAgICAgICBsZXQgZHZ5ID0gMDtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24oaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwKSkpXHJcbiAgICAgICAgICAgIGR2eSAtPSAxO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93bikpKVxyXG4gICAgICAgICAgICBkdnkgKz0gMTtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24oaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSAtPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXBSaWdodCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCArPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSAtPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bihpbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93bkxlZnQpKSkge1xyXG4gICAgICAgICAgICBkdnggLT0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgKz0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24oaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkRvd25SaWdodCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCArPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoTWF0aC5wb3coZHZ4LCAyKSArIE1hdGgucG93KGR2eSwgMikpO1xyXG4gICAgICAgIGlmIChsZW4gPD0gMC4wNSkge1xyXG4gICAgICAgICAgICAvLyBlaXRoZXIgemVybyBvciB0aGVyZSdzIGEgcm91bmRpbmcgZXJyb3IuXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGR2eCAvPSBsZW47XHJcbiAgICAgICAgICAgIGR2eSAvPSBsZW47XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0geyB4OiBkdngsIHk6IGR2eSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBCdWxsZXRzOlxyXG4gICAgICAgIGlmICh0aGlzLl9idWxsZXRUaW1lTGVmdCA8PSAwICYmIGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKGlucHV0LmdldEtleShpbnB1dF8xLktleS5GaXJlKSkpIHtcclxuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IGdlb18xLlBvaW50LnN1YnRyYWN0KGlucHV0LmN1cnNvciwgdGhpcy5wbGF5ZXIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKG5vcm1hbCk7XHJcbiAgICAgICAgICAgIG5vcm1hbC54IC89IGxlbjtcclxuICAgICAgICAgICAgbm9ybWFsLnkgLz0gbGVuO1xyXG4gICAgICAgICAgICBsZXQgbmV3UG9zID0gZ2VvXzEuUG9pbnQuY2xvbmUodGhpcy5wbGF5ZXIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBuZXdQb3MueCArPSBub3JtYWwueCAqIHRoaXMucGxheWVyLnBoeXNpY3MucmFkaXVzICogMS41O1xyXG4gICAgICAgICAgICBuZXdQb3MueSArPSBub3JtYWwueSAqIHRoaXMucGxheWVyLnBoeXNpY3MucmFkaXVzICogMS41O1xyXG4gICAgICAgICAgICBsZXQgbmV3VmVsID0gZ2VvXzEuUG9pbnQuY2xvbmUodGhpcy5wbGF5ZXIucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIG5ld1ZlbC54ICs9IG5vcm1hbC54ICogMjAwO1xyXG4gICAgICAgICAgICBuZXdWZWwueSArPSBub3JtYWwueSAqIDIwMDtcclxuICAgICAgICAgICAgbGV0IG5ld0J1bGxldCA9IGJ1bGxldENvbnRyb2xsZXJfMS5CdWxsZXRDb21wb25lbnQuY3JlYXRlQnVsbGV0KG5ld1BvcywgbmV3VmVsLCB0aGlzLmJ1bGxldERhbWFnZSwgdGhpcy5idWxsZXRMaWZlc3Bhbik7XHJcbiAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzLmFkZEVudGl0eShuZXdCdWxsZXQpO1xyXG4gICAgICAgICAgICB0aGlzLl9idWxsZXRUaW1lTGVmdCArPSB0aGlzLmJ1bGxldFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9idWxsZXRUaW1lTGVmdCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgLT0gc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QbGF5ZXJDb250cm9sbGVyID0gUGxheWVyQ29udHJvbGxlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGxheWVyQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbmNsYXNzIFN0eWxlIHtcclxufVxyXG5jb25zdCBWSUVXX0hFSUdIVCA9IDc1O1xyXG5jbGFzcyBSZW5kZXJlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdGllcykge1xyXG4gICAgICAgIHRoaXMuc2hhcGVGbnMgPSB7XHJcbiAgICAgICAgICAgICdjaXJjbGUnOiAoY3R4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIDEsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdoZXhhZ29uJzogKGN0eCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCAtMSk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKCtnZW9fMi5DT1NfMzAsIC1nZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygrZ2VvXzIuQ09TXzMwLCArZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oMCwgMSk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKC1nZW9fMi5DT1NfMzAsICtnZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygtZ2VvXzIuQ09TXzMwLCAtZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZHBpU2NhbGUgPSAxO1xyXG4gICAgICAgIHRoaXMuZ2xvdyA9IDEwO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhID0geyBwb3M6IHsgeDogMCwgeTogMCB9LCB6b29tOiAxIH07XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5yZW5kZXIpXHJcbiAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2VudGl0aWVzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzZXRDYW52YXMoY2FudmFzKSB7XHJcbiAgICAgICAgdGhpcy5fY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgY2FudmFzID0gY3R4LmNhbnZhcztcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiB0aGlzLmRwaVNjYWxlO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogdGhpcy5kcGlTY2FsZTtcclxuICAgICAgICBjdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX2VudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkucGh5c2ljcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgTUFYX0JMVVJfQ09VTlQgPSA1O1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShlbnRpdHkucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3BlZWQgPSBnZW9fMS5Qb2ludC5sZW5ndGgoZW50aXR5LnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJsdXJDb3VudCA9IE1hdGguZmxvb3Ioc3BlZWQgKiBzZWNvbmRzIC8gZW50aXR5LnJlbmRlci5yYWRpdXMgKyAxKTtcclxuICAgICAgICAgICAgICAgIGJsdXJDb3VudCA9IE1hdGgubWluKGJsdXJDb3VudCwgTUFYX0JMVVJfQ09VTlQsIGVudGl0eS5yZW5kZXIubWF4Qmx1cik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsdXJDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IGdlb18xLlBvaW50LmFkZChlbnRpdHkucG9zaXRpb24sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeDogLWVudGl0eS5waHlzaWNzLnZlbG9jaXR5LnggKiBzZWNvbmRzICogaSAvIGJsdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeTogLWVudGl0eS5waHlzaWNzLnZlbG9jaXR5LnkgKiBzZWNvbmRzICogaSAvIGJsdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVudGl0eShlbnRpdHksIHBvcywgTWF0aC5zcXJ0KDEuMCAvIGJsdXJDb3VudCksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyOiBkaXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhY3Rvcjogc3BlZWQgKiBzZWNvbmRzIC8gKGJsdXJDb3VudCArIDEpIC8gZW50aXR5LnJlbmRlci5yYWRpdXMgKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbnRpdHkoZW50aXR5LCBlbnRpdHkucG9zaXRpb24sIDEsIG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVuZGVyRW50aXR5KGUsIHBvcywgYWxwaGEsIHN0cmV0Y2gpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIGxldCByYWRpdXMgPSBlLnJlbmRlci5yYWRpdXM7XHJcbiAgICAgICAgY3R4LnRyYW5zbGF0ZShwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIGN0eC5zY2FsZShyYWRpdXMsIHJhZGl1cyk7XHJcbiAgICAgICAgaWYgKHN0cmV0Y2gpIHtcclxuICAgICAgICAgICAgdGhpcy5zdHJldGNoKHN0cmV0Y2guZGlyLCBzdHJldGNoLmZhY3Rvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgY3R4LnJvdGF0ZShlLnBoeXNpY3MudGhldGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3R5bGUgPSB7XHJcbiAgICAgICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgIHN0cm9rZTogZS5yZW5kZXIuY29sb3IsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogZS5yZW5kZXIubGluZVdpZHRoIC8gZS5yZW5kZXIucmFkaXVzLFxyXG4gICAgICAgICAgICBhbHBoYTogZS5yZW5kZXIuYWxwaGEgKiBhbHBoYSxcclxuICAgICAgICAgICAgZ2xvdzogZS5yZW5kZXIuZ2xvdyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGUoc3R5bGUpO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGbnNbZS5yZW5kZXIuc2hhcGVdKGN0eCk7XHJcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcclxuICAgIH1cclxuICAgIHN0cmV0Y2goZGlyLCBmYWN0b3IpIHtcclxuICAgICAgICBsZXQgYWIgPSB7IHg6IDEsIHk6IDAgfTtcclxuICAgICAgICBsZXQgYWJEb3QgPSBnZW9fMS5Qb2ludC5kb3QoYWIsIGRpcik7XHJcbiAgICAgICAgbGV0IGFiQW1vdW50ID0gYWJEb3QgKiAoZmFjdG9yIC0gMSk7XHJcbiAgICAgICAgYWIueCArPSBkaXIueCAqIGFiQW1vdW50O1xyXG4gICAgICAgIGFiLnkgKz0gZGlyLnkgKiBhYkFtb3VudDtcclxuICAgICAgICBsZXQgYmMgPSB7IHg6IDAsIHk6IDEgfTtcclxuICAgICAgICBsZXQgYmNEb3QgPSBnZW9fMS5Qb2ludC5kb3QoYmMsIGRpcik7XHJcbiAgICAgICAgbGV0IGJjQW1vdW50ID0gYmNEb3QgKiAoZmFjdG9yIC0gMSk7XHJcbiAgICAgICAgYmMueCArPSBkaXIueCAqIGJjQW1vdW50O1xyXG4gICAgICAgIGJjLnkgKz0gZGlyLnkgKiBiY0Ftb3VudDtcclxuICAgICAgICB0aGlzLl9jb250ZXh0LnRyYW5zZm9ybShhYi54LCBhYi55LCBiYy54LCBiYy55LCAwLCAwKTtcclxuICAgIH1cclxuICAgIHNldFRyYW5zZm9ybSgpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgc2NhbGUgPSB0aGlzLmNhbWVyYS56b29tICogY3R4LmNhbnZhcy5oZWlnaHQgLyBWSUVXX0hFSUdIVDtcclxuICAgICAgICBsZXQgZHggPSAtdGhpcy5jYW1lcmEucG9zLnggKiBzY2FsZSArIGN0eC5jYW52YXMud2lkdGggLyAyO1xyXG4gICAgICAgIGxldCBkeSA9IC10aGlzLmNhbWVyYS5wb3MueSAqIHNjYWxlICsgY3R4LmNhbnZhcy5oZWlnaHQgLyAyO1xyXG4gICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oc2NhbGUsIDAsIDAsIHNjYWxlLCBkeCwgZHkpO1xyXG4gICAgfVxyXG4gICAgZHJhd0NpcmNsZShjZW50ZXIsIHJhZGl1cywgc3R5bGUpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICB0aGlzLnNldFN0eWxlKHN0eWxlKTtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyhjZW50ZXIueCwgY2VudGVyLnksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0U3R5bGUoc3R5bGUpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gc3R5bGUuZmlsbDtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHlsZS5zdHJva2U7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5hbHBoYTtcclxuICAgICAgICBpZiAoc3R5bGUuZ2xvdyA+IDApIHtcclxuICAgICAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3R5bGUuc3Ryb2tlO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93Qmx1ciA9IDEwICogc3R5bGUuZ2xvdztcclxuICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFggPSAwO1xyXG4gICAgICAgICAgICBjdHguc2hhZG93T2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2NyZWVuVG9Xb3JsZChwKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IHggPSBwLng7XHJcbiAgICAgICAgbGV0IHkgPSBwLnk7XHJcbiAgICAgICAgeCAtPSBjdHguY2FudmFzLmNsaWVudFdpZHRoIC8gMjtcclxuICAgICAgICB5IC09IGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gMjtcclxuICAgICAgICBsZXQgZmFjID0gVklFV19IRUlHSFQgLyBjdHguY2FudmFzLmNsaWVudEhlaWdodDtcclxuICAgICAgICB4ICo9IGZhYztcclxuICAgICAgICB5ICo9IGZhYztcclxuICAgICAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5SZW5kZXJlciA9IFJlbmRlcmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXJlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBwYXJ0aWNsZUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGFydGljbGVDb250cm9sbGVyJyk7XHJcbmNsYXNzIFNoaXBDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5fc2hpcHMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5zaGlwKVxyXG4gICAgICAgICAgICB0aGlzLl9zaGlwcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIGVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9zaGlwcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gZW50aXRpZXM7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3NoaXBzKSB7XHJcbiAgICAgICAgICAgIGlmIChlLnNoaXAuaHAgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMucmVtb3ZlRW50aXR5KGUpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGUuc2hpcC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBkdkFtb3VudCA9IGUuc2hpcC5hY2NlbCAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ4ID0gZS5zaGlwLmRpcmVjdGlvbi54ICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ5ID0gZS5zaGlwLmRpcmVjdGlvbi55ICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHkueCArPSBkdng7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHkueSArPSBkdnk7XHJcbiAgICAgICAgICAgICAgICAvLyBleGhhdXN0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGUuc2hpcC5leGhhdXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4aGF1c3QgPSBlLnNoaXAuZXhoYXVzdDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvYmFibGVBbW91bnQgPSBleGhhdXN0LnJhdGUgKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2JhYmxlQW1vdW50IDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxBbW91bnQgPSBNYXRoLnJhbmRvbSgpIDwgcHJvYmFibGVBbW91bnQgPyAxIDogMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEFtb3VudCA9IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcHJvYmFibGVBbW91bnQgKiAyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBTcGVlZCA9IGUuc2hpcC5hY2NlbCAqIGUucGh5c2ljcy5tYXNzIC8gZXhoYXVzdC5tYXNzIC8gZXhoYXVzdC5yYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0dWFsQW1vdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWVkRmFjdG9yID0gTWF0aC5yYW5kb20oKSAqIDAuNSArIDAuNzU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwdnggPSAoZS5zaGlwLmRpcmVjdGlvbi54ICogLXBTcGVlZCAqIHNwZWVkRmFjdG9yKSArIGUucGh5c2ljcy52ZWxvY2l0eS54O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHZ5ID0gKGUuc2hpcC5kaXJlY3Rpb24ueSAqIC1wU3BlZWQgKiBzcGVlZEZhY3RvcikgKyBlLnBoeXNpY3MudmVsb2NpdHkueTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB4ID0gZS5wb3NpdGlvbi54IC0gZS5zaGlwLmRpcmVjdGlvbi54ICogZS5waHlzaWNzLnJhZGl1cyAqIDEuMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB5ID0gZS5wb3NpdGlvbi55IC0gZS5zaGlwLmRpcmVjdGlvbi55ICogZS5waHlzaWNzLnJhZGl1cyAqIDEuMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkRW50aXR5KHBhcnRpY2xlQ29udHJvbGxlcl8xLlBhcnRpY2xlQ29tcG9uZW50LmNyZWF0ZVBhcnRpY2xlKHsgeDogcHgsIHk6IHB5IH0sIHsgeDogcHZ4LCB5OiBwdnkgfSwgZS5yZW5kZXIuY29sb3IsIGV4aGF1c3QubWFzcywgZXhoYXVzdC5yYWRpdXMsIDAuMykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNoaXBDb250cm9sbGVyID0gU2hpcENvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNoaXBDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGVuZW15Q29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9lbmVteUNvbnRyb2xsZXInKTtcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxuY29uc3QgV0FWRV9QRVJJT0QgPSAzO1xyXG5jb25zdCBHRU5fUkFESVVTID0gMjAwO1xyXG5jbGFzcyBXYXZlR2VuZXJhdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGVudGl0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBlbnRpdGllcztcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLl93YXZlVGltZSA9IFdBVkVfUEVSSU9EO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMsIGVuZW1pZXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dhdmVUaW1lIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAoZW5lbWllcy5zaXplIDw9IDEwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlV2F2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3dhdmVUaW1lICs9IFdBVkVfUEVSSU9EO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl93YXZlVGltZSAtPSBzZWNvbmRzO1xyXG4gICAgfVxyXG4gICAgZ2VuZXJhdGVXYXZlKCkge1xyXG4gICAgICAgIGxldCBmb2xsb3dlcnMgPSAxMjtcclxuICAgICAgICBsZXQgdGFua3MgPSAyO1xyXG4gICAgICAgIGxldCBzZWVrZXJzID0gODtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGxvd2VyczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGRFbnRpdHkoZW5lbXlDb250cm9sbGVyXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlRm9sbG93ZXIocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFua3M7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgcCA9IGdlb18xLmdlby5tYXRoLnJhbmRDaXJjbGUoZ2VvXzEuUG9pbnQuemVybygpLCBHRU5fUkFESVVTKTtcclxuICAgICAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkRW50aXR5KGVuZW15Q29udHJvbGxlcl8xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVRhbmsocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vla2VyczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGRFbnRpdHkoZW5lbXlDb250cm9sbGVyXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlU2Vla2VyKHAsIGdlb18xLlBvaW50Lnplcm8oKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLldhdmVHZW5lcmF0b3IgPSBXYXZlR2VuZXJhdG9yO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD13YXZlR2VuZXJhdG9yLmpzLm1hcCJdfQ==
