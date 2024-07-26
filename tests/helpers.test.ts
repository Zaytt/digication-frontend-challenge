import { COLUMN_WIDTH, GUTTER_SIZE } from '../src/constants';
import { areColliding, localX2ModuleColX, localY2ModuleY, module2Rectangle, moduleColW2LocalW, moduleColX2LocalX, moduleY2LocalY } from '../src/helpers';
import ModuleInterface from '../src/types/ModuleInterface';

describe('helpers', () => {
  test('moduleColW2LocalW', () => {
    const w = 2;
    expect(moduleColW2LocalW(w)).toEqual(w * COLUMN_WIDTH - GUTTER_SIZE);
  });

  test('moduleColX2LocalX', () => {
    const x = 2;
    expect(moduleColX2LocalX(x)).toEqual(moduleColW2LocalW(x) + GUTTER_SIZE * 2);
  });

  test('moduleY2LocalY', () => {
    const y = 20;
    expect(moduleY2LocalY(y)).toEqual(y + GUTTER_SIZE);
  });

  test('localY2ModuleY', () => {
    const y = 20;
    expect(localY2ModuleY(y)).toEqual(y - GUTTER_SIZE);
  });

  test('localX2ModuleColX', () => {
    const x = 20;
    expect(localX2ModuleColX(x)).toEqual(Math.round((x - GUTTER_SIZE) / COLUMN_WIDTH));
  });

  test('areColliding', ()=>{
    const module1:ModuleInterface = { id: 1, coord: { x: 1, y: 80, w: 2, h: 200 } };
    const module2:ModuleInterface = { id: 2, coord: { x: 5, y: 0, w: 3, h: 100 } };
    const module3:ModuleInterface = { id: 3, coord: { x: 4, y: 310, w: 3, h: 200 } };
    const module4:ModuleInterface = { id: 4, coord: { x: 3, y: 410, w: 2, h: 100 } };
    
    expect(areColliding(module1, module2)).toEqual(false);
    expect(areColliding(module3, module4)).toEqual(true);
  });
});
