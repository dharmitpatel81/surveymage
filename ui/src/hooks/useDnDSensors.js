import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';

const DEFAULT_ACTIVATION_DISTANCE = 8;

/**
 * Shared DnD sensors for sortable lists (questions, widgets)
 * @param {number} [activationDistance=8] - Pixels before drag activates
 * @returns {object} DnD sensors
 */
export function useDnDSensors(activationDistance = DEFAULT_ACTIVATION_DISTANCE) {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: activationDistance },
    })
  );
}
