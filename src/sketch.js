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
var balls = [];
var holes = [];
var boundaries = [];

// Declaring variables for mouse-balls constraints
var mouse;
var mConstraint;

// Declaring needed constants
var snapshots = [];
var checkpoints = [];
var numberOfEpochs = 2;
var stops = 0;
var AIroundsCounter = 0;
var AInumberOfAttempts = 2;
var good = 0;


// Set proxy to trigger takeSnapshot on balls stopping
var isBallMoving = { value: false };
var isBallMovingProxy = new Proxy(isBallMoving, {
  set: function (target, key, value) {
    if (isBallMoving.value == true && value == false) {

      takeSnapshot();
      //If the checkpoint number is even, user has taken a shot. Its time for the AI.
      if(checkpoints.length%2==0){
        checkpoints.push(snapshots[snapshots.length-1]);
        World.remove(world, mConstraint);
        AIshoots();
      }
      //If the number of checkpoints is odd and number of shots taken by AI equals the set number of attempts, its time for the user to take a shot.
      else if(AIroundsCounter == AInumberOfAttempts){
        checkpoints.push(snapshots[snapshots.length-1]);
        World.add(world, mConstraint);
        AIroundsCounter = 0;
      }
      //If the number of checkpoints is odd and not enough shots were taken by AI, shoot more.
      else if(checkpoints.length%2!=0){
        World.remove(world, mConstraint);
        AIshoots();
      };

      good = goodness(snapshots[snapshots.length-2], snapshots[snapshots.length-1]);
      console.log("This is calculated goodness:" + good);

      cleanTable();
      addBallsFromSnapshot(checkpoints[checkpoints.length-1]);
    }
    target[key] = value;
  },
});

function AIshoots(){
  //Just automaticlly shoots after 1 second.
  let t = setTimeout(()=>{
    var whiteBall = balls.find(ball => ball && ball.body.id==1);
    if(!isBallMoving.value){
      Body.applyForce(whiteBall.body, whiteBall.body.position, {
        x: random(-2000, 2000),
        y: random(-2000, 2000),
      });
      AIroundsCounter++;
    }
  }, 1000);
}

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
    new Circle(
      startPositionWidth / 3,
      startPositionHeight,
      ballSize,
      false,
      "white",
      1
    )
  );
  balls.push(
    new Circle(
      (width / 4) * 3, 
      startPositionHeight, 
      ballSize, 
      false, 
      "player1",
      2
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2",
      3
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + ballSize,
      ballSize,
      false,
      "player1",
      4
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 2 * ballSize,
      ballSize,
      false,
      "player1",
      5
    )
  );
  balls.push(
    (blackBall = new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      // width / 4 + 10,
      startPositionHeight,
      ballSize,
      false,
      "black",
      6
    ))
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 2 * ballSize,
      ballSize,
      false,
      "player2",
      7
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 3 * ballSize,
      ballSize,
      false,
      "player1",
      8
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2",
      9
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + ballSize,
      ballSize,
      false,
      "player1",
      10
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 3 * ballSize,
      ballSize,
      false,
      "player2",
      11
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 4 * ballSize,
      ballSize,
      false,
      "player1",
      12
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 2 * ballSize,
      ballSize,
      false,
      "player2",
      13
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight,
      ballSize,
      false,
      "player1",
      14
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 2 * ballSize,
      ballSize,
      false,
      "player2",
      15
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 4 * ballSize,
      ballSize,
      false,
      "player2",
      16
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

  // Create snaphot from starting positions
  takeSnapshot();
}

//Clears the table of all balls.
function cleanTable(){
  balls.forEach(ball => {if(ball.body) ball.removeFromWorld()});
  balls = [];
};

//Creats new balls accordingly to the last snapshot.
function addBallsFromSnapshot(snapshot){
  var ballSize = 15;
  snapshot.forEach(ball => {
    if(ball){
      balls.push(
        new Circle(
          ball.position.x,
          ball.position.y,
          ballSize,
          false,
          ball.label,
          ball.id,
        )
      )
    }
  });
};

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
    if (balls[i].body) balls[i].show();
  }

  // Set isBallMoving.value
  isBallMovingProxy.value = isObjectMoving(balls);
}
