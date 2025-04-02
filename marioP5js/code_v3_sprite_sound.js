// ==================================
// --- Global Variable Declarations ---
// ==================================

// --- Game Configuration ---
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const MAX_SPEED = 7;
const FRICTION = 0.85;
const ENEMY_SPEED = 1;
const STOMP_BOUNCE = -6;

// --- Game State & Objects ---
let player;
let platforms = [];
let enemies = []; // Declared globally
let coins = [];
let goal;

let score = 0;
let cameraX = 0;
let levelWidth = 3000;

let isGameOver = false; // Declared globally
let isWin = false;

// --- Assets ---
let playerImg;
let enemyImg;
let coinImg;
// let platformImg; // Optional

// --- Sounds ---
let jumpSound;
let coinSound;
let stompSound;
// let bgMusic; // Optional

// --- Utility ---
let audioStarted = false; // Flag to ensure audio context starts


// ==================================
// --- P5.js Core Functions ---
// ==================================

function preload() {
  // --- Load Images ---
  try {
    // **** REPLACE THESE URLS/PATHS! ****
    playerImg = loadImage('./assets/images/mario.png'); // Replace! (Using example local path)
    enemyImg = loadImage('./assets/images/creeper.png');   // Replace!
    coinImg = loadImage('./assets/images/coin.png');    // Replace! (Optional)
    // platformImg = loadImage('assets/platform_texture.png'); // Optional
  } catch (error) {
    console.error("Error loading images:", error);
  }

  // --- Load Sounds ---
  try {
    // **** REPLACE THESE PATHS! ****
    jumpSound = loadSound('./assets/sounds/jump.wav');     // Replace!
    coinSound = loadSound('./assets/sounds/coin.wav');     // Replace!
    stompSound = loadSound('./assets/sounds/stomp.wav');   // Replace!
    // bgMusic = loadSound('assets/music.mp3'); // Optional
  } catch (error) {
    console.error("Error loading sounds:", error);
  }
}

function setup() {
  createCanvas(800, 400);
  rectMode(CORNER);
  imageMode(CORNER); // Important for drawing images from top-left

  // --- Initialize Game Objects ---
  // Ensure classes are defined below setup() before calling new Player(), etc.
  player = new Player(100, 100, 40, 40); // Use appropriate w/h for your sprite

  // Reset arrays (necessary if resetGame is called before first setup somehow, good practice)
  platforms = [];
  enemies = [];
  coins = [];

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
  enemies.push(new Enemy(400, height - 80, 28.5, 37.5)); // Use appropriate w/h
  enemies.push(new Enemy(700, height - 60, 28.5, 37.5));
  enemies.push(new Enemy(1100, height - 170, 28.5, 37.5));
  enemies.push(new Enemy(1700, height - 60, 28.5, 37.5));
  enemies.push(new Enemy(2200, height - 140, 28.5, 37.5));
  enemies.push(new Enemy(2650, height - 170, 28.5, 37.5));

  // --- Create Coins ---
  coins.push(new Coin(225, height - 130, 20,20)); // Use appropriate w/h
  coins.push(new Coin(380, height - 190, 20,20));
  coins.push(new Coin(410, height - 190, 20,20));
  coins.push(new Coin(630, height - 150,20,20));
  coins.push(new Coin(850, height - 230, 20,20));
  coins.push(new Coin(1050, height - 180, 20,20));
  coins.push(new Coin(1150, height - 180, 20,20));
  coins.push(new Coin(1640, height - 210, 20,20));
  coins.push(new Coin(1850, height - 280, 20,20));
  coins.push(new Coin(2150, height - 150, 20,20));
  coins.push(new Coin(2440, height - 230, 20,20));
  coins.push(new Coin(2660, height - 180, 20,20));

  // --- Create Goal ---
  goal = { x: levelWidth - 100, y: height - 100, w: 20, h: 60 };
}

