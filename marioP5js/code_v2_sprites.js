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
let levelWidth = 3000;

let isGameOver = false;
let isWin = false;

// --- NEW: Image Variables ---
let playerImg;
let enemyImg;
let coinImg; // Optional: Add a coin sprite too
let platformImg; // Optional: Tileable platform texture

// --- P5.js Preload Function ---
// Loads assets before setup() runs
function preload() {
  // **** REPLACE THESE URLS! ****
  // Use local paths (e.g., 'player.png' or 'assets/player.png')
  // Or URLs if hosting images online.
  // Using placeholders for demonstration:
  try {
      playerImg = loadImage('./assets/images/mario.png'); // Replace!
      enemyImg = loadImage('./assets/images/creeper.png');   // Replace!
      coinImg = loadImage('./assets/images/coin.png');    // Replace! (Optional)
       // platformImg = loadImage('path/to/your/platform_texture.png'); // Optional
  } catch (error) {
      console.error("Error loading images:", error);
      // Provide fallback drawing if images fail? For now, just log error.
  }
   // Note: loadImage() can load PNG, JPG, GIF, and SVG files.
}


// --- P5.js Setup Function ---
function setup() {
  createCanvas(800, 400);
  rectMode(CORNER);
  imageMode(CORNER); // Draw images from top-left corner

  // --- Create Player ---
  // Adjust hitbox size (w, h) if your sprite's proportions are different
  player = new Player(100, 100, 40, 40); // Added w, h arguments

  // --- Create Level Elements ---
  // Ground
  platforms.push(new Platform(0, height - 40, levelWidth, 40));

  // Example Platforms (same as before)
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
  // Adjust hitbox size (w, h) if needed
  enemies.push(new Enemy(400, height - 80, 28.5, 37.5)); // Added w, h args
  enemies.push(new Enemy(700, height - 60, 28.5, 37.5));
  enemies.push(new Enemy(1100, height - 170, 28.5, 37.5));
  enemies.push(new Enemy(1700, height - 60, 28.5, 37.5));
  enemies.push(new Enemy(2200, height - 140, 28.5, 37.5));
  enemies.push(new Enemy(2650, height - 170, 28.5, 37.5));


  // --- Create Coins ---
  // Adjust hitbox size (w, h) if needed
  coins.push(new Coin(225, height - 130, 30, 30)); // Added w, h args
  coins.push(new Coin(380, height - 190, 30, 30));
  coins.push(new Coin(410, height - 190, 30, 30));
  coins.push(new Coin(630, height - 150, 30, 30));
  coins.push(new Coin(850, height - 230, 30, 30));
  coins.push(new Coin(1050, height - 180, 30, 30));
  coins.push(new Coin(1150, height - 180, 30, 30));
  coins.push(new Coin(1640, height - 210, 30, 30));
  coins.push(new Coin(1850, height - 280, 30, 30));
  coins.push(new Coin(2150, height - 150, 30, 30));
  coins.push(new Coin(2440, height - 230, 30, 30));
  coins.push(new Coin(2660, height - 180, 30, 30));

  // --- Create Goal ---
  goal = { x: levelWidth - 100, y: height - 100, w: 20, h: 60 };
}

