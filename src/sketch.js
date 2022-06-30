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
var stops = 0;

// AI rounds counter counts the number of shots taken to learn the current AI shot.
var AIroundsCounter = 0;

var isAIPlaying = false

// Set proxy to trigger takeSnapshot on balls stopping
var isBallMoving = { value: false };
var isBallMovingProxy = new Proxy(isBallMoving, {
  set: function (target, key, value) {
    if (isBallMoving.value == true && value == false) {
      
      // All AI shots were taken + the best shot was repeated. We take a snapshot of the best AI shot, and then add it as the checkpoint.
      // We reset the AI shot counter, check if a ball has been potted. If not change to user and reanable mouse control.
      // If players ball has been potted, poke the proxy so that AI shoots again.
      if (AIroundsCounter == POP_SIZE * GENERATIONS + 1) {
        
        takeSnapshot();
        takeCheckpoint(snapshots[snapshots.length - 1]);
        AIroundsCounter = 0;
        
        isAIPlaying = hasPottedOwn(checkpoints[checkpoints.length - 2], checkpoints[checkpoints.length - 1], "player1");
        if(isAIPlaying == false) {
          World.add(world, mConstraint);
          console.log("USERS TURN !!!");
          changeCurrentPlayer();
        }
        else {
          // "Pokeing" the proxy.
          isBallMovingProxy.value = true;
          isBallMovingProxy.value = false;
        }
      }
      
      else if (isAIPlaying == true) {
        
        //In case that its not the first try for AI in this shot, but the counter is divisible by size of population,
        //its time for a new generation, because fitness has been calculated for the whole previous population.
        //We take a snapshot and calculates goodness of the last shot in this population. And calculate the new generation.
        if (AIroundsCounter != 0 && AIroundsCounter % POP_SIZE == 0) {
          takeSnapshot();
          setBalls(checkpoints[checkpoints.length - 1]);
          population[(AIroundsCounter - 1) % POP_SIZE].fitness = goodness( checkpoints[checkpoints.length - 1], snapshots[snapshots.length - 1] );

          console.log( "Goodness: " + population[(AIroundsCounter - 1) % POP_SIZE].fitness );

          //In case its not the last generation we shoot again the first shot of the new population.
          if (AIroundsCounter != POP_SIZE * GENERATIONS) {
            // Creating new generation
            population = crossAndMutate(population);
            console.log("New generation: ", population);

            AIshoot(population[AIroundsCounter % POP_SIZE]);
            console.log( "Shot: " + (AIroundsCounter % POP_SIZE) + " of generation: " + (Math.floor(AIroundsCounter / POP_SIZE) + 1) );
            AIroundsCounter++;
          }

          //In case its the last generation, we take the best shot and shoot it,
          //its snapshot will be taken in the line 52, when the proxy detects the stoppage of the balls.
          else if (AIroundsCounter == POP_SIZE * GENERATIONS) {
            var bestShot = population.reduce((previousIndividual, currentIndividual) => previousIndividual.fitness > currentIndividual.fitness ? previousIndividual : currentIndividual);
            console.log("Taking best shot: ", bestShot);
            AIshoot(bestShot);
            AIroundsCounter++;
          }
        }
        
        
        //AIs first take on this shot. It doesnt take snapshot or goodness for anyone.
        else if (AIroundsCounter == 0) {
          AIshoot(population[AIroundsCounter % POP_SIZE]);
          console.log( "Shot: " + (AIroundsCounter % POP_SIZE) + " of generation: " + (Math.floor(AIroundsCounter / POP_SIZE) + 1));
          AIroundsCounter++;
        }
        //Its not the first take for AI and its not the first shot of the new generation.
        //It takes the snapshot and goodness of previous shot like this, can be the snapshot of the first shot of generation or any, except the last.
        //Shoots the next shot.
        else {
          takeSnapshot();
          setBalls(checkpoints[checkpoints.length - 1]);
          population[(AIroundsCounter - 1) % POP_SIZE].fitness = goodness(
            checkpoints[checkpoints.length - 1],
            snapshots[snapshots.length - 1]
          );
          console.log( "Goodness: " + population[(AIroundsCounter - 1) % POP_SIZE].fitness );

          AIshoot(population[AIroundsCounter % POP_SIZE]);
          console.log( "Shot: " + (AIroundsCounter % POP_SIZE) + " of generation: " + (Math.floor(AIroundsCounter / POP_SIZE) + 1) );
          AIroundsCounter++;
        }
      }

      //User shot taken. We set a new checkpoint, and if no balls were potted remove posibillity to move balls using the mouse whilst AI is shooting.
      //If the ball was potted and its not AIs turn yet, we reanable mouse controls because they were removed whilst balls were moving.
      else if (isAIPlaying == false) {
        takeSnapshot();
        takeCheckpoint(snapshots[snapshots.length - 1]);
        
        isAIPlaying = !hasPottedOwn(checkpoints[checkpoints.length - 2], checkpoints[checkpoints.length - 1], "player2");
        if(isAIPlaying == true) {
          World.remove(world, mConstraint);
          console.log("AIs TURN !!!");
          changeCurrentPlayer();
          // Generate new initial population
          population = generateInitialPopulation();
          //Tricks the proxy, to switch the control to AI and make it shoot.
          isBallMovingProxy.value = true;
          isBallMovingProxy.value = false;
        }
        else {
          World.add(world, mConstraint);
        }
      }
    }
    target[key] = value;
    Engine.update(engine, 0.000001);
  },
});

