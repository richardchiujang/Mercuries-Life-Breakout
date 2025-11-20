export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Ball extends Position, Velocity {
  radius: number;
  speed: number;
  active: boolean;
}

export interface Paddle extends Position {
  width: number;
  height: number;
}

export interface Brick extends Position {
  width: number;
  height: number;
  status: number; // 1 = active, 0 = broken
  color: string;
  isFlashy: boolean;
  flashOffset: number;
}

export enum DropType {
  CONTRACT = 'CONTRACT',
  HEART = 'HEART'
}

export interface Drop extends Position {
  type: DropType;
  active: boolean;
  dy: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Particle extends Position, Velocity {
  life: number;
  color: string;
  size: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
  brickRowCount: number;
  brickColumnCount: number;
  brickPadding: number;
  brickOffsetTop: number;
}
