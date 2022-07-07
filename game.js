var ship;
var lasers = [];
var field = { width: 1200, height: 1200 };
var radius = 15;
var c;
var removelasers = [];
var otherplayers = {};
var gameover = false;
var botcount = 12; // default 10
var followingobject;
var oldfollowingpos = { x: 0, y: 0 };
var poweruptypes = ['shield', 'tripleshot', 'doublespeed', 'fullhealth'];
var powerups = {};
var powerupcount = 20;
var removepowerups = [];
var powerupfreq = {};
for (let i = 0; i < poweruptypes.length; i++) {
    powerupfreq[poweruptypes[i]] = {};
}

window.addEventListener("keydown", function (e) {
    // space en arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

function setup() {
    c = createCanvas(window.innerWidth, window.innerHeight);
    document.getElementById("canvascontainer").appendChild(c.canvas);
    document.body.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    let playercolor = 'rgb('+floor(random(0, 255))+','+floor(random(0, 255))+','+floor(random(0, 255))+')';
    ship = new Ship(playercolor , createVector(random(-field.width + radius, field.width - radius), random(-field.height + radius, field.height - radius)), radius);
    // clientside bots
    for (let i = 0; i < botcount; i++) {
        let playercolor = 'rgb('+floor(random(0, 255))+','+floor(random(0, 255))+','+floor(random(0, 255))+')';
        otherplayers[i] = new Ship(playercolor , createVector(random(-field.width + radius, field.width - radius), random(-field.height + radius, field.height - radius)), radius);
        otherplayers[i].bot = true;
    }
    followingobject = ship;
    for (let i = 0; i < powerupcount; i++) {
        let type = poweruptypes[round(random(0, poweruptypes.length-1))];
        powerups[i] = new Powerup({ x: random(-field.width+2*radius, field.width-2*radius), y: random(-field.height+2*radius, field.height-2*radius) },type , 2*radius);
        powerupfreq[type][i] = powerups[i];
    }
}

function draw() {
    background(0);
    translate(c.width/2, c.height/2);
    // zoomen
    // scale(0.3);
    translate(followingobject ? -followingobject.pos.x : oldfollowingpos.x, followingobject ? -followingobject.pos.y : oldfollowingpos.y);
    for (let i in powerups) {
        powerups[i].render();
        if (!gameover && !powerups[i].removed && powerups[i].checkPickUp(ship)) {
            removepowerups.push(i);
        }
        for (let key in otherplayers) {
            if (!powerups[i].removed && powerups[i].checkPickUp(otherplayers[key])) {
                removepowerups.push(i);
            }
        }
    }
    while (removepowerups.length > 0) {
        let index = removepowerups.pop();
        if (powerups[index]) {
            delete powerupfreq[powerups[index].type][index];
            delete powerups[index];
        }
    }
    for (let i = -field.width + 100; i < field.width; i += 100) {
        stroke('rgba(255,255,255,0.4)');
        line(i, -field.height, i, field.height);
    }
    for (let i = -field.height + 100; i < field.height; i += 100) {
        stroke('rgba(255,255,255,0.4)');
        line(-field.width, i, field.width, i);
    }
    stroke(255);
    line(-field.width, -field.height, -field.width, field.height);
    line(-field.width, field.height, field.width, field.height);
    line(field.width, field.height, field.width, -field.height);
    line(field.width, -field.height, -field.width, -field.height);
    if (!gameover) {
        ship.render(c);
        ship.turn();
        ship.update(field);
        ship.thrust();
    }

    for (let key in otherplayers) {
        otherplayers[key].render(c);
        otherplayers[key].turn();
        otherplayers[key].update(field);
        otherplayers[key].thrust();
        // client side bots
        if (otherplayers[key].bot) {
            if (Object.keys(otherplayers).length - 1 > 0 || !gameover) {
                let firstkey = Object.keys(otherplayers)[0];
                for (let i = 1; i < Object.keys(otherplayers).length; i++) {
                    if (firstkey != key) {
                        break;
                    } else {
                        firstkey = Object.keys(otherplayers)[i];
                    }
                }
                let firstplayer = gameover ? otherplayers[firstkey] : ship;
                let mindist = dist(otherplayers[key].pos.x, otherplayers[key].pos.y, firstplayer.pos.x, firstplayer.pos.y);
                let closestplayer = firstplayer;
                for (let k in otherplayers){
                    if (k != key) {
                        if (dist(otherplayers[k].pos.x, otherplayers[k].pos.y, otherplayers[key].pos.x, otherplayers[key].pos.y) < mindist) {
                            mindist = dist(otherplayers[k].pos.x, otherplayers[k].pos.y, otherplayers[key].pos.x, otherplayers[key].pos.y);
                            closestplayer = otherplayers[k];
                        }
                    }
                }
                let lookingforpowerup = false;
                if (otherplayers[key].life < 0.6 && otherplayers[key].shield < 0.2 && (Object.keys(powerupfreq['shield']).length > 0 || Object.keys(powerupfreq['fullhealth']).length > 0)) {
                    let closestshieldindex;
                    if (Object.keys(powerupfreq['shield']).length > 0) {
                        closestshieldindex = lookForClosestPowerup(otherplayers[key], 'shield');
                    }
                    let closestfullhealthindex;
                    if (Object.keys(powerupfreq['fullhealth']).length) {
                        closestfullhealthindex = lookForClosestPowerup(otherplayers[key], 'fullhealth');
                    }
                    if (closestshieldindex && closestfullhealthindex) {
                        if (dist(otherplayers[key].pos.x, otherplayers[key].pos.y, powerupfreq['shield'][closestshieldindex].pos.x, powerupfreq['shield'][closestshieldindex].pos.y)
                            <= dist(otherplayers[key].pos.x, otherplayers[key].pos.y, powerupfreq['fullhealth'][closestfullhealthindex].pos.x,  powerupfreq['fullhealth'][closestfullhealthindex].pos.y)) {
                            closestplayer = powerupfreq['shield'][closestshieldindex];
                        } else {
                            closestplayer = powerupfreq['fullhealth'][closestfullhealthindex];
                        }
                    } else if (closestshieldindex) {
                        closestplayer = powerupfreq['shield'][closestshieldindex];                        
                    } else if (closestfullhealthindex) {
                        closestplayer = powerupfreq['fullhealth'][closestfullhealthindex];
                    }
                    lookingforpowerup = true;
                } else if (otherplayers[key].life < 0.6 && otherplayers[key].shield < 0.2 && otherplayers[key].poweruptimer < 20 && Object.keys(powerupfreq['tripleshot']).length > 0) {
                    let closestpowerupindex = lookForClosestPowerup(otherplayers[key], 'tripleshot');
                    closestplayer = powerupfreq['tripleshot'][closestpowerupindex];
                    lookingforpowerup = true;
                } else if (otherplayers[key].life < 0.6 && otherplayers[key].shield < 0.2 && otherplayers[key].poweruptimer < 20 && Object.keys(powerupfreq['doublespeed']).length > 0) {
                    let closestpowerupindex = lookForClosestPowerup(otherplayers[key], 'doublespeed');
                    closestplayer = powerupfreq['doublespeed'][closestpowerupindex];
                    lookingforpowerup = true;
                }
                let theta = Math.round(Math.atan2(closestplayer.pos.y - otherplayers[key].pos.y, closestplayer.pos.x - otherplayers[key].pos.x) * 100) / 100;
                let shipangle = Math.round(otherplayers[key].angle * 100) / 100;
                if (lookingforpowerup) {
                    if (shipangle < theta) {
                        otherplayers[key].setRotation(0.05);
                    } else if (shipangle > theta) {
                        otherplayers[key].setRotation(-0.05);
                    } else {
                        otherplayers[key].setRotation(0);
                    }
                } else if (theta-shipangle > 0.05 && shipangle < theta) {
                    otherplayers[key].setRotation(0.05);
                } else if (shipangle-theta > 0.05 && shipangle > theta) {
                    otherplayers[key].setRotation(-0.05);
                } else {
                    otherplayers[key].setRotation(0);
                }

                if (mindist > 600 || lookingforpowerup) {
                    otherplayers[key].thrusting = true;
                } else {
                    otherplayers[key].thrusting = !otherplayers[key].thrusting;
                    if (otherplayers[key].rotation === 0) {
                        otherplayers[key].shoot(3, otherplayers[key].shootmodus);
                    }
                }
                
            } else {
                otherplayers[key].setRotation(0);
                otherplayers[key].thrusting = false;
            }
        }
    }

    if (ship.bot && !gameover) {
        if (Object.keys(otherplayers).length > 0) {
            let firstplayer = otherplayers[Object.keys(otherplayers)[0]];
            let mindist = dist(ship.pos.x, ship.pos.y, firstplayer.pos.x, firstplayer.pos.y);
            let closestplayer = firstplayer;
            for (let key in otherplayers){
                if (dist(ship.pos.x, ship.pos.y, otherplayers[key].pos.x, otherplayers[key].pos.y) < mindist) {
                    mindist = dist(ship.pos.x, ship.pos.y, otherplayers[key].pos.x, otherplayers[key].pos.y);
                    closestplayer = otherplayers[key];
                }
            }
            let lookingforpowerup = false;
            if (ship.life < 0.6 && ship.shield < 0.2 && (Object.keys(powerupfreq['shield']).length > 0 || Object.keys(powerupfreq['fullhealth']).length > 0)) {
                let closestshieldindex;
                if (Object.keys(powerupfreq['shield']).length > 0) {
                    closestshieldindex = lookForClosestPowerup(ship, 'shield');
                }
                let closestfullhealthindex;
                if (Object.keys(powerupfreq['fullhealth']).length) {
                    closestfullhealthindex = lookForClosestPowerup(ship, 'fullhealth');
                }
                if (closestshieldindex && closestfullhealthindex) {
                    if (dist(ship.pos.x, ship.pos.y, powerupfreq['shield'][closestshieldindex].pos.x, powerupfreq['shield'][closestshieldindex].pos.y)
                            <= dist(ship.pos.x, ship.pos.y, powerupfreq['fullhealth'][closestfullhealthindex].pos.x,  powerupfreq['fullhealth'][closestfullhealthindex].pos.y)) {
                        closestplayer = powerupfreq['shield'][closestshieldindex];
                    } else {
                        closestplayer = powerupfreq['fullhealth'][closestfullhealthindex];
                    }
                } else if (closestshieldindex) {
                    closestplayer = powerupfreq['shield'][closestshieldindex];                        
                } else if (closestfullhealthindex) {
                    closestplayer = powerupfreq['fullhealth'][closestfullhealthindex];
                }
                lookingforpowerup = true;
            } else if (ship.life < 0.6 && ship.shield < 0.2 && ship.poweruptimer < 20 && Object.keys(powerupfreq['tripleshot']).length > 0) {
                let closestpowerupindex = lookForClosestPowerup(ship, 'tripleshot');
                closestplayer = powerupfreq['tripleshot'][closestpowerupindex];
                lookingforpowerup = true;
            } else if (ship.life < 0.6 && ship.shield < 0.2 && ship.poweruptimer < 20 && Object.keys(powerupfreq['doublespeed']).length > 0) {
                let closestpowerupindex = lookForClosestPowerup(ship, 'doublespeed');
                closestplayer = powerupfreq['doublespeed'][closestpowerupindex];
                lookingforpowerup = true;
            }
            let theta = Math.round(Math.atan2(closestplayer.pos.y - ship.pos.y, closestplayer.pos.x - ship.pos.x) * 100) / 100;
            let shipangle = Math.round(ship.angle * 100) / 100;
            if (lookingforpowerup) {
                if (shipangle < theta) {
                    ship.setRotation(0.05);
                } else if (shipangle > theta) {
                    ship.setRotation(-0.05);
                } else {
                    ship.setRotation(0);
                }
            } else if (theta-shipangle > 0.05 && shipangle < theta) {
                ship.setRotation(0.05);
            } else if (shipangle-theta > 0.05 && shipangle > theta) {
                ship.setRotation(-0.05);
            } else {
                ship.setRotation(0);
            }

            if (mindist > 600 || lookingforpowerup) {
                ship.thrusting = true;
            } else {
                ship.thrusting = !ship.thrusting;
                if (ship.rotation === 0) {
                    ship.shoot(3, ship.shootmodus);
                }
            }
            
        } else {
            ship.setRotation(0);
            ship.thrusting = false;
        }
    }

    for (let i = 0; i < lasers.length; i++) {
        if (!lasers[i].removed) {
        lasers[i].render();
        lasers[i].update();
            if (lasers[i].checkEdges(field)) {
                lasers[i].removed = true;
                removelasers.push(i);
            }
            if (lasers[i].hit(ship) && !gameover) {
                if (ship.shield > 0) {
                    ship.shield -= 0.01;
                } else if (ship.life > 0) {
                    ship.life -= 0.01;
                } else {
                    gameover = true;
                    followingobject = otherplayers[Object.keys(otherplayers)[0]];
                }
                lasers[i].removed = true;
                removelasers.push(i);
            }
            for (let key in otherplayers) {
                if (lasers[i].hit(otherplayers[key])) {
                    if (otherplayers[key].shield > 0) {
                        otherplayers[key].shield -= 0.01;
                    } else if (otherplayers[key].life > 0) {
                        otherplayers[key].life -= 0.01;
                    } else {
                        // client side bots
                        let replace = false;
                        if (otherplayers[key] === followingobject) {
                            replace = true;
                        }
                        delete otherplayers[key];
                        if (replace) {
                            followingobject = otherplayers[Object.keys(otherplayers)[0]];
                        }
                    }
                    lasers[i].removed = true;
                    removelasers.push(i);
                }
            }
        }
    }

    if (gameover) {
        displayGameOver();
    }

    
    if (!gameover && Object.keys(otherplayers).length === 0) {
        displayWin();
    }

    while (removelasers.length > 0) {
        let index = removelasers.pop();
        lasers.splice(index, 1);
    }
    if (keyIsDown(32) && !keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !gameover) {
        ship.shoot(3, ship.shootmodus);
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        ship.setRotation(-0.05);
    } else if (keyCode === RIGHT_ARROW) {
        ship.setRotation(0.05);
    } else if (keyCode === UP_ARROW) {
        ship.thrusting = true;
    } else if (key === 'B') {
        // in commentaar voor classic
        // ship.pulse();
    } else if (key === 'W') {
        // in commentaar voor classic
        // ship.bombwall();
    } else if (key === '1') {
        // in commentaar voor classic
        // ship.shootmodus = 1;
    } else if (key === '2') {
        // in commentaar voor classic
        // ship.shootmodus = 2;
    } else if (key === '3') {
        // in commentaar voor classic
        // ship.shootmodus = 3;
    } else if (key === 'X') {
        // in commentaar voor classic
        // ship.nuke();
    } else if (key === 'A') {
        ship.bot = !ship.bot;
    } else if ((gameover || Object.keys(otherplayers).length === 0)&& key === 'R') {
        restart();
    } else if (gameover && key === 'N') {
        for (let key in otherplayers) {
            if (otherplayers[key] !== followingobject) {
                followingobject = otherplayers[key];
                break;
            }
        }
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        ship.setRotation(0);
    } else if (keyCode === UP_ARROW) {
        ship.thrusting = false;
    }
}

function displayGameOver() {
    fill(255);
    stroke(0);
    textSize(30);
    textAlign(CENTER);
    text("Game Over\n(R)estart", followingobject ? followingobject.pos.x : oldfollowingpos.x, followingobject ? followingobject.pos.y : oldfollowingpos.y);
}

function restart() {
    gameover = false;
    otherplayers = {};
    removelasers = [];
    powerups = {};
    removepowerups = [];
    powerupfreq = {};
    for (let i = 0; i < poweruptypes.length; i++) {
        powerupfreq[poweruptypes[i]] = {};
    }
    let playercolor = 'rgb('+floor(random(0, 255))+','+floor(random(0, 255))+','+floor(random(0, 255))+')';
    ship = new Ship(playercolor , createVector(random(-field.width + radius, field.width - radius), random(-field.height + radius, field.height - radius)), radius);
    // clientside bots
    for (let i = 0; i < botcount; i++) {
        let playercolor = 'rgb('+floor(random(0, 255))+','+floor(random(0, 255))+','+floor(random(0, 255))+')';
        otherplayers[i] = new Ship(playercolor , createVector(random(-field.width + radius, field.width - radius), random(-field.height + radius, field.height - radius)), radius);
        otherplayers[i].bot = true;
    }
    followingobject = ship;
    for (let i = 0; i < powerupcount; i++) {
        let type = poweruptypes[round(random(0,poweruptypes.length-1))];
        powerups[i] = new Powerup({ x: random(-field.width+2*radius, field.width-2*radius), y: random(-field.height+2*radius, field.height-2*radius) },type , 2*radius);
        powerupfreq[type][i] = powerups[i];
    }
}

function displayWin() {
    fill(255);
    stroke(0);
    textSize(30);
    textAlign(CENTER);
    text("You win\n(R)estart", followingobject ? followingobject.pos.x : oldfollowingpos.x, followingobject ? followingobject.pos.y : oldfollowingpos.y);    
}

function lookForClosestPowerup(spaceship, type){
    let closestpowerupindex = Object.keys(powerupfreq[type])[0];
    let powerupmindist = dist(spaceship.pos.x, spaceship.pos.y, powerupfreq[type][closestpowerupindex].pos.x, powerupfreq[type][closestpowerupindex].pos.y);
    for (let index in powerupfreq[type]) {
        if (closestpowerupindex != index &&
            dist(spaceship.pos.x, spaceship.pos.y, powerupfreq[type][index].pos.x, powerupfreq[type][index].pos.y) < powerupmindist) {
            closestpowerupindex = index;
            powerupmindist = dist(spaceship.pos.x, spaceship.pos.y, powerupfreq[type][closestpowerupindex].pos.x, powerupfreq[type][closestpowerupindex].pos.y);
        }
    }
    return closestpowerupindex;
}
