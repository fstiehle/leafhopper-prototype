import Step from "./Step";

export default interface StepJSONPayload {
  step: Step
  prevSteps: Step[]
}