// Function that creates objects in world using engine
function setup() {
  var canvas = createCanvas(1240, 620);
  engine = Engine.create();
  engine.gravity.scale = 0;
  world = engine.world;
  // initialize boudary width (shuld be big because collision detection bug)
  var boundaryWidth = 100000;
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

  // Creating balls on the table from left to right, top to bottom
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
      3
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2",
      10
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
      2
    ))
  );
  balls.push(
    new Circle(
      startPositionWidth + 2 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 2 * ballSize,
      ballSize,
      false,
      "player2",
      11
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 3 * ballSize,
      ballSize,
      false,
      "player1",
      6
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - ballSize,
      ballSize,
      false,
      "player2",
      12
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + ballSize,
      ballSize,
      false,
      "player1",
      7
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 3 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight + 3 * ballSize,
      ballSize,
      false,
      "player2",
      13
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 4 * ballSize,
      ballSize,
      false,
      "player1",
      8
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight - 2 * ballSize,
      ballSize,
      false,
      "player2",
      14
    )
  );
  balls.push(
    new Circle(
      startPositionWidth + 4 * Math.ceil(ballSize * sqrt(3)),
      startPositionHeight,
      ballSize,
      false,
      "player1",
      9
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
  takeCheckpoint(snapshots[snapshots.length - 1]);
}

// Function that draws objects created in the engine
// Otherwise objects would not be visible on the screen
function draw() {
  // Update engine whenever something is drawn with 0.1ms delay
  if (
    isAIPlaying &&
    AIroundsCounter != POP_SIZE * GENERATIONS + 1
  ) {
    for (let i = 0; i < SPEED_MULTIPLYER; i++) {
      Engine.update(engine, 0.1);
      isBallMovingProxy.value = isObjectMoving(balls);
      if (isBallMoving == true) break;
    }
  }

  Engine.update(engine, 0.1);
  isBallMovingProxy.value = isObjectMoving(balls);

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

  if (
    balls[0].body &&
    world.constraints.find((el) => el.label == mConstraint.constraint.label) !=
      undefined
  ) {
    var whiteBallPos = balls[0].body.position;
    var mouseConstraintPosition = mConstraint.mouse.position;
    let cuePosition = getPositionOfCue(whiteBallPos, mouseConstraintPosition);
    stroke(165, 42, 42);
    strokeWeight(5);
    line(whiteBallPos.x, whiteBallPos.y, cuePosition.x, cuePosition.y);
  }
}