function draw() {
  background(135, 206, 250); // Sky blue

  // --- Update Camera ---
  let targetCameraX = player.pos.x - width / 3;
  cameraX = lerp(cameraX, targetCameraX, 0.1);
  cameraX = constrain(cameraX, 0, levelWidth - width);

  // --- Apply Camera Transformation ---
  translate(-cameraX, 0);

  // --- Draw and Update Game Elements ---

  // Platforms
  for (let p of platforms) {
    p.show();
  }

  // Coins
  for (let i = coins.length - 1; i >= 0; i--) {
    let coin = coins[i];
    if (!coin.collected) {
      coin.show();
      if (player.collidesWith(coin)) {
        coin.collect();
        score += 10;
      }
    }
  }

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    if (enemy.alive) {
      enemy.update(platforms);
      enemy.show();

      // Check player collision with enemy AFTER enemy update/show
      if (player.collidesWith(enemy)) {
        // Check for stomp (player falling, feet above enemy mid-point)
        if (player.vel.y > 0 && player.pos.y + player.h < enemy.pos.y + enemy.h / 2) {
          enemy.stomp(); // Sets enemy.alive = false, plays sound
          player.vel.y = STOMP_BOUNCE; // Bounce player
          score += 50;
        }
        // Hurt check ONLY if enemy is STILL alive (important!)
        else if (enemy.alive) {
          player.reset(); // Or handle lives/damage
          score = 0; // Or reduce score
          cameraX = 0; // Reset camera immediately on death
          // Play hurt sound?
        }
      }
    }
    // No 'else' needed - dead enemies are simply skipped
  }

  // Player (Update and Show AFTER potential interactions)
  player.update(platforms); // References isGameOver internally
  player.show();

  // --- Draw Goal ---
  fill(255, 215, 0); // Gold
  noStroke();
  rect(goal.x, goal.y, goal.w, goal.h);

  // --- Check Win/Lose Conditions ---
  if (player.collidesWithRect(goal.x, goal.y, goal.w, goal.h) && !isGameOver) {
    isWin = true;
    isGameOver = true;
  }
  // Check AFTER player update in case they fall off
  if (player.pos.y > height + 100 && !isWin) { // Fell off screen
    isGameOver = true;
  }

  // --- Reset View for UI ---
  translate(cameraX, 0); // Cancel camera translation

  // --- Draw UI ---
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  // --- Game Over / Win Messages ---
  if (isGameOver) {
    fill(0, 0, 0, 180);
    rect(0, 0, width, height); // Dim screen

    fill(255);
    stroke(0);
    strokeWeight(3);
    textSize(48);
    textAlign(CENTER, CENTER);
    if (isWin) {
      text("YOU WIN!", width / 2, height / 2 - 20);
    } else {
      text("GAME OVER", width / 2, height / 2 - 20);
    }
    textSize(20);
    strokeWeight(1);
    text("Press Enter to Play Again", width / 2, height / 2 + 30);

    // Optional: Stop background music
    // if (bgMusic && bgMusic.isPlaying()) { bgMusic.stop(); }
    noLoop(); // Stop the draw loop
  }
}


// ==================================
// --- Input Handling & Game Control ---
// ==================================

function keyPressed() {
  // Start Audio Context on first interaction
  if (!audioStarted) {
    userStartAudio(); // p5 function to enable audio
    audioStarted = true;
    // Optional: Start background music looping here
    // if (bgMusic && !bgMusic.isPlaying()) { bgMusic.loop(); }
  }

  // Player Jump
  if ((keyCode === UP_ARROW || key === ' ' || key === 'w' || key === 'W') && !isGameOver) {
    player.jump(); // Sound plays inside jump()
  }

  // Reset Game
  if (isGameOver && keyCode === ENTER) {
    resetGame();
  }
}

// Fallback for starting audio context
function mousePressed() {
    if (!audioStarted) {
      userStartAudio();
      audioStarted = true;
       // Optional: Start background music looping here
       // if (bgMusic && !bgMusic.isPlaying()) { bgMusic.loop(); }
    }
}

function resetGame() {
  score = 0;
  cameraX = 0;
  isGameOver = false;
  isWin = false;
  // audioStarted = true; // Keep audio context enabled

  // Reset objects (Ensure classes are defined before calling reset)
  player.reset();
  // Important: Use forEach or loop *after* setup has populated the arrays
  enemies.forEach(enemy => enemy.reset());
  coins.forEach(coin => coin.reset());

  // Optional: Restart background music if it was stopped
  // if (bgMusic && !bgMusic.isPlaying()) { bgMusic.loop(); }

  loop(); // Restart the draw loop
}


// ==================================
// --- Class Definitions ---
// ==================================

