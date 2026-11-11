import { REQUEST_STATES, assertValidTransition } from "./requestStateMachine";

// Service-oriented workflow validation entrypoint.
// This module can be used by future API endpoints to ensure that
// request status transitions follow the state machine.

export function validateStatusUpdate({ currentStatus, nextStatus }) {
  if (!currentStatus || !nextStatus) {
    throw new Error("currentStatus and nextStatus are required");
  }

  // Ensure nextStatus is a known state
  const allStates = Object.values(REQUEST_STATES);
  if (!allStates.includes(nextStatus)) {
    throw new Error(`Unknown nextStatus: ${nextStatus}`);
  }

  assertValidTransition(currentStatus, nextStatus);
  return true;
}

