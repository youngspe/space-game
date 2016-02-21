(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
var BulletComponent;
(function (BulletComponent) {
    function createBullet(options) {
        return {
            physics: {
                velocity: options.vel,
                radius: 0.6,
                bounce: 1,
                drag: 0.125,
                theta: 0,
                omega: 0,
                mass: 0.5,
                collide: true,
            },
            position: options.pos,
            render: {
                color: options.color,
                alpha: 1,
                radius: 0.4,
                lineWidth: 0.1,
                shape: 'circle',
                maxBlur: 5,
                glow: 0,
            },
            bullet: {
                damage: options.damage,
                isAlive: true,
                source: options.source,
                damageGroup: options.damageGroup,
            },
            particle: {
                lifespan: options.lifespan,
                timeRemaining: options.lifespan,
                count: false,
            },
        };
    }
    BulletComponent.createBullet = createBullet;
})(BulletComponent = exports.BulletComponent || (exports.BulletComponent = {}));
class BulletController {
    constructor() {
        this.deps = new BulletController.Dependencies();
        this._bullets = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.bullet)
            this._bullets.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._bullets.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let intersections = this.deps.physics.intersections;
        for (let b of this._bullets) {
            if (b.bullet.isAlive) {
                let inters = intersections.get(b);
                if (inters && inters.length > 0) {
                    for (let i of inters) {
                        let other = i.b;
                        if (other.health) {
                            this.deps.healthController.damageEntity(other, b.bullet.damage, b.bullet.source, b.bullet.damageGroup);
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
(function (BulletController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.physics = null;
            this.entities = null;
            this.healthController = null;
        }
    }
    BulletController.Dependencies = Dependencies;
})(BulletController = exports.BulletController || (exports.BulletController = {}));

},{"./system":21}],2:[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./enemies/enemyBehavior'));
__export(require('./enemies/enemyComponent'));
__export(require('./enemies/enemyController'));

},{"./enemies/enemyBehavior":3,"./enemies/enemyComponent":4,"./enemies/enemyController":5}],3:[function(require,module,exports){
'use strict';
var geo_1 = require('../geo');
var geo_2 = require('../geo');
var geo = require('../geo');
const X = 0;
const Y = 1;
var EnemyBehavior;
(function (EnemyBehavior) {
    (function (Mode) {
        Mode[Mode["Follow"] = 0] = "Follow";
        Mode[Mode["Circle"] = 1] = "Circle";
        Mode[Mode["Shoot"] = 2] = "Shoot";
    })(EnemyBehavior.Mode || (EnemyBehavior.Mode = {}));
    var Mode = EnemyBehavior.Mode;
    (function (CircleDirection) {
        CircleDirection[CircleDirection["Clockwise"] = 0] = "Clockwise";
        CircleDirection[CircleDirection["Counter"] = 1] = "Counter";
    })(EnemyBehavior.CircleDirection || (EnemyBehavior.CircleDirection = {}));
    var CircleDirection = EnemyBehavior.CircleDirection;
    const circleMatrices = {
        // -30 degrees
        [CircleDirection.Clockwise]: [
            [geo.COS_30, geo.SIN_30],
            [-geo.SIN_30, geo.COS_30],
        ],
        // 30 degrees
        [CircleDirection.Counter]: [
            [geo.COS_30, -geo.SIN_30],
            [geo.SIN_30, geo.COS_30],
        ],
    };
    const behaviorMap = {
        [Mode.Follow]: (e, behavior, sys) => {
            let player = sys.deps.playerController.player;
            if (player) {
                let dir = geo_1.Point.normalize(geo_1.Point.subtract(player.position, e.position));
                e.ship.direction = dir;
            }
            else {
                e.ship.direction = null;
            }
        },
        [Mode.Circle]: (e, behavior, sys) => {
            let player = sys.deps.playerController.player;
            let data = behavior.data;
            if (player) {
                // Find the normalized direction from player to enemy
                let normal = geo_1.Point.normalize(geo_1.Point.subtract(e.position, player.position));
                let target = geo_2.Matrix.pointMul(circleMatrices[data.direction], normal);
                target[X] = target[X] * data.radius + player.position[X];
                target[Y] = target[Y] * data.radius + player.position[Y];
                let dir = geo_1.Point.normalize(geo_1.Point.subtract(target, e.position));
                e.ship.direction = dir;
            }
            else {
                e.ship.direction = null;
            }
        },
        [Mode.Shoot]: (e, behavior, sys) => {
            let data = behavior.data;
            let player = sys.deps.playerController.player;
            if (player) {
                let dir = geo_1.Point.subtract(player.position, e.position);
                let len = geo_1.Point.length(dir);
                if (len >= data.minDistance && len <= data.maxDistance) {
                    dir[X] /= len;
                    dir[Y] /= len;
                    e.gunner.direction = dir;
                    return;
                }
            }
            e.gunner.direction = null;
        },
    };
    function getBehaviorFunction(mode) {
        return behaviorMap[mode];
    }
    EnemyBehavior.getBehaviorFunction = getBehaviorFunction;
})(EnemyBehavior = exports.EnemyBehavior || (exports.EnemyBehavior = {}));

},{"../geo":9}],4:[function(require,module,exports){
'use strict';
var enemyBehavior_1 = require('./enemyBehavior');
var healthController_1 = require('../healthController');
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
            enemy: {
                behaviors: [
                    {
                        mode: enemyBehavior_1.EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 2,
                            direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                ],
            },
            ship: {
                accel: 100,
                exhaust: {
                    rate: 3,
                    mass: 1.5,
                    radius: 0.4,
                },
            },
            health: {
                hp: 10,
                maxHp: 10,
                damageGroup: healthController_1.DamageGroup.Enemy,
            },
            scoring: {
                value: 10,
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
            enemy: {
                behaviors: [
                    {
                        mode: enemyBehavior_1.EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 15,
                            direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                ],
            },
            ship: {
                accel: 80,
                exhaust: {
                    rate: 4,
                    mass: 4,
                    radius: 0.8,
                },
            },
            health: {
                hp: 30,
                maxHp: 30,
                damageGroup: healthController_1.DamageGroup.Enemy,
            },
            scoring: {
                value: 20,
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
            enemy: {
                behaviors: [
                    {
                        mode: enemyBehavior_1.EnemyBehavior.Mode.Circle,
                        data: {
                            radius: 6,
                            direction: enemyBehavior_1.EnemyBehavior.CircleDirection.Counter,
                        },
                    },
                    {
                        mode: enemyBehavior_1.EnemyBehavior.Mode.Shoot,
                        data: {
                            minDistance: 10,
                            maxDistance: 40,
                        },
                    },
                ],
            },
            ship: {
                accel: 150,
                exhaust: {
                    rate: 5,
                    mass: 1,
                    radius: 0.4,
                },
            },
            gunner: {
                rate: 3,
                direction: null,
                timeLeft: 0,
                damage: 4,
                damageGroup: healthController_1.DamageGroup.All & ~healthController_1.DamageGroup.Enemy,
                bulletSpeed: 200,
                color: '#80FF00',
            },
            health: {
                hp: 5,
                maxHp: 5,
                damageGroup: healthController_1.DamageGroup.Enemy,
            },
            scoring: {
                value: 5,
            },
        };
        return e;
    }
    EnemyComponent.createSeeker = createSeeker;
})(EnemyComponent = exports.EnemyComponent || (exports.EnemyComponent = {}));

},{"../healthController":11,"./enemyBehavior":3}],5:[function(require,module,exports){
'use strict';
var system_1 = require('../system');
var enemyBehavior_1 = require('./enemyBehavior');
const X = 0;
const Y = 1;
class EnemyController {
    constructor() {
        this.deps = new EnemyController.Dependencies();
        this.enemies = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.enemy)
            this.enemies.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this.enemies.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        let player = this.deps.playerController.player;
        for (let e of this.enemies) {
            if (e.isDead) {
                continue;
            }
            for (let b of e.enemy.behaviors) {
                enemyBehavior_1.EnemyBehavior.getBehaviorFunction(b.mode)(e, b, this);
            }
        }
    }
}
exports.EnemyController = EnemyController;
(function (EnemyController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.playerController = null;
            this.entities = null;
        }
    }
    EnemyController.Dependencies = Dependencies;
})(EnemyController = exports.EnemyController || (exports.EnemyController = {}));

},{"../system":21,"./enemyBehavior":3}],6:[function(require,module,exports){
'use strict';
var event_1 = require('./event');
class EntityContainer {
    constructor() {
        this.deps = {};
        /**
         * Occurs after an entity is added to the container.
         * arg: The entity that was added.
         */
        this.entityAdded = new event_1.Event();
        /**
         * Occurs after an entity is removed from the container.
         * arg: The entity that was removed.
         */
        this.entityRemoved = new event_1.Event();
        this._entities = new Set();
        this._nextId = 0;
        this._index = new Map();
    }
    init() { }
    /**
     * Adds an entity to the container.
     * @param entity The entity to add.
     */
    addEntity(entity) {
        entity.id = ++this._nextId;
        this._entities.add(entity);
        this._index.set(entity.id, entity);
        this.entityAdded.emit(entity);
    }
    /**
     * Removes an entity from the container.
     * @param entity The entity to remove.
     */
    removeEntity(entity) {
        this._entities.delete(entity);
        this._index.delete(entity.id);
        this.entityRemoved.emit(entity);
    }
    /**
     * Retrieves an entity with the given id.
     * @param id The id of the entity to retrieve.
     */
    getById(id) {
        return this._index.get(id);
    }
}
exports.EntityContainer = EntityContainer;

},{"./event":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var enemies_1 = require('./enemies');
var entityContainer_1 = require('./entityContainer');
var gunnerController_1 = require('./gunnerController');
var healthController_1 = require('./healthController');
var hud_1 = require('./hud');
var input_1 = require('./input');
var physics_1 = require('./physics');
var particleController_1 = require('./particleController');
var playerController_1 = require('./playerController');
var reaper_1 = require('./reaper');
var renderer_1 = require('./renderer');
var shipController_1 = require('./shipController');
var system_1 = require('./system');
var waveGenerator_1 = require('./waveGenerator');
class BaseGame {
    init() {
        system_1.System.initSystems(this.systems);
    }
}
exports.BaseGame = BaseGame;
(function (BaseGame) {
    class Systems extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = new entityContainer_1.EntityContainer();
        }
    }
    BaseGame.Systems = Systems;
})(BaseGame = exports.BaseGame || (exports.BaseGame = {}));
class Game extends BaseGame {
    constructor(...args) {
        super(...args);
        this.systems = new Game.Systems();
    }
    step(elapsedMs) {
        this.systems.waveGenerator.step(elapsedMs);
        this.systems.playerController.step(elapsedMs);
        this.systems.enemyController.step(elapsedMs);
        this.systems.shipController.step(elapsedMs);
        this.systems.gunnerController.step(elapsedMs);
        this.systems.bulletController.step(elapsedMs);
        this.systems.particleControler.step(elapsedMs);
        this.systems.reaper.reap();
        this.systems.physics.step(elapsedMs);
        this.systems.hud.step(elapsedMs);
        this.systems.input.postStep();
    }
}
exports.Game = Game;
(function (Game) {
    class Systems extends BaseGame.Systems {
        constructor(...args) {
            super(...args);
            this.input = new input_1.Input();
            this.physics = new physics_1.Physics();
            this.renderer = new renderer_1.Renderer();
            this.playerController = new playerController_1.PlayerController();
            this.shipController = new shipController_1.ShipController();
            this.enemyController = new enemies_1.EnemyController();
            this.bulletController = new bulletController_1.BulletController();
            this.gunnerController = new gunnerController_1.GunnerController();
            this.particleControler = new particleController_1.ParticleController();
            this.healthController = new healthController_1.HealthController();
            this.waveGenerator = new waveGenerator_1.WaveGenerator();
            this.hud = new hud_1.Hud();
            this.reaper = new reaper_1.Reaper();
        }
    }
    Game.Systems = Systems;
})(Game = exports.Game || (exports.Game = {}));

},{"./bulletController":1,"./enemies":2,"./entityContainer":6,"./gunnerController":10,"./healthController":11,"./hud":12,"./input":14,"./particleController":15,"./physics":16,"./playerController":17,"./reaper":18,"./renderer":19,"./shipController":20,"./system":21,"./waveGenerator":22}],9:[function(require,module,exports){
'use strict';
exports.SIN_30 = 0.5;
exports.COS_30 = 0.86603;
const X = 0;
const Y = 1;
var Point;
(function (Point) {
    function add(...points) {
        let p = [0, 0];
        for (let p1 of points) {
            p[X] += p1[X];
            p[Y] += p1[Y];
        }
        return p;
    }
    Point.add = add;
    function subtract(p1, p2) {
        return [p1[X] - p2[X], p1[Y] - p2[Y]];
    }
    Point.subtract = subtract;
    function length(p) {
        return Math.sqrt(lengthSquared(p));
    }
    Point.length = length;
    function lengthSquared(p) {
        return Math.pow(p[X], 2) + Math.pow(p[Y], 2);
    }
    Point.lengthSquared = lengthSquared;
    function dist(p1, p2) {
        return Math.sqrt(distSquared(p1, p2));
    }
    Point.dist = dist;
    function distSquared(p1, p2) {
        return Math.pow((p1[X] - p2[X]), 2) + Math.pow((p1[Y] - p2[Y]), 2);
    }
    Point.distSquared = distSquared;
    function dot(p1, p2) {
        return p1[X] * p2[X] + p1[Y] * p2[Y];
    }
    Point.dot = dot;
    function clone(p) {
        return [p[X], p[Y]];
    }
    Point.clone = clone;
    function normalize(p) {
        let len = length(p);
        return [p[X] / len, p[Y] / len];
    }
    Point.normalize = normalize;
    function zero() {
        return [0, 0];
    }
    Point.zero = zero;
    function plus(self, p) {
        self[X] += p[X];
        self[Y] += p[Y];
    }
    Point.plus = plus;
})(Point = exports.Point || (exports.Point = {}));
var Matrix;
(function (Matrix) {
    function mul(a, b) {
        let vecX = pointMul(a, [b[X][X], b[Y][X]]);
        let vecY = pointMul(a, [b[X][Y], b[Y][Y]]);
        return [
            [vecX[X], vecY[X]],
            [vecX[Y], vecY[Y]],
        ];
    }
    Matrix.mul = mul;
    function pointMul(a, b) {
        return [
            Point.dot(a[X], b),
            Point.dot(a[Y], b),
        ];
    }
    Matrix.pointMul = pointMul;
})(Matrix = exports.Matrix || (exports.Matrix = {}));
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
                    return [
                        x * radius + center[X],
                        y * radius + center[Y],
                    ];
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
            return [
                randGauss(center[X], dev),
                randGauss(center[Y], dev),
            ];
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

},{}],10:[function(require,module,exports){
'use strict';
var bulletController_1 = require('./bulletController');
var bulletController_2 = require('./bulletController');
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class GunnerComponent {
}
exports.GunnerComponent = GunnerComponent;
const BULLET_LIFESPAN = 4;
class GunnerController {
    constructor() {
        this.deps = new bulletController_2.BulletController.Dependencies();
        this._gunners = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.gunner)
            this._gunners.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._gunners.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._gunners) {
            if (e.gunner.direction && e.gunner.timeLeft <= 0) {
                let pos = e.position;
                let dir = e.gunner.direction;
                let vel = [0, 0];
                let rad = 0;
                if (e.physics) {
                    vel = e.physics.velocity;
                    rad = e.physics.radius;
                }
                let newPos = geo_1.Point.clone(pos);
                newPos[X] += dir[X] * rad * 1.5;
                newPos[Y] += dir[Y] * rad * 1.5;
                let newVel = geo_1.Point.clone(vel);
                newVel[X] += dir[X] * e.gunner.bulletSpeed;
                newVel[Y] += dir[Y] * e.gunner.bulletSpeed;
                e.gunner.timeLeft = 1 / e.gunner.rate;
                this.deps.entities.addEntity(bulletController_1.BulletComponent.createBullet({
                    damage: e.gunner.damage,
                    damageGroup: e.gunner.damageGroup,
                    pos: newPos,
                    vel: newVel,
                    source: e,
                    lifespan: BULLET_LIFESPAN,
                    color: e.gunner.color,
                }));
            }
            e.gunner.timeLeft = Math.max(0, e.gunner.timeLeft - seconds);
        }
    }
}
exports.GunnerController = GunnerController;
(function (GunnerController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
            this.bulletController = null;
        }
    }
    GunnerController.Dependencies = Dependencies;
})(GunnerController = exports.GunnerController || (exports.GunnerController = {}));

},{"./bulletController":1,"./geo":9,"./system":21}],11:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
(function (DamageGroup) {
    DamageGroup[DamageGroup["None"] = 0] = "None";
    DamageGroup[DamageGroup["Player"] = 1] = "Player";
    DamageGroup[DamageGroup["Enemy"] = 2] = "Enemy";
    DamageGroup[DamageGroup["All"] = 2147483647] = "All";
})(exports.DamageGroup || (exports.DamageGroup = {}));
var DamageGroup = exports.DamageGroup;
class HealthController {
    constructor() {
        this.deps = new HealthController.Dependencies();
        this._healthEntities = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.health)
            this._healthEntities.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._healthEntities.delete(e); });
    }
    damageEntity(entity, damage, source, damageGroup) {
        if (damageGroup == undefined)
            damageGroup = DamageGroup.All;
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
}
exports.HealthController = HealthController;
(function (HealthController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.reaper = null;
            this.entities = null;
        }
    }
    HealthController.Dependencies = Dependencies;
})(HealthController = exports.HealthController || (exports.HealthController = {}));

},{"./system":21}],12:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class Hud {
    constructor() {
        this.deps = new Hud.Dependencies();
    }
    init() { }
    step(elapsedMs) {
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
            this._cursorDisplay.position = geo_1.Point.clone(cursor);
        }
        if (this._displayController != null) {
            this.displayScore();
        }
    }
    displayScore() {
        let score = this.deps.playerController.score;
        this._displayController.score.setValue(score.toString());
    }
    setDisplayController(hdc) {
        this._displayController = hdc;
    }
}
exports.Hud = Hud;
(function (Hud) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
            this.playerController = null;
            this.input = null;
        }
    }
    Hud.Dependencies = Dependencies;
})(Hud = exports.Hud || (exports.Hud = {}));

},{"./geo":9,"./system":21}],13:[function(require,module,exports){
/// <reference path="../typings/node/node.d.ts" />
'use strict';
var game_1 = require('./game');
var healthController_1 = require('./healthController');
var input_1 = require('./input');
let mainCanvas = document.querySelector('#mainCanvas');
let game = new game_1.Game();
game.init();
game.systems.renderer.setCanvas(mainCanvas);
class ElementBinding {
    constructor(element, attribute) {
        attribute = attribute || 'innerText';
        this.element = element;
        this.attribute = attribute;
    }
    setValue(value) {
        this.element[this.attribute] = value;
    }
}
var hudDisplayController = {
    score: new ElementBinding(document.querySelector('#hud_score')),
};
game.systems.hud.setDisplayController(hudDisplayController);
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
game.systems.entities.addEntity({
    position: [0, 0],
    physics: {
        velocity: [0, 0],
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
    player: {
        score: 0,
    },
    ship: {
        accel: 600,
        exhaust: {
            rate: 80,
            mass: 0.6,
            radius: 0.3,
        },
    },
    gunner: {
        rate: 10,
        direction: null,
        timeLeft: 0,
        damage: 6,
        damageGroup: healthController_1.DamageGroup.All & ~healthController_1.DamageGroup.Player,
        bulletSpeed: 200,
        color: '#40A0FF',
    },
    health: {
        hp: 50,
        maxHp: 50,
        damageGroup: healthController_1.DamageGroup.Player,
    },
});
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
        game.systems.input.keyDown(key);
    }
});
window.addEventListener('keyup', (e) => {
    let key = keyMap[e.keyCode];
    if (key != undefined) {
        game.systems.input.keyUp(key);
    }
});
window.addEventListener('mousemove', (e) => {
    let rect = mainCanvas.getBoundingClientRect();
    let p = [
        e.clientX - rect.left,
        e.clientY - rect.top,
    ];
    game.systems.input.cursor = game.systems.renderer.screenToWorld(p);
});
window.addEventListener('mousedown', (e) => {
    game.systems.input.keyDown(input_1.Key.Fire);
});
window.addEventListener('mouseup', (e) => {
    game.systems.input.keyUp(input_1.Key.Fire);
});
let lastRenderTime = performance.now();
requestAnimationFrame(function render() {
    let renderTime = performance.now();
    game.systems.renderer.render(renderTime - lastRenderTime);
    lastRenderTime = renderTime;
    requestAnimationFrame(render);
});

},{"./game":8,"./healthController":11,"./input":14}],14:[function(require,module,exports){
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
        this.deps = {};
        this._toRelease = [];
        let keyCount = Object.keys(Key).length / 2;
        this._keys = new Array(keyCount);
        for (let i = 0; i < keyCount; ++i) {
            this._keys[i] = KeyState.Up;
        }
    }
    init() { }
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

},{}],15:[function(require,module,exports){
'use strict';
var system_1 = require('./system');
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
    constructor() {
        this.deps = new ParticleController.Dependencies();
        this.maxParticles = 200;
        this._particleCount = 0;
        this._particles = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => {
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
                            this.deps.entities.removeEntity(toDelete);
                        }
                    }
                }
            }
        });
        this.deps.entities.entityRemoved.listen(e => {
            if (e.particle) {
                this._particles.delete(e);
                if (e.particle.count) {
                    --this._particleCount;
                }
            }
        });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._particles) {
            if (e.particle.timeRemaining <= 0) {
                this.deps.entities.removeEntity(e);
                continue;
            }
            e.render.alpha = e.particle.timeRemaining / e.particle.lifespan;
            e.particle.timeRemaining -= seconds;
        }
    }
}
exports.ParticleController = ParticleController;
(function (ParticleController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    ParticleController.Dependencies = Dependencies;
})(ParticleController = exports.ParticleController || (exports.ParticleController = {}));

},{"./system":21}],16:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
const WORLD_DRAG = 4;
class Physics {
    constructor() {
        this.deps = new Physics.Dependencies();
        this.iterations = 4;
        this.intersections = new Map();
        this._physObjects = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.physics)
            this._physObjects.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._physObjects.delete(e); });
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
        for (let entity of this._physObjects) {
            let phys = entity.physics;
            let pos = entity.position;
            let vel = phys.velocity;
            pos[X] += vel[X] * seconds;
            pos[Y] += vel[Y] * seconds;
            let dragCoeff = Math.pow(Math.E, -WORLD_DRAG * phys.drag * seconds);
            vel[X] *= dragCoeff;
            vel[Y] *= dragCoeff;
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
            for (let e of this._physObjects) {
                if (e.physics.collide) {
                    list.push(e);
                }
            }
        }
        // Sort by leftmost bound of circle.
        list.sort((a, b) => Math.sign((a.position[X] - a.physics.radius) - (b.position[X] - b.physics.radius)));
        // Sweep left-to-right through the entities.
        for (let i = 0; i < list.length; ++i) {
            let a = list[i];
            let rightEdge = a.position[X] + a.physics.radius;
            // Check only entities to the right of a;
            for (let j = i + 1; j < list.length; ++j) {
                let b = list[j];
                if (b.position[X] - b.physics.radius >= rightEdge) {
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
            let normal = [difP[X] / len, difP[Y] / len];
            // Find the difference in velocity.
            let difV = geo_1.Point.subtract(b.physics.velocity, a.physics.velocity);
            let dot = geo_1.Point.dot(difV, normal);
            let bounce = a.physics.bounce * b.physics.bounce;
            let dv = [normal[X] * dot * bounce, normal[Y] * dot * bounce];
            let totalMass = a.physics.mass + b.physics.mass;
            a.physics.velocity[X] += dv[X] * b.physics.mass / totalMass;
            a.physics.velocity[Y] += dv[Y] * b.physics.mass / totalMass;
            b.physics.velocity[X] -= dv[X] * a.physics.mass / totalMass;
            b.physics.velocity[Y] -= dv[Y] * a.physics.mass / totalMass;
            // Displace the entities out of each other.
            let corA = corrections.get(a);
            if (corA == undefined) {
                corA = { d: [0, 0], mass: 0 };
                corrections.set(a, corA);
            }
            let corB = corrections.get(b);
            if (corB == undefined) {
                corB = { d: [0, 0], mass: 0 };
                corrections.set(b, corB);
            }
            let displace = (a.physics.radius + b.physics.radius) - len;
            let disX = normal[X] * displace;
            let disY = normal[Y] * displace;
            corA.d[X] -= disX * b.physics.mass;
            corA.d[Y] -= disY * b.physics.mass;
            corA.mass += totalMass;
            corB.d[X] += disX * a.physics.mass;
            corB.d[Y] += disY * a.physics.mass;
            corB.mass += totalMass;
        }
        for (let kvp of corrections) {
            let e = kvp[0];
            let cor = kvp[1];
            let dx = cor.d[X] / cor.mass * 1.05;
            let dy = cor.d[Y] / cor.mass * 1.05;
            e.position[X] += dx;
            e.position[Y] += dy;
        }
    }
}
exports.Physics = Physics;
(function (Physics) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Physics.Dependencies = Dependencies;
})(Physics = exports.Physics || (exports.Physics = {}));

},{"./geo":9,"./system":21}],17:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var geo_2 = require('./geo');
var input_1 = require('./input');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class PlayerController {
    constructor() {
        this.deps = new PlayerController.Dependencies();
        this.player = null;
        this.score = 0;
        this._bulletTimeLeft = 0;
    }
    init() {
        this.deps.entities.entityAdded.listen(e => {
            if (e.player != null) {
                this.player = e;
            }
        });
        this.deps.entities.entityRemoved.listen(e => {
            if (e == this.player) {
                this.player = null;
            }
        });
        this.deps.reaper.entityKilled.listen(args => {
            if (args.killer.player && args.entity.scoring) {
                this.score += args.entity.scoring.value;
            }
        });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        if (this.player == null) {
            return;
        }
        let dvx = 0;
        let dvy = 0;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Up)))
            dvy -= 1;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Down)))
            dvy += 1;
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.UpLeft))) {
            dvx -= geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.UpRight))) {
            dvx += geo_2.COS_30;
            dvy -= geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.DownLeft))) {
            dvx -= geo_2.COS_30;
            dvy += geo_2.SIN_30;
        }
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.DownRight))) {
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
            this.player.ship.direction = [dvx, dvy];
        }
        // Bullets:
        if (input_1.KeyState.isDown(this.deps.input.getKey(input_1.Key.Fire))) {
            let normal = geo_1.Point.normalize(geo_1.Point.subtract(this.deps.input.cursor, this.player.position));
            this.player.gunner.direction = normal;
        }
        else {
            this.player.gunner.direction = null;
        }
        if (this._bulletTimeLeft > 0) {
            this._bulletTimeLeft -= seconds;
        }
    }
}
exports.PlayerController = PlayerController;
(function (PlayerController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.input = null;
            this.reaper = null;
            this.entities = null;
        }
    }
    PlayerController.Dependencies = Dependencies;
})(PlayerController = exports.PlayerController || (exports.PlayerController = {}));

},{"./geo":9,"./input":14,"./system":21}],18:[function(require,module,exports){
'use strict';
var event_1 = require('./event');
var system_1 = require('./system');
class Reaper {
    constructor() {
        this.deps = new Reaper.Dependencies();
        /**
         * Occurs when an entity is killed.
         */
        this.entityKilled = new event_1.Event();
        this._toKill = new Set();
    }
    init() { }
    /**
     * Marks an entity as dead.
     * The entity will be removed when reap() is called.
     * @param entity The entity to kill.
     */
    killEntity(entity, killer) {
        entity.isDead = true;
        this._toKill.add(entity);
        this.entityKilled.emit({ entity: entity, killer: killer });
    }
    /**
     * Removes dead entities.
     */
    reap() {
        for (let e of this._toKill) {
            if (e.isDead) {
                this.deps.entities.removeEntity(e);
            }
        }
        this._toKill.clear();
    }
}
exports.Reaper = Reaper;
(function (Reaper) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Reaper.Dependencies = Dependencies;
})(Reaper = exports.Reaper || (exports.Reaper = {}));

},{"./event":7,"./system":21}],19:[function(require,module,exports){
'use strict';
var geo_1 = require('./geo');
var geo_2 = require('./geo');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class Style {
}
const VIEW_HEIGHT = 75;
class Renderer {
    constructor() {
        this.deps = new Renderer.Dependencies();
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
        this.camera = { pos: [0, 0], zoom: 1 };
        this._renderObjects = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.render)
            this._renderObjects.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._renderObjects.delete(e); });
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
        for (let entity of this._renderObjects) {
            if (entity.physics) {
                const MAX_BLUR_COUNT = 5;
                let dir = geo_1.Point.normalize(entity.physics.velocity);
                let speed = geo_1.Point.length(entity.physics.velocity);
                let blurCount = Math.floor(speed * seconds / entity.render.radius + 1);
                blurCount = Math.min(blurCount, MAX_BLUR_COUNT, entity.render.maxBlur);
                for (let i = 0; i < blurCount; ++i) {
                    let pos = geo_1.Point.add(entity.position, [
                        -entity.physics.velocity[X] * seconds * i / blurCount,
                        -entity.physics.velocity[Y] * seconds * i / blurCount,
                    ]);
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
        ctx.translate(pos[X], pos[Y]);
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
        let ab = [1, 0];
        let abDot = geo_1.Point.dot(ab, dir);
        let abAmount = abDot * (factor - 1);
        ab[X] += dir[X] * abAmount;
        ab[Y] += dir[Y] * abAmount;
        let bc = [0, 1];
        let bcDot = geo_1.Point.dot(bc, dir);
        let bcAmount = bcDot * (factor - 1);
        bc[X] += dir[X] * bcAmount;
        bc[Y] += dir[Y] * bcAmount;
        this._context.transform(ab[X], ab[Y], bc[X], bc[Y], 0, 0);
    }
    setTransform() {
        let ctx = this._context;
        let scale = this.camera.zoom * ctx.canvas.height / VIEW_HEIGHT;
        let dx = -this.camera.pos[X] * scale + ctx.canvas.width / 2;
        let dy = -this.camera.pos[Y] * scale + ctx.canvas.height / 2;
        ctx.setTransform(scale, 0, 0, scale, dx, dy);
    }
    drawCircle(center, radius, style) {
        let ctx = this._context;
        this.setStyle(style);
        ctx.beginPath();
        ctx.arc(center[X], center[Y], radius, 0, 2 * Math.PI);
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
        let x = p[X];
        let y = p[Y];
        x -= ctx.canvas.clientWidth / 2;
        y -= ctx.canvas.clientHeight / 2;
        let fac = VIEW_HEIGHT / ctx.canvas.clientHeight;
        x *= fac;
        y *= fac;
        return [x, y];
    }
}
exports.Renderer = Renderer;
(function (Renderer) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    Renderer.Dependencies = Dependencies;
})(Renderer = exports.Renderer || (exports.Renderer = {}));

},{"./geo":9,"./system":21}],20:[function(require,module,exports){
'use strict';
var particleController_1 = require('./particleController');
var system_1 = require('./system');
const X = 0;
const Y = 1;
class ShipController {
    constructor() {
        this.deps = new ShipController.Dependencies();
        this._ships = new Set();
    }
    init() {
        this.deps.entities.entityAdded.listen(e => { if (e.ship)
            this._ships.add(e); });
        this.deps.entities.entityRemoved.listen(e => { this._ships.delete(e); });
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        for (let e of this._ships) {
            if (e.isDead) {
                continue;
            }
            if (e.ship.direction) {
                let dvAmount = e.ship.accel * seconds;
                let dvx = e.ship.direction[X] * dvAmount;
                let dvy = e.ship.direction[Y] * dvAmount;
                e.physics.velocity[X] += dvx;
                e.physics.velocity[Y] += dvy;
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
                        let pvx = (e.ship.direction[X] * -pSpeed * speedFactor) + e.physics.velocity[X];
                        let pvy = (e.ship.direction[Y] * -pSpeed * speedFactor) + e.physics.velocity[Y];
                        let px = e.position[X] - e.ship.direction[X] * e.physics.radius * 1.2;
                        let py = e.position[Y] - e.ship.direction[Y] * e.physics.radius * 1.2;
                        this.deps.entities.addEntity(particleController_1.ParticleComponent.createParticle([px, py], [pvx, pvy], e.render.color, exhaust.mass, exhaust.radius, 0.3));
                    }
                }
            }
        }
    }
}
exports.ShipController = ShipController;
(function (ShipController) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.entities = null;
        }
    }
    ShipController.Dependencies = Dependencies;
})(ShipController = exports.ShipController || (exports.ShipController = {}));

},{"./particleController":15,"./system":21}],21:[function(require,module,exports){
'use strict';
var System;
(function (System) {
    class Dependencies {
    }
    System.Dependencies = Dependencies;
    /**
     * Topologically sort the systems based on their dependencies.
     */
    function initOrder(sysObject) {
        let systems = new Set();
        for (let name in sysObject) {
            systems.add(name);
        }
        let order = [];
        while (systems.size > 0) {
            let nextItem = null;
            for (let name of systems) {
                let sys = sysObject[name];
                if (dependsOnSet(sys.deps, systems) === false) {
                    // sys doesn't depend on anything still in systems;
                    // it must be the next in the order.
                    nextItem = [name, sys];
                    break;
                }
            }
            if (nextItem == null) {
                // Cyclic dependency?
                return null;
            }
            systems.delete(nextItem[0]);
            order.push(nextItem);
        }
        return order;
    }
    System.initOrder = initOrder;
    function dependsOnSet(deps, systems) {
        for (let name in deps) {
            if (systems.has(name)) {
                return true;
            }
        }
        return false;
    }
    function initSystems(sysObject) {
        let order = initOrder(sysObject);
        if (order == null) {
            // Tsort has failed. Abort.
            return false;
        }
        for (let pair of order) {
            let sys = pair[1];
            // Fill in the dependencies.
            for (let name in sys.deps) {
                sys.deps[name] = sysObject[name];
            }
            sys.init();
        }
        return true;
    }
    System.initSystems = initSystems;
})(System = exports.System || (exports.System = {}));

},{}],22:[function(require,module,exports){
'use strict';
var enemies_1 = require('./enemies');
var geo_1 = require('./geo');
var system_1 = require('./system');
const WAVE_PERIOD = 3;
const GEN_RADIUS = 200;
class WaveGenerator {
    constructor() {
        this.deps = new WaveGenerator.Dependencies();
    }
    init() {
        this.reset();
    }
    reset() {
        this._waveTime = WAVE_PERIOD;
    }
    step(elapsedMs) {
        let seconds = elapsedMs / 1000;
        if (this._waveTime < 0) {
            if (this.deps.enemyController.enemies.size <= 10) {
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
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createFollower(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < tanks; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createTank(p, geo_1.Point.zero()));
        }
        for (let i = 0; i < seekers; ++i) {
            let p = geo_1.geo.math.randCircle(geo_1.Point.zero(), GEN_RADIUS);
            this.deps.entities.addEntity(enemies_1.EnemyComponent.createSeeker(p, geo_1.Point.zero()));
        }
    }
}
exports.WaveGenerator = WaveGenerator;
(function (WaveGenerator) {
    class Dependencies extends system_1.System.Dependencies {
        constructor(...args) {
            super(...args);
            this.enemyController = null;
            this.entities = null;
        }
    }
    WaveGenerator.Dependencies = Dependencies;
})(WaveGenerator = exports.WaveGenerator || (exports.WaveGenerator = {}));

},{"./enemies":2,"./geo":9,"./system":21}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVtaWVzLmpzIiwiYmluL2VuZW1pZXMvZW5lbXlCZWhhdmlvci5qcyIsImJpbi9lbmVtaWVzL2VuZW15Q29tcG9uZW50LmpzIiwiYmluL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyLmpzIiwiYmluL2VudGl0eUNvbnRhaW5lci5qcyIsImJpbi9ldmVudC5qcyIsImJpbi9nYW1lLmpzIiwiYmluL2dlby5qcyIsImJpbi9ndW5uZXJDb250cm9sbGVyLmpzIiwiYmluL2hlYWx0aENvbnRyb2xsZXIuanMiLCJiaW4vaHVkLmpzIiwiYmluL2luZGV4LmpzIiwiYmluL2lucHV0LmpzIiwiYmluL3BhcnRpY2xlQ29udHJvbGxlci5qcyIsImJpbi9waHlzaWNzLmpzIiwiYmluL3BsYXllckNvbnRyb2xsZXIuanMiLCJiaW4vcmVhcGVyLmpzIiwiYmluL3JlbmRlcmVyLmpzIiwiYmluL3NoaXBDb250cm9sbGVyLmpzIiwiYmluL3N5c3RlbS5qcyIsImJpbi93YXZlR2VuZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxudmFyIEJ1bGxldENvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChCdWxsZXRDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJ1bGxldChvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IG9wdGlvbnMudmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjYsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDEsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjEyNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucy5wb3MsXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC40LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiA1LFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnVsbGV0OiB7XHJcbiAgICAgICAgICAgICAgICBkYW1hZ2U6IG9wdGlvbnMuZGFtYWdlLFxyXG4gICAgICAgICAgICAgICAgaXNBbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogb3B0aW9ucy5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBkYW1hZ2VHcm91cDogb3B0aW9ucy5kYW1hZ2VHcm91cCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGFydGljbGU6IHtcclxuICAgICAgICAgICAgICAgIGxpZmVzcGFuOiBvcHRpb25zLmxpZmVzcGFuLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogb3B0aW9ucy5saWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgQnVsbGV0Q29tcG9uZW50LmNyZWF0ZUJ1bGxldCA9IGNyZWF0ZUJ1bGxldDtcclxufSkoQnVsbGV0Q29tcG9uZW50ID0gZXhwb3J0cy5CdWxsZXRDb21wb25lbnQgfHwgKGV4cG9ydHMuQnVsbGV0Q29tcG9uZW50ID0ge30pKTtcclxuY2xhc3MgQnVsbGV0Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgQnVsbGV0Q29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9idWxsZXRzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5idWxsZXQpXHJcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldHMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2J1bGxldHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5kZXBzLnBoeXNpY3MuaW50ZXJzZWN0aW9ucztcclxuICAgICAgICBmb3IgKGxldCBiIG9mIHRoaXMuX2J1bGxldHMpIHtcclxuICAgICAgICAgICAgaWYgKGIuYnVsbGV0LmlzQWxpdmUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnRlcnMgPSBpbnRlcnNlY3Rpb25zLmdldChiKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnMgJiYgaW50ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpIG9mIGludGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3RoZXIgPSBpLmI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdGhlci5oZWFsdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5oZWFsdGhDb250cm9sbGVyLmRhbWFnZUVudGl0eShvdGhlciwgYi5idWxsZXQuZGFtYWdlLCBiLmJ1bGxldC5zb3VyY2UsIGIuYnVsbGV0LmRhbWFnZUdyb3VwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIuYnVsbGV0LmlzQWxpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYi5yZW5kZXIuY29sb3IgPSBcIiM4MDgwODBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSBCdWxsZXRDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEJ1bGxldENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShCdWxsZXRDb250cm9sbGVyID0gZXhwb3J0cy5CdWxsZXRDb250cm9sbGVyIHx8IChleHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWxsZXRDb250cm9sbGVyLmpzLm1hcCIsImZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlCZWhhdmlvcicpKTtcclxuX19leHBvcnQocmVxdWlyZSgnLi9lbmVtaWVzL2VuZW15Q29tcG9uZW50JykpO1xyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyJykpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVtaWVzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4uL2dlbycpO1xyXG52YXIgZ2VvID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxudmFyIEVuZW15QmVoYXZpb3I7XHJcbihmdW5jdGlvbiAoRW5lbXlCZWhhdmlvcikge1xyXG4gICAgKGZ1bmN0aW9uIChNb2RlKSB7XHJcbiAgICAgICAgTW9kZVtNb2RlW1wiRm9sbG93XCJdID0gMF0gPSBcIkZvbGxvd1wiO1xyXG4gICAgICAgIE1vZGVbTW9kZVtcIkNpcmNsZVwiXSA9IDFdID0gXCJDaXJjbGVcIjtcclxuICAgICAgICBNb2RlW01vZGVbXCJTaG9vdFwiXSA9IDJdID0gXCJTaG9vdFwiO1xyXG4gICAgfSkoRW5lbXlCZWhhdmlvci5Nb2RlIHx8IChFbmVteUJlaGF2aW9yLk1vZGUgPSB7fSkpO1xyXG4gICAgdmFyIE1vZGUgPSBFbmVteUJlaGF2aW9yLk1vZGU7XHJcbiAgICAoZnVuY3Rpb24gKENpcmNsZURpcmVjdGlvbikge1xyXG4gICAgICAgIENpcmNsZURpcmVjdGlvbltDaXJjbGVEaXJlY3Rpb25bXCJDbG9ja3dpc2VcIl0gPSAwXSA9IFwiQ2xvY2t3aXNlXCI7XHJcbiAgICAgICAgQ2lyY2xlRGlyZWN0aW9uW0NpcmNsZURpcmVjdGlvbltcIkNvdW50ZXJcIl0gPSAxXSA9IFwiQ291bnRlclwiO1xyXG4gICAgfSkoRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24gfHwgKEVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uID0ge30pKTtcclxuICAgIHZhciBDaXJjbGVEaXJlY3Rpb24gPSBFbmVteUJlaGF2aW9yLkNpcmNsZURpcmVjdGlvbjtcclxuICAgIGNvbnN0IGNpcmNsZU1hdHJpY2VzID0ge1xyXG4gICAgICAgIC8vIC0zMCBkZWdyZWVzXHJcbiAgICAgICAgW0NpcmNsZURpcmVjdGlvbi5DbG9ja3dpc2VdOiBbXHJcbiAgICAgICAgICAgIFtnZW8uQ09TXzMwLCBnZW8uU0lOXzMwXSxcclxuICAgICAgICAgICAgWy1nZW8uU0lOXzMwLCBnZW8uQ09TXzMwXSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIC8vIDMwIGRlZ3JlZXNcclxuICAgICAgICBbQ2lyY2xlRGlyZWN0aW9uLkNvdW50ZXJdOiBbXHJcbiAgICAgICAgICAgIFtnZW8uQ09TXzMwLCAtZ2VvLlNJTl8zMF0sXHJcbiAgICAgICAgICAgIFtnZW8uU0lOXzMwLCBnZW8uQ09TXzMwXSxcclxuICAgICAgICBdLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGJlaGF2aW9yTWFwID0ge1xyXG4gICAgICAgIFtNb2RlLkZvbGxvd106IChlLCBiZWhhdmlvciwgc3lzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBzeXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShnZW9fMS5Qb2ludC5zdWJ0cmFjdChwbGF5ZXIucG9zaXRpb24sIGUucG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW01vZGUuQ2lyY2xlXTogKGUsIGJlaGF2aW9yLCBzeXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IHN5cy5kZXBzLnBsYXllckNvbnRyb2xsZXIucGxheWVyO1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGJlaGF2aW9yLmRhdGE7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG5vcm1hbGl6ZWQgZGlyZWN0aW9uIGZyb20gcGxheWVyIHRvIGVuZW15XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGdlb18xLlBvaW50LnN1YnRyYWN0KGUucG9zaXRpb24sIHBsYXllci5wb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGdlb18yLk1hdHJpeC5wb2ludE11bChjaXJjbGVNYXRyaWNlc1tkYXRhLmRpcmVjdGlvbl0sIG5vcm1hbCk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbWF0gPSB0YXJnZXRbWF0gKiBkYXRhLnJhZGl1cyArIHBsYXllci5wb3NpdGlvbltYXTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtZXSA9IHRhcmdldFtZXSAqIGRhdGEucmFkaXVzICsgcGxheWVyLnBvc2l0aW9uW1ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShnZW9fMS5Qb2ludC5zdWJ0cmFjdCh0YXJnZXQsIGUucG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW01vZGUuU2hvb3RdOiAoZSwgYmVoYXZpb3IsIHN5cykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGJlaGF2aW9yLmRhdGE7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBzeXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHBsYXllci5wb3NpdGlvbiwgZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpcik7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID49IGRhdGEubWluRGlzdGFuY2UgJiYgbGVuIDw9IGRhdGEubWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXJbWF0gLz0gbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpcltZXSAvPSBsZW47XHJcbiAgICAgICAgICAgICAgICAgICAgZS5ndW5uZXIuZGlyZWN0aW9uID0gZGlyO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLmd1bm5lci5kaXJlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gZ2V0QmVoYXZpb3JGdW5jdGlvbihtb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuIGJlaGF2aW9yTWFwW21vZGVdO1xyXG4gICAgfVxyXG4gICAgRW5lbXlCZWhhdmlvci5nZXRCZWhhdmlvckZ1bmN0aW9uID0gZ2V0QmVoYXZpb3JGdW5jdGlvbjtcclxufSkoRW5lbXlCZWhhdmlvciA9IGV4cG9ydHMuRW5lbXlCZWhhdmlvciB8fCAoZXhwb3J0cy5FbmVteUJlaGF2aW9yID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW5lbXlCZWhhdmlvci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBlbmVteUJlaGF2aW9yXzEgPSByZXF1aXJlKCcuL2VuZW15QmVoYXZpb3InKTtcclxudmFyIGhlYWx0aENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4uL2hlYWx0aENvbnRyb2xsZXInKTtcclxudmFyIEVuZW15Q29tcG9uZW50O1xyXG4oZnVuY3Rpb24gKEVuZW15Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGb2xsb3dlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjUsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjRkY4MDAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDIsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbmVteToge1xyXG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5Nb2RlLkNpcmNsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ291bnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDEwMCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEuNSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDEwLFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5FbmVteSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NvcmluZzoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVGb2xsb3dlciA9IGNyZWF0ZUZvbGxvd2VyO1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlVGFuayhwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC40LFxyXG4gICAgICAgICAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIG1hc3M6IDksXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI0QwMDAwMCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMixcclxuICAgICAgICAgICAgICAgIGdsb3c6IDEsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7XHJcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLk1vZGUuQ2lyY2xlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ291bnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDgwLFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogNCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuOCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDMwLFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDMwLFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5FbmVteSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NvcmluZzoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IDIwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rID0gY3JlYXRlVGFuaztcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNlZWtlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC4yNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwRkYwMCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC45LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAzLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHtcclxuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZTogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuTW9kZS5DaXJjbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1czogNixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uLkNvdW50ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLk1vZGUuU2hvb3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpc3RhbmNlOiAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heERpc3RhbmNlOiA0MCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDE1MCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiA1LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAwLjQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBndW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHJhdGU6IDMsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IG51bGwsXHJcbiAgICAgICAgICAgICAgICB0aW1lTGVmdDogMCxcclxuICAgICAgICAgICAgICAgIGRhbWFnZTogNCxcclxuICAgICAgICAgICAgICAgIGRhbWFnZUdyb3VwOiBoZWFsdGhDb250cm9sbGVyXzEuRGFtYWdlR3JvdXAuQWxsICYgfmhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5FbmVteSxcclxuICAgICAgICAgICAgICAgIGJ1bGxldFNwZWVkOiAyMDAsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM4MEZGMDAnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoZWFsdGg6IHtcclxuICAgICAgICAgICAgICAgIGhwOiA1LFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDUsXHJcbiAgICAgICAgICAgICAgICBkYW1hZ2VHcm91cDogaGVhbHRoQ29udHJvbGxlcl8xLkRhbWFnZUdyb3VwLkVuZW15LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzY29yaW5nOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogNSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBlO1xyXG4gICAgfVxyXG4gICAgRW5lbXlDb21wb25lbnQuY3JlYXRlU2Vla2VyID0gY3JlYXRlU2Vla2VyO1xyXG59KShFbmVteUNvbXBvbmVudCA9IGV4cG9ydHMuRW5lbXlDb21wb25lbnQgfHwgKGV4cG9ydHMuRW5lbXlDb21wb25lbnQgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVteUNvbXBvbmVudC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4uL3N5c3RlbScpO1xyXG52YXIgZW5lbXlCZWhhdmlvcl8xID0gcmVxdWlyZSgnLi9lbmVteUJlaGF2aW9yJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgRW5lbXlDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBFbmVteUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5lbmVteSlcclxuICAgICAgICAgICAgdGhpcy5lbmVtaWVzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLmVuZW1pZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGxldCBwbGF5ZXIgPSB0aGlzLmRlcHMucGxheWVyQ29udHJvbGxlci5wbGF5ZXI7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLmVuZW1pZXMpIHtcclxuICAgICAgICAgICAgaWYgKGUuaXNEZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBiIG9mIGUuZW5lbXkuYmVoYXZpb3JzKSB7XHJcbiAgICAgICAgICAgICAgICBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5nZXRCZWhhdmlvckZ1bmN0aW9uKGIubW9kZSkoZSwgYiwgdGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FbmVteUNvbnRyb2xsZXIgPSBFbmVteUNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoRW5lbXlDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShFbmVteUNvbnRyb2xsZXIgPSBleHBvcnRzLkVuZW15Q29udHJvbGxlciB8fCAoZXhwb3J0cy5FbmVteUNvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVteUNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZXZlbnRfMSA9IHJlcXVpcmUoJy4vZXZlbnQnKTtcclxuY2xhc3MgRW50aXR5Q29udGFpbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9jY3VycyBhZnRlciBhbiBlbnRpdHkgaXMgYWRkZWQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBhcmc6IFRoZSBlbnRpdHkgdGhhdCB3YXMgYWRkZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbnRpdHlBZGRlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIGFmdGVyIGFuIGVudGl0eSBpcyByZW1vdmVkIGZyb20gdGhlIGNvbnRhaW5lci5cclxuICAgICAgICAgKiBhcmc6IFRoZSBlbnRpdHkgdGhhdCB3YXMgcmVtb3ZlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eVJlbW92ZWQgPSBuZXcgZXZlbnRfMS5FdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzID0gbmV3IFNldCgpO1xyXG4gICAgICAgIHRoaXMuX25leHRJZCA9IDA7XHJcbiAgICAgICAgdGhpcy5faW5kZXggPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gZW50aXR5IHRvIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5IFRoZSBlbnRpdHkgdG8gYWRkLlxyXG4gICAgICovXHJcbiAgICBhZGRFbnRpdHkoZW50aXR5KSB7XHJcbiAgICAgICAgZW50aXR5LmlkID0gKyt0aGlzLl9uZXh0SWQ7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMuYWRkKGVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5faW5kZXguc2V0KGVudGl0eS5pZCwgZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eUFkZGVkLmVtaXQoZW50aXR5KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBlbnRpdHkgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGVudGl0eSBUaGUgZW50aXR5IHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuX2VudGl0aWVzLmRlbGV0ZShlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuX2luZGV4LmRlbGV0ZShlbnRpdHkuaWQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZC5lbWl0KGVudGl0eSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBhbiBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXHJcbiAgICAgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBlbnRpdHkgdG8gcmV0cmlldmUuXHJcbiAgICAgKi9cclxuICAgIGdldEJ5SWQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5kZXguZ2V0KGlkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkVudGl0eUNvbnRhaW5lciA9IEVudGl0eUNvbnRhaW5lcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW50aXR5Q29udGFpbmVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgRXZlbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gW107XHJcbiAgICB9XHJcbiAgICBlbWl0KHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpc3RlbmVycy5tYXAobCA9PiBsKHZhbHVlKSk7XHJcbiAgICB9XHJcbiAgICBlbWl0QXN5bmModmFsdWUpIHtcclxuICAgICAgICBsZXQgcmVzdWx0cyA9IHRoaXMuZW1pdCh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMubWFwKHYgPT4gdiAmJiB2LnRoZW4gPyB2IDogUHJvbWlzZS5yZXNvbHZlKHYpKSk7XHJcbiAgICB9XHJcbiAgICBsaXN0ZW4obGlzdGVuZXIpIHtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5FdmVudCA9IEV2ZW50O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1ldmVudC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBidWxsZXRDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2J1bGxldENvbnRyb2xsZXInKTtcclxudmFyIGVuZW1pZXNfMSA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xyXG52YXIgZW50aXR5Q29udGFpbmVyXzEgPSByZXF1aXJlKCcuL2VudGl0eUNvbnRhaW5lcicpO1xyXG52YXIgZ3VubmVyQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9ndW5uZXJDb250cm9sbGVyJyk7XHJcbnZhciBoZWFsdGhDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2hlYWx0aENvbnRyb2xsZXInKTtcclxudmFyIGh1ZF8xID0gcmVxdWlyZSgnLi9odWQnKTtcclxudmFyIGlucHV0XzEgPSByZXF1aXJlKCcuL2lucHV0Jyk7XHJcbnZhciBwaHlzaWNzXzEgPSByZXF1aXJlKCcuL3BoeXNpY3MnKTtcclxudmFyIHBhcnRpY2xlQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9wYXJ0aWNsZUNvbnRyb2xsZXInKTtcclxudmFyIHBsYXllckNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGxheWVyQ29udHJvbGxlcicpO1xyXG52YXIgcmVhcGVyXzEgPSByZXF1aXJlKCcuL3JlYXBlcicpO1xyXG52YXIgcmVuZGVyZXJfMSA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKTtcclxudmFyIHNoaXBDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3NoaXBDb250cm9sbGVyJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbnZhciB3YXZlR2VuZXJhdG9yXzEgPSByZXF1aXJlKCcuL3dhdmVHZW5lcmF0b3InKTtcclxuY2xhc3MgQmFzZUdhbWUge1xyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBzeXN0ZW1fMS5TeXN0ZW0uaW5pdFN5c3RlbXModGhpcy5zeXN0ZW1zKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJhc2VHYW1lID0gQmFzZUdhbWU7XHJcbihmdW5jdGlvbiAoQmFzZUdhbWUpIHtcclxuICAgIGNsYXNzIFN5c3RlbXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbmV3IGVudGl0eUNvbnRhaW5lcl8xLkVudGl0eUNvbnRhaW5lcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJhc2VHYW1lLlN5c3RlbXMgPSBTeXN0ZW1zO1xyXG59KShCYXNlR2FtZSA9IGV4cG9ydHMuQmFzZUdhbWUgfHwgKGV4cG9ydHMuQmFzZUdhbWUgPSB7fSkpO1xyXG5jbGFzcyBHYW1lIGV4dGVuZHMgQmFzZUdhbWUge1xyXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcyA9IG5ldyBHYW1lLlN5c3RlbXMoKTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLndhdmVHZW5lcmF0b3Iuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5wbGF5ZXJDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuZW5lbXlDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuc2hpcENvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5ndW5uZXJDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuYnVsbGV0Q29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnBhcnRpY2xlQ29udHJvbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucmVhcGVyLnJlYXAoKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGh5c2ljcy5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmh1ZC5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmlucHV0LnBvc3RTdGVwKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HYW1lID0gR2FtZTtcclxuKGZ1bmN0aW9uIChHYW1lKSB7XHJcbiAgICBjbGFzcyBTeXN0ZW1zIGV4dGVuZHMgQmFzZUdhbWUuU3lzdGVtcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG5ldyBpbnB1dF8xLklucHV0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG5ldyBwaHlzaWNzXzEuUGh5c2ljcygpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IHJlbmRlcmVyXzEuUmVuZGVyZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJDb250cm9sbGVyID0gbmV3IHBsYXllckNvbnRyb2xsZXJfMS5QbGF5ZXJDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hpcENvbnRyb2xsZXIgPSBuZXcgc2hpcENvbnRyb2xsZXJfMS5TaGlwQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW15Q29udHJvbGxlciA9IG5ldyBlbmVtaWVzXzEuRW5lbXlDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29udHJvbGxlciA9IG5ldyBidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmd1bm5lckNvbnRyb2xsZXIgPSBuZXcgZ3VubmVyQ29udHJvbGxlcl8xLkd1bm5lckNvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZUNvbnRyb2xlciA9IG5ldyBwYXJ0aWNsZUNvbnRyb2xsZXJfMS5QYXJ0aWNsZUNvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5oZWFsdGhDb250cm9sbGVyID0gbmV3IGhlYWx0aENvbnRyb2xsZXJfMS5IZWFsdGhDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMud2F2ZUdlbmVyYXRvciA9IG5ldyB3YXZlR2VuZXJhdG9yXzEuV2F2ZUdlbmVyYXRvcigpO1xyXG4gICAgICAgICAgICB0aGlzLmh1ZCA9IG5ldyBodWRfMS5IdWQoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFwZXIgPSBuZXcgcmVhcGVyXzEuUmVhcGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgR2FtZS5TeXN0ZW1zID0gU3lzdGVtcztcclxufSkoR2FtZSA9IGV4cG9ydHMuR2FtZSB8fCAoZXhwb3J0cy5HYW1lID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2FtZS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbmV4cG9ydHMuU0lOXzMwID0gMC41O1xyXG5leHBvcnRzLkNPU18zMCA9IDAuODY2MDM7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxudmFyIFBvaW50O1xyXG4oZnVuY3Rpb24gKFBvaW50KSB7XHJcbiAgICBmdW5jdGlvbiBhZGQoLi4ucG9pbnRzKSB7XHJcbiAgICAgICAgbGV0IHAgPSBbMCwgMF07XHJcbiAgICAgICAgZm9yIChsZXQgcDEgb2YgcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHBbWF0gKz0gcDFbWF07XHJcbiAgICAgICAgICAgIHBbWV0gKz0gcDFbWV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuYWRkID0gYWRkO1xyXG4gICAgZnVuY3Rpb24gc3VidHJhY3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIFtwMVtYXSAtIHAyW1hdLCBwMVtZXSAtIHAyW1ldXTtcclxuICAgIH1cclxuICAgIFBvaW50LnN1YnRyYWN0ID0gc3VidHJhY3Q7XHJcbiAgICBmdW5jdGlvbiBsZW5ndGgocCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQobGVuZ3RoU3F1YXJlZChwKSk7XHJcbiAgICB9XHJcbiAgICBQb2ludC5sZW5ndGggPSBsZW5ndGg7XHJcbiAgICBmdW5jdGlvbiBsZW5ndGhTcXVhcmVkKHApIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5wb3cocFtYXSwgMikgKyBNYXRoLnBvdyhwW1ldLCAyKTtcclxuICAgIH1cclxuICAgIFBvaW50Lmxlbmd0aFNxdWFyZWQgPSBsZW5ndGhTcXVhcmVkO1xyXG4gICAgZnVuY3Rpb24gZGlzdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KGRpc3RTcXVhcmVkKHAxLCBwMikpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZGlzdCA9IGRpc3Q7XHJcbiAgICBmdW5jdGlvbiBkaXN0U3F1YXJlZChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5wb3coKHAxW1hdIC0gcDJbWF0pLCAyKSArIE1hdGgucG93KChwMVtZXSAtIHAyW1ldKSwgMik7XHJcbiAgICB9XHJcbiAgICBQb2ludC5kaXN0U3F1YXJlZCA9IGRpc3RTcXVhcmVkO1xyXG4gICAgZnVuY3Rpb24gZG90KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBwMVtYXSAqIHAyW1hdICsgcDFbWV0gKiBwMltZXTtcclxuICAgIH1cclxuICAgIFBvaW50LmRvdCA9IGRvdDtcclxuICAgIGZ1bmN0aW9uIGNsb25lKHApIHtcclxuICAgICAgICByZXR1cm4gW3BbWF0sIHBbWV1dO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuY2xvbmUgPSBjbG9uZTtcclxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShwKSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IGxlbmd0aChwKTtcclxuICAgICAgICByZXR1cm4gW3BbWF0gLyBsZW4sIHBbWV0gLyBsZW5dO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubm9ybWFsaXplID0gbm9ybWFsaXplO1xyXG4gICAgZnVuY3Rpb24gemVybygpIHtcclxuICAgICAgICByZXR1cm4gWzAsIDBdO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuemVybyA9IHplcm87XHJcbiAgICBmdW5jdGlvbiBwbHVzKHNlbGYsIHApIHtcclxuICAgICAgICBzZWxmW1hdICs9IHBbWF07XHJcbiAgICAgICAgc2VsZltZXSArPSBwW1ldO1xyXG4gICAgfVxyXG4gICAgUG9pbnQucGx1cyA9IHBsdXM7XHJcbn0pKFBvaW50ID0gZXhwb3J0cy5Qb2ludCB8fCAoZXhwb3J0cy5Qb2ludCA9IHt9KSk7XHJcbnZhciBNYXRyaXg7XHJcbihmdW5jdGlvbiAoTWF0cml4KSB7XHJcbiAgICBmdW5jdGlvbiBtdWwoYSwgYikge1xyXG4gICAgICAgIGxldCB2ZWNYID0gcG9pbnRNdWwoYSwgW2JbWF1bWF0sIGJbWV1bWF1dKTtcclxuICAgICAgICBsZXQgdmVjWSA9IHBvaW50TXVsKGEsIFtiW1hdW1ldLCBiW1ldW1ldXSk7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgW3ZlY1hbWF0sIHZlY1lbWF1dLFxyXG4gICAgICAgICAgICBbdmVjWFtZXSwgdmVjWVtZXV0sXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuICAgIE1hdHJpeC5tdWwgPSBtdWw7XHJcbiAgICBmdW5jdGlvbiBwb2ludE11bChhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgUG9pbnQuZG90KGFbWF0sIGIpLFxyXG4gICAgICAgICAgICBQb2ludC5kb3QoYVtZXSwgYiksXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuICAgIE1hdHJpeC5wb2ludE11bCA9IHBvaW50TXVsO1xyXG59KShNYXRyaXggPSBleHBvcnRzLk1hdHJpeCB8fCAoZXhwb3J0cy5NYXRyaXggPSB7fSkpO1xyXG52YXIgZ2VvO1xyXG4oZnVuY3Rpb24gKGdlbykge1xyXG4gICAgdmFyIG1hdGg7XHJcbiAgICAoZnVuY3Rpb24gKG1hdGgpIHtcclxuICAgICAgICBmdW5jdGlvbiByYW5kQmV0d2VlbihtaW4sIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLnJhbmRCZXR3ZWVuID0gcmFuZEJldHdlZW47XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZENpcmNsZShjZW50ZXIsIHJhZGl1cykge1xyXG4gICAgICAgICAgICAvLyBSZXBlYXQgdW50aWwgKHgseSkgaXMgaW5zaWRlIHRoZSB1bml0IGNpcmNsZS5cclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gcmFuZEJldHdlZW4oLTEsIDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSByYW5kQmV0d2VlbigtMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5wb3coeCwgMikgKyBNYXRoLnBvdyh5LCAyKSA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeCAqIHJhZGl1cyArIGNlbnRlcltYXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSAqIHJhZGl1cyArIGNlbnRlcltZXSxcclxuICAgICAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZENpcmNsZSA9IHJhbmRDaXJjbGU7XHJcbiAgICAgICAgLy8gQXBwcm94LiB1c2luZyBzdW0gb2YgMyB1bmlmb3JtIHJhbmRvbSBudW1iZXJzLlxyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRHYXVzcyhtZWFuLCBkZXYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKSArIE1hdGgucmFuZG9tKCkgLSAxLjUpICogMC42NyAqIGRldiArIG1lYW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZEdhdXNzID0gcmFuZEdhdXNzO1xyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRHYXVzczJkKGNlbnRlciwgZGV2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICByYW5kR2F1c3MoY2VudGVyW1hdLCBkZXYpLFxyXG4gICAgICAgICAgICAgICAgcmFuZEdhdXNzKGNlbnRlcltZXSwgZGV2KSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MyZCA9IHJhbmRHYXVzczJkO1xyXG4gICAgICAgIGZ1bmN0aW9uIGxlcnAobWluLCBtYXgsIHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHggKiAobWF4IC0gbWluKSArIG1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5sZXJwID0gbGVycDtcclxuICAgICAgICBmdW5jdGlvbiBjbGFtcChtaW4sIHgsIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCB4KSwgbWF4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5jbGFtcCA9IGNsYW1wO1xyXG4gICAgfSkobWF0aCA9IGdlby5tYXRoIHx8IChnZW8ubWF0aCA9IHt9KSk7XHJcbn0pKGdlbyA9IGV4cG9ydHMuZ2VvIHx8IChleHBvcnRzLmdlbyA9IHt9KSk7XHJcbmV4cG9ydHMuZGVmYXVsdCA9IGdlbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2VvLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgYnVsbGV0Q29udHJvbGxlcl8yID0gcmVxdWlyZSgnLi9idWxsZXRDb250cm9sbGVyJyk7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgR3VubmVyQ29tcG9uZW50IHtcclxufVxyXG5leHBvcnRzLkd1bm5lckNvbXBvbmVudCA9IEd1bm5lckNvbXBvbmVudDtcclxuY29uc3QgQlVMTEVUX0xJRkVTUEFOID0gNDtcclxuY2xhc3MgR3VubmVyQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgYnVsbGV0Q29udHJvbGxlcl8yLkJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5fZ3VubmVycyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuZ3VubmVyKVxyXG4gICAgICAgICAgICB0aGlzLl9ndW5uZXJzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9ndW5uZXJzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX2d1bm5lcnMpIHtcclxuICAgICAgICAgICAgaWYgKGUuZ3VubmVyLmRpcmVjdGlvbiAmJiBlLmd1bm5lci50aW1lTGVmdCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gZS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBlLmd1bm5lci5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICBsZXQgdmVsID0gWzAsIDBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5waHlzaWNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVsID0gZS5waHlzaWNzLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICAgICAgICAgIHJhZCA9IGUucGh5c2ljcy5yYWRpdXM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3UG9zID0gZ2VvXzEuUG9pbnQuY2xvbmUocG9zKTtcclxuICAgICAgICAgICAgICAgIG5ld1Bvc1tYXSArPSBkaXJbWF0gKiByYWQgKiAxLjU7XHJcbiAgICAgICAgICAgICAgICBuZXdQb3NbWV0gKz0gZGlyW1ldICogcmFkICogMS41O1xyXG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZlbCA9IGdlb18xLlBvaW50LmNsb25lKHZlbCk7XHJcbiAgICAgICAgICAgICAgICBuZXdWZWxbWF0gKz0gZGlyW1hdICogZS5ndW5uZXIuYnVsbGV0U3BlZWQ7XHJcbiAgICAgICAgICAgICAgICBuZXdWZWxbWV0gKz0gZGlyW1ldICogZS5ndW5uZXIuYnVsbGV0U3BlZWQ7XHJcbiAgICAgICAgICAgICAgICBlLmd1bm5lci50aW1lTGVmdCA9IDEgLyBlLmd1bm5lci5yYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShidWxsZXRDb250cm9sbGVyXzEuQnVsbGV0Q29tcG9uZW50LmNyZWF0ZUJ1bGxldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZGFtYWdlOiBlLmd1bm5lci5kYW1hZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGUuZ3VubmVyLmRhbWFnZUdyb3VwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvczogbmV3UG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIHZlbDogbmV3VmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZSxcclxuICAgICAgICAgICAgICAgICAgICBsaWZlc3BhbjogQlVMTEVUX0xJRkVTUEFOLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBlLmd1bm5lci5jb2xvcixcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLmd1bm5lci50aW1lTGVmdCA9IE1hdGgubWF4KDAsIGUuZ3VubmVyLnRpbWVMZWZ0IC0gc2Vjb25kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuR3VubmVyQ29udHJvbGxlciA9IEd1bm5lckNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoR3VubmVyQ29udHJvbGxlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0Q29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgR3VubmVyQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEd1bm5lckNvbnRyb2xsZXIgPSBleHBvcnRzLkd1bm5lckNvbnRyb2xsZXIgfHwgKGV4cG9ydHMuR3VubmVyQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWd1bm5lckNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG4oZnVuY3Rpb24gKERhbWFnZUdyb3VwKSB7XHJcbiAgICBEYW1hZ2VHcm91cFtEYW1hZ2VHcm91cFtcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xyXG4gICAgRGFtYWdlR3JvdXBbRGFtYWdlR3JvdXBbXCJQbGF5ZXJcIl0gPSAxXSA9IFwiUGxheWVyXCI7XHJcbiAgICBEYW1hZ2VHcm91cFtEYW1hZ2VHcm91cFtcIkVuZW15XCJdID0gMl0gPSBcIkVuZW15XCI7XHJcbiAgICBEYW1hZ2VHcm91cFtEYW1hZ2VHcm91cFtcIkFsbFwiXSA9IDIxNDc0ODM2NDddID0gXCJBbGxcIjtcclxufSkoZXhwb3J0cy5EYW1hZ2VHcm91cCB8fCAoZXhwb3J0cy5EYW1hZ2VHcm91cCA9IHt9KSk7XHJcbnZhciBEYW1hZ2VHcm91cCA9IGV4cG9ydHMuRGFtYWdlR3JvdXA7XHJcbmNsYXNzIEhlYWx0aENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEhlYWx0aENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5faGVhbHRoRW50aXRpZXMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLmhlYWx0aClcclxuICAgICAgICAgICAgdGhpcy5faGVhbHRoRW50aXRpZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2hlYWx0aEVudGl0aWVzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBkYW1hZ2VFbnRpdHkoZW50aXR5LCBkYW1hZ2UsIHNvdXJjZSwgZGFtYWdlR3JvdXApIHtcclxuICAgICAgICBpZiAoZGFtYWdlR3JvdXAgPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBkYW1hZ2VHcm91cCA9IERhbWFnZUdyb3VwLkFsbDtcclxuICAgICAgICBpZiAoZW50aXR5LmhlYWx0aCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhbWFnZUdyb3VwICYgZW50aXR5LmhlYWx0aC5kYW1hZ2VHcm91cCkge1xyXG4gICAgICAgICAgICBlbnRpdHkuaGVhbHRoLmhwIC09IGRhbWFnZTtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5oZWFsdGguaHAgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLnJlYXBlci5raWxsRW50aXR5KGVudGl0eSwgc291cmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkhlYWx0aENvbnRyb2xsZXIgPSBIZWFsdGhDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEhlYWx0aENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVhcGVyID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSGVhbHRoQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEhlYWx0aENvbnRyb2xsZXIgPSBleHBvcnRzLkhlYWx0aENvbnRyb2xsZXIgfHwgKGV4cG9ydHMuSGVhbHRoQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhlYWx0aENvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIEh1ZCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgSHVkLkRlcGVuZGVuY2llcygpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3Vyc29yRGlzcGxheSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnNvckRpc3BsYXkgPSB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogWzAsIDBdLFxyXG4gICAgICAgICAgICAgICAgcmVuZGVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjODA4MDgwJyxcclxuICAgICAgICAgICAgICAgICAgICBhbHBoYTogMC4zLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgICAgICBzaGFwZTogJ2hleGFnb24nLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC4xMjUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4Qmx1cjogMSxcclxuICAgICAgICAgICAgICAgICAgICBnbG93OiAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eSh0aGlzLl9jdXJzb3JEaXNwbGF5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGN1cnNvciA9IHRoaXMuZGVwcy5pbnB1dC5jdXJzb3I7XHJcbiAgICAgICAgaWYgKGN1cnNvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJzb3JEaXNwbGF5LnBvc2l0aW9uID0gZ2VvXzEuUG9pbnQuY2xvbmUoY3Vyc29yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2Rpc3BsYXlDb250cm9sbGVyICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5U2NvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkaXNwbGF5U2NvcmUoKSB7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5kZXBzLnBsYXllckNvbnRyb2xsZXIuc2NvcmU7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXIuc2NvcmUuc2V0VmFsdWUoc2NvcmUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBzZXREaXNwbGF5Q29udHJvbGxlcihoZGMpIHtcclxuICAgICAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlciA9IGhkYztcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkh1ZCA9IEh1ZDtcclxuKGZ1bmN0aW9uIChIdWQpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBIdWQuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShIdWQgPSBleHBvcnRzLkh1ZCB8fCAoZXhwb3J0cy5IdWQgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1odWQuanMubWFwIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3Mvbm9kZS9ub2RlLmQudHNcIiAvPlxyXG4ndXNlIHN0cmljdCc7XHJcbnZhciBnYW1lXzEgPSByZXF1aXJlKCcuL2dhbWUnKTtcclxudmFyIGhlYWx0aENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vaGVhbHRoQ29udHJvbGxlcicpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxubGV0IG1haW5DYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpbkNhbnZhcycpO1xyXG5sZXQgZ2FtZSA9IG5ldyBnYW1lXzEuR2FtZSgpO1xyXG5nYW1lLmluaXQoKTtcclxuZ2FtZS5zeXN0ZW1zLnJlbmRlcmVyLnNldENhbnZhcyhtYWluQ2FudmFzKTtcclxuY2xhc3MgRWxlbWVudEJpbmRpbmcge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgYXR0cmlidXRlKSB7XHJcbiAgICAgICAgYXR0cmlidXRlID0gYXR0cmlidXRlIHx8ICdpbm5lclRleHQnO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGUgPSBhdHRyaWJ1dGU7XHJcbiAgICB9XHJcbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudFt0aGlzLmF0dHJpYnV0ZV0gPSB2YWx1ZTtcclxuICAgIH1cclxufVxyXG52YXIgaHVkRGlzcGxheUNvbnRyb2xsZXIgPSB7XHJcbiAgICBzY29yZTogbmV3IEVsZW1lbnRCaW5kaW5nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNodWRfc2NvcmUnKSksXHJcbn07XHJcbmdhbWUuc3lzdGVtcy5odWQuc2V0RGlzcGxheUNvbnRyb2xsZXIoaHVkRGlzcGxheUNvbnRyb2xsZXIpO1xyXG5sZXQgbGFzdFN0ZXBUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbmxldCB0aW1lc2NhbGUgPSAxO1xyXG5zZXRUaW1lb3V0KGZ1bmN0aW9uIHN0ZXAoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGxldCBzdGVwVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGdhbWUuc3RlcCgoc3RlcFRpbWUgLSBsYXN0U3RlcFRpbWUpICogdGltZXNjYWxlKTtcclxuICAgICAgICBsYXN0U3RlcFRpbWUgPSBzdGVwVGltZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG4gICAgc2V0VGltZW91dChzdGVwLCAzMCk7XHJcbn0sIDMwKTtcclxuZ2FtZS5zeXN0ZW1zLmVudGl0aWVzLmFkZEVudGl0eSh7XHJcbiAgICBwb3NpdGlvbjogWzAsIDBdLFxyXG4gICAgcGh5c2ljczoge1xyXG4gICAgICAgIHZlbG9jaXR5OiBbMCwgMF0sXHJcbiAgICAgICAgcmFkaXVzOiAxLFxyXG4gICAgICAgIGRyYWc6IDIsXHJcbiAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgbWFzczogMSxcclxuICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgY29sbGlkZTogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICByZW5kZXI6IHtcclxuICAgICAgICBjb2xvcjogJyMwMEEwRkYnLFxyXG4gICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgIHNoYXBlOiAnaGV4YWdvbicsXHJcbiAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgbGluZVdpZHRoOiAwLjI1LFxyXG4gICAgICAgIG1heEJsdXI6IDMsXHJcbiAgICAgICAgZ2xvdzogMSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgICBzY29yZTogMCxcclxuICAgIH0sXHJcbiAgICBzaGlwOiB7XHJcbiAgICAgICAgYWNjZWw6IDYwMCxcclxuICAgICAgICBleGhhdXN0OiB7XHJcbiAgICAgICAgICAgIHJhdGU6IDgwLFxyXG4gICAgICAgICAgICBtYXNzOiAwLjYsXHJcbiAgICAgICAgICAgIHJhZGl1czogMC4zLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgZ3VubmVyOiB7XHJcbiAgICAgICAgcmF0ZTogMTAsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBudWxsLFxyXG4gICAgICAgIHRpbWVMZWZ0OiAwLFxyXG4gICAgICAgIGRhbWFnZTogNixcclxuICAgICAgICBkYW1hZ2VHcm91cDogaGVhbHRoQ29udHJvbGxlcl8xLkRhbWFnZUdyb3VwLkFsbCAmIH5oZWFsdGhDb250cm9sbGVyXzEuRGFtYWdlR3JvdXAuUGxheWVyLFxyXG4gICAgICAgIGJ1bGxldFNwZWVkOiAyMDAsXHJcbiAgICAgICAgY29sb3I6ICcjNDBBMEZGJyxcclxuICAgIH0sXHJcbiAgICBoZWFsdGg6IHtcclxuICAgICAgICBocDogNTAsXHJcbiAgICAgICAgbWF4SHA6IDUwLFxyXG4gICAgICAgIGRhbWFnZUdyb3VwOiBoZWFsdGhDb250cm9sbGVyXzEuRGFtYWdlR3JvdXAuUGxheWVyLFxyXG4gICAgfSxcclxufSk7XHJcbmxldCBrZXlNYXAgPSB7XHJcbiAgICA4MTogaW5wdXRfMS5LZXkuVXBMZWZ0LFxyXG4gICAgODc6IGlucHV0XzEuS2V5LlVwLFxyXG4gICAgNjk6IGlucHV0XzEuS2V5LlVwUmlnaHQsXHJcbiAgICA2NTogaW5wdXRfMS5LZXkuRG93bkxlZnQsXHJcbiAgICA4MzogaW5wdXRfMS5LZXkuRG93bixcclxuICAgIDY4OiBpbnB1dF8xLktleS5Eb3duUmlnaHQsXHJcbn07XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcclxuICAgIGxldCBrZXkgPSBrZXlNYXBbZS5rZXlDb2RlXTtcclxuICAgIGlmIChrZXkgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleURvd24oa2V5KTtcclxuICAgIH1cclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XHJcbiAgICBsZXQga2V5ID0ga2V5TWFwW2Uua2V5Q29kZV07XHJcbiAgICBpZiAoa2V5ICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlVcChrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB7XHJcbiAgICBsZXQgcmVjdCA9IG1haW5DYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgcCA9IFtcclxuICAgICAgICBlLmNsaWVudFggLSByZWN0LmxlZnQsXHJcbiAgICAgICAgZS5jbGllbnRZIC0gcmVjdC50b3AsXHJcbiAgICBdO1xyXG4gICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmN1cnNvciA9IGdhbWUuc3lzdGVtcy5yZW5kZXJlci5zY3JlZW5Ub1dvcmxkKHApO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XHJcbiAgICBnYW1lLnN5c3RlbXMuaW5wdXQua2V5RG93bihpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcclxuICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlVcChpbnB1dF8xLktleS5GaXJlKTtcclxufSk7XHJcbmxldCBsYXN0UmVuZGVyVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgbGV0IHJlbmRlclRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIGdhbWUuc3lzdGVtcy5yZW5kZXJlci5yZW5kZXIocmVuZGVyVGltZSAtIGxhc3RSZW5kZXJUaW1lKTtcclxuICAgIGxhc3RSZW5kZXJUaW1lID0gcmVuZGVyVGltZTtcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xyXG59KTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG4oZnVuY3Rpb24gKEtleSkge1xyXG4gICAgS2V5W0tleVtcIlVwTGVmdFwiXSA9IDBdID0gXCJVcExlZnRcIjtcclxuICAgIEtleVtLZXlbXCJVcFwiXSA9IDFdID0gXCJVcFwiO1xyXG4gICAgS2V5W0tleVtcIlVwUmlnaHRcIl0gPSAyXSA9IFwiVXBSaWdodFwiO1xyXG4gICAgS2V5W0tleVtcIkRvd25MZWZ0XCJdID0gM10gPSBcIkRvd25MZWZ0XCI7XHJcbiAgICBLZXlbS2V5W1wiRG93blwiXSA9IDRdID0gXCJEb3duXCI7XHJcbiAgICBLZXlbS2V5W1wiRG93blJpZ2h0XCJdID0gNV0gPSBcIkRvd25SaWdodFwiO1xyXG4gICAgS2V5W0tleVtcIkZpcmVcIl0gPSA2XSA9IFwiRmlyZVwiO1xyXG59KShleHBvcnRzLktleSB8fCAoZXhwb3J0cy5LZXkgPSB7fSkpO1xyXG52YXIgS2V5ID0gZXhwb3J0cy5LZXk7XHJcbihmdW5jdGlvbiAoS2V5U3RhdGUpIHtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiUHJlc3NpbmdcIl0gPSAwXSA9IFwiUHJlc3NpbmdcIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XHJcbiAgICBLZXlTdGF0ZVtLZXlTdGF0ZVtcIlJlbGVhc2luZ1wiXSA9IDJdID0gXCJSZWxlYXNpbmdcIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiVXBcIl0gPSAzXSA9IFwiVXBcIjtcclxufSkoZXhwb3J0cy5LZXlTdGF0ZSB8fCAoZXhwb3J0cy5LZXlTdGF0ZSA9IHt9KSk7XHJcbnZhciBLZXlTdGF0ZSA9IGV4cG9ydHMuS2V5U3RhdGU7XHJcbnZhciBLZXlTdGF0ZTtcclxuKGZ1bmN0aW9uIChLZXlTdGF0ZSkge1xyXG4gICAgZnVuY3Rpb24gaXNEb3duKHN0YXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlIDwgMjtcclxuICAgIH1cclxuICAgIEtleVN0YXRlLmlzRG93biA9IGlzRG93bjtcclxufSkoS2V5U3RhdGUgPSBleHBvcnRzLktleVN0YXRlIHx8IChleHBvcnRzLktleVN0YXRlID0ge30pKTtcclxuY2xhc3MgSW5wdXQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0ge307XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlID0gW107XHJcbiAgICAgICAgbGV0IGtleUNvdW50ID0gT2JqZWN0LmtleXMoS2V5KS5sZW5ndGggLyAyO1xyXG4gICAgICAgIHRoaXMuX2tleXMgPSBuZXcgQXJyYXkoa2V5Q291bnQpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5Q291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuVXA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaW5pdCgpIHsgfVxyXG4gICAgZ2V0S2V5KGtleSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlzW2tleV07XHJcbiAgICB9XHJcbiAgICBrZXlEb3duKGtleSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9rZXlzW2tleV0gIT0gS2V5U3RhdGUuRG93bikge1xyXG4gICAgICAgICAgICB0aGlzLl9rZXlzW2tleV0gPSBLZXlTdGF0ZS5QcmVzc2luZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBrZXlVcChrZXkpIHtcclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UucHVzaChrZXkpO1xyXG4gICAgfVxyXG4gICAgcG9zdFN0ZXAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9rZXlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9rZXlzW2ldID09IEtleVN0YXRlLlByZXNzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuRG93bjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9rZXlzW2ldID09IEtleVN0YXRlLlJlbGVhc2luZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5c1tpXSA9IEtleVN0YXRlLlVwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiB0aGlzLl90b1JlbGVhc2UpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2tleXNba2V5XSAhPSBLZXlTdGF0ZS5VcCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5c1trZXldID0gS2V5U3RhdGUuUmVsZWFzaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZS5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSW5wdXQgPSBJbnB1dDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5wdXQuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG52YXIgUGFydGljbGVDb21wb25lbnQ7XHJcbihmdW5jdGlvbiAoUGFydGljbGVDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVBhcnRpY2xlKHBvcywgdmVsLCBjb2xvciwgbWFzcywgcmFkaXVzLCBsaWZlc3Bhbikge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBwb3MsXHJcbiAgICAgICAgICAgIHBoeXNpY3M6IHtcclxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWwsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiBtYXNzLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC4yNSxcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IGZhbHNlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICByYWRpdXM6IHJhZGl1cyxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDEsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYXJ0aWNsZToge1xyXG4gICAgICAgICAgICAgICAgbGlmZXNwYW46IGxpZmVzcGFuLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICBjb3VudDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgUGFydGljbGVDb21wb25lbnQuY3JlYXRlUGFydGljbGUgPSBjcmVhdGVQYXJ0aWNsZTtcclxufSkoUGFydGljbGVDb21wb25lbnQgPSBleHBvcnRzLlBhcnRpY2xlQ29tcG9uZW50IHx8IChleHBvcnRzLlBhcnRpY2xlQ29tcG9uZW50ID0ge30pKTtcclxuY2xhc3MgUGFydGljbGVDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQYXJ0aWNsZUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5tYXhQYXJ0aWNsZXMgPSAyMDA7XHJcbiAgICAgICAgdGhpcy5fcGFydGljbGVDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5fcGFydGljbGVzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGljbGVzLmFkZChlKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKyt0aGlzLl9wYXJ0aWNsZUNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYXJ0aWNsZUNvdW50ID4gdGhpcy5tYXhQYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRvRGVsZXRlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBlMiBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlMi5wYXJ0aWNsZS5jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvRGVsZXRlID0gZTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMucmVtb3ZlRW50aXR5KHRvRGVsZXRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHtcclxuICAgICAgICAgICAgaWYgKGUucGFydGljbGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BhcnRpY2xlcy5kZWxldGUoZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZS5jb3VudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC0tdGhpcy5fcGFydGljbGVDb3VudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl9wYXJ0aWNsZXMpIHtcclxuICAgICAgICAgICAgaWYgKGUucGFydGljbGUudGltZVJlbWFpbmluZyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMucmVtb3ZlRW50aXR5KGUpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5yZW5kZXIuYWxwaGEgPSBlLnBhcnRpY2xlLnRpbWVSZW1haW5pbmcgLyBlLnBhcnRpY2xlLmxpZmVzcGFuO1xyXG4gICAgICAgICAgICBlLnBhcnRpY2xlLnRpbWVSZW1haW5pbmcgLT0gc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QYXJ0aWNsZUNvbnRyb2xsZXIgPSBQYXJ0aWNsZUNvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoUGFydGljbGVDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNsZUNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShQYXJ0aWNsZUNvbnRyb2xsZXIgPSBleHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciB8fCAoZXhwb3J0cy5QYXJ0aWNsZUNvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJ0aWNsZUNvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNvbnN0IFdPUkxEX0RSQUcgPSA0O1xyXG5jbGFzcyBQaHlzaWNzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQaHlzaWNzLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuaXRlcmF0aW9ucyA9IDQ7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHRoaXMuX3BoeXNPYmplY3RzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5waHlzaWNzKVxyXG4gICAgICAgICAgICB0aGlzLl9waHlzT2JqZWN0cy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fcGh5c09iamVjdHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnNlY3Rpb25zLmNsZWFyKCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLml0ZXJhdGlvbnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IHRoaXMuc3RlcEludGVybmFsKGVsYXBzZWRNcyAvIHRoaXMuaXRlcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGludGVyIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkSW50ZXJzZWN0aW9uKGludGVyLmEsIGludGVyLmIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYiwgaW50ZXIuYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRJbnRlcnNlY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGxldCBpbnRlcnMgPSB0aGlzLmludGVyc2VjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgIGlmIChpbnRlcnMgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGludGVycyA9IFtdO1xyXG4gICAgICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuc2V0KGEsIGludGVycyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGludGVycy5wdXNoKHsgYTogYSwgYjogYiB9KTtcclxuICAgIH1cclxuICAgIHN0ZXBJbnRlcm5hbChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuX3BoeXNPYmplY3RzKSB7XHJcbiAgICAgICAgICAgIGxldCBwaHlzID0gZW50aXR5LnBoeXNpY3M7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBlbnRpdHkucG9zaXRpb247XHJcbiAgICAgICAgICAgIGxldCB2ZWwgPSBwaHlzLnZlbG9jaXR5O1xyXG4gICAgICAgICAgICBwb3NbWF0gKz0gdmVsW1hdICogc2Vjb25kcztcclxuICAgICAgICAgICAgcG9zW1ldICs9IHZlbFtZXSAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgIGxldCBkcmFnQ29lZmYgPSBNYXRoLnBvdyhNYXRoLkUsIC1XT1JMRF9EUkFHICogcGh5cy5kcmFnICogc2Vjb25kcyk7XHJcbiAgICAgICAgICAgIHZlbFtYXSAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHZlbFtZXSAqPSBkcmFnQ29lZmY7XHJcbiAgICAgICAgICAgIHBoeXMudGhldGEgKz0gcGh5cy5vbWVnYSAqIHNlY29uZHM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5maW5kSW50ZXJzZWN0aW9ucygpO1xyXG4gICAgICAgIHRoaXMuY29ycmVjdENvbGxpc2lvbnMoaW50ZXJzZWN0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XHJcbiAgICB9XHJcbiAgICBmaW5kSW50ZXJzZWN0aW9ucygpIHtcclxuICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0ID0gW107XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3BoeXNPYmplY3RzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5waHlzaWNzLmNvbGxpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU29ydCBieSBsZWZ0bW9zdCBib3VuZCBvZiBjaXJjbGUuXHJcbiAgICAgICAgbGlzdC5zb3J0KChhLCBiKSA9PiBNYXRoLnNpZ24oKGEucG9zaXRpb25bWF0gLSBhLnBoeXNpY3MucmFkaXVzKSAtIChiLnBvc2l0aW9uW1hdIC0gYi5waHlzaWNzLnJhZGl1cykpKTtcclxuICAgICAgICAvLyBTd2VlcCBsZWZ0LXRvLXJpZ2h0IHRocm91Z2ggdGhlIGVudGl0aWVzLlxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgYSA9IGxpc3RbaV07XHJcbiAgICAgICAgICAgIGxldCByaWdodEVkZ2UgPSBhLnBvc2l0aW9uW1hdICsgYS5waHlzaWNzLnJhZGl1cztcclxuICAgICAgICAgICAgLy8gQ2hlY2sgb25seSBlbnRpdGllcyB0byB0aGUgcmlnaHQgb2YgYTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgbGlzdC5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGIgPSBsaXN0W2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGIucG9zaXRpb25bWF0gLSBiLnBoeXNpY3MucmFkaXVzID49IHJpZ2h0RWRnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGludGVyc2VjdGlvbnMgYXJlIHBvc3NpYmxlIGFmdGVyIHRoaXMuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFkU3FyID0gTWF0aC5wb3coKGEucGh5c2ljcy5yYWRpdXMgKyBiLnBoeXNpY3MucmFkaXVzKSwgMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzdFNxciA9IGdlb18xLlBvaW50LmRpc3RTcXVhcmVkKGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3RTcXIgPCByYWRTcXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3Rpb25zLnB1c2goeyBhOiBhLCBiOiBiIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xyXG4gICAgfVxyXG4gICAgY29ycmVjdENvbGxpc2lvbnMoaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgIGxldCBjb3JyZWN0aW9ucyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGxldCBpIG9mIGludGVyc2VjdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGEgPSBpLmE7XHJcbiAgICAgICAgICAgIGxldCBiID0gaS5iO1xyXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBkaWZmZXJlbmNlIGluIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBsZXQgZGlmUCA9IGdlb18xLlBvaW50LnN1YnRyYWN0KGIucG9zaXRpb24sIGEucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpZlApO1xyXG4gICAgICAgICAgICAvLyBOb3JtYWxpemUgdGhlIGRpZmZlcmVuY2UuXHJcbiAgICAgICAgICAgIGxldCBub3JtYWwgPSBbZGlmUFtYXSAvIGxlbiwgZGlmUFtZXSAvIGxlbl07XHJcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGRpZmZlcmVuY2UgaW4gdmVsb2NpdHkuXHJcbiAgICAgICAgICAgIGxldCBkaWZWID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QoYi5waHlzaWNzLnZlbG9jaXR5LCBhLnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICBsZXQgZG90ID0gZ2VvXzEuUG9pbnQuZG90KGRpZlYsIG5vcm1hbCk7XHJcbiAgICAgICAgICAgIGxldCBib3VuY2UgPSBhLnBoeXNpY3MuYm91bmNlICogYi5waHlzaWNzLmJvdW5jZTtcclxuICAgICAgICAgICAgbGV0IGR2ID0gW25vcm1hbFtYXSAqIGRvdCAqIGJvdW5jZSwgbm9ybWFsW1ldICogZG90ICogYm91bmNlXTtcclxuICAgICAgICAgICAgbGV0IHRvdGFsTWFzcyA9IGEucGh5c2ljcy5tYXNzICsgYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eVtYXSArPSBkdltYXSAqIGIucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBhLnBoeXNpY3MudmVsb2NpdHlbWV0gKz0gZHZbWV0gKiBiLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYi5waHlzaWNzLnZlbG9jaXR5W1hdIC09IGR2W1hdICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGIucGh5c2ljcy52ZWxvY2l0eVtZXSAtPSBkdltZXSAqIGEucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICAvLyBEaXNwbGFjZSB0aGUgZW50aXRpZXMgb3V0IG9mIGVhY2ggb3RoZXIuXHJcbiAgICAgICAgICAgIGxldCBjb3JBID0gY29ycmVjdGlvbnMuZ2V0KGEpO1xyXG4gICAgICAgICAgICBpZiAoY29yQSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvckEgPSB7IGQ6IFswLCAwXSwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGEsIGNvckEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBjb3JCID0gY29ycmVjdGlvbnMuZ2V0KGIpO1xyXG4gICAgICAgICAgICBpZiAoY29yQiA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvckIgPSB7IGQ6IFswLCAwXSwgbWFzczogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29ycmVjdGlvbnMuc2V0KGIsIGNvckIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBkaXNwbGFjZSA9IChhLnBoeXNpY3MucmFkaXVzICsgYi5waHlzaWNzLnJhZGl1cykgLSBsZW47XHJcbiAgICAgICAgICAgIGxldCBkaXNYID0gbm9ybWFsW1hdICogZGlzcGxhY2U7XHJcbiAgICAgICAgICAgIGxldCBkaXNZID0gbm9ybWFsW1ldICogZGlzcGxhY2U7XHJcbiAgICAgICAgICAgIGNvckEuZFtYXSAtPSBkaXNYICogYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckEuZFtZXSAtPSBkaXNZICogYi5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckEubWFzcyArPSB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGNvckIuZFtYXSArPSBkaXNYICogYS5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckIuZFtZXSArPSBkaXNZICogYS5waHlzaWNzLm1hc3M7XHJcbiAgICAgICAgICAgIGNvckIubWFzcyArPSB0b3RhbE1hc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGt2cCBvZiBjb3JyZWN0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgZSA9IGt2cFswXTtcclxuICAgICAgICAgICAgbGV0IGNvciA9IGt2cFsxXTtcclxuICAgICAgICAgICAgbGV0IGR4ID0gY29yLmRbWF0gLyBjb3IubWFzcyAqIDEuMDU7XHJcbiAgICAgICAgICAgIGxldCBkeSA9IGNvci5kW1ldIC8gY29yLm1hc3MgKiAxLjA1O1xyXG4gICAgICAgICAgICBlLnBvc2l0aW9uW1hdICs9IGR4O1xyXG4gICAgICAgICAgICBlLnBvc2l0aW9uW1ldICs9IGR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBoeXNpY3MgPSBQaHlzaWNzO1xyXG4oZnVuY3Rpb24gKFBoeXNpY3MpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFBoeXNpY3MuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShQaHlzaWNzID0gZXhwb3J0cy5QaHlzaWNzIHx8IChleHBvcnRzLlBoeXNpY3MgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1waHlzaWNzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIGdlb18yID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIGlucHV0XzEgPSByZXF1aXJlKCcuL2lucHV0Jyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgUGxheWVyQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgUGxheWVyQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLnBsYXllciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgPSAwO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wbGF5ZXIgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZSA9PSB0aGlzLnBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLnJlYXBlci5lbnRpdHlLaWxsZWQubGlzdGVuKGFyZ3MgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYXJncy5raWxsZXIucGxheWVyICYmIGFyZ3MuZW50aXR5LnNjb3JpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gYXJncy5lbnRpdHkuc2NvcmluZy52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHRoaXMucGxheWVyID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZHZ4ID0gMDtcclxuICAgICAgICBsZXQgZHZ5ID0gMDtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5VcCkpKVxyXG4gICAgICAgICAgICBkdnkgLT0gMTtcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duKSkpXHJcbiAgICAgICAgICAgIGR2eSArPSAxO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSAtPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwUmlnaHQpKSkge1xyXG4gICAgICAgICAgICBkdnggKz0gZ2VvXzIuQ09TXzMwO1xyXG4gICAgICAgICAgICBkdnkgLT0gZ2VvXzIuU0lOXzMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5Eb3duTGVmdCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCAtPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkRvd25SaWdodCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCArPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSArPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsZW4gPSBNYXRoLnNxcnQoTWF0aC5wb3coZHZ4LCAyKSArIE1hdGgucG93KGR2eSwgMikpO1xyXG4gICAgICAgIGlmIChsZW4gPD0gMC4wNSkge1xyXG4gICAgICAgICAgICAvLyBlaXRoZXIgemVybyBvciB0aGVyZSdzIGEgcm91bmRpbmcgZXJyb3IuXHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGR2eCAvPSBsZW47XHJcbiAgICAgICAgICAgIGR2eSAvPSBsZW47XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnNoaXAuZGlyZWN0aW9uID0gW2R2eCwgZHZ5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQnVsbGV0czpcclxuICAgICAgICBpZiAoaW5wdXRfMS5LZXlTdGF0ZS5pc0Rvd24odGhpcy5kZXBzLmlucHV0LmdldEtleShpbnB1dF8xLktleS5GaXJlKSkpIHtcclxuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShnZW9fMS5Qb2ludC5zdWJ0cmFjdCh0aGlzLmRlcHMuaW5wdXQuY3Vyc29yLCB0aGlzLnBsYXllci5wb3NpdGlvbikpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5ndW5uZXIuZGlyZWN0aW9uID0gbm9ybWFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZ3VubmVyLmRpcmVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9idWxsZXRUaW1lTGVmdCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fYnVsbGV0VGltZUxlZnQgLT0gc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QbGF5ZXJDb250cm9sbGVyID0gUGxheWVyQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChQbGF5ZXJDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5yZWFwZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBQbGF5ZXJDb250cm9sbGVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoUGxheWVyQ29udHJvbGxlciA9IGV4cG9ydHMuUGxheWVyQ29udHJvbGxlciB8fCAoZXhwb3J0cy5QbGF5ZXJDb250cm9sbGVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGxheWVyQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBldmVudF8xID0gcmVxdWlyZSgnLi9ldmVudCcpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jbGFzcyBSZWFwZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFJlYXBlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPY2N1cnMgd2hlbiBhbiBlbnRpdHkgaXMga2lsbGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZW50aXR5S2lsbGVkID0gbmV3IGV2ZW50XzEuRXZlbnQoKTtcclxuICAgICAgICB0aGlzLl90b0tpbGwgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICAvKipcclxuICAgICAqIE1hcmtzIGFuIGVudGl0eSBhcyBkZWFkLlxyXG4gICAgICogVGhlIGVudGl0eSB3aWxsIGJlIHJlbW92ZWQgd2hlbiByZWFwKCkgaXMgY2FsbGVkLlxyXG4gICAgICogQHBhcmFtIGVudGl0eSBUaGUgZW50aXR5IHRvIGtpbGwuXHJcbiAgICAgKi9cclxuICAgIGtpbGxFbnRpdHkoZW50aXR5LCBraWxsZXIpIHtcclxuICAgICAgICBlbnRpdHkuaXNEZWFkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl90b0tpbGwuYWRkKGVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlLaWxsZWQuZW1pdCh7IGVudGl0eTogZW50aXR5LCBraWxsZXI6IGtpbGxlciB9KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBkZWFkIGVudGl0aWVzLlxyXG4gICAgICovXHJcbiAgICByZWFwKCkge1xyXG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fdG9LaWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmlzRGVhZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLnJlbW92ZUVudGl0eShlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b0tpbGwuY2xlYXIoKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlJlYXBlciA9IFJlYXBlcjtcclxuKGZ1bmN0aW9uIChSZWFwZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFJlYXBlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFJlYXBlciA9IGV4cG9ydHMuUmVhcGVyIHx8IChleHBvcnRzLlJlYXBlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlYXBlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgU3R5bGUge1xyXG59XHJcbmNvbnN0IFZJRVdfSEVJR0hUID0gNzU7XHJcbmNsYXNzIFJlbmRlcmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBSZW5kZXJlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLnNoYXBlRm5zID0ge1xyXG4gICAgICAgICAgICAnY2lyY2xlJzogKGN0eCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmFyYygwLCAwLCAxLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnaGV4YWdvbic6IChjdHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oMCwgLTEpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygrZ2VvXzIuQ09TXzMwLCAtZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oK2dlb18yLkNPU18zMCwgK2dlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygtZ2VvXzIuQ09TXzMwLCArZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oLWdlb18yLkNPU18zMCwgLWdlb18yLlNJTl8zMCk7XHJcbiAgICAgICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmRwaVNjYWxlID0gMTtcclxuICAgICAgICB0aGlzLmdsb3cgPSAxMDtcclxuICAgICAgICB0aGlzLmNhbWVyYSA9IHsgcG9zOiBbMCwgMF0sIHpvb206IDEgfTtcclxuICAgICAgICB0aGlzLl9yZW5kZXJPYmplY3RzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5yZW5kZXIpXHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlck9iamVjdHMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX3JlbmRlck9iamVjdHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHNldENhbnZhcyhjYW52YXMpIHtcclxuICAgICAgICB0aGlzLl9jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB9XHJcbiAgICByZW5kZXIoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGxldCBjYW52YXMgPSBjdHguY2FudmFzO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIHRoaXMuZHBpU2NhbGU7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiB0aGlzLmRwaVNjYWxlO1xyXG4gICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XHJcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm0oKTtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5fcmVuZGVyT2JqZWN0cykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IE1BWF9CTFVSX0NPVU5UID0gNTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBnZW9fMS5Qb2ludC5ub3JtYWxpemUoZW50aXR5LnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGVudGl0eS5waHlzaWNzLnZlbG9jaXR5KTtcclxuICAgICAgICAgICAgICAgIGxldCBibHVyQ291bnQgPSBNYXRoLmZsb29yKHNwZWVkICogc2Vjb25kcyAvIGVudGl0eS5yZW5kZXIucmFkaXVzICsgMSk7XHJcbiAgICAgICAgICAgICAgICBibHVyQ291bnQgPSBNYXRoLm1pbihibHVyQ291bnQsIE1BWF9CTFVSX0NPVU5ULCBlbnRpdHkucmVuZGVyLm1heEJsdXIpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBibHVyQ291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSBnZW9fMS5Qb2ludC5hZGQoZW50aXR5LnBvc2l0aW9uLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC1lbnRpdHkucGh5c2ljcy52ZWxvY2l0eVtYXSAqIHNlY29uZHMgKiBpIC8gYmx1ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAtZW50aXR5LnBoeXNpY3MudmVsb2NpdHlbWV0gKiBzZWNvbmRzICogaSAvIGJsdXJDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVudGl0eShlbnRpdHksIHBvcywgTWF0aC5zcXJ0KDEuMCAvIGJsdXJDb3VudCksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyOiBkaXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhY3Rvcjogc3BlZWQgKiBzZWNvbmRzIC8gKGJsdXJDb3VudCArIDEpIC8gZW50aXR5LnJlbmRlci5yYWRpdXMgKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbnRpdHkoZW50aXR5LCBlbnRpdHkucG9zaXRpb24sIDEsIG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVuZGVyRW50aXR5KGUsIHBvcywgYWxwaGEsIHN0cmV0Y2gpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBjdHguc2F2ZSgpO1xyXG4gICAgICAgIGxldCByYWRpdXMgPSBlLnJlbmRlci5yYWRpdXM7XHJcbiAgICAgICAgY3R4LnRyYW5zbGF0ZShwb3NbWF0sIHBvc1tZXSk7XHJcbiAgICAgICAgY3R4LnNjYWxlKHJhZGl1cywgcmFkaXVzKTtcclxuICAgICAgICBpZiAoc3RyZXRjaCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0cmV0Y2goc3RyZXRjaC5kaXIsIHN0cmV0Y2guZmFjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUucGh5c2ljcykge1xyXG4gICAgICAgICAgICBjdHgucm90YXRlKGUucGh5c2ljcy50aGV0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdHlsZSA9IHtcclxuICAgICAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgc3Ryb2tlOiBlLnJlbmRlci5jb2xvcixcclxuICAgICAgICAgICAgbGluZVdpZHRoOiBlLnJlbmRlci5saW5lV2lkdGggLyBlLnJlbmRlci5yYWRpdXMsXHJcbiAgICAgICAgICAgIGFscGhhOiBlLnJlbmRlci5hbHBoYSAqIGFscGhhLFxyXG4gICAgICAgICAgICBnbG93OiBlLnJlbmRlci5nbG93LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZXRTdHlsZShzdHlsZSk7XHJcbiAgICAgICAgdGhpcy5zaGFwZUZuc1tlLnJlbmRlci5zaGFwZV0oY3R4KTtcclxuICAgICAgICBjdHgucmVzdG9yZSgpO1xyXG4gICAgfVxyXG4gICAgc3RyZXRjaChkaXIsIGZhY3Rvcikge1xyXG4gICAgICAgIGxldCBhYiA9IFsxLCAwXTtcclxuICAgICAgICBsZXQgYWJEb3QgPSBnZW9fMS5Qb2ludC5kb3QoYWIsIGRpcik7XHJcbiAgICAgICAgbGV0IGFiQW1vdW50ID0gYWJEb3QgKiAoZmFjdG9yIC0gMSk7XHJcbiAgICAgICAgYWJbWF0gKz0gZGlyW1hdICogYWJBbW91bnQ7XHJcbiAgICAgICAgYWJbWV0gKz0gZGlyW1ldICogYWJBbW91bnQ7XHJcbiAgICAgICAgbGV0IGJjID0gWzAsIDFdO1xyXG4gICAgICAgIGxldCBiY0RvdCA9IGdlb18xLlBvaW50LmRvdChiYywgZGlyKTtcclxuICAgICAgICBsZXQgYmNBbW91bnQgPSBiY0RvdCAqIChmYWN0b3IgLSAxKTtcclxuICAgICAgICBiY1tYXSArPSBkaXJbWF0gKiBiY0Ftb3VudDtcclxuICAgICAgICBiY1tZXSArPSBkaXJbWV0gKiBiY0Ftb3VudDtcclxuICAgICAgICB0aGlzLl9jb250ZXh0LnRyYW5zZm9ybShhYltYXSwgYWJbWV0sIGJjW1hdLCBiY1tZXSwgMCwgMCk7XHJcbiAgICB9XHJcbiAgICBzZXRUcmFuc2Zvcm0oKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IHNjYWxlID0gdGhpcy5jYW1lcmEuem9vbSAqIGN0eC5jYW52YXMuaGVpZ2h0IC8gVklFV19IRUlHSFQ7XHJcbiAgICAgICAgbGV0IGR4ID0gLXRoaXMuY2FtZXJhLnBvc1tYXSAqIHNjYWxlICsgY3R4LmNhbnZhcy53aWR0aCAvIDI7XHJcbiAgICAgICAgbGV0IGR5ID0gLXRoaXMuY2FtZXJhLnBvc1tZXSAqIHNjYWxlICsgY3R4LmNhbnZhcy5oZWlnaHQgLyAyO1xyXG4gICAgICAgIGN0eC5zZXRUcmFuc2Zvcm0oc2NhbGUsIDAsIDAsIHNjYWxlLCBkeCwgZHkpO1xyXG4gICAgfVxyXG4gICAgZHJhd0NpcmNsZShjZW50ZXIsIHJhZGl1cywgc3R5bGUpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICB0aGlzLnNldFN0eWxlKHN0eWxlKTtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyhjZW50ZXJbWF0sIGNlbnRlcltZXSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRTdHlsZShzdHlsZSkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBzdHlsZS5maWxsO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0eWxlLnN0cm9rZTtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLmFscGhhO1xyXG4gICAgICAgIGlmIChzdHlsZS5nbG93ID4gMCkge1xyXG4gICAgICAgICAgICBjdHguc2hhZG93Q29sb3IgPSBzdHlsZS5zdHJva2U7XHJcbiAgICAgICAgICAgIGN0eC5zaGFkb3dCbHVyID0gMTAgKiBzdHlsZS5nbG93O1xyXG4gICAgICAgICAgICBjdHguc2hhZG93T2Zmc2V0WCA9IDA7XHJcbiAgICAgICAgICAgIGN0eC5zaGFkb3dPZmZzZXRZID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzY3JlZW5Ub1dvcmxkKHApIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgeCA9IHBbWF07XHJcbiAgICAgICAgbGV0IHkgPSBwW1ldO1xyXG4gICAgICAgIHggLT0gY3R4LmNhbnZhcy5jbGllbnRXaWR0aCAvIDI7XHJcbiAgICAgICAgeSAtPSBjdHguY2FudmFzLmNsaWVudEhlaWdodCAvIDI7XHJcbiAgICAgICAgbGV0IGZhYyA9IFZJRVdfSEVJR0hUIC8gY3R4LmNhbnZhcy5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgeCAqPSBmYWM7XHJcbiAgICAgICAgeSAqPSBmYWM7XHJcbiAgICAgICAgcmV0dXJuIFt4LCB5XTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlJlbmRlcmVyID0gUmVuZGVyZXI7XHJcbihmdW5jdGlvbiAoUmVuZGVyZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFJlbmRlcmVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoUmVuZGVyZXIgPSBleHBvcnRzLlJlbmRlcmVyIHx8IChleHBvcnRzLlJlbmRlcmVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVuZGVyZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgcGFydGljbGVDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3BhcnRpY2xlQ29udHJvbGxlcicpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBYID0gMDtcclxuY29uc3QgWSA9IDE7XHJcbmNsYXNzIFNoaXBDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBTaGlwQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9zaGlwcyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuc2hpcClcclxuICAgICAgICAgICAgdGhpcy5fc2hpcHMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX3NoaXBzLmRlbGV0ZShlKTsgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3NoaXBzKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmlzRGVhZCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGUuc2hpcC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBkdkFtb3VudCA9IGUuc2hpcC5hY2NlbCAqIHNlY29uZHM7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ4ID0gZS5zaGlwLmRpcmVjdGlvbltYXSAqIGR2QW1vdW50O1xyXG4gICAgICAgICAgICAgICAgbGV0IGR2eSA9IGUuc2hpcC5kaXJlY3Rpb25bWV0gKiBkdkFtb3VudDtcclxuICAgICAgICAgICAgICAgIGUucGh5c2ljcy52ZWxvY2l0eVtYXSArPSBkdng7XHJcbiAgICAgICAgICAgICAgICBlLnBoeXNpY3MudmVsb2NpdHlbWV0gKz0gZHZ5O1xyXG4gICAgICAgICAgICAgICAgLy8gZXhoYXVzdDpcclxuICAgICAgICAgICAgICAgIGlmIChlLnNoaXAuZXhoYXVzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleGhhdXN0ID0gZS5zaGlwLmV4aGF1c3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb2JhYmxlQW1vdW50ID0gZXhoYXVzdC5yYXRlICogc2Vjb25kcztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0dWFsQW1vdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9iYWJsZUFtb3VudCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsQW1vdW50ID0gTWF0aC5yYW5kb20oKSA8IHByb2JhYmxlQW1vdW50ID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxBbW91bnQgPSBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIHByb2JhYmxlQW1vdW50ICogMik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwU3BlZWQgPSBlLnNoaXAuYWNjZWwgKiBlLnBoeXNpY3MubWFzcyAvIGV4aGF1c3QubWFzcyAvIGV4aGF1c3QucmF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdHVhbEFtb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcGVlZEZhY3RvciA9IE1hdGgucmFuZG9tKCkgKiAwLjUgKyAwLjc1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHZ4ID0gKGUuc2hpcC5kaXJlY3Rpb25bWF0gKiAtcFNwZWVkICogc3BlZWRGYWN0b3IpICsgZS5waHlzaWNzLnZlbG9jaXR5W1hdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHZ5ID0gKGUuc2hpcC5kaXJlY3Rpb25bWV0gKiAtcFNwZWVkICogc3BlZWRGYWN0b3IpICsgZS5waHlzaWNzLnZlbG9jaXR5W1ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHggPSBlLnBvc2l0aW9uW1hdIC0gZS5zaGlwLmRpcmVjdGlvbltYXSAqIGUucGh5c2ljcy5yYWRpdXMgKiAxLjI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBweSA9IGUucG9zaXRpb25bWV0gLSBlLnNoaXAuZGlyZWN0aW9uW1ldICogZS5waHlzaWNzLnJhZGl1cyAqIDEuMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShwYXJ0aWNsZUNvbnRyb2xsZXJfMS5QYXJ0aWNsZUNvbXBvbmVudC5jcmVhdGVQYXJ0aWNsZShbcHgsIHB5XSwgW3B2eCwgcHZ5XSwgZS5yZW5kZXIuY29sb3IsIGV4aGF1c3QubWFzcywgZXhoYXVzdC5yYWRpdXMsIDAuMykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlNoaXBDb250cm9sbGVyID0gU2hpcENvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoU2hpcENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFNoaXBDb250cm9sbGVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoU2hpcENvbnRyb2xsZXIgPSBleHBvcnRzLlNoaXBDb250cm9sbGVyIHx8IChleHBvcnRzLlNoaXBDb250cm9sbGVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hpcENvbnRyb2xsZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgU3lzdGVtO1xyXG4oZnVuY3Rpb24gKFN5c3RlbSkge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIHtcclxuICAgIH1cclxuICAgIFN5c3RlbS5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbiAgICAvKipcclxuICAgICAqIFRvcG9sb2dpY2FsbHkgc29ydCB0aGUgc3lzdGVtcyBiYXNlZCBvbiB0aGVpciBkZXBlbmRlbmNpZXMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGluaXRPcmRlcihzeXNPYmplY3QpIHtcclxuICAgICAgICBsZXQgc3lzdGVtcyA9IG5ldyBTZXQoKTtcclxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIHN5c09iamVjdCkge1xyXG4gICAgICAgICAgICBzeXN0ZW1zLmFkZChuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG9yZGVyID0gW107XHJcbiAgICAgICAgd2hpbGUgKHN5c3RlbXMuc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgbGV0IG5leHRJdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBvZiBzeXN0ZW1zKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3lzID0gc3lzT2JqZWN0W25hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlcGVuZHNPblNldChzeXMuZGVwcywgc3lzdGVtcykgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3lzIGRvZXNuJ3QgZGVwZW5kIG9uIGFueXRoaW5nIHN0aWxsIGluIHN5c3RlbXM7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaXQgbXVzdCBiZSB0aGUgbmV4dCBpbiB0aGUgb3JkZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dEl0ZW0gPSBbbmFtZSwgc3lzXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmV4dEl0ZW0gPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3ljbGljIGRlcGVuZGVuY3k/XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzeXN0ZW1zLmRlbGV0ZShuZXh0SXRlbVswXSk7XHJcbiAgICAgICAgICAgIG9yZGVyLnB1c2gobmV4dEl0ZW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3JkZXI7XHJcbiAgICB9XHJcbiAgICBTeXN0ZW0uaW5pdE9yZGVyID0gaW5pdE9yZGVyO1xyXG4gICAgZnVuY3Rpb24gZGVwZW5kc09uU2V0KGRlcHMsIHN5c3RlbXMpIHtcclxuICAgICAgICBmb3IgKGxldCBuYW1lIGluIGRlcHMpIHtcclxuICAgICAgICAgICAgaWYgKHN5c3RlbXMuaGFzKG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbml0U3lzdGVtcyhzeXNPYmplY3QpIHtcclxuICAgICAgICBsZXQgb3JkZXIgPSBpbml0T3JkZXIoc3lzT2JqZWN0KTtcclxuICAgICAgICBpZiAob3JkZXIgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBUc29ydCBoYXMgZmFpbGVkLiBBYm9ydC5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBwYWlyIG9mIG9yZGVyKSB7XHJcbiAgICAgICAgICAgIGxldCBzeXMgPSBwYWlyWzFdO1xyXG4gICAgICAgICAgICAvLyBGaWxsIGluIHRoZSBkZXBlbmRlbmNpZXMuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gc3lzLmRlcHMpIHtcclxuICAgICAgICAgICAgICAgIHN5cy5kZXBzW25hbWVdID0gc3lzT2JqZWN0W25hbWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN5cy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgU3lzdGVtLmluaXRTeXN0ZW1zID0gaW5pdFN5c3RlbXM7XHJcbn0pKFN5c3RlbSA9IGV4cG9ydHMuU3lzdGVtIHx8IChleHBvcnRzLlN5c3RlbSA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN5c3RlbS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBlbmVtaWVzXzEgPSByZXF1aXJlKCcuL2VuZW1pZXMnKTtcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgV0FWRV9QRVJJT0QgPSAzO1xyXG5jb25zdCBHRU5fUkFESVVTID0gMjAwO1xyXG5jbGFzcyBXYXZlR2VuZXJhdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBXYXZlR2VuZXJhdG9yLkRlcGVuZGVuY2llcygpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLl93YXZlVGltZSA9IFdBVkVfUEVSSU9EO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dhdmVUaW1lIDwgMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZXBzLmVuZW15Q29udHJvbGxlci5lbmVtaWVzLnNpemUgPD0gMTApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGVXYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fd2F2ZVRpbWUgKz0gV0FWRV9QRVJJT0Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3dhdmVUaW1lIC09IHNlY29uZHM7XHJcbiAgICB9XHJcbiAgICBnZW5lcmF0ZVdhdmUoKSB7XHJcbiAgICAgICAgbGV0IGZvbGxvd2VycyA9IDEyO1xyXG4gICAgICAgIGxldCB0YW5rcyA9IDI7XHJcbiAgICAgICAgbGV0IHNlZWtlcnMgPSA4O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZm9sbG93ZXJzOyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IHAgPSBnZW9fMS5nZW8ubWF0aC5yYW5kQ2lyY2xlKGdlb18xLlBvaW50Lnplcm8oKSwgR0VOX1JBRElVUyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkoZW5lbWllc18xLkVuZW15Q29tcG9uZW50LmNyZWF0ZUZvbGxvd2VyKHAsIGdlb18xLlBvaW50Lnplcm8oKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhbmtzOyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IHAgPSBnZW9fMS5nZW8ubWF0aC5yYW5kQ2lyY2xlKGdlb18xLlBvaW50Lnplcm8oKSwgR0VOX1JBRElVUyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkoZW5lbWllc18xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVRhbmsocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2Vla2VyczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBwID0gZ2VvXzEuZ2VvLm1hdGgucmFuZENpcmNsZShnZW9fMS5Qb2ludC56ZXJvKCksIEdFTl9SQURJVVMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGVuZW1pZXNfMS5FbmVteUNvbXBvbmVudC5jcmVhdGVTZWVrZXIocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuV2F2ZUdlbmVyYXRvciA9IFdhdmVHZW5lcmF0b3I7XHJcbihmdW5jdGlvbiAoV2F2ZUdlbmVyYXRvcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbmVteUNvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBXYXZlR2VuZXJhdG9yLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoV2F2ZUdlbmVyYXRvciA9IGV4cG9ydHMuV2F2ZUdlbmVyYXRvciB8fCAoZXhwb3J0cy5XYXZlR2VuZXJhdG9yID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2F2ZUdlbmVyYXRvci5qcy5tYXAiXX0=
