var Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Collision = Matter.Collision,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

var engine;
var world;
var whiteBall;
var blackBall;
var balls = [];
var holes = [];
var boundaries = [];

var mouse;
var mConstraint;

function setup() {
  var canvas = createCanvas(820, 420);
  engine = Engine.create();
  engine.gravity.scale = 0;
  world = engine.world;

  // initialize boudary width (shuld be big because collision detection bug)
  var boundaryWidth = 10000000;
  var boundaryOffset = boundaryWidth / 2 - 25;

  // Initializing balls positions
  var startPositionWidth = (width / 4) * 3;
  var startPositionHeight = height / 2;

  // Creating boundaries
  boundaries.push(
    new Boundary(-boundaryOffset, height / 2, boundaryWidth, height, 0)
  );
  boundaries.push(
    new Boundary(width + boundaryOffset, height / 2, boundaryWidth, height, 0)
  );
  boundaries.push(
    new Boundary(width / 2, -boundaryOffset, width, boundaryWidth, 0)
  );
  boundaries.push(
    new Boundary(width / 2, height + boundaryOffset, width, boundaryWidth, 0)
  );

  // Creating holes as sensors (sensors read collisions, bit objects pass through it)
  holes.push(new Circle(25, 25, 15, true, "hole"));
  holes.push(new Circle(width / 2, 20, 15, true, "hole"));
  holes.push(new Circle(width - 25, 25, 15, true, "hole"));
  holes.push(new Circle(25, height - 25, 15, true, "hole"));
  holes.push(new Circle(width / 2, height - 20, 15, true, "hole"));
  holes.push(new Circle(width - 25, height - 25, 15, true, "hole"));

  // Creating balls on the table from left to right, top to bottom
  balls.push(
    (whiteBall = new Circle(width / 4, startPositionHeight, 10, false, "white"))
  );
  balls.push(
    new Circle((width / 4) * 3, startPositionHeight, 10, false, "player1")
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(10 * sqrt(3)),
      startPositionHeight - 10,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(10 * sqrt(3)),
      startPositionHeight + 10,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(10 * sqrt(3)),
      startPositionHeight - 20,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    (blacBall = new Circle(
      startPositionWidth + 2 * Math.ceil(10 * sqrt(3)),
      // width / 4 + 10,
      startPositionHeight,
      10,
      false,
      "black"
    ))
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(10 * sqrt(3)),
      startPositionHeight + 20,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(10 * sqrt(3)),
      startPositionHeight - 30,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(10 * sqrt(3)),
      startPositionHeight - 10,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(10 * sqrt(3)),
      startPositionHeight + 10,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(10 * sqrt(3)),
      startPositionHeight + 30,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(10 * sqrt(3)),
      startPositionHeight - 40,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(10 * sqrt(3)),
      startPositionHeight - 20,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(10 * sqrt(3)),
      startPositionHeight,
      10,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(10 * sqrt(3)),
      startPositionHeight + 20,
      10,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(10 * sqrt(3)),
      startPositionHeight + 40,
      10,
      false,
      "player2"
    )
  );

  // This code allows user to drag balls over the table
  // Creates constrait from object to mouse
  var canvasMouse = Mouse.create(canvas.elt);
  canvasMouse.pixelRatio = pixelDensity();
  var options = {
    mouse: canvasMouse,
  };
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);

  // Starts collision event for any colision
  Events.on(engine, "collisionStart", handleCollision);
}

// Function that handles collisions between objects
function handleCollision(event) {
  const { pairs } = event;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    // If bodyA is hole delete bodyB
    if (bodyA.label.includes("hole")) {
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyB) {
          balls.splice(i, 1);
          World.remove(world, bodyB);
        }
      }
    } else if (bodyB.label.includes("hole")) {
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyA) {
          balls.splice(i, 1);
          World.remove(world, bodyA);
        }
      }
    }
  });
}

// Funtion that applys random force to white ball on mouse click
function mousePressed() {
  Body.applyForce(whiteBall.body, whiteBall.body.position, {
    x: random(100, 500),
    y: random(100, 500),
  });
}

// Function that draws objects created in the engine
// Otherwise objects would not be visible on the screen
function draw() {
  // Update engine whenever something is drawn with 0.1ms delay
  Engine.update(engine, 0.1);

  // Draw green background
  background(0, 194, 36);

  // Draw boundaries
  for (var i = 0; i < boundaries.length; i++) {
    boundaries[i].show();
  }

  // Draw holes
  for (var i = 0; i < holes.length; i++) {
    holes[i].show();
  }

  // Draw balls
  for (var i = 0; i < balls.length; i++) {
    balls[i].show();
  }
}