// --- P5.js Draw Function (Game Loop) ---
function draw() {
  background(135, 206, 250); // Sky blue

  // Update Camera
  let targetCameraX = player.pos.x - width / 3;
  cameraX = lerp(cameraX, targetCameraX, 0.1);
  cameraX = constrain(cameraX, 0, levelWidth - width);

  // Apply Camera Transformation
  translate(-cameraX, 0);

  // Draw and Update Game Elements

  // Platforms (Optional: Draw with texture)
  for (let p of platforms) {
      p.show(); // Keep using original show, or modify Platform.show() too
  }

   // Coins
   for (let i = coins.length - 1; i >= 0; i--) {
      let coin = coins[i];
      if (!coin.collected) {
          coin.show();
          if (player.collidesWith(coin)) {
              coin.collect();
              score += 10;
              // Maybe play coin sound
          }
      }
   }

   // Enemies
   for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      if (enemy.alive) {
          enemy.update(platforms);
          enemy.show();

          // Check player collision with enemy
          if (player.collidesWith(enemy)) {
              if (player.vel.y > 0 && player.pos.y + player.h < enemy.pos.y + enemy.h / 2) {
                  enemy.stomp();
                  player.vel.y = STOMP_BOUNCE;
                  score += 50;
                  // Maybe play stomp sound
              } else if (!enemy.isStomped) { // Prevent hitting already stomped enemy in same frame
                  // Player got hit
                  player.reset(); // Reset player position/state
                  score = 0; // Reset score (or decrease lives)
                  cameraX = 0; // Reset camera immediately
                  // Maybe play hurt sound
              }
          }
      } else {
          // Optionally: Add fade out/poof animation for dead enemy
          // Optionally: Remove after animation: enemies.splice(i, 1);
      }
   }

  // Player
  player.update(platforms);
  player.show();

  // --- Draw Goal ---
  fill(255, 215, 0); // Gold
  noStroke();
  rect(goal.x, goal.y, goal.w, goal.h); // Simple goalpost

  // --- Check Win/Lose Conditions ---
  if (player.collidesWithRect(goal.x, goal.y, goal.w, goal.h) && !isGameOver) {
     isWin = true;
     isGameOver = true;
  }
  if (player.pos.y > height + 50 && !isWin) {
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
    fill(0, 0, 0, 180); // Darker overlay
    rect(0, 0, width, height);

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
    strokeWeight(1); // Thinner stroke for smaller text
     text("Press Enter to Play Again", width / 2, height / 2 + 30);
    noLoop();
  }
}

// --- Handle Player Input ---
function keyPressed() {
  if ((keyCode === UP_ARROW || key === ' ' || key === 'w' || key === 'W') && !isGameOver) {
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

    player.reset();

    enemies.forEach(enemy => enemy.reset());
    coins.forEach(coin => coin.reset()); // Add reset method to Coin

    loop(); // Restart the draw loop
}


// ==================================
// --- Player Class ---
// ==================================
class Player {
  // --- MODIFIED: Added w, h to constructor ---
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    // --- MODIFIED: Use w, h from arguments ---
    this.w = w; // Hitbox width
    this.h = h; // Hitbox height
    this.isGrounded = false;
    this.initialPos = createVector(x, y);
    // --- NEW: Track facing direction ---
    this.facingRight = true;
  }

  update(platforms) {
    if (isGameOver) return; // Stop moving if game over

    // --- Input ---
    let targetVelX = 0;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      targetVelX = -MOVE_SPEED;
      if(this.vel.x > -0.1) this.facingRight = false; // Update direction only if moving significantly or changing dir
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      targetVelX = MOVE_SPEED;
       if(this.vel.x < 0.1) this.facingRight = true; // Update direction
    }

    this.vel.x = lerp(this.vel.x, targetVelX, 0.2);
    if (targetVelX === 0) {
      this.vel.x *= FRICTION;
    }
    this.vel.x = constrain(this.vel.x, -MAX_SPEED, MAX_SPEED);
    if (abs(this.vel.x) < 0.1) this.vel.x = 0;

    // --- Physics & Collision (Same as before) ---
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
      // Horizontal Collision
      if (nextPos.y + this.h > p.y && nextPos.y < p.y + p.h && nextPos.x + this.w > p.x && this.pos.x + this.w <= p.x) {
        this.vel.x = 0; nextPos.x = p.x - this.w;
      } else if (nextPos.y + this.h > p.y && nextPos.y < p.y + p.h && nextPos.x < p.x + p.w && this.pos.x >= p.x + p.w) {
        this.vel.x = 0; nextPos.x = p.x + p.w;
      }
    }

    this.pos.set(nextPos);
    if (this.pos.x < 0) { this.pos.x = 0; this.vel.x = 0; }
  }

  jump() {
    if (this.isGrounded) {
      this.vel.y = JUMP_FORCE;
      this.isGrounded = false;
      // Play jump sound?
    }
  }

  // Basic rectangle collision check
  collidesWith(other) {
    return (
      this.pos.x < other.pos.x + other.w &&
      this.pos.x + this.w > other.pos.x &&
      this.pos.y < other.pos.y + other.h &&
      this.pos.y + this.h > other.pos.y
    );
  }
  // Specific check for goal rect
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
        this.facingRight = true; // Face right on reset
   }

  // --- MODIFIED: Draw using image ---
  show() {
    if (!playerImg) { // Fallback if image didn't load
       fill(255, 0, 0); stroke(0); strokeWeight(1);
       rect(this.pos.x, this.pos.y, this.w, this.h);
       return;
    }

    push(); // Isolate transformations
    translate(this.pos.x, this.pos.y); // Move origin to player's top-left

    if (!this.facingRight) {
      // Flip horizontally
      translate(this.w, 0); // Move origin to the right edge
      scale(-1, 1);        // Flip coordinate system horizontally
    }

    // Draw the image from the (potentially flipped) origin
    // The image will be scaled to fit the hitbox dimensions (this.w, this.h)
    image(playerImg, 0, 0, this.w, this.h);

    // Optional: Draw hitbox for debugging
    // noFill();
    // stroke(255, 0, 0, 150); // Red semi-transparent
    // rect(0, 0, this.w, this.h); // Draw relative to translated origin

    pop(); // Restore original transformations
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
      // --- Option 1: Original solid color ---
      fill(139, 69, 19); // Brown
      noStroke();
      rect(this.x, this.y, this.w, this.h);

      // --- Option 2: Use a Tiling Texture (if platformImg loaded) ---
      /*
      if (platformImg) {
          push();
          translate(this.x, this.y);
          noStroke();
          // Tile the image across the platform width
          for (let tx = 0; tx < this.w; tx += platformImg.width) {
               for (let ty = 0; ty < this.h; ty += platformImg.height) {
                   let drawW = min(platformImg.width, this.w - tx);
                   let drawH = min(platformImg.height, this.h - ty);
                   image(platformImg, tx, ty, drawW, drawH, 0, 0, drawW, drawH);
               }
          }
          pop();
      } else { // Fallback if no image
           fill(139, 69, 19); // Brown
           noStroke();
           rect(this.x, this.y, this.w, this.h);
      }
      */
  }
}


