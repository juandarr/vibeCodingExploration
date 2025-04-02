// --- Game Configuration ---
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const MAX_SPEED = 7;
const FRICTION = 0.85;
const ENEMY_SPEED = 1;
const STOMP_BOUNCE = -6;

// --- Game Variables ---
let player;
let platforms = [];
let enemies = [];
let coins = [];
let goal;

let score = 0;
let cameraX = 0;
let levelWidth = 3000; // How wide the level is

let isGameOver = false;
let isWin = false;

// --- P5.js Setup Function ---
function setup() {
  createCanvas(800, 400); // Adjust canvas size as needed
  rectMode(CORNER);

  // --- Create Player ---
  player = new Player(100, 100);

  // --- Create Level Elements ---
  // Ground
  platforms.push(new Platform(0, height - 40, levelWidth, 40));

  // Example Platforms
  platforms.push(new Platform(200, height - 100, 100, 20));
  platforms.push(new Platform(350, height - 160, 150, 20));
  platforms.push(new Platform(600, height - 120, 80, 20));
  platforms.push(new Platform(800, height - 200, 120, 20));
  platforms.push(new Platform(1000, height - 150, 200, 20));
  platforms.push(new Platform(1300, height - 100, 50, 20));
  platforms.push(new Platform(1350, height - 150, 50, 20));
  platforms.push(new Platform(1400, height - 200, 50, 20));
  platforms.push(new Platform(1600, height - 180, 100, 20));
  platforms.push(new Platform(1800, height - 250, 150, 20));
   platforms.push(new Platform(2100, height - 120, 200, 20));
   platforms.push(new Platform(2400, height - 200, 100, 20));
   platforms.push(new Platform(2600, height - 150, 150, 20));


  // --- Create Enemies ---
  enemies.push(new Enemy(400, height - 80));
  enemies.push(new Enemy(700, height - 60));
  enemies.push(new Enemy(1100, height - 170));
   enemies.push(new Enemy(1700, height - 60));
   enemies.push(new Enemy(2200, height - 140));
   enemies.push(new Enemy(2650, height - 170));


  // --- Create Coins ---
  coins.push(new Coin(225, height - 130));
  coins.push(new Coin(380, height - 190));
  coins.push(new Coin(410, height - 190));
  coins.push(new Coin(630, height - 150));
  coins.push(new Coin(850, height - 230));
  coins.push(new Coin(1050, height - 180));
  coins.push(new Coin(1150, height - 180));
  coins.push(new Coin(1640, height - 210));
  coins.push(new Coin(1850, height - 280));
  coins.push(new Coin(2150, height - 150));
  coins.push(new Coin(2440, height - 230));
  coins.push(new Coin(2660, height - 180));

  // --- Create Goal ---
  goal = { x: levelWidth - 100, y: height - 100, w: 20, h: 60 }; // Simple rectangle goal
}

// --- P5.js Draw Function (Game Loop) ---
function draw() {
  background(135, 206, 250); // Sky blue

  // --- Update Camera ---
  // Camera follows player, keeping player roughly in the first third of the screen
  let targetCameraX = player.pos.x - width / 3;
  // Clamp camera to level boundaries
  cameraX = lerp(cameraX, targetCameraX, 0.1); // Smooth camera movement
  cameraX = constrain(cameraX, 0, levelWidth - width);


  // --- Apply Camera Transformation ---
  translate(-cameraX, 0);


  // --- Draw and Update Game Elements ---
  for (let p of platforms) {
    p.show();
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    if (coin.collected) {
       // coins.splice(i, 1); // OPTION 1: Remove if collected (can cause issues if iterating)
       // Better not to splice while iterating, just don't draw/update
    } else {
        coin.show();
        if (player.collidesWith(coin)) {
            coin.collect();
            score += 10;
        }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      if (enemy.alive) {
          enemy.update(platforms);
          enemy.show();

          // Check player collision with enemy
          if (player.collidesWith(enemy)) {
              // Check for stomp (player moving down, player bottom hits enemy top)
              if (player.vel.y > 0 && player.pos.y + player.h < enemy.pos.y + enemy.h / 2) {
                  enemy.stomp();
                  player.vel.y = STOMP_BOUNCE; // Bounce off enemy
                  score += 50;
              } else {
                  // Player got hit
                  player.reset(100, 100); // Reset player position
                  score = 0; // Reset score (or implement lives)
                  // Could add a small temporary invincibility here
              }
          }
      } else {
           // Optional: Remove dead enemies after a delay? For now, just don't draw/update.
           // enemies.splice(i, 1); // Careful with splicing while iterating
      }
  }


  player.update(platforms);
  player.show();

  // --- Draw Goal ---
  fill(255, 215, 0); // Gold
  rect(goal.x, goal.y, goal.w, goal.h);

  // --- Check Win Condition ---
   if (player.pos.x + player.w > goal.x &&
       player.pos.x < goal.x + goal.w &&
       player.pos.y + player.h > goal.y &&
       player.pos.y < goal.y + goal.h &&
       !isGameOver) {
       isWin = true;
       isGameOver = true; // Stop further game logic
   }


  // --- Check Lose Condition ---
  if (player.pos.y > height + 50 && !isWin) { // Fell off screen
      isGameOver = true;
  }


  // --- Reset View for UI ---
  translate(cameraX, 0); // Cancel camera translation

  // --- Draw UI ---
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  // --- Game Over / Win Messages ---
  if (isGameOver) {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height); // Dim screen

    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    if (isWin) {
         text("YOU WIN!", width / 2, height / 2);
    } else {
        text("GAME OVER", width / 2, height / 2);
    }
    textSize(20);
     text("Press Enter to Play Again", width / 2, height / 2 + 50);
    noLoop(); // Stop the draw loop
  }
}

