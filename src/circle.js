function Circle(x, y, r, isStatic, label, id) {
  var options = {
    friction: 0,
    restitution: 1,
    isStatic: isStatic,
    isSensor: isStatic,
    label: label ? label : "",
  };
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
  //Id for differenciating balls whilst calculating goodness. White is 1, Black is 6.
  this.id = id ? id : "";

  World.add(world, this.body);

  this.removeFromWorld = function () {
    World.remove(world, this.body);
    this.body = null;
  };

  this.resetBall = function (position) {
    this.body = Bodies.circle(position.x, position.y, r, options);
    World.add(world, this.body);
  };

  this.show = function () {
    var pos = this.body.position;
    var angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    strokeWeight(1);
    stroke(0);
    fill(getColor(label));
    ellipse(0, 0, this.r * 2);
    textAlign(CENTER, CENTER);
    fill(255);
    text(getText(id), 0, 0);
    pop();
  };
}

function getColor(label) {
  switch (label) {
    case "hole":
      return 0;
    case "white":
      return 255;
    case "black":
      return 100;
    case "player1":
      return "red";
    case "player2":
      return "blue";
    default:
      return "yellow";
  }
}

//Gets display numbers from indexes. Cue ball is id=1, black is id=2. And player one balls are id=display_num+2, whilst player2 ids are id=display_num+9.
function getText(id) {
  switch (id) {
    case 2:
      return "8";
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      return id - 2;
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
      return id - 9;
    default:
      return "";
  }
}
