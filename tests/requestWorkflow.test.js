import { describe, it, expect } from "vitest";
import {
  REQUEST_STATES,
  canTransition,
  assertValidTransition,
} from "../src/workflows/requestStateMachine";
import { validateStatusUpdate } from "../src/workflows/requestWorkflowValidator";

describe("Request workflow state machine", () => {
  it("allows Pending -> In Progress", () => {
    expect(canTransition(REQUEST_STATES.PENDING, REQUEST_STATES.IN_PROGRESS)).toBe(true);
  });

  it("allows In Progress -> Completed", () => {
    expect(canTransition(REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.COMPLETED)).toBe(true);
  });

  it("rejects Pending -> Completed", () => {
    expect(canTransition(REQUEST_STATES.PENDING, REQUEST_STATES.COMPLETED)).toBe(false);
  });

  it("assertValidTransition throws on invalid edge", () => {
    expect(() =>
      assertValidTransition(REQUEST_STATES.PENDING, REQUEST_STATES.COMPLETED)
    ).toThrow(/Invalid transition/);
  });

  it("validator accepts a valid update", () => {
    expect(
      validateStatusUpdate({
        currentStatus: REQUEST_STATES.PENDING,
        nextStatus: REQUEST_STATES.IN_PROGRESS,
      })
    ).toBe(true);
  });

  it("validator throws on invalid update", () => {
    expect(() =>
      validateStatusUpdate({
        currentStatus: REQUEST_STATES.PENDING,
        nextStatus: REQUEST_STATES.COMPLETED,
      })
    ).toThrow(/Invalid transition/);
  });
});