class Player {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.w = w; // Hitbox width
    this.h = h; // Hitbox height
    this.isGrounded = false;
    this.initialPos = createVector(x, y);
    this.facingRight = true;
  }

  update(platforms) {
    // Check global state *after* it's declared
    if (isGameOver) return;

    // --- Input ---
    let targetVelX = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
      targetVelX = -MOVE_SPEED;
      if(this.vel.x > -0.1) this.facingRight = false;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
      targetVelX = MOVE_SPEED;
       if(this.vel.x < 0.1) this.facingRight = true;
    }

    this.vel.x = lerp(this.vel.x, targetVelX, 0.2);
    if (targetVelX === 0) { this.vel.x *= FRICTION; }
    this.vel.x = constrain(this.vel.x, -MAX_SPEED, MAX_SPEED);
    if (abs(this.vel.x) < 0.1) this.vel.x = 0;

    // --- Physics & Collision ---
    this.vel.y += GRAVITY;
    this.isGrounded = false;
    let nextPos = p5.Vector.add(this.pos, this.vel);

    for (let p of platforms) {
      // Vertical Collision
      if (nextPos.x + this.w > p.x && nextPos.x < p.x + p.w && nextPos.y + this.h > p.y && this.pos.y + this.h <= p.y) {
        this.vel.y = 0; nextPos.y = p.y - this.h; this.isGrounded = true;
      } else if (nextPos.x + this.w > p.x && nextPos.x < p.x + p.w && nextPos.y < p.y + p.h && this.pos.y >= p.y + p.h) {
        this.vel.y = 0; nextPos.y = p.y + p.h;
      }
      // Horizontal Collision (check based on *adjusted* Y)
      if (nextPos.y + this.h > p.y && nextPos.y < p.y + p.h) { // Vertical overlap
         if (nextPos.x + this.w > p.x && this.pos.x + this.w <= p.x) { // Hit left side of platform
            this.vel.x = 0; nextPos.x = p.x - this.w;
         } else if (nextPos.x < p.x + p.w && this.pos.x >= p.x + p.w) { // Hit right side of platform
             this.vel.x = 0; nextPos.x = p.x + p.w;
         }
      }
    }

    // --- Update Position ---
    this.pos.set(nextPos);

    // --- Boundaries ---
    if (this.pos.x < 0) { this.pos.x = 0; this.vel.x = 0; }
    // No right boundary needed if level scrolls past width
  }

  jump() {
    if (this.isGrounded) {
      this.vel.y = JUMP_FORCE;
      this.isGrounded = false;
      if (jumpSound && jumpSound.isLoaded()) {
          jumpSound.play();
      }
    }
  }

  collidesWith(other) {
    // Assumes other has pos, w, h
    return (
      this.pos.x < other.pos.x + other.w &&
      this.pos.x + this.w > other.pos.x &&
      this.pos.y < other.pos.y + other.h &&
      this.pos.y + this.h > other.pos.y
    );
  }

  collidesWithRect(rx, ry, rw, rh) {
    return (
      this.pos.x < rx + rw &&
      this.pos.x + this.w > rx &&
      this.pos.y < ry + rh &&
      this.pos.y + this.h > ry
    );
  }

   reset() {
        this.pos.set(this.initialPos);
        this.vel.set(0, 0);
        this.isGrounded = false;
        this.facingRight = true;
   }

  show() {
    if (!playerImg) { // Fallback
       fill(255, 0, 0); stroke(0); strokeWeight(1);
       rect(this.pos.x, this.pos.y, this.w, this.h);
       return;
    }
    push();
    translate(this.pos.x, this.pos.y);
    if (!this.facingRight) {
      translate(this.w, 0); // Move to right edge
      scale(-1, 1); // Flip
    }
    image(playerImg, 0, 0, this.w, this.h); // Draw from (translated) origin
    pop();
  }
}


class Platform {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show() {
      // Simple brown rectangle
      fill(139, 69, 19);
      noStroke();
      rect(this.x, this.y, this.w, this.h);

      // // Optional: Textured Platform (replace simple rect above)
      // if (platformImg) {
      //     push();
      //     translate(this.x, this.y);
      //     noStroke();
      //     for (let tx = 0; tx < this.w; tx += platformImg.width) {
      //          for (let ty = 0; ty < this.h; ty += platformImg.height) {
      //              let drawW = min(platformImg.width, this.w - tx);
      //              let drawH = min(platformImg.height, this.h - ty);
      //              image(platformImg, tx, ty, drawW, drawH, 0, 0, drawW, drawH);
      //          }
      //     }
      //     pop();
      // } else { /* Fallback if needed */ }
  }
}