// ==================================
// --- Enemy Class ---
// ==================================
class Enemy {
   // --- MODIFIED: Added w, h to constructor ---
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.vel = createVector(-ENEMY_SPEED, 0);
    // --- MODIFIED: Use w, h from arguments ---
    this.w = w; // Hitbox width
    this.h = h; // Hitbox height
    this.alive = true;
    this.isStomped = false; // Flag to prevent multi-hits after stomp
    this.initialPos = createVector(x, y);
    this.onGround = false;
     // --- NEW: Track facing direction ---
    this.facingRight = false; // Starts moving left
  }

  update(platforms) {
    if (!this.alive || this.isStomped) return;

    // Basic Gravity
    this.vel.y += GRAVITY;

    // Simple platform collision (landing)
    this.onGround = false;
    let nextY = this.pos.y + this.vel.y;
    for (let p of platforms) {
       if (this.pos.x + this.w > p.x && this.pos.x < p.x + p.w && nextY + this.h > p.y && this.pos.y + this.h <= p.y) {
         this.vel.y = 0; nextY = p.y - this.h; this.onGround = true; break;
       }
    }
    this.pos.y = nextY;

    // AI: Move and turn
    let nextX = this.pos.x + this.vel.x;
    let turnAround = false;

    // Check edges if on ground
    if (this.onGround) {
       let leadingEdgeX = (this.vel.x < 0) ? nextX : nextX + this.w;
       let footY = this.pos.y + this.h + 5;
       let supportingPlatform = null;
       for (let p of platforms) { if (leadingEdgeX > p.x && leadingEdgeX < p.x + p.w && footY > p.y && footY < p.y + p.h + 10) { supportingPlatform = p; break; } }
       if (!supportingPlatform) { turnAround = true; }
    }

    // Check walls
    for (let p of platforms) {
       if (this.pos.y + this.h > p.y && this.pos.y < p.y + p.h) { // Vertical overlap
           if (nextX + this.w > p.x && this.pos.x + this.w <= p.x) { // Hit left wall
               turnAround = true; nextX = p.x - this.w; break;
           } else if (nextX < p.x + p.w && this.pos.x >= p.x + p.w) { // Hit right wall
               turnAround = true; nextX = p.x + p.w; break;
           }
       }
    }

    if (turnAround) {
       this.vel.x *= -1;
       this.facingRight = this.vel.x > 0; // Update facing direction
       // If we hit a wall exactly, don't move horizontally this frame
       if (abs(nextX - this.pos.x) > abs(this.vel.x * 1.1)) { // Check if snapped
          this.pos.x = nextX; // Use snapped position if hitting wall
       } else {
           // If turning near edge, don't update X this frame to prevent overshoot
       }

    } else {
       this.pos.x = nextX; // Update horizontal position normally
    }

    // Boundary check
    if (this.pos.x < 0 && this.vel.x < 0) {
       this.pos.x = 0; this.vel.x *= -1; this.facingRight = true;
    }
    // Add right boundary check if needed (levelWidth)
  }

   stomp() {
       this.alive = true; // Keep it for potential animation
       this.isStomped = true; // Mark as stomped
       this.vel.x = 0; // Stop moving
       // Play stomp sound?
       // Start shrinking/fade animation? For now, it just stops moving
       // We can modify show() to draw differently if isStomped is true
   }

   reset() {
       this.pos.set(this.initialPos);
       this.vel.set(-ENEMY_SPEED, 0);
       this.alive = true;
       this.isStomped = false;
       this.onGround = false;
       this.facingRight = false; // Reset direction
   }

  // --- MODIFIED: Draw using image ---
  show() {
    if (!this.alive) return; // Don't draw if fully 'dead' (optional state)

    // Change appearance if stomped (e.g., flatten)
    let displayH = this.isStomped ? this.h / 2 : this.h;
    let displayY = this.isStomped ? this.pos.y + this.h / 2 : this.pos.y;

    if (!enemyImg) { // Fallback if image didn't load
        fill(this.isStomped ? 100 : 160, 82, 45); // Darker if stomped
        noStroke();
        ellipseMode(CORNER);
        ellipse(this.pos.x, displayY, this.w, displayH);
        return;
    }

    push(); // Isolate transformations
    translate(this.pos.x, displayY); // Use displayY for stomped effect

    if (!this.facingRight) {
      // Flip horizontally
      translate(this.w, 0);
      scale(-1, 1);
    }

    // Draw the image, potentially squashed if stomped
    image(enemyImg, 0, 0, this.w, displayH);

    // Optional: Draw hitbox for debugging
    // noFill();
    // stroke(0, 0, 255, 150); // Blue semi-transparent
    // rect(0, 0, this.w, displayH); // Draw relative to translated origin

    pop(); // Restore original transformations
  }
}

