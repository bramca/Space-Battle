function Ship(color, pos, radius) {
    this.pos = pos;
    this.vel = createVector(0, 0);
    this.r = radius;
    this.angle = 0;
    this.rotation = 0;
    this.thrusting = false;
    this.shipcolor = color;
    this.life = 1;
    this.shield = 0;
    this.bot = false;
    this.shootmodus = 1;
    this.thrustspeed = 0.1;
    this.poweruptimer = 0;
    this.poweruptimerbool = false;
     

    this.setRotation = function (a) {
        this.rotation = a;
    }

    this.render = function (c) {
        push();
        // rotate(this.angle);
        // noFill();
        if (this.shield > 0) {
            noFill();
            stroke('rgba(64,224,208,' + this.shield + ')');
            strokeWeight(2);
            arc(this.pos.x, this.pos.y, 3*this.r, 3*this.r, 0, TWO_PI);
            strokeWeight(1);
        }
        stroke(255);
        fill('red');
        rect(this.pos.x-this.r, this.pos.y-2*this.r, 2*this.r, 5);
        fill('green');
        rect(this.pos.x-this.r, this.pos.y-2*this.r, this.life*2*this.r, 5);
        stroke(this.shipcolor);
        fill(this.shipcolor);
        // triangle(this.pos.x-this.r, this.pos.y+this.r, this.pos.x-this.r, this.pos.y-this.r, this.pos.x+this.r, this.pos.y);
        triangle(this.pos.x+this.r*Math.cos(this.angle), this.pos.y+this.r*Math.sin(this.angle), this.pos.x+this.r*Math.cos(this.angle+127.5*Math.PI/180), this.pos.y+this.r*Math.sin(this.angle+127.5*Math.PI/180), this.pos.x+this.r*Math.cos(this.angle-127.5*Math.PI/180), this.pos.y+this.r*Math.sin(this.angle-127.5*Math.PI/180));
        pop();
    }

    this.turn = function () {
        // this.angle += this.rotation;
        this.angle = (this.angle + this.rotation) % (Math.PI * 2);
    }

    this.update = function (field) {
        this.pos.add(this.vel);
        this.vel.mult(0.99);

        if (this.pos.x < -field.width + this.r) {
            this.pos.x = -field.width + this.r;
            this.vel.mult(0);
        }
        if (this.pos.x > field.width - this.r) {
            this.pos.x = field.width - this.r;
            this.vel.mult(0);
        }
        if (this.pos.y < -field.height + this.r) {
            this.pos.y = -field.height + this.r;
            this.vel.mult(0);
        }
        if (this.pos.y > field.height - this.r) {
            this.pos.y = field.height - this.r;
            this.vel.mult(0);
        }
        if (this.poweruptimer > 0) {
            this.poweruptimer -= 1;
        } else if (this.poweruptimerbool) {
            this.shootmodus = 1;
            this.thrustspeed = 0.1;
            this.poweruptimerbool = false;
        }
    }

    this.thrust = function () {
        if (this.thrusting) {
            this.vel.add(p5.Vector.fromAngle(this.angle).mult(this.thrustspeed));
        }
    }

    this.shoot = function (velocity, shootmod) {
        var lcolor = 'rgb(255,0,0)';
        if (shootmod === 1) {
            let position = this.pos.copy();
            position.add(p5.Vector.fromAngle(this.angle).mult(this.r));
            lasers.push(new Laser(position, this.angle, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
        } else if (shootmod === 2) {
            let position1 = this.pos.copy();
            position1.add(p5.Vector.fromAngle(this.angle + HALF_PI).mult(this.r / 2));
            let position2 = this.pos.copy();
            position2.add(p5.Vector.fromAngle(this.angle - HALF_PI).mult(this.r / 2));
            lasers.push(new Laser(position1, this.angle, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
            lasers.push(new Laser(position2, this.angle, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
        } else if (shootmod === 3) {
            let position = this.pos.copy();
            position.add(p5.Vector.fromAngle(this.angle).mult(this.r));
            lasers.push(new Laser(position, this.angle, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
            let position1 = this.pos.copy();
            position1.add(p5.Vector.fromAngle(this.angle).mult(this.r));
            let position2 = this.pos.copy();
            position2.add(p5.Vector.fromAngle(this.angle).mult(this.r));
            lasers.push(new Laser(position1, this.angle + PI/8, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
            lasers.push(new Laser(position2, this.angle - PI/8, p5.Vector.fromAngle(this.angle).mult(this.vel.mag() + velocity), lcolor));
        }
    }

    var pulseCount = 0;

    this.pulse = function() {
        if (pulseCount < 2) {
            var pulsecolor = 'rgb(0,255,127)';
            pulseCount++;
            for (let i = 0; i < 360; i += 10) {
                let position = this.pos.copy();
                let laser = new Laser(position, 0, createVector(0, 0), pulsecolor);
                laser.vel = p5.Vector.fromAngle(this.angle + radians(i)).mult(2);
                lasers.push(laser);
            }
        }
    }

    var bombwallCount = 0;

    this.bombwall = function() {
        if (bombwallCount < 1) {
            var bombcolor = 'rgb(255,0,255)';
            bombwallCount++;
            var i = 1;
            var position = this.pos.copy();
            position.add(p5.Vector.fromAngle(this.angle).mult(i * this.r));
            while (position.x > -field.width && position.x < field.width && position.y > -field.height && position.y < field.height) {
                let bomb = new Laser(position, 0, createVector(0, 0), bombcolor);
                bomb.vel = createVector(0, 0);
                bomb.isbomb = true;
                lasers.push(bomb);
                i += 5;
                position = this.pos.copy();
                position.add(p5.Vector.fromAngle(this.angle).mult(i * this.r));
            }
        }
    }

    var nukeCount = 0;

    this.nuke = function() {
        if (nukeCount < 3) {
            let nukecolor = 'rgb(255,178,102)';
            let position = this.pos.copy();
            position.add(p5.Vector.fromAngle(this.angle).mult(this.r));
            let nuke = new Laser(position, this.angle, createVector(0, 0), nukecolor);
            nuke.isnuke = true;
            nuke.weight = 6;
            nuke.vel = p5.Vector.fromAngle(this.angle).mult(15);
            lasers.push(nuke);
            nukeCount++;
        }
    }
}