// --- Handle Player Input ---
function keyPressed() {
  if (keyCode === UP_ARROW || key === ' ' || key === 'w' || key === 'W') {
    player.jump();
  }

  if (isGameOver && keyCode === ENTER) {
      resetGame();
  }
}

// --- Reset Game Function ---
function resetGame() {
    score = 0;
    cameraX = 0;
    isGameOver = false;
    isWin = false;

    // Reset player
    player.reset(100, 100);

    // Reset enemies
    for(let enemy of enemies) {
        enemy.reset(); // Add a reset method to Enemy class
    }

    // Reset coins
    for(let coin of coins) {
        coin.collected = false;
    }

    loop(); // Restart the draw loop
}


// ==================================
// --- Player Class ---
// ==================================
class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.w = 25;
    this.h = 35;
    this.isGrounded = false;
    this.initialPos = createVector(x, y); // Store initial position for reset
  }

  update(platforms) {
    // --- Input ---
    let targetVelX = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
      targetVelX = -MOVE_SPEED;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
      targetVelX = MOVE_SPEED;
    }

    // Apply acceleration towards target speed
    this.vel.x = lerp(this.vel.x, targetVelX, 0.2);

    // Apply friction if no input
    if (targetVelX === 0) {
      this.vel.x *= FRICTION;
    }

    // Limit max speed
    this.vel.x = constrain(this.vel.x, -MAX_SPEED, MAX_SPEED);
     // Stop tiny movements
     if (abs(this.vel.x) < 0.1) this.vel.x = 0;


    // --- Physics ---
    // Apply gravity
    this.vel.y += GRAVITY;

    // --- Collision Detection & Resolution ---
    this.isGrounded = false; // Assume not grounded until proven otherwise

    // Store next potential position
    let nextPos = p5.Vector.add(this.pos, this.vel);

    // Check collision with each platform
    for (let p of platforms) {
      // Check Vertical Collision (Landing or Hitting Head)
      if (
        nextPos.x + this.w > p.x &&
        nextPos.x < p.x + p.w &&
        nextPos.y + this.h > p.y &&
        this.pos.y + this.h <= p.y // Was above the platform in the previous frame
      ) {
        // Landed on top
        this.vel.y = 0;
        nextPos.y = p.y - this.h; // Snap to top of platform
        this.isGrounded = true;
      } else if (
         nextPos.x + this.w > p.x &&
         nextPos.x < p.x + p.w &&
         nextPos.y < p.y + p.h &&
         this.pos.y >= p.y + p.h // Was below the platform
      ) {
          // Hit head on bottom
          this.vel.y = 0;
          nextPos.y = p.y + p.h; // Snap to bottom
      }

      // Check Horizontal Collision (Sides) - Check based on ADJUSTED Y position
      // Important to check horizontal collision *after* potentially adjusting Y
      if (
        nextPos.y + this.h > p.y &&       // Player's bottom is below platform's top
        nextPos.y < p.y + p.h &&       // Player's top is above platform's bottom
        nextPos.x + this.w > p.x &&    // Player's right edge is past platform's left
        this.pos.x + this.w <= p.x     // Player WAS to the left
      ) {
        // Hit right side of player / left side of platform
        this.vel.x = 0;
        nextPos.x = p.x - this.w; // Snap to left side
      } else if (
        nextPos.y + this.h > p.y &&       // Player's bottom is below platform's top
        nextPos.y < p.y + p.h &&       // Player's top is above platform's bottom
        nextPos.x < p.x + p.w &&    // Player's left edge is before platform's right
        this.pos.x >= p.x + p.w     // Player WAS to the right
      ) {
        // Hit left side of player / right side of platform
        this.vel.x = 0;
        nextPos.x = p.x + p.w; // Snap to right side
      }
    }


    // --- Update Position ---
    this.pos.set(nextPos); // Update position based on potentially adjusted nextPos

     // Prevent falling through floor at edges (simple clamp)
    if (this.pos.x < 0) {
        this.pos.x = 0;
        this.vel.x = 0;
    }
    // No right edge clamp needed if level scrolls beyond canvas width

  }

  jump() {
    if (this.isGrounded) {
      this.vel.y = JUMP_FORCE;
      this.isGrounded = false; // Prevent double jump
    }
  }

  collidesWith(other) {
    return (
      this.pos.x < other.pos.x + other.w &&
      this.pos.x + this.w > other.pos.x &&
      this.pos.y < other.pos.y + other.h &&
      this.pos.y + this.h > other.pos.y
    );
  }

   reset(x, y) {
        this.pos.set(this.initialPos); // Reset to initial starting point
        this.vel.set(0, 0);
        this.isGrounded = false;
   }


  show() {
    fill(255, 0, 0); // Red
    stroke(0);
    strokeWeight(1);
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }
}


