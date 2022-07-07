function Laser(position, angle, initvel, lcolor) {
    this.pos = position;
    this.vel = p5.Vector.fromAngle(angle).mult(6).add(initvel);
    this.lasercolor = lcolor;
    this.weight = 4;
    this.removed = false;
    this.angle = angle;
    this.initvel = initvel;

    this.render = function () {
        push();
        stroke(this.lasercolor);
        strokeWeight(this.weight);
        point(this.pos.x, this.pos.y);
        pop();
    }

    this.update = function () {
        this.pos.add(this.vel);
    }

    this.checkEdges = function (field) {
        if (this.pos.x < -field.width || this.pos.x > field.width
            || this.pos.y < -field.height || this.pos.y > field.height) {
            return true;
        } else {
            return false;
        }
    }

    this.hit = function (ship) {
        if (dist(this.pos.x, this.pos.y, ship.pos.x, ship.pos.y) < ship.r) {
            return true;
        } else {
            return false;
        }
    }

    this.isnuke = false;

    this.chainreact = function() {
        for (let i = 0; i < 8; i += random(1, 4)) {
            let position = this.pos.copy();
            let laser = new Laser(position, 0, createVector(0, 0), this.lasercolor);
            laser.isnuke = true;
            laser.vel = p5.Vector.fromAngle(random(0, TWO_PI)).mult(random(4, 6));
            lasers.push(laser);
        }
    }

    this.isbomb = false;

    this.explode = function() {
        for (let i = 0; i < 360; i += 20) {
            let position = this.pos.copy();
            let laser = new Laser(position, 0, createVector(0, 0), this.lasercolor);
            laser.vel = p5.Vector.fromAngle(radians(i)).mult(random(5, 15));
            lasers.push(laser);
        }
    }
}
