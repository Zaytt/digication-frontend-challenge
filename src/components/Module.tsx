import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDrag, useDragDropManager } from 'react-dnd';
import { useRafLoop } from 'react-use';

import ModuleInterface from '../types/ModuleInterface';
import {
  moduleColW2LocalW,
  moduleColX2LocalX,
  moduleY2LocalY,
  localX2ModuleColX,
  localY2ModuleY,
} from '../helpers.ts';
import { CONTAINER_WIDTH, GUTTER_SIZE } from '../constants';

type ModuleProps = {
  data: ModuleInterface;
  updateModules: (updatedModule: ModuleInterface) => void;
  colissionCheck: (targetModule: ModuleInterface) => boolean;
  color: string;
};

const Module = (props: ModuleProps) => {
  const {
    data: {
      id,
      coord: { x, y, w, h },
    },
    updateModules,
    colissionCheck,
    color,
  } = props;

  // Transform x, y to left, top
  const [{ top, left }, setPosition] = React.useState(() => ({
    top: moduleY2LocalY(y),
    left: moduleColX2LocalX(x),
  }));

  // Update the local position based of the module's data
  useEffect(() => {
    setPosition({
      top: moduleY2LocalY(y),
      left: moduleColX2LocalX(x),
    });
  }, [x, y]);

  const dndManager = useDragDropManager();
  const initialPosition = React.useRef<{ top: number; left: number }>();

  // Use request animation frame to process dragging
  const [stop, start] = useRafLoop(() => {
    const movement = dndManager.getMonitor().getDifferenceFromInitialOffset();

    if (!initialPosition.current || !movement) {
      return;
    }

    // Updated pos after drag
    const updatedX: number = initialPosition.current.left + movement.x;
    const updatedY: number = initialPosition.current.top + movement.y;

    // Prevent movement outside grid
    const padding: number = moduleColW2LocalW(w) + GUTTER_SIZE;
    const boundedX = Math.min(
      Math.max(updatedX, GUTTER_SIZE),
      CONTAINER_WIDTH - padding
    );
    const boundedY = Math.max(updatedY, GUTTER_SIZE);

    // Update modules, instead of local position
    // Better UX, The grid height expansion reacts faster to module drag
    const currentModule = props.data;
    const updatedModule = {
      ...currentModule,
      coord: {
        ...currentModule.coord,
        x: localX2ModuleColX(boundedX),
        y: localY2ModuleY(boundedY),
      },
    };
    // updateModules(updatedModule);
    if (!colissionCheck(updatedModule)) {
      updateModules(updatedModule);
    }
  }, false);

  // Wire the module to DnD drag system
  const [, drag] = useDrag(
    () => ({
      type: 'module',
      item: () => {
        // Track the initial position at the beginning of the drag operation
        initialPosition.current = { top, left };

        // Start raf
        start();
        return { id };
      },
      end: stop,
    }),
    [top, left]
  );

  return (
    <Box
      ref={drag}
      display="flex"
      position="absolute"
      border={1}
      borderColor="grey.500"
      padding="10px"
      bgcolor={color}
      top={top}
      left={left}
      width={moduleColW2LocalW(w)}
      height={h}
      sx={{
        transitionProperty: 'top, left',
        transitionDuration: '0.1s',
        '& .resizer': {
          opacity: 0,
        },
        '&:hover .resizer': {
          opacity: 1,
        },
      }}
    >
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={40}
        color="#222"
        sx={{ cursor: 'move' }}
        draggable
      >
        <Box sx={{ userSelect: 'none', pointerEvents: 'none' }}>{id}</Box>
      </Box>
    </Box>
  );
};

export default React.memo(Module);
