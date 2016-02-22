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
                maxBlur: 3,
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
                            minDistance: 6,
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
                rate: 2,
                direction: null,
                timeLeft: 0,
                damage: 4,
                damageGroup: healthController_1.DamageGroup.All & ~healthController_1.DamageGroup.Enemy,
                bulletSpeed: 150,
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
const BULLET_LIFESPAN = 2;
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
            this.displayHealth();
        }
    }
    displayScore() {
        let score = this.deps.playerController.score;
        this._displayController.score.setValue(score.toString());
    }
    displayHealth() {
        let player = this.deps.playerController.player;
        if (player == null) {
            return;
        }
        let health = player.health;
        this._displayController.hp.setValue(health.hp.toString());
        this._displayController.maxHp.setValue(health.maxHp.toString());
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
    hp: new ElementBinding(document.querySelector('#hud_hp')),
    maxHp: new ElementBinding(document.querySelector('#hud_maxHp')),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnVsbGV0Q29udHJvbGxlci5qcyIsImJpbi9lbmVtaWVzLmpzIiwiYmluL2VuZW1pZXMvZW5lbXlCZWhhdmlvci5qcyIsImJpbi9lbmVtaWVzL2VuZW15Q29tcG9uZW50LmpzIiwiYmluL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyLmpzIiwiYmluL2VudGl0eUNvbnRhaW5lci5qcyIsImJpbi9ldmVudC5qcyIsImJpbi9nYW1lLmpzIiwiYmluL2dlby5qcyIsImJpbi9ndW5uZXJDb250cm9sbGVyLmpzIiwiYmluL2hlYWx0aENvbnRyb2xsZXIuanMiLCJiaW4vaHVkLmpzIiwiYmluL2luZGV4LmpzIiwiYmluL2lucHV0LmpzIiwiYmluL3BhcnRpY2xlQ29udHJvbGxlci5qcyIsImJpbi9waHlzaWNzLmpzIiwiYmluL3BsYXllckNvbnRyb2xsZXIuanMiLCJiaW4vcmVhcGVyLmpzIiwiYmluL3JlbmRlcmVyLmpzIiwiYmluL3NoaXBDb250cm9sbGVyLmpzIiwiYmluL3N5c3RlbS5qcyIsImJpbi93YXZlR2VuZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxudmFyIEJ1bGxldENvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChCdWxsZXRDb21wb25lbnQpIHtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJ1bGxldChvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IG9wdGlvbnMudmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjYsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDEsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjEyNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucy5wb3MsXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC40LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEsXHJcbiAgICAgICAgICAgICAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAzLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnVsbGV0OiB7XHJcbiAgICAgICAgICAgICAgICBkYW1hZ2U6IG9wdGlvbnMuZGFtYWdlLFxyXG4gICAgICAgICAgICAgICAgaXNBbGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogb3B0aW9ucy5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICBkYW1hZ2VHcm91cDogb3B0aW9ucy5kYW1hZ2VHcm91cCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcGFydGljbGU6IHtcclxuICAgICAgICAgICAgICAgIGxpZmVzcGFuOiBvcHRpb25zLmxpZmVzcGFuLFxyXG4gICAgICAgICAgICAgICAgdGltZVJlbWFpbmluZzogb3B0aW9ucy5saWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgQnVsbGV0Q29tcG9uZW50LmNyZWF0ZUJ1bGxldCA9IGNyZWF0ZUJ1bGxldDtcclxufSkoQnVsbGV0Q29tcG9uZW50ID0gZXhwb3J0cy5CdWxsZXRDb21wb25lbnQgfHwgKGV4cG9ydHMuQnVsbGV0Q29tcG9uZW50ID0ge30pKTtcclxuY2xhc3MgQnVsbGV0Q29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgQnVsbGV0Q29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9idWxsZXRzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5idWxsZXQpXHJcbiAgICAgICAgICAgIHRoaXMuX2J1bGxldHMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2J1bGxldHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5kZXBzLnBoeXNpY3MuaW50ZXJzZWN0aW9ucztcclxuICAgICAgICBmb3IgKGxldCBiIG9mIHRoaXMuX2J1bGxldHMpIHtcclxuICAgICAgICAgICAgaWYgKGIuYnVsbGV0LmlzQWxpdmUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBpbnRlcnMgPSBpbnRlcnNlY3Rpb25zLmdldChiKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbnRlcnMgJiYgaW50ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpIG9mIGludGVycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3RoZXIgPSBpLmI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdGhlci5oZWFsdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5oZWFsdGhDb250cm9sbGVyLmRhbWFnZUVudGl0eShvdGhlciwgYi5idWxsZXQuZGFtYWdlLCBiLmJ1bGxldC5zb3VyY2UsIGIuYnVsbGV0LmRhbWFnZUdyb3VwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIuYnVsbGV0LmlzQWxpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYi5yZW5kZXIuY29sb3IgPSBcIiM4MDgwODBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSBCdWxsZXRDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKEJ1bGxldENvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGh5c2ljcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEJ1bGxldENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShCdWxsZXRDb250cm9sbGVyID0gZXhwb3J0cy5CdWxsZXRDb250cm9sbGVyIHx8IChleHBvcnRzLkJ1bGxldENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1idWxsZXRDb250cm9sbGVyLmpzLm1hcCIsImZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlCZWhhdmlvcicpKTtcclxuX19leHBvcnQocmVxdWlyZSgnLi9lbmVtaWVzL2VuZW15Q29tcG9uZW50JykpO1xyXG5fX2V4cG9ydChyZXF1aXJlKCcuL2VuZW1pZXMvZW5lbXlDb250cm9sbGVyJykpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbmVtaWVzLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbnZhciBnZW9fMiA9IHJlcXVpcmUoJy4uL2dlbycpO1xyXG52YXIgZ2VvID0gcmVxdWlyZSgnLi4vZ2VvJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxudmFyIEVuZW15QmVoYXZpb3I7XHJcbihmdW5jdGlvbiAoRW5lbXlCZWhhdmlvcikge1xyXG4gICAgKGZ1bmN0aW9uIChNb2RlKSB7XHJcbiAgICAgICAgTW9kZVtNb2RlW1wiRm9sbG93XCJdID0gMF0gPSBcIkZvbGxvd1wiO1xyXG4gICAgICAgIE1vZGVbTW9kZVtcIkNpcmNsZVwiXSA9IDFdID0gXCJDaXJjbGVcIjtcclxuICAgICAgICBNb2RlW01vZGVbXCJTaG9vdFwiXSA9IDJdID0gXCJTaG9vdFwiO1xyXG4gICAgfSkoRW5lbXlCZWhhdmlvci5Nb2RlIHx8IChFbmVteUJlaGF2aW9yLk1vZGUgPSB7fSkpO1xyXG4gICAgdmFyIE1vZGUgPSBFbmVteUJlaGF2aW9yLk1vZGU7XHJcbiAgICAoZnVuY3Rpb24gKENpcmNsZURpcmVjdGlvbikge1xyXG4gICAgICAgIENpcmNsZURpcmVjdGlvbltDaXJjbGVEaXJlY3Rpb25bXCJDbG9ja3dpc2VcIl0gPSAwXSA9IFwiQ2xvY2t3aXNlXCI7XHJcbiAgICAgICAgQ2lyY2xlRGlyZWN0aW9uW0NpcmNsZURpcmVjdGlvbltcIkNvdW50ZXJcIl0gPSAxXSA9IFwiQ291bnRlclwiO1xyXG4gICAgfSkoRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24gfHwgKEVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uID0ge30pKTtcclxuICAgIHZhciBDaXJjbGVEaXJlY3Rpb24gPSBFbmVteUJlaGF2aW9yLkNpcmNsZURpcmVjdGlvbjtcclxuICAgIGNvbnN0IGNpcmNsZU1hdHJpY2VzID0ge1xyXG4gICAgICAgIC8vIC0zMCBkZWdyZWVzXHJcbiAgICAgICAgW0NpcmNsZURpcmVjdGlvbi5DbG9ja3dpc2VdOiBbXHJcbiAgICAgICAgICAgIFtnZW8uQ09TXzMwLCBnZW8uU0lOXzMwXSxcclxuICAgICAgICAgICAgWy1nZW8uU0lOXzMwLCBnZW8uQ09TXzMwXSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIC8vIDMwIGRlZ3JlZXNcclxuICAgICAgICBbQ2lyY2xlRGlyZWN0aW9uLkNvdW50ZXJdOiBbXHJcbiAgICAgICAgICAgIFtnZW8uQ09TXzMwLCAtZ2VvLlNJTl8zMF0sXHJcbiAgICAgICAgICAgIFtnZW8uU0lOXzMwLCBnZW8uQ09TXzMwXSxcclxuICAgICAgICBdLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGJlaGF2aW9yTWFwID0ge1xyXG4gICAgICAgIFtNb2RlLkZvbGxvd106IChlLCBiZWhhdmlvciwgc3lzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBzeXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShnZW9fMS5Qb2ludC5zdWJ0cmFjdChwbGF5ZXIucG9zaXRpb24sIGUucG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW01vZGUuQ2lyY2xlXTogKGUsIGJlaGF2aW9yLCBzeXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IHBsYXllciA9IHN5cy5kZXBzLnBsYXllckNvbnRyb2xsZXIucGxheWVyO1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGJlaGF2aW9yLmRhdGE7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIG5vcm1hbGl6ZWQgZGlyZWN0aW9uIGZyb20gcGxheWVyIHRvIGVuZW15XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGdlb18xLlBvaW50LnN1YnRyYWN0KGUucG9zaXRpb24sIHBsYXllci5wb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGdlb18yLk1hdHJpeC5wb2ludE11bChjaXJjbGVNYXRyaWNlc1tkYXRhLmRpcmVjdGlvbl0sIG5vcm1hbCk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbWF0gPSB0YXJnZXRbWF0gKiBkYXRhLnJhZGl1cyArIHBsYXllci5wb3NpdGlvbltYXTtcclxuICAgICAgICAgICAgICAgIHRhcmdldFtZXSA9IHRhcmdldFtZXSAqIGRhdGEucmFkaXVzICsgcGxheWVyLnBvc2l0aW9uW1ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShnZW9fMS5Qb2ludC5zdWJ0cmFjdCh0YXJnZXQsIGUucG9zaXRpb24pKTtcclxuICAgICAgICAgICAgICAgIGUuc2hpcC5kaXJlY3Rpb24gPSBkaXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlLnNoaXAuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW01vZGUuU2hvb3RdOiAoZSwgYmVoYXZpb3IsIHN5cykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGJlaGF2aW9yLmRhdGE7XHJcbiAgICAgICAgICAgIGxldCBwbGF5ZXIgPSBzeXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICAgICAgaWYgKHBsYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50LnN1YnRyYWN0KHBsYXllci5wb3NpdGlvbiwgZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gZ2VvXzEuUG9pbnQubGVuZ3RoKGRpcik7XHJcbiAgICAgICAgICAgICAgICBpZiAobGVuID49IGRhdGEubWluRGlzdGFuY2UgJiYgbGVuIDw9IGRhdGEubWF4RGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXJbWF0gLz0gbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpcltZXSAvPSBsZW47XHJcbiAgICAgICAgICAgICAgICAgICAgZS5ndW5uZXIuZGlyZWN0aW9uID0gZGlyO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLmd1bm5lci5kaXJlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gZ2V0QmVoYXZpb3JGdW5jdGlvbihtb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuIGJlaGF2aW9yTWFwW21vZGVdO1xyXG4gICAgfVxyXG4gICAgRW5lbXlCZWhhdmlvci5nZXRCZWhhdmlvckZ1bmN0aW9uID0gZ2V0QmVoYXZpb3JGdW5jdGlvbjtcclxufSkoRW5lbXlCZWhhdmlvciA9IGV4cG9ydHMuRW5lbXlCZWhhdmlvciB8fCAoZXhwb3J0cy5FbmVteUJlaGF2aW9yID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW5lbXlCZWhhdmlvci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBlbmVteUJlaGF2aW9yXzEgPSByZXF1aXJlKCcuL2VuZW15QmVoYXZpb3InKTtcclxudmFyIGhlYWx0aENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4uL2hlYWx0aENvbnRyb2xsZXInKTtcclxudmFyIEVuZW15Q29tcG9uZW50O1xyXG4oZnVuY3Rpb24gKEVuZW15Q29tcG9uZW50KSB7XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVGb2xsb3dlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgICAgICAgICBkcmFnOiAwLjUsXHJcbiAgICAgICAgICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICAgICAgICAgIG9tZWdhOiAwLFxyXG4gICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGNvbGxpZGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjRkY4MDAwJyxcclxuICAgICAgICAgICAgICAgIGFscGhhOiAxLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLjIsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1heEJsdXI6IDIsXHJcbiAgICAgICAgICAgICAgICBnbG93OiAwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbmVteToge1xyXG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5Nb2RlLkNpcmNsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ291bnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDEwMCxcclxuICAgICAgICAgICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICByYXRlOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hc3M6IDEuNSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDEwLFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5FbmVteSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NvcmluZzoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IDEwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVGb2xsb3dlciA9IGNyZWF0ZUZvbGxvd2VyO1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlVGFuayhwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC40LFxyXG4gICAgICAgICAgICAgICAgdGhldGE6IDAsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIG1hc3M6IDksXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnI0QwMDAwMCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMyxcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMixcclxuICAgICAgICAgICAgICAgIGdsb3c6IDEsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuZW15OiB7XHJcbiAgICAgICAgICAgICAgICBiZWhhdmlvcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLk1vZGUuQ2lyY2xlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDE1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBlbmVteUJlaGF2aW9yXzEuRW5lbXlCZWhhdmlvci5DaXJjbGVEaXJlY3Rpb24uQ291bnRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2hpcDoge1xyXG4gICAgICAgICAgICAgICAgYWNjZWw6IDgwLFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogNCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuOCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDMwLFxyXG4gICAgICAgICAgICAgICAgbWF4SHA6IDMwLFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5FbmVteSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2NvcmluZzoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IDIwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVUYW5rID0gY3JlYXRlVGFuaztcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVNlZWtlcihwb3MsIHZlbCkge1xyXG4gICAgICAgIGxldCBlID0ge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcG9zLFxyXG4gICAgICAgICAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgICAgICAgICB2ZWxvY2l0eTogdmVsLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLFxyXG4gICAgICAgICAgICAgICAgZHJhZzogMC4yNSxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgb21lZ2E6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXNzOiAwLjgsXHJcbiAgICAgICAgICAgICAgICBib3VuY2U6IDAuOTYsXHJcbiAgICAgICAgICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwRkYwMCcsXHJcbiAgICAgICAgICAgICAgICBhbHBoYTogMSxcclxuICAgICAgICAgICAgICAgIHNoYXBlOiAnY2lyY2xlJyxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogMC45LFxyXG4gICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgICAgICAgICAgICBtYXhCbHVyOiAzLFxyXG4gICAgICAgICAgICAgICAgZ2xvdzogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5lbXk6IHtcclxuICAgICAgICAgICAgICAgIGJlaGF2aW9yczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZTogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuTW9kZS5DaXJjbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1czogNixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogZW5lbXlCZWhhdmlvcl8xLkVuZW15QmVoYXZpb3IuQ2lyY2xlRGlyZWN0aW9uLkNvdW50ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLk1vZGUuU2hvb3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpc3RhbmNlOiA2LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlzdGFuY2U6IDQwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGlwOiB7XHJcbiAgICAgICAgICAgICAgICBhY2NlbDogMTUwLFxyXG4gICAgICAgICAgICAgICAgZXhoYXVzdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhdGU6IDUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFzczogMSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDAuNCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGd1bm5lcjoge1xyXG4gICAgICAgICAgICAgICAgcmF0ZTogMixcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgIHRpbWVMZWZ0OiAwLFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlOiA0LFxyXG4gICAgICAgICAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5BbGwgJiB+aGVhbHRoQ29udHJvbGxlcl8xLkRhbWFnZUdyb3VwLkVuZW15LFxyXG4gICAgICAgICAgICAgICAgYnVsbGV0U3BlZWQ6IDE1MCxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzgwRkYwMCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhlYWx0aDoge1xyXG4gICAgICAgICAgICAgICAgaHA6IDUsXHJcbiAgICAgICAgICAgICAgICBtYXhIcDogNSxcclxuICAgICAgICAgICAgICAgIGRhbWFnZUdyb3VwOiBoZWFsdGhDb250cm9sbGVyXzEuRGFtYWdlR3JvdXAuRW5lbXksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNjb3Jpbmc6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiA1LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGU7XHJcbiAgICB9XHJcbiAgICBFbmVteUNvbXBvbmVudC5jcmVhdGVTZWVrZXIgPSBjcmVhdGVTZWVrZXI7XHJcbn0pKEVuZW15Q29tcG9uZW50ID0gZXhwb3J0cy5FbmVteUNvbXBvbmVudCB8fCAoZXhwb3J0cy5FbmVteUNvbXBvbmVudCA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZW15Q29tcG9uZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi4vc3lzdGVtJyk7XHJcbnZhciBlbmVteUJlaGF2aW9yXzEgPSByZXF1aXJlKCcuL2VuZW15QmVoYXZpb3InKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBFbmVteUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IEVuZW15Q29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLmVuZW1pZXMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLmVuZW15KVxyXG4gICAgICAgICAgICB0aGlzLmVuZW1pZXMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuZW5lbWllcy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgbGV0IHBsYXllciA9IHRoaXMuZGVwcy5wbGF5ZXJDb250cm9sbGVyLnBsYXllcjtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuZW5lbWllcykge1xyXG4gICAgICAgICAgICBpZiAoZS5pc0RlYWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGIgb2YgZS5lbmVteS5iZWhhdmlvcnMpIHtcclxuICAgICAgICAgICAgICAgIGVuZW15QmVoYXZpb3JfMS5FbmVteUJlaGF2aW9yLmdldEJlaGF2aW9yRnVuY3Rpb24oYi5tb2RlKShlLCBiLCB0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLkVuZW15Q29udHJvbGxlciA9IEVuZW15Q29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChFbmVteUNvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEVuZW15Q29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEVuZW15Q29udHJvbGxlciA9IGV4cG9ydHMuRW5lbXlDb250cm9sbGVyIHx8IChleHBvcnRzLkVuZW15Q29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVuZW15Q29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBldmVudF8xID0gcmVxdWlyZSgnLi9ldmVudCcpO1xyXG5jbGFzcyBFbnRpdHlDb250YWluZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogT2NjdXJzIGFmdGVyIGFuIGVudGl0eSBpcyBhZGRlZCB0byB0aGUgY29udGFpbmVyLlxyXG4gICAgICAgICAqIGFyZzogVGhlIGVudGl0eSB0aGF0IHdhcyBhZGRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmVudGl0eUFkZGVkID0gbmV3IGV2ZW50XzEuRXZlbnQoKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBPY2N1cnMgYWZ0ZXIgYW4gZW50aXR5IGlzIHJlbW92ZWQgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICAgICAqIGFyZzogVGhlIGVudGl0eSB0aGF0IHdhcyByZW1vdmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuZW50aXR5UmVtb3ZlZCA9IG5ldyBldmVudF8xLkV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgdGhpcy5fbmV4dElkID0gMDtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7IH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBlbnRpdHkgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAqIEBwYXJhbSBlbnRpdHkgVGhlIGVudGl0eSB0byBhZGQuXHJcbiAgICAgKi9cclxuICAgIGFkZEVudGl0eShlbnRpdHkpIHtcclxuICAgICAgICBlbnRpdHkuaWQgPSArK3RoaXMuX25leHRJZDtcclxuICAgICAgICB0aGlzLl9lbnRpdGllcy5hZGQoZW50aXR5KTtcclxuICAgICAgICB0aGlzLl9pbmRleC5zZXQoZW50aXR5LmlkLCBlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5QWRkZWQuZW1pdChlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGVudGl0eSBmcm9tIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5IFRoZSBlbnRpdHkgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbnRpdHkoZW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5fZW50aXRpZXMuZGVsZXRlKGVudGl0eSk7XHJcbiAgICAgICAgdGhpcy5faW5kZXguZGVsZXRlKGVudGl0eS5pZCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlSZW1vdmVkLmVtaXQoZW50aXR5KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cclxuICAgICAqIEBwYXJhbSBpZCBUaGUgaWQgb2YgdGhlIGVudGl0eSB0byByZXRyaWV2ZS5cclxuICAgICAqL1xyXG4gICAgZ2V0QnlJZChpZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleC5nZXQoaWQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRW50aXR5Q29udGFpbmVyID0gRW50aXR5Q29udGFpbmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1lbnRpdHlDb250YWluZXIuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG5jbGFzcyBFdmVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcclxuICAgIH1cclxuICAgIGVtaXQodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGlzdGVuZXJzLm1hcChsID0+IGwodmFsdWUpKTtcclxuICAgIH1cclxuICAgIGVtaXRBc3luYyh2YWx1ZSkge1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gdGhpcy5lbWl0KHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cy5tYXAodiA9PiB2ICYmIHYudGhlbiA/IHYgOiBQcm9taXNlLnJlc29sdmUodikpKTtcclxuICAgIH1cclxuICAgIGxpc3RlbihsaXN0ZW5lcikge1xyXG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkV2ZW50ID0gRXZlbnQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50LmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGJ1bGxldENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vYnVsbGV0Q29udHJvbGxlcicpO1xyXG52YXIgZW5lbWllc18xID0gcmVxdWlyZSgnLi9lbmVtaWVzJyk7XHJcbnZhciBlbnRpdHlDb250YWluZXJfMSA9IHJlcXVpcmUoJy4vZW50aXR5Q29udGFpbmVyJyk7XHJcbnZhciBndW5uZXJDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL2d1bm5lckNvbnRyb2xsZXInKTtcclxudmFyIGhlYWx0aENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vaGVhbHRoQ29udHJvbGxlcicpO1xyXG52YXIgaHVkXzEgPSByZXF1aXJlKCcuL2h1ZCcpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxudmFyIHBoeXNpY3NfMSA9IHJlcXVpcmUoJy4vcGh5c2ljcycpO1xyXG52YXIgcGFydGljbGVDb250cm9sbGVyXzEgPSByZXF1aXJlKCcuL3BhcnRpY2xlQ29udHJvbGxlcicpO1xyXG52YXIgcGxheWVyQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9wbGF5ZXJDb250cm9sbGVyJyk7XHJcbnZhciByZWFwZXJfMSA9IHJlcXVpcmUoJy4vcmVhcGVyJyk7XHJcbnZhciByZW5kZXJlcl8xID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpO1xyXG52YXIgc2hpcENvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vc2hpcENvbnRyb2xsZXInKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxudmFyIHdhdmVHZW5lcmF0b3JfMSA9IHJlcXVpcmUoJy4vd2F2ZUdlbmVyYXRvcicpO1xyXG5jbGFzcyBCYXNlR2FtZSB7XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHN5c3RlbV8xLlN5c3RlbS5pbml0U3lzdGVtcyh0aGlzLnN5c3RlbXMpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuQmFzZUdhbWUgPSBCYXNlR2FtZTtcclxuKGZ1bmN0aW9uIChCYXNlR2FtZSkge1xyXG4gICAgY2xhc3MgU3lzdGVtcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBuZXcgZW50aXR5Q29udGFpbmVyXzEuRW50aXR5Q29udGFpbmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQmFzZUdhbWUuU3lzdGVtcyA9IFN5c3RlbXM7XHJcbn0pKEJhc2VHYW1lID0gZXhwb3J0cy5CYXNlR2FtZSB8fCAoZXhwb3J0cy5CYXNlR2FtZSA9IHt9KSk7XHJcbmNsYXNzIEdhbWUgZXh0ZW5kcyBCYXNlR2FtZSB7XHJcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zID0gbmV3IEdhbWUuU3lzdGVtcygpO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICB0aGlzLnN5c3RlbXMud2F2ZUdlbmVyYXRvci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLnBsYXllckNvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5lbmVteUNvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5zaGlwQ29udHJvbGxlci5zdGVwKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgdGhpcy5zeXN0ZW1zLmd1bm5lckNvbnRyb2xsZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5idWxsZXRDb250cm9sbGVyLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMucGFydGljbGVDb250cm9sZXIuc3RlcChlbGFwc2VkTXMpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5yZWFwZXIucmVhcCgpO1xyXG4gICAgICAgIHRoaXMuc3lzdGVtcy5waHlzaWNzLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuaHVkLnN0ZXAoZWxhcHNlZE1zKTtcclxuICAgICAgICB0aGlzLnN5c3RlbXMuaW5wdXQucG9zdFN0ZXAoKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkdhbWUgPSBHYW1lO1xyXG4oZnVuY3Rpb24gKEdhbWUpIHtcclxuICAgIGNsYXNzIFN5c3RlbXMgZXh0ZW5kcyBCYXNlR2FtZS5TeXN0ZW1zIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbmV3IGlucHV0XzEuSW5wdXQoKTtcclxuICAgICAgICAgICAgdGhpcy5waHlzaWNzID0gbmV3IHBoeXNpY3NfMS5QaHlzaWNzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgcmVuZGVyZXJfMS5SZW5kZXJlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllckNvbnRyb2xsZXIgPSBuZXcgcGxheWVyQ29udHJvbGxlcl8xLlBsYXllckNvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zaGlwQ29udHJvbGxlciA9IG5ldyBzaGlwQ29udHJvbGxlcl8xLlNoaXBDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW5lbXlDb250cm9sbGVyID0gbmV3IGVuZW1pZXNfMS5FbmVteUNvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRDb250cm9sbGVyID0gbmV3IGJ1bGxldENvbnRyb2xsZXJfMS5CdWxsZXRDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3VubmVyQ29udHJvbGxlciA9IG5ldyBndW5uZXJDb250cm9sbGVyXzEuR3VubmVyQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlQ29udHJvbGVyID0gbmV3IHBhcnRpY2xlQ29udHJvbGxlcl8xLlBhcnRpY2xlQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmhlYWx0aENvbnRyb2xsZXIgPSBuZXcgaGVhbHRoQ29udHJvbGxlcl8xLkhlYWx0aENvbnRyb2xsZXIoKTtcclxuICAgICAgICAgICAgdGhpcy53YXZlR2VuZXJhdG9yID0gbmV3IHdhdmVHZW5lcmF0b3JfMS5XYXZlR2VuZXJhdG9yKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaHVkID0gbmV3IGh1ZF8xLkh1ZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlYXBlciA9IG5ldyByZWFwZXJfMS5SZWFwZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBHYW1lLlN5c3RlbXMgPSBTeXN0ZW1zO1xyXG59KShHYW1lID0gZXhwb3J0cy5HYW1lIHx8IChleHBvcnRzLkdhbWUgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nYW1lLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxuZXhwb3J0cy5TSU5fMzAgPSAwLjU7XHJcbmV4cG9ydHMuQ09TXzMwID0gMC44NjYwMztcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG52YXIgUG9pbnQ7XHJcbihmdW5jdGlvbiAoUG9pbnQpIHtcclxuICAgIGZ1bmN0aW9uIGFkZCguLi5wb2ludHMpIHtcclxuICAgICAgICBsZXQgcCA9IFswLCAwXTtcclxuICAgICAgICBmb3IgKGxldCBwMSBvZiBwb2ludHMpIHtcclxuICAgICAgICAgICAgcFtYXSArPSBwMVtYXTtcclxuICAgICAgICAgICAgcFtZXSArPSBwMVtZXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcbiAgICB9XHJcbiAgICBQb2ludC5hZGQgPSBhZGQ7XHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChwMSwgcDIpIHtcclxuICAgICAgICByZXR1cm4gW3AxW1hdIC0gcDJbWF0sIHAxW1ldIC0gcDJbWV1dO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuc3VidHJhY3QgPSBzdWJ0cmFjdDtcclxuICAgIGZ1bmN0aW9uIGxlbmd0aChwKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChsZW5ndGhTcXVhcmVkKHApKTtcclxuICAgIH1cclxuICAgIFBvaW50Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIGZ1bmN0aW9uIGxlbmd0aFNxdWFyZWQocCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdyhwW1hdLCAyKSArIE1hdGgucG93KHBbWV0sIDIpO1xyXG4gICAgfVxyXG4gICAgUG9pbnQubGVuZ3RoU3F1YXJlZCA9IGxlbmd0aFNxdWFyZWQ7XHJcbiAgICBmdW5jdGlvbiBkaXN0KHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoZGlzdFNxdWFyZWQocDEsIHAyKSk7XHJcbiAgICB9XHJcbiAgICBQb2ludC5kaXN0ID0gZGlzdDtcclxuICAgIGZ1bmN0aW9uIGRpc3RTcXVhcmVkKHAxLCBwMikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnBvdygocDFbWF0gLSBwMltYXSksIDIpICsgTWF0aC5wb3coKHAxW1ldIC0gcDJbWV0pLCAyKTtcclxuICAgIH1cclxuICAgIFBvaW50LmRpc3RTcXVhcmVkID0gZGlzdFNxdWFyZWQ7XHJcbiAgICBmdW5jdGlvbiBkb3QocDEsIHAyKSB7XHJcbiAgICAgICAgcmV0dXJuIHAxW1hdICogcDJbWF0gKyBwMVtZXSAqIHAyW1ldO1xyXG4gICAgfVxyXG4gICAgUG9pbnQuZG90ID0gZG90O1xyXG4gICAgZnVuY3Rpb24gY2xvbmUocCkge1xyXG4gICAgICAgIHJldHVybiBbcFtYXSwgcFtZXV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5jbG9uZSA9IGNsb25lO1xyXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKHApIHtcclxuICAgICAgICBsZXQgbGVuID0gbGVuZ3RoKHApO1xyXG4gICAgICAgIHJldHVybiBbcFtYXSAvIGxlbiwgcFtZXSAvIGxlbl07XHJcbiAgICB9XHJcbiAgICBQb2ludC5ub3JtYWxpemUgPSBub3JtYWxpemU7XHJcbiAgICBmdW5jdGlvbiB6ZXJvKCkge1xyXG4gICAgICAgIHJldHVybiBbMCwgMF07XHJcbiAgICB9XHJcbiAgICBQb2ludC56ZXJvID0gemVybztcclxuICAgIGZ1bmN0aW9uIHBsdXMoc2VsZiwgcCkge1xyXG4gICAgICAgIHNlbGZbWF0gKz0gcFtYXTtcclxuICAgICAgICBzZWxmW1ldICs9IHBbWV07XHJcbiAgICB9XHJcbiAgICBQb2ludC5wbHVzID0gcGx1cztcclxufSkoUG9pbnQgPSBleHBvcnRzLlBvaW50IHx8IChleHBvcnRzLlBvaW50ID0ge30pKTtcclxudmFyIE1hdHJpeDtcclxuKGZ1bmN0aW9uIChNYXRyaXgpIHtcclxuICAgIGZ1bmN0aW9uIG11bChhLCBiKSB7XHJcbiAgICAgICAgbGV0IHZlY1ggPSBwb2ludE11bChhLCBbYltYXVtYXSwgYltZXVtYXV0pO1xyXG4gICAgICAgIGxldCB2ZWNZID0gcG9pbnRNdWwoYSwgW2JbWF1bWV0sIGJbWV1bWV1dKTtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBbdmVjWFtYXSwgdmVjWVtYXV0sXHJcbiAgICAgICAgICAgIFt2ZWNYW1ldLCB2ZWNZW1ldXSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgTWF0cml4Lm11bCA9IG11bDtcclxuICAgIGZ1bmN0aW9uIHBvaW50TXVsKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBQb2ludC5kb3QoYVtYXSwgYiksXHJcbiAgICAgICAgICAgIFBvaW50LmRvdChhW1ldLCBiKSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgTWF0cml4LnBvaW50TXVsID0gcG9pbnRNdWw7XHJcbn0pKE1hdHJpeCA9IGV4cG9ydHMuTWF0cml4IHx8IChleHBvcnRzLk1hdHJpeCA9IHt9KSk7XHJcbnZhciBnZW87XHJcbihmdW5jdGlvbiAoZ2VvKSB7XHJcbiAgICB2YXIgbWF0aDtcclxuICAgIChmdW5jdGlvbiAobWF0aCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIHJhbmRCZXR3ZWVuKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdGgucmFuZEJldHdlZW4gPSByYW5kQmV0d2VlbjtcclxuICAgICAgICBmdW5jdGlvbiByYW5kQ2lyY2xlKGNlbnRlciwgcmFkaXVzKSB7XHJcbiAgICAgICAgICAgIC8vIFJlcGVhdCB1bnRpbCAoeCx5KSBpcyBpbnNpZGUgdGhlIHVuaXQgY2lyY2xlLlxyXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSByYW5kQmV0d2VlbigtMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IHJhbmRCZXR3ZWVuKC0xLCAxKTtcclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLnBvdyh4LCAyKSArIE1hdGgucG93KHksIDIpIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4ICogcmFkaXVzICsgY2VudGVyW1hdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ICogcmFkaXVzICsgY2VudGVyW1ldLFxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kQ2lyY2xlID0gcmFuZENpcmNsZTtcclxuICAgICAgICAvLyBBcHByb3guIHVzaW5nIHN1bSBvZiAzIHVuaWZvcm0gcmFuZG9tIG51bWJlcnMuXHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzKG1lYW4sIGRldikge1xyXG4gICAgICAgICAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKyBNYXRoLnJhbmRvbSgpICsgTWF0aC5yYW5kb20oKSAtIDEuNSkgKiAwLjY3ICogZGV2ICsgbWVhbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF0aC5yYW5kR2F1c3MgPSByYW5kR2F1c3M7XHJcbiAgICAgICAgZnVuY3Rpb24gcmFuZEdhdXNzMmQoY2VudGVyLCBkZXYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHJhbmRHYXVzcyhjZW50ZXJbWF0sIGRldiksXHJcbiAgICAgICAgICAgICAgICByYW5kR2F1c3MoY2VudGVyW1ldLCBkZXYpLFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLnJhbmRHYXVzczJkID0gcmFuZEdhdXNzMmQ7XHJcbiAgICAgICAgZnVuY3Rpb24gbGVycChtaW4sIG1heCwgeCkge1xyXG4gICAgICAgICAgICByZXR1cm4geCAqIChtYXggLSBtaW4pICsgbWluO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLmxlcnAgPSBsZXJwO1xyXG4gICAgICAgIGZ1bmN0aW9uIGNsYW1wKG1pbiwgeCwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIHgpLCBtYXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRoLmNsYW1wID0gY2xhbXA7XHJcbiAgICB9KShtYXRoID0gZ2VvLm1hdGggfHwgKGdlby5tYXRoID0ge30pKTtcclxufSkoZ2VvID0gZXhwb3J0cy5nZW8gfHwgKGV4cG9ydHMuZ2VvID0ge30pKTtcclxuZXhwb3J0cy5kZWZhdWx0ID0gZ2VvO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW8uanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgYnVsbGV0Q29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9idWxsZXRDb250cm9sbGVyJyk7XHJcbnZhciBidWxsZXRDb250cm9sbGVyXzIgPSByZXF1aXJlKCcuL2J1bGxldENvbnRyb2xsZXInKTtcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBHdW5uZXJDb21wb25lbnQge1xyXG59XHJcbmV4cG9ydHMuR3VubmVyQ29tcG9uZW50ID0gR3VubmVyQ29tcG9uZW50O1xyXG5jb25zdCBCVUxMRVRfTElGRVNQQU4gPSAyO1xyXG5jbGFzcyBHdW5uZXJDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBidWxsZXRDb250cm9sbGVyXzIuQnVsbGV0Q29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9ndW5uZXJzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5ndW5uZXIpXHJcbiAgICAgICAgICAgIHRoaXMuX2d1bm5lcnMuYWRkKGUpOyB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7IHRoaXMuX2d1bm5lcnMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fZ3VubmVycykge1xyXG4gICAgICAgICAgICBpZiAoZS5ndW5uZXIuZGlyZWN0aW9uICYmIGUuZ3VubmVyLnRpbWVMZWZ0IDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBwb3MgPSBlLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGUuZ3VubmVyLmRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgIGxldCB2ZWwgPSBbMCwgMF07XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFkID0gMDtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBoeXNpY3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2ZWwgPSBlLnBoeXNpY3MudmVsb2NpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmFkID0gZS5waHlzaWNzLnJhZGl1cztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBuZXdQb3MgPSBnZW9fMS5Qb2ludC5jbG9uZShwb3MpO1xyXG4gICAgICAgICAgICAgICAgbmV3UG9zW1hdICs9IGRpcltYXSAqIHJhZCAqIDEuNTtcclxuICAgICAgICAgICAgICAgIG5ld1Bvc1tZXSArPSBkaXJbWV0gKiByYWQgKiAxLjU7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmV3VmVsID0gZ2VvXzEuUG9pbnQuY2xvbmUodmVsKTtcclxuICAgICAgICAgICAgICAgIG5ld1ZlbFtYXSArPSBkaXJbWF0gKiBlLmd1bm5lci5idWxsZXRTcGVlZDtcclxuICAgICAgICAgICAgICAgIG5ld1ZlbFtZXSArPSBkaXJbWV0gKiBlLmd1bm5lci5idWxsZXRTcGVlZDtcclxuICAgICAgICAgICAgICAgIGUuZ3VubmVyLnRpbWVMZWZ0ID0gMSAvIGUuZ3VubmVyLnJhdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KGJ1bGxldENvbnRyb2xsZXJfMS5CdWxsZXRDb21wb25lbnQuY3JlYXRlQnVsbGV0KHtcclxuICAgICAgICAgICAgICAgICAgICBkYW1hZ2U6IGUuZ3VubmVyLmRhbWFnZSxcclxuICAgICAgICAgICAgICAgICAgICBkYW1hZ2VHcm91cDogZS5ndW5uZXIuZGFtYWdlR3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zOiBuZXdQb3MsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVsOiBuZXdWZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpZmVzcGFuOiBCVUxMRVRfTElGRVNQQU4sXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGUuZ3VubmVyLmNvbG9yLFxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUuZ3VubmVyLnRpbWVMZWZ0ID0gTWF0aC5tYXgoMCwgZS5ndW5uZXIudGltZUxlZnQgLSBzZWNvbmRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5HdW5uZXJDb250cm9sbGVyID0gR3VubmVyQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChHdW5uZXJDb250cm9sbGVyKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5idWxsZXRDb250cm9sbGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBHdW5uZXJDb250cm9sbGVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoR3VubmVyQ29udHJvbGxlciA9IGV4cG9ydHMuR3VubmVyQ29udHJvbGxlciB8fCAoZXhwb3J0cy5HdW5uZXJDb250cm9sbGVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z3VubmVyQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbihmdW5jdGlvbiAoRGFtYWdlR3JvdXApIHtcclxuICAgIERhbWFnZUdyb3VwW0RhbWFnZUdyb3VwW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XHJcbiAgICBEYW1hZ2VHcm91cFtEYW1hZ2VHcm91cFtcIlBsYXllclwiXSA9IDFdID0gXCJQbGF5ZXJcIjtcclxuICAgIERhbWFnZUdyb3VwW0RhbWFnZUdyb3VwW1wiRW5lbXlcIl0gPSAyXSA9IFwiRW5lbXlcIjtcclxuICAgIERhbWFnZUdyb3VwW0RhbWFnZUdyb3VwW1wiQWxsXCJdID0gMjE0NzQ4MzY0N10gPSBcIkFsbFwiO1xyXG59KShleHBvcnRzLkRhbWFnZUdyb3VwIHx8IChleHBvcnRzLkRhbWFnZUdyb3VwID0ge30pKTtcclxudmFyIERhbWFnZUdyb3VwID0gZXhwb3J0cy5EYW1hZ2VHcm91cDtcclxuY2xhc3MgSGVhbHRoQ29udHJvbGxlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgSGVhbHRoQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLl9oZWFsdGhFbnRpdGllcyA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eUFkZGVkLmxpc3RlbihlID0+IHsgaWYgKGUuaGVhbHRoKVxyXG4gICAgICAgICAgICB0aGlzLl9oZWFsdGhFbnRpdGllcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5faGVhbHRoRW50aXRpZXMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIGRhbWFnZUVudGl0eShlbnRpdHksIGRhbWFnZSwgc291cmNlLCBkYW1hZ2VHcm91cCkge1xyXG4gICAgICAgIGlmIChkYW1hZ2VHcm91cCA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIGRhbWFnZUdyb3VwID0gRGFtYWdlR3JvdXAuQWxsO1xyXG4gICAgICAgIGlmIChlbnRpdHkuaGVhbHRoID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGFtYWdlR3JvdXAgJiBlbnRpdHkuaGVhbHRoLmRhbWFnZUdyb3VwKSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5oZWFsdGguaHAgLT0gZGFtYWdlO1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmhlYWx0aC5ocCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHMucmVhcGVyLmtpbGxFbnRpdHkoZW50aXR5LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSGVhbHRoQ29udHJvbGxlciA9IEhlYWx0aENvbnRyb2xsZXI7XHJcbihmdW5jdGlvbiAoSGVhbHRoQ29udHJvbGxlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5yZWFwZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBIZWFsdGhDb250cm9sbGVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoSGVhbHRoQ29udHJvbGxlciA9IGV4cG9ydHMuSGVhbHRoQ29udHJvbGxlciB8fCAoZXhwb3J0cy5IZWFsdGhDb250cm9sbGVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aGVhbHRoQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgSHVkIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBIdWQuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJzb3JEaXNwbGF5ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3Vyc29yRGlzcGxheSA9IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBbMCwgMF0sXHJcbiAgICAgICAgICAgICAgICByZW5kZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM4MDgwODAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGFscGhhOiAwLjMsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiAzLFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlOiAnaGV4YWdvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLjEyNSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhCbHVyOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGdsb3c6IDEsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KHRoaXMuX2N1cnNvckRpc3BsYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY3Vyc29yID0gdGhpcy5kZXBzLmlucHV0LmN1cnNvcjtcclxuICAgICAgICBpZiAoY3Vyc29yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnNvckRpc3BsYXkucG9zaXRpb24gPSBnZW9fMS5Qb2ludC5jbG9uZShjdXJzb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fZGlzcGxheUNvbnRyb2xsZXIgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTY29yZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlIZWFsdGgoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkaXNwbGF5U2NvcmUoKSB7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5kZXBzLnBsYXllckNvbnRyb2xsZXIuc2NvcmU7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXIuc2NvcmUuc2V0VmFsdWUoc2NvcmUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBkaXNwbGF5SGVhbHRoKCkge1xyXG4gICAgICAgIGxldCBwbGF5ZXIgPSB0aGlzLmRlcHMucGxheWVyQ29udHJvbGxlci5wbGF5ZXI7XHJcbiAgICAgICAgaWYgKHBsYXllciA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGhlYWx0aCA9IHBsYXllci5oZWFsdGg7XHJcbiAgICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXIuaHAuc2V0VmFsdWUoaGVhbHRoLmhwLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVyLm1heEhwLnNldFZhbHVlKGhlYWx0aC5tYXhIcC50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIHNldERpc3BsYXlDb250cm9sbGVyKGhkYykge1xyXG4gICAgICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVyID0gaGRjO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSHVkID0gSHVkO1xyXG4oZnVuY3Rpb24gKEh1ZCkge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyQ29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEh1ZC5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKEh1ZCA9IGV4cG9ydHMuSHVkIHx8IChleHBvcnRzLkh1ZCA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh1ZC5qcy5tYXAiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9ub2RlL25vZGUuZC50c1wiIC8+XHJcbid1c2Ugc3RyaWN0JztcclxudmFyIGdhbWVfMSA9IHJlcXVpcmUoJy4vZ2FtZScpO1xyXG52YXIgaGVhbHRoQ29udHJvbGxlcl8xID0gcmVxdWlyZSgnLi9oZWFsdGhDb250cm9sbGVyJyk7XHJcbnZhciBpbnB1dF8xID0gcmVxdWlyZSgnLi9pbnB1dCcpO1xyXG5sZXQgbWFpbkNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluQ2FudmFzJyk7XHJcbmxldCBnYW1lID0gbmV3IGdhbWVfMS5HYW1lKCk7XHJcbmdhbWUuaW5pdCgpO1xyXG5nYW1lLnN5c3RlbXMucmVuZGVyZXIuc2V0Q2FudmFzKG1haW5DYW52YXMpO1xyXG5jbGFzcyBFbGVtZW50QmluZGluZyB7XHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBhdHRyaWJ1dGUpIHtcclxuICAgICAgICBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGUgfHwgJ2lubmVyVGV4dCc7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZSA9IGF0dHJpYnV0ZTtcclxuICAgIH1cclxuICAgIHNldFZhbHVlKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50W3RoaXMuYXR0cmlidXRlXSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcbnZhciBodWREaXNwbGF5Q29udHJvbGxlciA9IHtcclxuICAgIHNjb3JlOiBuZXcgRWxlbWVudEJpbmRpbmcoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2h1ZF9zY29yZScpKSxcclxuICAgIGhwOiBuZXcgRWxlbWVudEJpbmRpbmcoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2h1ZF9ocCcpKSxcclxuICAgIG1heEhwOiBuZXcgRWxlbWVudEJpbmRpbmcoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2h1ZF9tYXhIcCcpKSxcclxufTtcclxuZ2FtZS5zeXN0ZW1zLmh1ZC5zZXREaXNwbGF5Q29udHJvbGxlcihodWREaXNwbGF5Q29udHJvbGxlcik7XHJcbmxldCBsYXN0U3RlcFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxubGV0IHRpbWVzY2FsZSA9IDE7XHJcbnNldFRpbWVvdXQoZnVuY3Rpb24gc3RlcCgpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IHN0ZXBUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgZ2FtZS5zdGVwKChzdGVwVGltZSAtIGxhc3RTdGVwVGltZSkgKiB0aW1lc2NhbGUpO1xyXG4gICAgICAgIGxhc3RTdGVwVGltZSA9IHN0ZXBUaW1lO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KHN0ZXAsIDMwKTtcclxufSwgMzApO1xyXG5nYW1lLnN5c3RlbXMuZW50aXRpZXMuYWRkRW50aXR5KHtcclxuICAgIHBvc2l0aW9uOiBbMCwgMF0sXHJcbiAgICBwaHlzaWNzOiB7XHJcbiAgICAgICAgdmVsb2NpdHk6IFswLCAwXSxcclxuICAgICAgICByYWRpdXM6IDEsXHJcbiAgICAgICAgZHJhZzogMixcclxuICAgICAgICB0aGV0YTogMCxcclxuICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICBtYXNzOiAxLFxyXG4gICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICBjb2xsaWRlOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJlbmRlcjoge1xyXG4gICAgICAgIGNvbG9yOiAnIzAwQTBGRicsXHJcbiAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgc2hhcGU6ICdoZXhhZ29uJyxcclxuICAgICAgICByYWRpdXM6IDEuMixcclxuICAgICAgICBsaW5lV2lkdGg6IDAuMjUsXHJcbiAgICAgICAgbWF4Qmx1cjogMyxcclxuICAgICAgICBnbG93OiAxLFxyXG4gICAgfSxcclxuICAgIHBsYXllcjoge1xyXG4gICAgICAgIHNjb3JlOiAwLFxyXG4gICAgfSxcclxuICAgIHNoaXA6IHtcclxuICAgICAgICBhY2NlbDogNjAwLFxyXG4gICAgICAgIGV4aGF1c3Q6IHtcclxuICAgICAgICAgICAgcmF0ZTogODAsXHJcbiAgICAgICAgICAgIG1hc3M6IDAuNixcclxuICAgICAgICAgICAgcmFkaXVzOiAwLjMsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBndW5uZXI6IHtcclxuICAgICAgICByYXRlOiAxMCxcclxuICAgICAgICBkaXJlY3Rpb246IG51bGwsXHJcbiAgICAgICAgdGltZUxlZnQ6IDAsXHJcbiAgICAgICAgZGFtYWdlOiA2LFxyXG4gICAgICAgIGRhbWFnZUdyb3VwOiBoZWFsdGhDb250cm9sbGVyXzEuRGFtYWdlR3JvdXAuQWxsICYgfmhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5QbGF5ZXIsXHJcbiAgICAgICAgYnVsbGV0U3BlZWQ6IDIwMCxcclxuICAgICAgICBjb2xvcjogJyM0MEEwRkYnLFxyXG4gICAgfSxcclxuICAgIGhlYWx0aDoge1xyXG4gICAgICAgIGhwOiA1MCxcclxuICAgICAgICBtYXhIcDogNTAsXHJcbiAgICAgICAgZGFtYWdlR3JvdXA6IGhlYWx0aENvbnRyb2xsZXJfMS5EYW1hZ2VHcm91cC5QbGF5ZXIsXHJcbiAgICB9LFxyXG59KTtcclxubGV0IGtleU1hcCA9IHtcclxuICAgIDgxOiBpbnB1dF8xLktleS5VcExlZnQsXHJcbiAgICA4NzogaW5wdXRfMS5LZXkuVXAsXHJcbiAgICA2OTogaW5wdXRfMS5LZXkuVXBSaWdodCxcclxuICAgIDY1OiBpbnB1dF8xLktleS5Eb3duTGVmdCxcclxuICAgIDgzOiBpbnB1dF8xLktleS5Eb3duLFxyXG4gICAgNjg6IGlucHV0XzEuS2V5LkRvd25SaWdodCxcclxufTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xyXG4gICAgbGV0IGtleSA9IGtleU1hcFtlLmtleUNvZGVdO1xyXG4gICAgaWYgKGtleSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBnYW1lLnN5c3RlbXMuaW5wdXQua2V5RG93bihrZXkpO1xyXG4gICAgfVxyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcclxuICAgIGxldCBrZXkgPSBrZXlNYXBbZS5rZXlDb2RlXTtcclxuICAgIGlmIChrZXkgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleVVwKGtleSk7XHJcbiAgICB9XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuICAgIGxldCByZWN0ID0gbWFpbkNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGxldCBwID0gW1xyXG4gICAgICAgIGUuY2xpZW50WCAtIHJlY3QubGVmdCxcclxuICAgICAgICBlLmNsaWVudFkgLSByZWN0LnRvcCxcclxuICAgIF07XHJcbiAgICBnYW1lLnN5c3RlbXMuaW5wdXQuY3Vyc29yID0gZ2FtZS5zeXN0ZW1zLnJlbmRlcmVyLnNjcmVlblRvV29ybGQocCk7XHJcbn0pO1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHtcclxuICAgIGdhbWUuc3lzdGVtcy5pbnB1dC5rZXlEb3duKGlucHV0XzEuS2V5LkZpcmUpO1xyXG59KTtcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4ge1xyXG4gICAgZ2FtZS5zeXN0ZW1zLmlucHV0LmtleVVwKGlucHV0XzEuS2V5LkZpcmUpO1xyXG59KTtcclxubGV0IGxhc3RSZW5kZXJUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBsZXQgcmVuZGVyVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZ2FtZS5zeXN0ZW1zLnJlbmRlcmVyLnJlbmRlcihyZW5kZXJUaW1lIC0gbGFzdFJlbmRlclRpbWUpO1xyXG4gICAgbGFzdFJlbmRlclRpbWUgPSByZW5kZXJUaW1lO1xyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XHJcbn0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbihmdW5jdGlvbiAoS2V5KSB7XHJcbiAgICBLZXlbS2V5W1wiVXBMZWZ0XCJdID0gMF0gPSBcIlVwTGVmdFwiO1xyXG4gICAgS2V5W0tleVtcIlVwXCJdID0gMV0gPSBcIlVwXCI7XHJcbiAgICBLZXlbS2V5W1wiVXBSaWdodFwiXSA9IDJdID0gXCJVcFJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRG93bkxlZnRcIl0gPSAzXSA9IFwiRG93bkxlZnRcIjtcclxuICAgIEtleVtLZXlbXCJEb3duXCJdID0gNF0gPSBcIkRvd25cIjtcclxuICAgIEtleVtLZXlbXCJEb3duUmlnaHRcIl0gPSA1XSA9IFwiRG93blJpZ2h0XCI7XHJcbiAgICBLZXlbS2V5W1wiRmlyZVwiXSA9IDZdID0gXCJGaXJlXCI7XHJcbn0pKGV4cG9ydHMuS2V5IHx8IChleHBvcnRzLktleSA9IHt9KSk7XHJcbnZhciBLZXkgPSBleHBvcnRzLktleTtcclxuKGZ1bmN0aW9uIChLZXlTdGF0ZSkge1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJQcmVzc2luZ1wiXSA9IDBdID0gXCJQcmVzc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxuICAgIEtleVN0YXRlW0tleVN0YXRlW1wiUmVsZWFzaW5nXCJdID0gMl0gPSBcIlJlbGVhc2luZ1wiO1xyXG4gICAgS2V5U3RhdGVbS2V5U3RhdGVbXCJVcFwiXSA9IDNdID0gXCJVcFwiO1xyXG59KShleHBvcnRzLktleVN0YXRlIHx8IChleHBvcnRzLktleVN0YXRlID0ge30pKTtcclxudmFyIEtleVN0YXRlID0gZXhwb3J0cy5LZXlTdGF0ZTtcclxudmFyIEtleVN0YXRlO1xyXG4oZnVuY3Rpb24gKEtleVN0YXRlKSB7XHJcbiAgICBmdW5jdGlvbiBpc0Rvd24oc3RhdGUpIHtcclxuICAgICAgICByZXR1cm4gc3RhdGUgPCAyO1xyXG4gICAgfVxyXG4gICAgS2V5U3RhdGUuaXNEb3duID0gaXNEb3duO1xyXG59KShLZXlTdGF0ZSA9IGV4cG9ydHMuS2V5U3RhdGUgfHwgKGV4cG9ydHMuS2V5U3RhdGUgPSB7fSkpO1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSB7fTtcclxuICAgICAgICB0aGlzLl90b1JlbGVhc2UgPSBbXTtcclxuICAgICAgICBsZXQga2V5Q291bnQgPSBPYmplY3Qua2V5cyhLZXkpLmxlbmd0aCAvIDI7XHJcbiAgICAgICAgdGhpcy5fa2V5cyA9IG5ldyBBcnJheShrZXlDb3VudCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5VcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbml0KCkgeyB9XHJcbiAgICBnZXRLZXkoa2V5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleXNba2V5XTtcclxuICAgIH1cclxuICAgIGtleURvd24oa2V5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2tleXNba2V5XSAhPSBLZXlTdGF0ZS5Eb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleXNba2V5XSA9IEtleVN0YXRlLlByZXNzaW5nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGtleVVwKGtleSkge1xyXG4gICAgICAgIHRoaXMuX3RvUmVsZWFzZS5wdXNoKGtleSk7XHJcbiAgICB9XHJcbiAgICBwb3N0U3RlcCgpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2tleXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUHJlc3NpbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaV0gPSBLZXlTdGF0ZS5Eb3duO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2tleXNbaV0gPT0gS2V5U3RhdGUuUmVsZWFzaW5nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2ldID0gS2V5U3RhdGUuVXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIHRoaXMuX3RvUmVsZWFzZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fa2V5c1trZXldICE9IEtleVN0YXRlLlVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzW2tleV0gPSBLZXlTdGF0ZS5SZWxlYXNpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdG9SZWxlYXNlLmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5JbnB1dCA9IElucHV0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnB1dC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbnZhciBQYXJ0aWNsZUNvbXBvbmVudDtcclxuKGZ1bmN0aW9uIChQYXJ0aWNsZUNvbXBvbmVudCkge1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlUGFydGljbGUocG9zLCB2ZWwsIGNvbG9yLCBtYXNzLCByYWRpdXMsIGxpZmVzcGFuKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IHBvcyxcclxuICAgICAgICAgICAgcGh5c2ljczoge1xyXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlbCxcclxuICAgICAgICAgICAgICAgIGJvdW5jZTogMC45NixcclxuICAgICAgICAgICAgICAgIGRyYWc6IDAuNSxcclxuICAgICAgICAgICAgICAgIG1hc3M6IG1hc3MsXHJcbiAgICAgICAgICAgICAgICBvbWVnYTogMCxcclxuICAgICAgICAgICAgICAgIHRoZXRhOiAwLFxyXG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjI1LFxyXG4gICAgICAgICAgICAgICAgY29sbGlkZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbmRlcjoge1xyXG4gICAgICAgICAgICAgICAgYWxwaGE6IDEsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogY29sb3IsXHJcbiAgICAgICAgICAgICAgICBsaW5lV2lkdGg6IDAuMSxcclxuICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxyXG4gICAgICAgICAgICAgICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAgICAgbWF4Qmx1cjogMSxcclxuICAgICAgICAgICAgICAgIGdsb3c6IDAsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBhcnRpY2xlOiB7XHJcbiAgICAgICAgICAgICAgICBsaWZlc3BhbjogbGlmZXNwYW4sXHJcbiAgICAgICAgICAgICAgICB0aW1lUmVtYWluaW5nOiBsaWZlc3BhbixcclxuICAgICAgICAgICAgICAgIGNvdW50OiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBQYXJ0aWNsZUNvbXBvbmVudC5jcmVhdGVQYXJ0aWNsZSA9IGNyZWF0ZVBhcnRpY2xlO1xyXG59KShQYXJ0aWNsZUNvbXBvbmVudCA9IGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgfHwgKGV4cG9ydHMuUGFydGljbGVDb21wb25lbnQgPSB7fSkpO1xyXG5jbGFzcyBQYXJ0aWNsZUNvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFBhcnRpY2xlQ29udHJvbGxlci5EZXBlbmRlbmNpZXMoKTtcclxuICAgICAgICB0aGlzLm1heFBhcnRpY2xlcyA9IDIwMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZUNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9wYXJ0aWNsZXMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXJ0aWNsZXMuYWRkKGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGUucGFydGljbGUuY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICArK3RoaXMuX3BhcnRpY2xlQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BhcnRpY2xlQ291bnQgPiB0aGlzLm1heFBhcnRpY2xlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdG9EZWxldGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGUyIG9mIHRoaXMuX3BhcnRpY2xlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUyLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9EZWxldGUgPSBlMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9EZWxldGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkodG9EZWxldGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFydGljbGVzLmRlbGV0ZShlKTtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBhcnRpY2xlLmNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLS10aGlzLl9wYXJ0aWNsZUNvdW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlIG9mIHRoaXMuX3BhcnRpY2xlcykge1xyXG4gICAgICAgICAgICBpZiAoZS5wYXJ0aWNsZS50aW1lUmVtYWluaW5nIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5yZW1vdmVFbnRpdHkoZSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnJlbmRlci5hbHBoYSA9IGUucGFydGljbGUudGltZVJlbWFpbmluZyAvIGUucGFydGljbGUubGlmZXNwYW47XHJcbiAgICAgICAgICAgIGUucGFydGljbGUudGltZVJlbWFpbmluZyAtPSBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciA9IFBhcnRpY2xlQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChQYXJ0aWNsZUNvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFBhcnRpY2xlQ29udHJvbGxlci5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBhcnRpY2xlQ29udHJvbGxlciA9IGV4cG9ydHMuUGFydGljbGVDb250cm9sbGVyIHx8IChleHBvcnRzLlBhcnRpY2xlQ29udHJvbGxlciA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnRpY2xlQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBnZW9fMSA9IHJlcXVpcmUoJy4vZ2VvJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY29uc3QgV09STERfRFJBRyA9IDQ7XHJcbmNsYXNzIFBoeXNpY3Mge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFBoeXNpY3MuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICAgICAgdGhpcy5pdGVyYXRpb25zID0gNDtcclxuICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgdGhpcy5fcGh5c09iamVjdHMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnBoeXNpY3MpXHJcbiAgICAgICAgICAgIHRoaXMuX3BoeXNPYmplY3RzLmFkZChlKTsgfSk7XHJcbiAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmVudGl0eVJlbW92ZWQubGlzdGVuKGUgPT4geyB0aGlzLl9waHlzT2JqZWN0cy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcChlbGFwc2VkTXMpIHtcclxuICAgICAgICB0aGlzLmludGVyc2VjdGlvbnMuY2xlYXIoKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaXRlcmF0aW9uczsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gdGhpcy5zdGVwSW50ZXJuYWwoZWxhcHNlZE1zIC8gdGhpcy5pdGVyYXRpb25zKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW50ZXIgb2YgaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJbnRlcnNlY3Rpb24oaW50ZXIuYSwgaW50ZXIuYik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEludGVyc2VjdGlvbihpbnRlci5iLCBpbnRlci5hKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZEludGVyc2VjdGlvbihhLCBiKSB7XHJcbiAgICAgICAgbGV0IGludGVycyA9IHRoaXMuaW50ZXJzZWN0aW9ucy5nZXQoYSk7XHJcbiAgICAgICAgaWYgKGludGVycyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaW50ZXJzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJzZWN0aW9ucy5zZXQoYSwgaW50ZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW50ZXJzLnB1c2goeyBhOiBhLCBiOiBiIH0pO1xyXG4gICAgfVxyXG4gICAgc3RlcEludGVybmFsKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5fcGh5c09iamVjdHMpIHtcclxuICAgICAgICAgICAgbGV0IHBoeXMgPSBlbnRpdHkucGh5c2ljcztcclxuICAgICAgICAgICAgbGV0IHBvcyA9IGVudGl0eS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgbGV0IHZlbCA9IHBoeXMudmVsb2NpdHk7XHJcbiAgICAgICAgICAgIHBvc1tYXSArPSB2ZWxbWF0gKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICBwb3NbWV0gKz0gdmVsW1ldICogc2Vjb25kcztcclxuICAgICAgICAgICAgbGV0IGRyYWdDb2VmZiA9IE1hdGgucG93KE1hdGguRSwgLVdPUkxEX0RSQUcgKiBwaHlzLmRyYWcgKiBzZWNvbmRzKTtcclxuICAgICAgICAgICAgdmVsW1hdICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgdmVsW1ldICo9IGRyYWdDb2VmZjtcclxuICAgICAgICAgICAgcGh5cy50aGV0YSArPSBwaHlzLm9tZWdhICogc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGludGVyc2VjdGlvbnMgPSB0aGlzLmZpbmRJbnRlcnNlY3Rpb25zKCk7XHJcbiAgICAgICAgdGhpcy5jb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKTtcclxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcclxuICAgIH1cclxuICAgIGZpbmRJbnRlcnNlY3Rpb25zKCkge1xyXG4gICAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gW107XHJcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fcGh5c09iamVjdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnBoeXNpY3MuY29sbGlkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTb3J0IGJ5IGxlZnRtb3N0IGJvdW5kIG9mIGNpcmNsZS5cclxuICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IE1hdGguc2lnbigoYS5wb3NpdGlvbltYXSAtIGEucGh5c2ljcy5yYWRpdXMpIC0gKGIucG9zaXRpb25bWF0gLSBiLnBoeXNpY3MucmFkaXVzKSkpO1xyXG4gICAgICAgIC8vIFN3ZWVwIGxlZnQtdG8tcmlnaHQgdGhyb3VnaCB0aGUgZW50aXRpZXMuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBhID0gbGlzdFtpXTtcclxuICAgICAgICAgICAgbGV0IHJpZ2h0RWRnZSA9IGEucG9zaXRpb25bWF0gKyBhLnBoeXNpY3MucmFkaXVzO1xyXG4gICAgICAgICAgICAvLyBDaGVjayBvbmx5IGVudGl0aWVzIHRvIHRoZSByaWdodCBvZiBhO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsaXN0Lmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYiA9IGxpc3Rbal07XHJcbiAgICAgICAgICAgICAgICBpZiAoYi5wb3NpdGlvbltYXSAtIGIucGh5c2ljcy5yYWRpdXMgPj0gcmlnaHRFZGdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gaW50ZXJzZWN0aW9ucyBhcmUgcG9zc2libGUgYWZ0ZXIgdGhpcy5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCByYWRTcXIgPSBNYXRoLnBvdygoYS5waHlzaWNzLnJhZGl1cyArIGIucGh5c2ljcy5yYWRpdXMpLCAyKTtcclxuICAgICAgICAgICAgICAgIGxldCBkaXN0U3FyID0gZ2VvXzEuUG9pbnQuZGlzdFNxdWFyZWQoYS5wb3NpdGlvbiwgYi5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzdFNxciA8IHJhZFNxcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbnMucHVzaCh7IGE6IGEsIGI6IGIgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XHJcbiAgICB9XHJcbiAgICBjb3JyZWN0Q29sbGlzaW9ucyhpbnRlcnNlY3Rpb25zKSB7XHJcbiAgICAgICAgbGV0IGNvcnJlY3Rpb25zID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgb2YgaW50ZXJzZWN0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgYSA9IGkuYTtcclxuICAgICAgICAgICAgbGV0IGIgPSBpLmI7XHJcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIGRpZmZlcmVuY2UgaW4gcG9zaXRpb24uXHJcbiAgICAgICAgICAgIGxldCBkaWZQID0gZ2VvXzEuUG9pbnQuc3VidHJhY3QoYi5wb3NpdGlvbiwgYS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBnZW9fMS5Qb2ludC5sZW5ndGgoZGlmUCk7XHJcbiAgICAgICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgZGlmZmVyZW5jZS5cclxuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IFtkaWZQW1hdIC8gbGVuLCBkaWZQW1ldIC8gbGVuXTtcclxuICAgICAgICAgICAgLy8gRmluZCB0aGUgZGlmZmVyZW5jZSBpbiB2ZWxvY2l0eS5cclxuICAgICAgICAgICAgbGV0IGRpZlYgPSBnZW9fMS5Qb2ludC5zdWJ0cmFjdChiLnBoeXNpY3MudmVsb2NpdHksIGEucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgIGxldCBkb3QgPSBnZW9fMS5Qb2ludC5kb3QoZGlmViwgbm9ybWFsKTtcclxuICAgICAgICAgICAgbGV0IGJvdW5jZSA9IGEucGh5c2ljcy5ib3VuY2UgKiBiLnBoeXNpY3MuYm91bmNlO1xyXG4gICAgICAgICAgICBsZXQgZHYgPSBbbm9ybWFsW1hdICogZG90ICogYm91bmNlLCBub3JtYWxbWV0gKiBkb3QgKiBib3VuY2VdO1xyXG4gICAgICAgICAgICBsZXQgdG90YWxNYXNzID0gYS5waHlzaWNzLm1hc3MgKyBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgYS5waHlzaWNzLnZlbG9jaXR5W1hdICs9IGR2W1hdICogYi5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIGEucGh5c2ljcy52ZWxvY2l0eVtZXSArPSBkdltZXSAqIGIucGh5c2ljcy5tYXNzIC8gdG90YWxNYXNzO1xyXG4gICAgICAgICAgICBiLnBoeXNpY3MudmVsb2NpdHlbWF0gLT0gZHZbWF0gKiBhLnBoeXNpY3MubWFzcyAvIHRvdGFsTWFzcztcclxuICAgICAgICAgICAgYi5waHlzaWNzLnZlbG9jaXR5W1ldIC09IGR2W1ldICogYS5waHlzaWNzLm1hc3MgLyB0b3RhbE1hc3M7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYWNlIHRoZSBlbnRpdGllcyBvdXQgb2YgZWFjaCBvdGhlci5cclxuICAgICAgICAgICAgbGV0IGNvckEgPSBjb3JyZWN0aW9ucy5nZXQoYSk7XHJcbiAgICAgICAgICAgIGlmIChjb3JBID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQSA9IHsgZDogWzAsIDBdLCBtYXNzOiAwIH07XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9ucy5zZXQoYSwgY29yQSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGNvckIgPSBjb3JyZWN0aW9ucy5nZXQoYik7XHJcbiAgICAgICAgICAgIGlmIChjb3JCID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29yQiA9IHsgZDogWzAsIDBdLCBtYXNzOiAwIH07XHJcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9ucy5zZXQoYiwgY29yQik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGRpc3BsYWNlID0gKGEucGh5c2ljcy5yYWRpdXMgKyBiLnBoeXNpY3MucmFkaXVzKSAtIGxlbjtcclxuICAgICAgICAgICAgbGV0IGRpc1ggPSBub3JtYWxbWF0gKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgbGV0IGRpc1kgPSBub3JtYWxbWV0gKiBkaXNwbGFjZTtcclxuICAgICAgICAgICAgY29yQS5kW1hdIC09IGRpc1ggKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS5kW1ldIC09IGRpc1kgKiBiLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQS5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICAgICAgY29yQi5kW1hdICs9IGRpc1ggKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi5kW1ldICs9IGRpc1kgKiBhLnBoeXNpY3MubWFzcztcclxuICAgICAgICAgICAgY29yQi5tYXNzICs9IHRvdGFsTWFzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga3ZwIG9mIGNvcnJlY3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCBlID0ga3ZwWzBdO1xyXG4gICAgICAgICAgICBsZXQgY29yID0ga3ZwWzFdO1xyXG4gICAgICAgICAgICBsZXQgZHggPSBjb3IuZFtYXSAvIGNvci5tYXNzICogMS4wNTtcclxuICAgICAgICAgICAgbGV0IGR5ID0gY29yLmRbWV0gLyBjb3IubWFzcyAqIDEuMDU7XHJcbiAgICAgICAgICAgIGUucG9zaXRpb25bWF0gKz0gZHg7XHJcbiAgICAgICAgICAgIGUucG9zaXRpb25bWV0gKz0gZHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGh5c2ljcyA9IFBoeXNpY3M7XHJcbihmdW5jdGlvbiAoUGh5c2ljcykge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUGh5c2ljcy5EZXBlbmRlbmNpZXMgPSBEZXBlbmRlbmNpZXM7XHJcbn0pKFBoeXNpY3MgPSBleHBvcnRzLlBoeXNpY3MgfHwgKGV4cG9ydHMuUGh5c2ljcyA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBoeXNpY3MuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgZ2VvXzIgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgaW5wdXRfMSA9IHJlcXVpcmUoJy4vaW5wdXQnKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBQbGF5ZXJDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVwcyA9IG5ldyBQbGF5ZXJDb250cm9sbGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLl9idWxsZXRUaW1lTGVmdCA9IDA7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLnBsYXllciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllciA9IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5UmVtb3ZlZC5saXN0ZW4oZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlID09IHRoaXMucGxheWVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRlcHMucmVhcGVyLmVudGl0eUtpbGxlZC5saXN0ZW4oYXJncyA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhcmdzLmtpbGxlci5wbGF5ZXIgJiYgYXJncy5lbnRpdHkuc2NvcmluZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZSArPSBhcmdzLmVudGl0eS5zY29yaW5nLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBpZiAodGhpcy5wbGF5ZXIgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkdnggPSAwO1xyXG4gICAgICAgIGxldCBkdnkgPSAwO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LlVwKSkpXHJcbiAgICAgICAgICAgIGR2eSAtPSAxO1xyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkRvd24pKSlcclxuICAgICAgICAgICAgZHZ5ICs9IDE7XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXBMZWZ0KSkpIHtcclxuICAgICAgICAgICAgZHZ4IC09IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5IC09IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuVXBSaWdodCkpKSB7XHJcbiAgICAgICAgICAgIGR2eCArPSBnZW9fMi5DT1NfMzA7XHJcbiAgICAgICAgICAgIGR2eSAtPSBnZW9fMi5TSU5fMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkRvd25MZWZ0KSkpIHtcclxuICAgICAgICAgICAgZHZ4IC09IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5ICs9IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0XzEuS2V5U3RhdGUuaXNEb3duKHRoaXMuZGVwcy5pbnB1dC5nZXRLZXkoaW5wdXRfMS5LZXkuRG93blJpZ2h0KSkpIHtcclxuICAgICAgICAgICAgZHZ4ICs9IGdlb18yLkNPU18zMDtcclxuICAgICAgICAgICAgZHZ5ICs9IGdlb18yLlNJTl8zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGxlbiA9IE1hdGguc3FydChNYXRoLnBvdyhkdngsIDIpICsgTWF0aC5wb3coZHZ5LCAyKSk7XHJcbiAgICAgICAgaWYgKGxlbiA8PSAwLjA1KSB7XHJcbiAgICAgICAgICAgIC8vIGVpdGhlciB6ZXJvIG9yIHRoZXJlJ3MgYSByb3VuZGluZyBlcnJvci5cclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2hpcC5kaXJlY3Rpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZHZ4IC89IGxlbjtcclxuICAgICAgICAgICAgZHZ5IC89IGxlbjtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2hpcC5kaXJlY3Rpb24gPSBbZHZ4LCBkdnldO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBCdWxsZXRzOlxyXG4gICAgICAgIGlmIChpbnB1dF8xLktleVN0YXRlLmlzRG93bih0aGlzLmRlcHMuaW5wdXQuZ2V0S2V5KGlucHV0XzEuS2V5LkZpcmUpKSkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZ2VvXzEuUG9pbnQubm9ybWFsaXplKGdlb18xLlBvaW50LnN1YnRyYWN0KHRoaXMuZGVwcy5pbnB1dC5jdXJzb3IsIHRoaXMucGxheWVyLnBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmd1bm5lci5kaXJlY3Rpb24gPSBub3JtYWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllci5ndW5uZXIuZGlyZWN0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2J1bGxldFRpbWVMZWZ0ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9idWxsZXRUaW1lTGVmdCAtPSBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBsYXllckNvbnRyb2xsZXIgPSBQbGF5ZXJDb250cm9sbGVyO1xyXG4oZnVuY3Rpb24gKFBsYXllckNvbnRyb2xsZXIpIHtcclxuICAgIGNsYXNzIERlcGVuZGVuY2llcyBleHRlbmRzIHN5c3RlbV8xLlN5c3RlbS5EZXBlbmRlbmNpZXMge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgc3VwZXIoLi4uYXJncyk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnJlYXBlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFBsYXllckNvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShQbGF5ZXJDb250cm9sbGVyID0gZXhwb3J0cy5QbGF5ZXJDb250cm9sbGVyIHx8IChleHBvcnRzLlBsYXllckNvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wbGF5ZXJDb250cm9sbGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGV2ZW50XzEgPSByZXF1aXJlKCcuL2V2ZW50Jyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNsYXNzIFJlYXBlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmRlcHMgPSBuZXcgUmVhcGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE9jY3VycyB3aGVuIGFuIGVudGl0eSBpcyBraWxsZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5lbnRpdHlLaWxsZWQgPSBuZXcgZXZlbnRfMS5FdmVudCgpO1xyXG4gICAgICAgIHRoaXMuX3RvS2lsbCA9IG5ldyBTZXQoKTtcclxuICAgIH1cclxuICAgIGluaXQoKSB7IH1cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgYW4gZW50aXR5IGFzIGRlYWQuXHJcbiAgICAgKiBUaGUgZW50aXR5IHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHJlYXAoKSBpcyBjYWxsZWQuXHJcbiAgICAgKiBAcGFyYW0gZW50aXR5IFRoZSBlbnRpdHkgdG8ga2lsbC5cclxuICAgICAqL1xyXG4gICAga2lsbEVudGl0eShlbnRpdHksIGtpbGxlcikge1xyXG4gICAgICAgIGVudGl0eS5pc0RlYWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3RvS2lsbC5hZGQoZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eUtpbGxlZC5lbWl0KHsgZW50aXR5OiBlbnRpdHksIGtpbGxlcjoga2lsbGVyIH0pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGRlYWQgZW50aXRpZXMuXHJcbiAgICAgKi9cclxuICAgIHJlYXAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZSBvZiB0aGlzLl90b0tpbGwpIHtcclxuICAgICAgICAgICAgaWYgKGUuaXNEZWFkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMucmVtb3ZlRW50aXR5KGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3RvS2lsbC5jbGVhcigpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUmVhcGVyID0gUmVhcGVyO1xyXG4oZnVuY3Rpb24gKFJlYXBlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUmVhcGVyLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxufSkoUmVhcGVyID0gZXhwb3J0cy5SZWFwZXIgfHwgKGV4cG9ydHMuUmVhcGVyID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVhcGVyLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdlb18xID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIGdlb18yID0gcmVxdWlyZSgnLi9nZW8nKTtcclxudmFyIHN5c3RlbV8xID0gcmVxdWlyZSgnLi9zeXN0ZW0nKTtcclxuY29uc3QgWCA9IDA7XHJcbmNvbnN0IFkgPSAxO1xyXG5jbGFzcyBTdHlsZSB7XHJcbn1cclxuY29uc3QgVklFV19IRUlHSFQgPSA3NTtcclxuY2xhc3MgUmVuZGVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFJlbmRlcmVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuc2hhcGVGbnMgPSB7XHJcbiAgICAgICAgICAgICdjaXJjbGUnOiAoY3R4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIDEsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdoZXhhZ29uJzogKGN0eCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICAgICAgY3R4Lm1vdmVUbygwLCAtMSk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKCtnZW9fMi5DT1NfMzAsIC1nZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygrZ2VvXzIuQ09TXzMwLCArZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oMCwgMSk7XHJcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKC1nZW9fMi5DT1NfMzAsICtnZW9fMi5TSU5fMzApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbygtZ2VvXzIuQ09TXzMwLCAtZ2VvXzIuU0lOXzMwKTtcclxuICAgICAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcclxuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZHBpU2NhbGUgPSAxO1xyXG4gICAgICAgIHRoaXMuZ2xvdyA9IDEwO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhID0geyBwb3M6IFswLCAwXSwgem9vbTogMSB9O1xyXG4gICAgICAgIHRoaXMuX3JlbmRlck9iamVjdHMgPSBuZXcgU2V0KCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlBZGRlZC5saXN0ZW4oZSA9PiB7IGlmIChlLnJlbmRlcilcclxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyT2JqZWN0cy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fcmVuZGVyT2JqZWN0cy5kZWxldGUoZSk7IH0pO1xyXG4gICAgfVxyXG4gICAgc2V0Q2FudmFzKGNhbnZhcykge1xyXG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIH1cclxuICAgIHJlbmRlcihlbGFwc2VkTXMpIHtcclxuICAgICAgICBsZXQgc2Vjb25kcyA9IGVsYXBzZWRNcyAvIDEwMDA7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgbGV0IGNhbnZhcyA9IGN0eC5jYW52YXM7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoICogdGhpcy5kcGlTY2FsZTtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodCAqIHRoaXMuZHBpU2NhbGU7XHJcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldFRyYW5zZm9ybSgpO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLl9yZW5kZXJPYmplY3RzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkucGh5c2ljcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgTUFYX0JMVVJfQ09VTlQgPSA1O1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IGdlb18xLlBvaW50Lm5vcm1hbGl6ZShlbnRpdHkucGh5c2ljcy52ZWxvY2l0eSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3BlZWQgPSBnZW9fMS5Qb2ludC5sZW5ndGgoZW50aXR5LnBoeXNpY3MudmVsb2NpdHkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJsdXJDb3VudCA9IE1hdGguZmxvb3Ioc3BlZWQgKiBzZWNvbmRzIC8gZW50aXR5LnJlbmRlci5yYWRpdXMgKyAxKTtcclxuICAgICAgICAgICAgICAgIGJsdXJDb3VudCA9IE1hdGgubWluKGJsdXJDb3VudCwgTUFYX0JMVVJfQ09VTlQsIGVudGl0eS5yZW5kZXIubWF4Qmx1cik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsdXJDb3VudDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IGdlb18xLlBvaW50LmFkZChlbnRpdHkucG9zaXRpb24sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLWVudGl0eS5waHlzaWNzLnZlbG9jaXR5W1hdICogc2Vjb25kcyAqIGkgLyBibHVyQ291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC1lbnRpdHkucGh5c2ljcy52ZWxvY2l0eVtZXSAqIHNlY29uZHMgKiBpIC8gYmx1ckNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW50aXR5KGVudGl0eSwgcG9zLCBNYXRoLnNxcnQoMS4wIC8gYmx1ckNvdW50KSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXI6IGRpcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFjdG9yOiBzcGVlZCAqIHNlY29uZHMgLyAoYmx1ckNvdW50ICsgMSkgLyBlbnRpdHkucmVuZGVyLnJhZGl1cyArIDEsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVudGl0eShlbnRpdHksIGVudGl0eS5wb3NpdGlvbiwgMSwgbnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW5kZXJFbnRpdHkoZSwgcG9zLCBhbHBoYSwgc3RyZXRjaCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGN0eC5zYXZlKCk7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IGUucmVuZGVyLnJhZGl1cztcclxuICAgICAgICBjdHgudHJhbnNsYXRlKHBvc1tYXSwgcG9zW1ldKTtcclxuICAgICAgICBjdHguc2NhbGUocmFkaXVzLCByYWRpdXMpO1xyXG4gICAgICAgIGlmIChzdHJldGNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RyZXRjaChzdHJldGNoLmRpciwgc3RyZXRjaC5mYWN0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5waHlzaWNzKSB7XHJcbiAgICAgICAgICAgIGN0eC5yb3RhdGUoZS5waHlzaWNzLnRoZXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHN0eWxlID0ge1xyXG4gICAgICAgICAgICBmaWxsOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgICAgICAgICBzdHJva2U6IGUucmVuZGVyLmNvbG9yLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IGUucmVuZGVyLmxpbmVXaWR0aCAvIGUucmVuZGVyLnJhZGl1cyxcclxuICAgICAgICAgICAgYWxwaGE6IGUucmVuZGVyLmFscGhhICogYWxwaGEsXHJcbiAgICAgICAgICAgIGdsb3c6IGUucmVuZGVyLmdsb3csXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNldFN0eWxlKHN0eWxlKTtcclxuICAgICAgICB0aGlzLnNoYXBlRm5zW2UucmVuZGVyLnNoYXBlXShjdHgpO1xyXG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgICBzdHJldGNoKGRpciwgZmFjdG9yKSB7XHJcbiAgICAgICAgbGV0IGFiID0gWzEsIDBdO1xyXG4gICAgICAgIGxldCBhYkRvdCA9IGdlb18xLlBvaW50LmRvdChhYiwgZGlyKTtcclxuICAgICAgICBsZXQgYWJBbW91bnQgPSBhYkRvdCAqIChmYWN0b3IgLSAxKTtcclxuICAgICAgICBhYltYXSArPSBkaXJbWF0gKiBhYkFtb3VudDtcclxuICAgICAgICBhYltZXSArPSBkaXJbWV0gKiBhYkFtb3VudDtcclxuICAgICAgICBsZXQgYmMgPSBbMCwgMV07XHJcbiAgICAgICAgbGV0IGJjRG90ID0gZ2VvXzEuUG9pbnQuZG90KGJjLCBkaXIpO1xyXG4gICAgICAgIGxldCBiY0Ftb3VudCA9IGJjRG90ICogKGZhY3RvciAtIDEpO1xyXG4gICAgICAgIGJjW1hdICs9IGRpcltYXSAqIGJjQW1vdW50O1xyXG4gICAgICAgIGJjW1ldICs9IGRpcltZXSAqIGJjQW1vdW50O1xyXG4gICAgICAgIHRoaXMuX2NvbnRleHQudHJhbnNmb3JtKGFiW1hdLCBhYltZXSwgYmNbWF0sIGJjW1ldLCAwLCAwKTtcclxuICAgIH1cclxuICAgIHNldFRyYW5zZm9ybSgpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5fY29udGV4dDtcclxuICAgICAgICBsZXQgc2NhbGUgPSB0aGlzLmNhbWVyYS56b29tICogY3R4LmNhbnZhcy5oZWlnaHQgLyBWSUVXX0hFSUdIVDtcclxuICAgICAgICBsZXQgZHggPSAtdGhpcy5jYW1lcmEucG9zW1hdICogc2NhbGUgKyBjdHguY2FudmFzLndpZHRoIC8gMjtcclxuICAgICAgICBsZXQgZHkgPSAtdGhpcy5jYW1lcmEucG9zW1ldICogc2NhbGUgKyBjdHguY2FudmFzLmhlaWdodCAvIDI7XHJcbiAgICAgICAgY3R4LnNldFRyYW5zZm9ybShzY2FsZSwgMCwgMCwgc2NhbGUsIGR4LCBkeSk7XHJcbiAgICB9XHJcbiAgICBkcmF3Q2lyY2xlKGNlbnRlciwgcmFkaXVzLCBzdHlsZSkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIHRoaXMuc2V0U3R5bGUoc3R5bGUpO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguYXJjKGNlbnRlcltYXSwgY2VudGVyW1ldLCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIHNldFN0eWxlKHN0eWxlKSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuX2NvbnRleHQ7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHN0eWxlLmZpbGw7XHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3R5bGUuc3Ryb2tlO1xyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3R5bGUuYWxwaGE7XHJcbiAgICAgICAgaWYgKHN0eWxlLmdsb3cgPiAwKSB7XHJcbiAgICAgICAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHN0eWxlLnN0cm9rZTtcclxuICAgICAgICAgICAgY3R4LnNoYWRvd0JsdXIgPSAxMCAqIHN0eWxlLmdsb3c7XHJcbiAgICAgICAgICAgIGN0eC5zaGFkb3dPZmZzZXRYID0gMDtcclxuICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNjcmVlblRvV29ybGQocCkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLl9jb250ZXh0O1xyXG4gICAgICAgIGxldCB4ID0gcFtYXTtcclxuICAgICAgICBsZXQgeSA9IHBbWV07XHJcbiAgICAgICAgeCAtPSBjdHguY2FudmFzLmNsaWVudFdpZHRoIC8gMjtcclxuICAgICAgICB5IC09IGN0eC5jYW52YXMuY2xpZW50SGVpZ2h0IC8gMjtcclxuICAgICAgICBsZXQgZmFjID0gVklFV19IRUlHSFQgLyBjdHguY2FudmFzLmNsaWVudEhlaWdodDtcclxuICAgICAgICB4ICo9IGZhYztcclxuICAgICAgICB5ICo9IGZhYztcclxuICAgICAgICByZXR1cm4gW3gsIHldO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcclxuKGZ1bmN0aW9uIChSZW5kZXJlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgUmVuZGVyZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShSZW5kZXJlciA9IGV4cG9ydHMuUmVuZGVyZXIgfHwgKGV4cG9ydHMuUmVuZGVyZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXJlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBwYXJ0aWNsZUNvbnRyb2xsZXJfMSA9IHJlcXVpcmUoJy4vcGFydGljbGVDb250cm9sbGVyJyk7XHJcbnZhciBzeXN0ZW1fMSA9IHJlcXVpcmUoJy4vc3lzdGVtJyk7XHJcbmNvbnN0IFggPSAwO1xyXG5jb25zdCBZID0gMTtcclxuY2xhc3MgU2hpcENvbnRyb2xsZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFNoaXBDb250cm9sbGVyLkRlcGVuZGVuY2llcygpO1xyXG4gICAgICAgIHRoaXMuX3NoaXBzID0gbmV3IFNldCgpO1xyXG4gICAgfVxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuZW50aXR5QWRkZWQubGlzdGVuKGUgPT4geyBpZiAoZS5zaGlwKVxyXG4gICAgICAgICAgICB0aGlzLl9zaGlwcy5hZGQoZSk7IH0pO1xyXG4gICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5lbnRpdHlSZW1vdmVkLmxpc3RlbihlID0+IHsgdGhpcy5fc2hpcHMuZGVsZXRlKGUpOyB9KTtcclxuICAgIH1cclxuICAgIHN0ZXAoZWxhcHNlZE1zKSB7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBlbGFwc2VkTXMgLyAxMDAwO1xyXG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcy5fc2hpcHMpIHtcclxuICAgICAgICAgICAgaWYgKGUuaXNEZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZS5zaGlwLmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGR2QW1vdW50ID0gZS5zaGlwLmFjY2VsICogc2Vjb25kcztcclxuICAgICAgICAgICAgICAgIGxldCBkdnggPSBlLnNoaXAuZGlyZWN0aW9uW1hdICogZHZBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgZHZ5ID0gZS5zaGlwLmRpcmVjdGlvbltZXSAqIGR2QW1vdW50O1xyXG4gICAgICAgICAgICAgICAgZS5waHlzaWNzLnZlbG9jaXR5W1hdICs9IGR2eDtcclxuICAgICAgICAgICAgICAgIGUucGh5c2ljcy52ZWxvY2l0eVtZXSArPSBkdnk7XHJcbiAgICAgICAgICAgICAgICAvLyBleGhhdXN0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGUuc2hpcC5leGhhdXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4aGF1c3QgPSBlLnNoaXAuZXhoYXVzdDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvYmFibGVBbW91bnQgPSBleGhhdXN0LnJhdGUgKiBzZWNvbmRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3R1YWxBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2JhYmxlQW1vdW50IDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxBbW91bnQgPSBNYXRoLnJhbmRvbSgpIDwgcHJvYmFibGVBbW91bnQgPyAxIDogMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbEFtb3VudCA9IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcHJvYmFibGVBbW91bnQgKiAyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBTcGVlZCA9IGUuc2hpcC5hY2NlbCAqIGUucGh5c2ljcy5tYXNzIC8gZXhoYXVzdC5tYXNzIC8gZXhoYXVzdC5yYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0dWFsQW1vdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNwZWVkRmFjdG9yID0gTWF0aC5yYW5kb20oKSAqIDAuNSArIDAuNzU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwdnggPSAoZS5zaGlwLmRpcmVjdGlvbltYXSAqIC1wU3BlZWQgKiBzcGVlZEZhY3RvcikgKyBlLnBoeXNpY3MudmVsb2NpdHlbWF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwdnkgPSAoZS5zaGlwLmRpcmVjdGlvbltZXSAqIC1wU3BlZWQgKiBzcGVlZEZhY3RvcikgKyBlLnBoeXNpY3MudmVsb2NpdHlbWV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBweCA9IGUucG9zaXRpb25bWF0gLSBlLnNoaXAuZGlyZWN0aW9uW1hdICogZS5waHlzaWNzLnJhZGl1cyAqIDEuMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB5ID0gZS5wb3NpdGlvbltZXSAtIGUuc2hpcC5kaXJlY3Rpb25bWV0gKiBlLnBoeXNpY3MucmFkaXVzICogMS4yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHMuZW50aXRpZXMuYWRkRW50aXR5KHBhcnRpY2xlQ29udHJvbGxlcl8xLlBhcnRpY2xlQ29tcG9uZW50LmNyZWF0ZVBhcnRpY2xlKFtweCwgcHldLCBbcHZ4LCBwdnldLCBlLnJlbmRlci5jb2xvciwgZXhoYXVzdC5tYXNzLCBleGhhdXN0LnJhZGl1cywgMC4zKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuU2hpcENvbnRyb2xsZXIgPSBTaGlwQ29udHJvbGxlcjtcclxuKGZ1bmN0aW9uIChTaGlwQ29udHJvbGxlcikge1xyXG4gICAgY2xhc3MgRGVwZW5kZW5jaWVzIGV4dGVuZHMgc3lzdGVtXzEuU3lzdGVtLkRlcGVuZGVuY2llcyB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoLi4uYXJncykge1xyXG4gICAgICAgICAgICBzdXBlciguLi5hcmdzKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgU2hpcENvbnRyb2xsZXIuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShTaGlwQ29udHJvbGxlciA9IGV4cG9ydHMuU2hpcENvbnRyb2xsZXIgfHwgKGV4cG9ydHMuU2hpcENvbnRyb2xsZXIgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1zaGlwQ29udHJvbGxlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XHJcbnZhciBTeXN0ZW07XHJcbihmdW5jdGlvbiAoU3lzdGVtKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMge1xyXG4gICAgfVxyXG4gICAgU3lzdGVtLkRlcGVuZGVuY2llcyA9IERlcGVuZGVuY2llcztcclxuICAgIC8qKlxyXG4gICAgICogVG9wb2xvZ2ljYWxseSBzb3J0IHRoZSBzeXN0ZW1zIGJhc2VkIG9uIHRoZWlyIGRlcGVuZGVuY2llcy5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdE9yZGVyKHN5c09iamVjdCkge1xyXG4gICAgICAgIGxldCBzeXN0ZW1zID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gc3lzT2JqZWN0KSB7XHJcbiAgICAgICAgICAgIHN5c3RlbXMuYWRkKG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb3JkZXIgPSBbXTtcclxuICAgICAgICB3aGlsZSAoc3lzdGVtcy5zaXplID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbmV4dEl0ZW0gPSBudWxsO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIG9mIHN5c3RlbXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzeXMgPSBzeXNPYmplY3RbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoZGVwZW5kc09uU2V0KHN5cy5kZXBzLCBzeXN0ZW1zKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzeXMgZG9lc24ndCBkZXBlbmQgb24gYW55dGhpbmcgc3RpbGwgaW4gc3lzdGVtcztcclxuICAgICAgICAgICAgICAgICAgICAvLyBpdCBtdXN0IGJlIHRoZSBuZXh0IGluIHRoZSBvcmRlci5cclxuICAgICAgICAgICAgICAgICAgICBuZXh0SXRlbSA9IFtuYW1lLCBzeXNdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXh0SXRlbSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDeWNsaWMgZGVwZW5kZW5jeT9cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN5c3RlbXMuZGVsZXRlKG5leHRJdGVtWzBdKTtcclxuICAgICAgICAgICAgb3JkZXIucHVzaChuZXh0SXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcmRlcjtcclxuICAgIH1cclxuICAgIFN5c3RlbS5pbml0T3JkZXIgPSBpbml0T3JkZXI7XHJcbiAgICBmdW5jdGlvbiBkZXBlbmRzT25TZXQoZGVwcywgc3lzdGVtcykge1xyXG4gICAgICAgIGZvciAobGV0IG5hbWUgaW4gZGVwcykge1xyXG4gICAgICAgICAgICBpZiAoc3lzdGVtcy5oYXMobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluaXRTeXN0ZW1zKHN5c09iamVjdCkge1xyXG4gICAgICAgIGxldCBvcmRlciA9IGluaXRPcmRlcihzeXNPYmplY3QpO1xyXG4gICAgICAgIGlmIChvcmRlciA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIFRzb3J0IGhhcyBmYWlsZWQuIEFib3J0LlxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHBhaXIgb2Ygb3JkZXIpIHtcclxuICAgICAgICAgICAgbGV0IHN5cyA9IHBhaXJbMV07XHJcbiAgICAgICAgICAgIC8vIEZpbGwgaW4gdGhlIGRlcGVuZGVuY2llcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBzeXMuZGVwcykge1xyXG4gICAgICAgICAgICAgICAgc3lzLmRlcHNbbmFtZV0gPSBzeXNPYmplY3RbbmFtZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3lzLmluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBTeXN0ZW0uaW5pdFN5c3RlbXMgPSBpbml0U3lzdGVtcztcclxufSkoU3lzdGVtID0gZXhwb3J0cy5TeXN0ZW0gfHwgKGV4cG9ydHMuU3lzdGVtID0ge30pKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3lzdGVtLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcclxudmFyIGVuZW1pZXNfMSA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xyXG52YXIgZ2VvXzEgPSByZXF1aXJlKCcuL2dlbycpO1xyXG52YXIgc3lzdGVtXzEgPSByZXF1aXJlKCcuL3N5c3RlbScpO1xyXG5jb25zdCBXQVZFX1BFUklPRCA9IDM7XHJcbmNvbnN0IEdFTl9SQURJVVMgPSAyMDA7XHJcbmNsYXNzIFdhdmVHZW5lcmF0b3Ige1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZXBzID0gbmV3IFdhdmVHZW5lcmF0b3IuRGVwZW5kZW5jaWVzKCk7XHJcbiAgICB9XHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuX3dhdmVUaW1lID0gV0FWRV9QRVJJT0Q7XHJcbiAgICB9XHJcbiAgICBzdGVwKGVsYXBzZWRNcykge1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZWxhcHNlZE1zIC8gMTAwMDtcclxuICAgICAgICBpZiAodGhpcy5fd2F2ZVRpbWUgPCAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlcHMuZW5lbXlDb250cm9sbGVyLmVuZW1pZXMuc2l6ZSA8PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVdhdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl93YXZlVGltZSArPSBXQVZFX1BFUklPRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fd2F2ZVRpbWUgLT0gc2Vjb25kcztcclxuICAgIH1cclxuICAgIGdlbmVyYXRlV2F2ZSgpIHtcclxuICAgICAgICBsZXQgZm9sbG93ZXJzID0gMTI7XHJcbiAgICAgICAgbGV0IHRhbmtzID0gMjtcclxuICAgICAgICBsZXQgc2Vla2VycyA9IDg7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb2xsb3dlcnM7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgcCA9IGdlb18xLmdlby5tYXRoLnJhbmRDaXJjbGUoZ2VvXzEuUG9pbnQuemVybygpLCBHRU5fUkFESVVTKTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShlbmVtaWVzXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlRm9sbG93ZXIocCwgZ2VvXzEuUG9pbnQuemVybygpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFua3M7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgcCA9IGdlb18xLmdlby5tYXRoLnJhbmRDaXJjbGUoZ2VvXzEuUG9pbnQuemVybygpLCBHRU5fUkFESVVTKTtcclxuICAgICAgICAgICAgdGhpcy5kZXBzLmVudGl0aWVzLmFkZEVudGl0eShlbmVtaWVzXzEuRW5lbXlDb21wb25lbnQuY3JlYXRlVGFuayhwLCBnZW9fMS5Qb2ludC56ZXJvKCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWVrZXJzOyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IHAgPSBnZW9fMS5nZW8ubWF0aC5yYW5kQ2lyY2xlKGdlb18xLlBvaW50Lnplcm8oKSwgR0VOX1JBRElVUyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVwcy5lbnRpdGllcy5hZGRFbnRpdHkoZW5lbWllc18xLkVuZW15Q29tcG9uZW50LmNyZWF0ZVNlZWtlcihwLCBnZW9fMS5Qb2ludC56ZXJvKCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5XYXZlR2VuZXJhdG9yID0gV2F2ZUdlbmVyYXRvcjtcclxuKGZ1bmN0aW9uIChXYXZlR2VuZXJhdG9yKSB7XHJcbiAgICBjbGFzcyBEZXBlbmRlbmNpZXMgZXh0ZW5kcyBzeXN0ZW1fMS5TeXN0ZW0uRGVwZW5kZW5jaWVzIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLmVuZW15Q29udHJvbGxlciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFdhdmVHZW5lcmF0b3IuRGVwZW5kZW5jaWVzID0gRGVwZW5kZW5jaWVzO1xyXG59KShXYXZlR2VuZXJhdG9yID0gZXhwb3J0cy5XYXZlR2VuZXJhdG9yIHx8IChleHBvcnRzLldhdmVHZW5lcmF0b3IgPSB7fSkpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD13YXZlR2VuZXJhdG9yLmpzLm1hcCJdfQ==
