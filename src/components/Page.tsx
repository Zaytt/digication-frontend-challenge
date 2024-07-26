import React from 'react';
import { Box } from '@mui/material';
import { useDrop } from 'react-dnd';

import Grid from '../Grid';
import Module from './Module';
import { GUTTER_SIZE } from '../constants';
import ModuleInterface from '../types/ModuleInterface';
import { adjustModulePos, areColliding } from '../helpers.ts';

const colors = ['#39C7FF', '#F83882', '#FA6B37', '#E1FF36'];

const Page = () => {
  // Modules initial config
  const [modules, setModules] = React.useState([
    { id: 1, coord: { x: 1, y: 80, w: 2, h: 200 } },
    { id: 2, coord: { x: 5, y: 0, w: 3, h: 100 } },
    { id: 3, coord: { x: 7, y: 310, w: 3, h: 200 } },
    { id: 4, coord: { x: 2, y: 410, w: 2, h: 100 } },
  ]);

  const containerRef = React.useRef<HTMLDivElement>();

  // Wire the module to DnD drag system
  const [, drop] = useDrop({ accept: 'module' });
  drop(containerRef);

  // Calculate container height
  const containerHeight = React.useMemo(
    () =>
      Math.max(...modules.map(({ coord: { y, h } }) => y + h)) +
      GUTTER_SIZE * 2,
    [modules]
  );

  // Updates the modules state
  const updateModules = (updatedModule: ModuleInterface) => {
    const moduleIndex = modules.findIndex(
      (module) => updatedModule.id === module.id
    );
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = updatedModule;
    setModules(updatedModules);
  };

  // Check for module collision
  const colissionCheck = (targetModule: ModuleInterface) => {
    let hasCollision = false;
    let updatedModules = [...modules];

    for (let i = 0; i < updatedModules.length; i++) {
      // skip checking collision with itself
      if (targetModule.id === updatedModules[i].id) continue;

      // check if the previous adjustment worked. if not, return false and let the user pick a different position
      const collisionDetected = areColliding(targetModule, updatedModules[i]);
      if (hasCollision && collisionDetected) return true;
      if (collisionDetected) {
        hasCollision = true;
        const adjustment = adjustModulePos(targetModule, updatedModules[i]);
        targetModule = {
          ...targetModule,
          coord: {
            ...targetModule.coord,
            ...adjustment,
          },
        };

        // Ensure the updated module is placed back in the array
        const moduleIndex = updatedModules.findIndex(
          (module) => targetModule.id === module.id
        );
        updatedModules[moduleIndex] = targetModule;

        // Check again for any further collisions with the updated position
        i = -1; // restart checking from the beginning
      }
    }

    setModules(updatedModules);

    return hasCollision;
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      width={1024}
      height={containerHeight}
      margin="auto"
      sx={{
        overflow: 'hidden',
        outline: 'thick double #32a1ce',
        transition: 'height 0.2s',
      }}
    >
      <Grid height={containerHeight} />
      {modules.map((module, index) => (
        <Module
          key={module.id}
          data={module}
          updateModules={updateModules}
          colissionCheck={colissionCheck}
          color={colors[index]}
        />
      ))}
    </Box>
  );
};

export default React.memo(Page);
