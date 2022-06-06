// Initializing module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

// Declaring variables for engine
var engine;
var world;

// Declaring variables for table and balls
var whiteBall;
var blackBall;
var balls = [];
var holes = [];
var boundaries = [];

// Declaring variables for mouse-balls constraints
var mouse;
var mConstraint;

// Declaring positions snapshot
var snapshot = [];
var stops = 0;

// Set proxy to trigger takeSnapshot on balls stopping
var isBallMoving = { value: false };
var isBallMovingProxy = new Proxy(isBallMoving, {
  set: function (target, key, value) {
    if (isBallMoving.value == true && value == false) {
      takeSnapshot();
    }
    target[key] = value;
  },
});

// Function that creates objects in world using engine
function setup() {
  var canvas = createCanvas(1240, 620);
  engine = Engine.create();
  engine.gravity.scale = 0;
  world = engine.world;

  // initialize boudary width (shuld be big because collision detection bug)
  var boundaryWidth = 10000000;
  var offset = 30;
  var boundaryOffset = boundaryWidth / 2 - offset;

  // Initializing balls positions
  var startPositionWidth = (width / 4) * 3;
  var startPositionHeight = height / 2;
  var ballSize = 15;
  var holeSize = 20;

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
  holes.push(new Circle(offset, offset, holeSize, true, "hole"));
  holes.push(new Circle(width / 2, offset, holeSize, true, "hole"));
  holes.push(new Circle(width - offset, offset, holeSize, true, "hole"));
  holes.push(new Circle(offset, height - offset, holeSize, true, "hole"));
  holes.push(new Circle(width / 2, height - offset, holeSize, true, "hole"));
  holes.push(
    new Circle(width - offset, height - offset, holeSize, true, "hole")
  );

  // // Creating balls on the table from left to right, top to bottom
  balls.push(
    (whiteBall = new Circle(
      startPositionWidth / 3,
      startPositionHeight,
      ballSize,
      false,
      "white"
    ))
  );
  balls.push(
    new Circle((width / 4) * 3, startPositionHeight, ballSize, false, "player1")
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + ballSize,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 2 * ballSize,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    (blackBall = new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      // width / 4 + 10,
      startPositionHeight,
      ballSize,
      false,
      "black"
    ))
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 2 * ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 3 * ballSize,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + ballSize,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 3 * ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 4 * ballSize,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 2 * ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight,
      ballSize,
      false,
      "player1"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 2 * ballSize,
      ballSize,
      false,
      "player2"
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 4 * ballSize,
      ballSize,
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
    if (bodyA.label.includes("hole")) {
      // If bodyA is hole delete bodyB
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyB) {
          // Removing is actually translating to invisible area
          switch (bodyB.label) {
            case "white":
              // bodyB.resetWhite(startingPositions[0][0].position);
              bodyB.removeFromWorld();
              break;
            case "black":
              bodyB.removeFromWorld();
              break;
            case "player1":
              bodyB.removeFromWorld();
              break;
            case "player2":
              bodyB.removeFromWorld();
              break;
            default:
              null;
              break;
          }
        }
      }
    } else if (bodyB.label.includes("hole")) {
      // If bodyA is hole delete bodyB
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].body == bodyA) {
          // Removing is actually translating to invisible area
          switch (bodyA.label) {
            case "white":
              // bodyA.resetWhite(startingPositions[0][0].position);
              bodyA.removeFromWorld();
              break;
            case "black":
              bodyA.removeFromWorld();
              break;
            case "player1":
              bodyA.removeFromWorld();
              break;
            case "player2":
              bodyA.removeFromWorld();
              break;
            default:
              null;
              break;
          }
        }
      }
    }
  });
}

// Funtion that applys random force to white ball on mouse click
function mousePressed() {
  if (!isBallMoving.value) {
    Body.applyForce(whiteBall.body, whiteBall.body.position, {
      x: random(500, 1000),
      y: random(500, 1000),
    });
  }
}

function keyPressed() {
  setBalls();
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

  // Set isBallMoving.value
  isBallMovingProxy.value = isObjectMoving(balls);
}
