import { describe, expect, it } from "vitest";
import { circuitCurrent, springExtension } from "../src/components/lab/AdditionalLabSimulations";
import { gradeLabQuiz, labExperiments } from "../src/data/labExperiments";
describe("guided lab science", () => {
  it("calculates 6 V / 100 ohms as 0.06 A", () => expect(circuitCurrent(6, 100)).toBe(0.06));
  it("calculates a 100 g load on 50 N/m spring", () => expect(springExtension(0.1, 50)).toBeCloseTo(0.0196));
  it("passes three of four answers", () => {
    const lab = labExperiments[0];
    expect(gradeLabQuiz(lab, lab.quiz.map((q, i) => i < 3 ? q.correctIndex : undefined)).passed).toBe(true);
    expect(gradeLabQuiz(lab, lab.quiz.map((q, i) => i < 2 ? q.correctIndex : undefined)).passed).toBe(false);
  });
});