// ==================================
// --- Platform Class ---
// ==================================
class Platform {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show() {
    fill(139, 69, 19); // Brown
    noStroke();
    rect(this.x, this.y, this.w, this.h);
  }
}


// ==================================
// --- Enemy Class ---
// ==================================
class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(-ENEMY_SPEED, 0); // Start moving left
    this.w = 25;
    this.h = 25;
    this.alive = true;
    this.initialPos = createVector(x, y); // Store initial position
    this.onGround = false;
  }

  update(platforms) {
    if (!this.alive) return;

     // Basic Gravity (so they fall if pushed off)
     this.vel.y += GRAVITY;

     // Simple platform collision for enemy (just landing)
     this.onGround = false;
     let nextY = this.pos.y + this.vel.y;
     for (let p of platforms) {
         if (
             this.pos.x + this.w > p.x &&
             this.pos.x < p.x + p.w &&
             nextY + this.h > p.y &&
             this.pos.y + this.h <= p.y
         ) {
             this.vel.y = 0;
             nextY = p.y - this.h;
             this.onGround = true;
             break; // Found ground, no need to check others vertically
         }
     }
      this.pos.y = nextY;


     // Simple AI: Move back and forth, turn at edges or walls
     let nextX = this.pos.x + this.vel.x;
     let turnAround = false;

     // Check for platform edges (only if on ground)
     if (this.onGround) {
         let leadingEdgeX = (this.vel.x < 0) ? nextX : nextX + this.w;
         let footY = this.pos.y + this.h + 5; // Check slightly below feet

         let supportingPlatform = null;
         for (let p of platforms) {
              if (
                 leadingEdgeX > p.x &&
                 leadingEdgeX < p.x + p.w &&
                 footY > p.y && footY < p.y + p.h + 10 // Check within platform height + buffer
              ) {
                  supportingPlatform = p;
                  break;
              }
         }
         if (!supportingPlatform) {
            // No platform ahead, turn around!
            turnAround = true;
         }
     }


     // Check for collisions with platform sides
     for (let p of platforms) {
        if (
            this.pos.y + this.h > p.y && // Enemy bottom below platform top
            this.pos.y < p.y + p.h &&    // Enemy top above platform bottom
            nextX + this.w > p.x &&   // Right edge past platform left
            this.pos.x + this.w <= p.x  // Was left of platform
         ) {
             // Hit left side of platform
             turnAround = true;
             nextX = p.x - this.w; // Snap
             break;
         } else if (
             this.pos.y + this.h > p.y &&
             this.pos.y < p.y + p.h &&
             nextX < p.x + p.w &&     // Left edge before platform right
             this.pos.x >= p.x + p.w   // Was right of platform
         ) {
             // Hit right side of platform
             turnAround = true;
             nextX = p.x + p.w; // Snap
             break;
         }
     }


     if (turnAround) {
         this.vel.x *= -1; // Reverse direction
         // Don't update X position this frame if we hit a wall
         if(this.pos.x === nextX) { // Only skip update if snapped position is same
             nextX = this.pos.x;
         } else {
            // If turning due to edge, allow the move up to the edge
             this.pos.x += this.vel.x; // Move one step back
         }

     } else {
         this.pos.x = nextX; // Update horizontal position
     }


     // Basic boundary check (turn around at level start)
     if (this.pos.x < 0) {
         this.pos.x = 0;
         this.vel.x *= -1;
     }
     // Add check for levelWidth if needed
  }

   stomp() {
       this.alive = false;
       // Could add a small visual indicator like shrinking or changing color
   }

   reset() {
       this.pos.set(this.initialPos);
       this.vel.set(-ENEMY_SPEED, 0); // Reset direction
       this.alive = true;
       this.onGround = false;
   }


  show() {
    if (!this.alive) return;
    fill(160, 82, 45); // Sienna (Goomba-ish color)
    noStroke();
    ellipseMode(CORNER); // Make ellipse draw from top-left like rect
    ellipse(this.pos.x, this.pos.y, this.w, this.h);
  }
}

// ==================================
// --- Coin Class ---
// ==================================
class Coin {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.w = 15;
        this.h = 15;
        this.collected = false;
        this.initialY = y;
        this.bobSpeed = 0.08; // How fast it bobs
        this.bobAmount = 3;  // How much it bobs
    }

    show() {
        if (this.collected) return;

        // Bobbing effect
        let bobOffset = sin(frameCount * this.bobSpeed) * this.bobAmount;
        this.pos.y = this.initialY + bobOffset;


        fill(255, 223, 0); // Gold color
        noStroke();
        ellipseMode(CENTER); // Center coin drawing
        ellipse(this.pos.x + this.w / 2, this.pos.y + this.h / 2, this.w, this.h);
    }

    collect() {
        this.collected = true;
        // Play sound effect here if desired
    }
}