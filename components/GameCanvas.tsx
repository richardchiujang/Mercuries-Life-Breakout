import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Ball, Paddle, Brick, Particle, Drop, DropType, FloatingText } from '../types';
import { CONFIG, THEME, LOGO_URL, MLI_PRODUCTS } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: (prev: number) => number) => void;
  lives: number;
  setLives: (lives: (prev: number) => number) => void;
  autoMode: boolean;
  onGameOver: (finalScore: number, win: boolean) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  setScore,
  setLives,
  autoMode,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game Entities Refs (to avoid closure staleness in loop)
  const ballRef = useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0, radius: CONFIG.ballRadius, speed: 6, active: false });
  const paddleRef = useRef<Paddle>({ x: 0, y: 0, width: CONFIG.paddleWidth, height: CONFIG.paddleHeight });
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dropsRef = useRef<Drop[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  
  const [isMobile, setIsMobile] = useState(false);

  // Initialize Logo
  useEffect(() => {
    const img = new Image();
    img.src = LOGO_URL;
    img.onload = () => {
      logoImgRef.current = img;
    };
  }, []);

  // Initialize Game Level
  const initLevel = useCallback(() => {
    const { canvasWidth, canvasHeight, brickRowCount, brickColumnCount, brickPadding, brickOffsetTop, paddleWidth, paddleHeight } = CONFIG;
    
    // Reset Ball
    ballRef.current = {
      x: canvasWidth / 2,
      y: canvasHeight - 40,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4,
      radius: CONFIG.ballRadius,
      speed: 6,
      active: true
    };

    // Reset Paddle
    paddleRef.current = {
      x: (canvasWidth - paddleWidth) / 2,
      y: canvasHeight - paddleHeight - 10,
      width: paddleWidth,
      height: paddleHeight
    };

    // Create Bricks
    const newBricks: Brick[] = [];
    const brickWidth = (canvasWidth - (brickPadding * (brickColumnCount + 1))) / brickColumnCount;
    
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const x = (c * (brickWidth + brickPadding)) + brickPadding;
        const y = (r * (30 + brickPadding)) + brickOffsetTop; // Increased height slightly for text
        
        // Assign a random MLI product to this brick
        const product = MLI_PRODUCTS[Math.floor(Math.random() * MLI_PRODUCTS.length)];
        
        // 15% chance to be "Flashy" (Bonus)
        const isFlashy = Math.random() < 0.15;
        
        newBricks.push({
          x,
          y,
          originalX: x, // Store original X for movement calculation
          width: brickWidth,
          height: 25,
          status: 1,
          color: isFlashy ? THEME.accent : product.color,
          isFlashy,
          flashOffset: Math.random() * 100,
          productName: product.name
        });
      }
    }
    bricksRef.current = newBricks;
    particlesRef.current = [];
    dropsRef.current = [];
    floatingTextsRef.current = [];
  }, []);

  // Reset game when entering PLAYING state
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initLevel();
      setScore(() => 0);
      setLives(() => 3);
    }
  }, [gameState, initLevel, setScore, setLives]);

  // Handle Mouse/Touch Movement
  const handleInput = useCallback((clientX: number) => {
    if (autoMode) return; // Ignore input in auto mode
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    
    let newPaddleX = relativeX - paddleRef.current.width / 2;
    
    // Constrain to canvas
    if (newPaddleX < 0) newPaddleX = 0;
    if (newPaddleX + paddleRef.current.width > CONFIG.canvasWidth) {
      newPaddleX = CONFIG.canvasWidth - paddleRef.current.width;
    }
    
    paddleRef.current.x = newPaddleX;
  }, [autoMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouseMove = (e: MouseEvent) => handleInput(e.clientX);
    const touchMove = (e: TouchEvent) => handleInput(e.touches[0].clientX);

    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('touchmove', touchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', mouseMove);
      canvas.removeEventListener('touchmove', touchMove);
    };
  }, [handleInput]);

  // Game Loop
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const ball = ballRef.current;
    const paddle = paddleRef.current;
    const { canvasWidth, canvasHeight } = CONFIG;
    const time = Date.now() / 1000;

    // --- Update Brick Positions (Moving Bricks) ---
    bricksRef.current.forEach((brick, index) => {
      if (brick.status === 1) {
         // Alternate direction based on row index (calculated roughly from Y)
         const rowIndex = Math.floor((brick.y - CONFIG.brickOffsetTop) / (30 + CONFIG.brickPadding));
         const direction = rowIndex % 2 === 0 ? 1 : -1;
         // Sine wave movement
         const offset = Math.sin(time * 2) * 20 * direction;
         brick.x = brick.originalX + offset;
      }
    });

    // --- Auto Mode Logic ---
    if (autoMode && ball.active) {
      const targetX = ball.x - paddle.width / 2;
      // Smooth lerp for a more natural but perfect feel
      paddle.x += (targetX - paddle.x) * 0.15; 
      
      // Constrain
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > canvasWidth) paddle.x = canvasWidth - paddle.width;
    }

    // --- Ball Movement ---
    if (ball.active) {
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall Collisions
      if (ball.x + ball.dx > canvasWidth - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
      }
      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
      }
      
      // Floor Collision (Death)
      if (ball.y + ball.dy > canvasHeight - ball.radius) {
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                ball.active = false;
                onGameOver(0, false); // Score handled in state, passing 0 just to trigger
            } else {
                // Reset Ball Position
                ball.x = canvasWidth / 2;
                ball.y = canvasHeight - 40;
                ball.dy = -4;
                ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
            }
            return newLives;
        });
      }

      // Paddle Collision
      if (
        ball.y + ball.dy > paddle.y - ball.radius && // below top of paddle
        ball.y - ball.radius < paddle.y + paddle.height && // above bottom
        ball.x > paddle.x && // right of left side
        ball.x < paddle.x + paddle.width // left of right side
      ) {
          // Simple reflection
          ball.dy = -ball.speed; // Force up
          
          // Add some "english" based on where it hit the paddle
          const hitPoint = ball.x - (paddle.x + paddle.width / 2);
          ball.dx = hitPoint * 0.15;
          
          // Increase speed slightly on every paddle hit
          ball.speed = Math.min(ball.speed * 1.02, 12);
      }
    }

    // --- Brick Collision ---
    let activeBricksCount = 0;
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        activeBricksCount++;
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          
          const points = brick.isFlashy ? 50 : 10;
          setScore(prev => prev + points);

          // Spawn Floating Text (Product Name)
          floatingTextsRef.current.push({
              x: brick.x + brick.width/2,
              y: brick.y,
              text: brick.productName,
              color: brick.color,
              life: 1.0,
              dy: -1.5,
              scale: 1.0
          });

          // Spawn Particles
          for(let i=0; i<8; i++) {
            particlesRef.current.push({
                x: brick.x + brick.width/2,
                y: brick.y + brick.height/2,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                life: 1.0,
                size: Math.random() * 3 + 1,
                color: brick.color
            });
          }

          // Spawn Drops (30% chance)
          if (Math.random() < 0.3) {
            // Use a fixed larger size for drops
            const dropSize = 50;
            dropsRef.current.push({
                x: brick.x + brick.width / 2 - dropSize/2,
                y: brick.y,
                width: dropSize,
                height: dropSize,
                dy: 2.5, // Fall speed
                active: true,
                type: Math.random() > 0.8 ? DropType.HEART : DropType.CONTRACT, // Contracts are more common
                rotation: 0
            });
          }
        }
      }
    });

    if (activeBricksCount === 0) {
      onGameOver(0, true); // Win
      ball.active = false;
    }

    // --- Drops Update ---
    dropsRef.current.forEach(drop => {
        if (drop.active) {
            drop.y += drop.dy;
            drop.rotation += 0.05;

            // Catch Drop
            if (
                drop.y + drop.height > paddle.y &&
                drop.y < paddle.y + paddle.height &&
                drop.x + drop.width > paddle.x &&
                drop.x < paddle.x + paddle.width
            ) {
                drop.active = false;
                if (drop.type === DropType.HEART) {
                    setLives(prev => Math.min(prev + 1, 5)); // Max 5 lives
                    // Visual feedback
                    particlesRef.current.push({ x: drop.x, y: drop.y, dx: 0, dy: -1, life: 1, size: 8, color: '#ff0000' });
                    floatingTextsRef.current.push({ x: drop.x, y: drop.y, text: "❤️ +1 Life", color: '#ff0000', life: 1.0, dy: -2, scale: 1.2 });
                } else {
                    setScore(prev => prev + 100); // Big points for contracts
                    floatingTextsRef.current.push({ x: drop.x, y: drop.y, text: "📑 保單GET!", color: '#FFD700', life: 1.0, dy: -2, scale: 1.2 });
                    // Gold particles for contracts
                    for(let i=0; i<5; i++) {
                       particlesRef.current.push({ 
                           x: drop.x + drop.width/2, 
                           y: drop.y + drop.height/2, 
                           dx: (Math.random()-0.5)*5, 
                           dy: (Math.random()-0.5)*5, 
                           life: 0.8, 
                           size: 4, 
                           color: '#FFD700' 
                       });
                    }
                }
            }

            // Remove if off screen
            if (drop.y > canvasHeight) drop.active = false;
        }
    });
    // Clean up drops
    dropsRef.current = dropsRef.current.filter(d => d.active);


    // --- Particles Update ---
    particlesRef.current.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // --- Floating Text Update ---
    floatingTextsRef.current.forEach(ft => {
        ft.y += ft.dy;
        ft.life -= 0.015;
        ft.scale += 0.01;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

  }, [gameState, autoMode, setLives, setScore, onGameOver]);

  // Render Loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Screen
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Draw Background Logo Watermark
    if (logoImgRef.current) {
        ctx.globalAlpha = 0.15;
        const size = 400;
        // Center logo
        ctx.drawImage(
            logoImgRef.current, 
            CONFIG.canvasWidth/2 - size/2, 
            CONFIG.canvasHeight/2 - size/4, 
            size, size/3 // Aspect ratio adjust based on the SVG
        );
        ctx.globalAlpha = 1.0;
    }

    // Draw Bricks
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        
        if (brick.isFlashy) {
            // Strobe effect
            const time = Date.now() * 0.005 + brick.flashOffset;
            const hue = (time * 50) % 360; // Rainbow strobe
            ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';
        } else {
            ctx.fillStyle = brick.color;
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.closePath();
        
        // Reset Shadow
        ctx.shadowBlur = 0;

        // Brick Shine
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height/2);
      }
    });

    // Draw Drops (Enhanced)
    dropsRef.current.forEach(drop => {
        ctx.save();
        
        // Center of drop for transforms
        const cx = drop.x + drop.width / 2;
        const cy = drop.y + drop.height / 2;
        
        ctx.translate(cx, cy);
        
        // Pulsing Scale Animation
        const pulse = 1 + 0.15 * Math.sin(Date.now() * 0.008);
        ctx.scale(pulse, pulse);
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = drop.type === DropType.HEART ? '#ff0000' : '#FFD700';
        
        // Background Circle (to make it pop)
        ctx.beginPath();
        ctx.arc(0, 0, drop.width / 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.closePath();
        
        // Text/Emoji
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0; // Clear shadow for text so it's sharp
        
        if (drop.type === DropType.HEART) {
            ctx.fillText("❤️", 0, 2);
        } else {
            // Policy Contract
            ctx.fillText("📑", 0, 2);
        }
        ctx.restore();
    });

    // Draw Floating Texts (Product Names)
    floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        
        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = "bold 14px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText(ft.text, 0, 0);
        
        // Fill
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);
        
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;

    // Draw Paddle
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, paddleRef.current.y, paddleRef.current.width, paddleRef.current.height, 5);
    ctx.fillStyle = THEME.primary;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    // Draw Branding on Paddle
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MERCURIES", paddleRef.current.x + paddleRef.current.width/2, paddleRef.current.y + 14);


    // Draw Ball
    if (ballRef.current.active || gameState === GameState.PLAYING) {
        ctx.beginPath();
        ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        // Ball Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = THEME.primary;
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
    });
    ctx.globalAlpha = 1.0;

  }, [gameState]);

  // Main Loop
  useEffect(() => {
    const loop = () => {
      update();
      draw();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.canvasWidth}
      height={CONFIG.canvasHeight}
      className="bg-black rounded-lg shadow-2xl border-4 border-red-600 cursor-none touch-none"
      style={{ maxWidth: '100%' }}
    />
  );
};

export default GameCanvas;