// ==================================
// --- Coin Class ---
// ==================================
class Coin {
    // --- MODIFIED: Added w, h to constructor ---
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
         // --- MODIFIED: Use w, h from arguments ---
        this.w = w; // Hitbox width
        this.h = h; // Hitbox height
        this.collected = false;
        this.initialY = y;
        this.bobSpeed = 0.08;
        this.bobAmount = 3;
        this.initialPos = createVector(x,y); // For reset
    }

    // --- MODIFIED: Draw using image (optional) ---
    show() {
        if (this.collected) return;

        let bobOffset = sin(frameCount * this.bobSpeed) * this.bobAmount;
        let currentY = this.initialY + bobOffset;

        if (!coinImg) { // Fallback if image didn't load
            fill(255, 223, 0); // Gold color
            noStroke();
            ellipseMode(CORNER); // Match imageMode(CORNER)
            ellipse(this.pos.x, currentY, this.w, this.h);
        } else {
            // Draw the image
            image(coinImg, this.pos.x, currentY, this.w, this.h);
        }
         // Update the position used for collision checking ONLY if needed
         // If collision uses pos.x/y directly, update it:
         this.pos.y = currentY;
    }

    collect() {
        this.collected = true;
        // Play sound effect?
    }

    reset() {
        this.collected = false;
        this.pos.set(this.initialPos); // Reset position needed if bobbing updates it
    }
}