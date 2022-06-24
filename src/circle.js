function Circle(x, y, r, isStatic, label, id) {
  var options = {
    friction: 0,
    restitution: 1,
    isStatic: isStatic,
    isSensor: isStatic,
    label: label ? label : "",
    //Id for differenciating balls whilst calculating goodness. White is 1, Black is 6.
    id: id ? id : "",
  };
  this.body = Bodies.circle(x, y, r, options);
  this.r = r;
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
