// Request lifecycle finite state machine definition
// Used for graph/state-machine based workflow validation.

export const REQUEST_STATES = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

// Allowed transitions: edge list
export const REQUEST_TRANSITIONS = [
  { from: REQUEST_STATES.PENDING, to: REQUEST_STATES.IN_PROGRESS },
  { from: REQUEST_STATES.IN_PROGRESS, to: REQUEST_STATES.COMPLETED },

  // Optional: allow reverts (uncomment if business rules permit)
  // { from: REQUEST_STATES.IN_PROGRESS, to: REQUEST_STATES.PENDING },
];

export function canTransition(from, to) {
  return REQUEST_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

export function assertValidTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
}

