function Powerup(pos, type, r, id) {
    this.pos = pos;
    this.type = type;
    this.r = r;
    this.removed = false;

    this.render = function () {
        noStroke();
        noFill();
        stroke('rgb(0,255,0)');
        strokeWeight(2);
        arc(this.pos.x, this.pos.y, this.r, this.r, 0, TWO_PI);
        if (this.type == 'shield') {
            stroke('rgb(64,224,208)');
            strokeWeight(2);
            arc(this.pos.x, this.pos.y, this.r-15, this.r-15, 0, TWO_PI);
        } else if (this.type == 'tripleshot') {
            stroke('rgb(255,0,0)');
            line(this.pos.x-10, this.pos.y, this.pos.x+10, this.pos.y);
            line(this.pos.x-10, this.pos.y, this.pos.x+3, this.pos.y+10);
            line(this.pos.x-10, this.pos.y, this.pos.x+3, this.pos.y-10);
        } else if (this.type == 'doublespeed') {
            stroke('rgb(255,131,0)');
            line(this.pos.x+10, this.pos.y, this.pos.x, this.pos.y-7);
            line(this.pos.x+10, this.pos.y, this.pos.x, this.pos.y+7);
            line(this.pos.x, this.pos.y, this.pos.x-10, this.pos.y-7);
            line(this.pos.x, this.pos.y, this.pos.x-10, this.pos.y+7);
        } else if (this.type == 'fullhealth') {
            stroke('rgb(0,255,0)');
            strokeWeight(2);
            line(this.pos.x-10, this.pos.y, this.pos.x+10, this.pos.y);
            line(this.pos.x, this.pos.y-10, this.pos.x, this.pos.y+10);
        }
        strokeWeight(1);
    };

    this.checkPickUp = function (ship) {
        if (dist(ship.pos.x, ship.pos.y, this.pos.x, this.pos.y) < this.r) {
            if (this.type == 'shield') {
                ship.shield = 1;
            } else if (this.type == 'tripleshot') {
                ship.shootmodus = 3;
                ship.poweruptimer = 600;
                ship.poweruptimerbool = true;
            } else if (this.type == 'doublespeed') {
                ship.thrustspeed = 0.15;
                ship.poweruptimer = 600;
                ship.poweruptimerbool = true;
            } else if (this.type == 'fullhealth') {
                ship.life = 1;
            }
            return true;
        } else {
            return false;
        }
    };
}
