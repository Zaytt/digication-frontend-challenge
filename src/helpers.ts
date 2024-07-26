import { COLUMN_WIDTH, GUTTER_SIZE, NUM_COLUMNS } from './constants';
import ModuleInterface from './types/ModuleInterface';
import RectangleInterface from './types/RectangleInterface';

/**
 * Returns the width of the module in pixels
 * @param colW the number of columns that the module spans
 * @returns number representing the pixel width
 */
export const moduleColW2LocalW = (colW: number) => colW * COLUMN_WIDTH - GUTTER_SIZE;

/**
 * Returns the position in the x axis based on the column number
 * @param moduleX number of col width
 * @returns The x position in the grid
 */
export const moduleColX2LocalX = (moduleX: number) => moduleColW2LocalW(moduleX) + GUTTER_SIZE * 2;

/**
 * Returns the position in the y axis based on the module y value
 * @param moduleY module y value
 * @returns y position in the grid
 */
export const moduleY2LocalY = (moduleY: number) => moduleY + GUTTER_SIZE;

/**
 * Returns the module y position based on the local y value
 * @param moduleY local y value
 * @returns y module position
 */
export const localY2ModuleY = (localY: number) => localY - GUTTER_SIZE;

/**
 * Transform the local x coordinate to the corresponding column position
 * @param localX grid x coordinate
 * @returns the nearest column integer value, starting at 0
 */
export const localX2ModuleColX = (localX: number) => Math.round((localX - GUTTER_SIZE) / COLUMN_WIDTH);

/**
 * Transforms the module data values into a rectangle with grid coordinates (x1,y1) and (x2,y2)
 * @param module 
 * @returns the x1, x2, y1, y2 coordinates of the rectangle
 */
export const module2Rectangle = (module: ModuleInterface):RectangleInterface => {
  const { x, y, w, h } = module.coord;
  const x1 = moduleColX2LocalX(x);
  const y1 = moduleY2LocalY(y);
  const x2 = x1 + moduleColW2LocalW(w);
  const y2 = moduleY2LocalY(y1 + h);
  
  return { x1, x2, y1, y2 };
};

/**
 * Checks if two modules are overlapping eachother
 * @param module1 
 * @param module2 
 * @returns true if overlapping, false if not
 */
export const areColliding = (module1: ModuleInterface, module2: ModuleInterface):boolean=> {
  const rectangle1 = module2Rectangle(module1);
  const rectangle2 = module2Rectangle(module2);

  const { x1: m1x1, x2: m1x2, y1: m1y1, y2: m1y2 } = rectangle1;
  const { x1: m2x1, x2: m2x2, y1: m2y1, y2: m2y2 }  = rectangle2;

  const horizontalCollision = m1x1 < m2x2 && m1x2 > m2x1;
  const verticalCollision = m1y1 < m2y2 && m2y1 < m1y2;

  return horizontalCollision && verticalCollision;
};


/**
 * Returns the position adjustment for a module depending on the neareast collision point
 * @param module1 the module that is being dragged
 * @param module2 the module that is still
 * @returns an object containing the x or y value of a ModuleInterface to be adjusted
 */
export const adjustModulePos = (module1: ModuleInterface, module2: ModuleInterface) => {
  // Transform modules to rectangles
  const rect1 = module2Rectangle(module1);
  const rect2 = module2Rectangle(module2);

  const coord1 = module1.coord;
  const coord2 = module2.coord;
  
  // calculate distances
  const distanceRight = Math.abs(rect2.x2 - rect1.x1);
  const distanceLeft = Math.abs(rect2.x1 - rect1.x2);
  const distanceDown = Math.abs(rect2.y2 - rect1.y1);
  const distanceUp = Math.abs(rect2.y1 - rect1.y2);

  const minDistance = Math.min(distanceRight, distanceLeft, distanceDown, distanceUp);

  // Define possible movements
  const moveRight = {
    x: coord2.x + coord2.w,
  };
  
  const moveLeft = {
    x: coord2.x - coord1.w,
  };
  
  const moveDown = {
    y: rect2.y2 - GUTTER_SIZE,
  };
  
  const moveUp = {
    y: rect2.y1 - (rect1.y2 - rect1.y1) - GUTTER_SIZE,
  };
  
  // adjust position based on the closest position to the collision
  // consider that the adjustment must be a valid position inside the grid.
  if (minDistance === distanceRight && coord2.x + coord2.w + coord1.w < NUM_COLUMNS - 1) return moveRight;
  if (minDistance === distanceLeft && coord2.x - coord1.w > 0) return moveLeft;
  if (minDistance === distanceUp && coord2.y - coord1.h > GUTTER_SIZE) return moveUp;

  return moveDown;
};