class Enemy {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.vel = createVector(-ENEMY_SPEED, 0); // Start moving left
    this.w = w; this.h = h;
    this.alive = true;
    this.initialPos = createVector(x, y);
    this.onGround = false;
    this.facingRight = false; // Moving left initially
  }

  update(platforms) {
    if (!this.alive) return; // Skip if dead

     // --- Physics (Gravity) ---
     this.vel.y += GRAVITY;

     // --- Vertical Collision (Landing on platforms) ---
     this.onGround = false;
     let nextY = this.pos.y + this.vel.y;
     for (let p of platforms) {
         if (this.pos.x + this.w > p.x && this.pos.x < p.x + p.w && nextY + this.h > p.y && this.pos.y + this.h <= p.y) {
             this.vel.y = 0;
             nextY = p.y - this.h;
             this.onGround = true;
             break; // Stop checking platforms vertically once ground is found
         }
     }
      this.pos.y = nextY; // Apply vertical movement/correction

      // --- Horizontal Movement & AI ---
     let nextX = this.pos.x + this.vel.x;
     let turnAround = false;

     // Check for platform edges (only if on ground)
     if (this.onGround) {
         let leadingEdgeX = (this.vel.x < 0) ? nextX : nextX + this.w; // Front edge based on direction
         let footY = this.pos.y + this.h + 5; // Check slightly below feet
         let supportingPlatformFound = false;
         for (let p of platforms) {
              // Check if the leading edge is over the platform horizontally
              // And if the footY is roughly at the platform's height
              if ( leadingEdgeX > p.x && leadingEdgeX < p.x + p.w &&
                   footY > p.y && footY < p.y + p.h + 10 ) { // Small buffer for check
                  supportingPlatformFound = true;
                  break;
              }
         }
         if (!supportingPlatformFound) {
            turnAround = true; // No ground ahead, turn!
         }
     }

     // Check for collisions with platform sides (Walls)
     for (let p of platforms) {
        // Check vertical overlap first
        if (this.pos.y + this.h > p.y && this.pos.y < p.y + p.h) {
           // Check horizontal collision based on direction
           if (this.vel.x < 0 && nextX < p.x + p.w && this.pos.x >= p.x + p.w) { // Moving left, hit right wall
               turnAround = true;
               nextX = p.x + p.w; // Snap to wall
               break;
           } else if (this.vel.x > 0 && nextX + this.w > p.x && this.pos.x + this.w <= p.x) { // Moving right, hit left wall
               turnAround = true;
               nextX = p.x - this.w; // Snap to wall
               break;
           }
        }
     }

     // Apply Turning Logic
     if (turnAround) {
         this.vel.x *= -1; // Reverse direction
         this.facingRight = this.vel.x > 0; // Update facing direction
         // Use the snapped position if we hit a wall
         // Don't apply velocity update this frame if turning
         this.pos.x = nextX;
     } else {
         // Apply normal horizontal movement
         this.pos.x = nextX;
     }

     // Basic boundary check (turn around at level start)
     if (this.pos.x < 0 && this.vel.x < 0) {
         this.pos.x = 0;
         this.vel.x *= -1;
         this.facingRight = true;
     }
     // Add check for levelWidth if needed (e.g., this.pos.x > levelWidth - this.w)
  }

   stomp() {
       this.alive = false; // Mark as dead
       // this.vel.x = 0; // Stop horizontal movement (optional)
        if (stompSound && stompSound.isLoaded()) {
            stompSound.play();
        }
   }

   reset() {
       this.pos.set(this.initialPos);
       this.vel.set(-ENEMY_SPEED, 0); // Reset direction
       this.alive = true;
       this.onGround = false;
       this.facingRight = false;
   }

  show() {
    if (!this.alive) return; // Don't draw if dead

    if (!enemyImg) { // Fallback
        fill(160, 82, 45); noStroke(); ellipseMode(CORNER);
        ellipse(this.pos.x, this.pos.y, this.w, this.h);
        return;
    }
    push();
    translate(this.pos.x, this.pos.y);
    if (!this.facingRight) {
      translate(this.w, 0);
      scale(-1, 1);
    }
    image(enemyImg, 0, 0, this.w, this.h);
    pop();
  }
}


class Coin {
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
        this.w = w; this.h = h;
        this.collected = false;
        this.initialY = y; // Store original Y for bobbing
        this.bobSpeed = 0.08;
        this.bobAmount = 3;
        this.initialPos = createVector(x,y); // Store for reset
    }

    show() {
        if (this.collected) return;

        // Bobbing effect - calculate current Y based on initial Y
        let bobOffset = sin(frameCount * this.bobSpeed) * this.bobAmount;
        let currentY = this.initialY + bobOffset;

        if (!coinImg) { // Fallback
            fill(255, 223, 0); noStroke();
            // Use CORNER mode to be consistent with image drawing if switching
            ellipseMode(CORNER);
            ellipse(this.pos.x, currentY, this.w, this.h);
        } else {
            // Draw the image at the bobbing Y position
            image(coinImg, this.pos.x, currentY, this.w, this.h);
        }
         // Update the actual position Y used for collision detection
         // If collision uses center, adjust accordingly. Here it uses top-left.
         this.pos.y = currentY;
    }

    collect() {
        if (!this.collected) {
            this.collected = true;
            if (coinSound && coinSound.isLoaded()) {
                coinSound.play();
            }
        }
    }

    reset() {
        this.collected = false;
        this.pos.set(this.initialPos); // Reset to original position
        // No need to reset initialY as it's constant
    }
}