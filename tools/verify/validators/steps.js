/**
 * Step results validator
 *
 * Enforces the bridge between scenario definitions and record evidence:
 * - Every required step must have a matching step_result
 * - A scenario cannot be "pass" if any required step is "fail" or "blocked"
 */

/**
 * Validate step results for a single scenario result.
 *
 * Note: Without access to the source repo's scenario definition, we validate
 * structural integrity. The full required_steps check is done by policy
 * evaluation when scenario definitions are available.
 *
 * @param {object} scenarioResult - A single scenario_results[] item
 * @returns {string[]} Array of error messages (empty if valid)
 */
export function validateStepResults(scenarioResult) {
  const errors = [];
  const { step_results, verdict, scenario_id } = scenarioResult;

  if (!step_results || step_results.length === 0) {
    errors.push('step_results is required and must have at least one entry');
    return errors;
  }

  // Check for duplicate step IDs
  const seenIds = new Set();
  for (const step of step_results) {
    if (seenIds.has(step.step_id)) {
      errors.push(`duplicate step_id: ${step.step_id}`);
    }
    seenIds.add(step.step_id);
  }

  // A scenario cannot be "pass" if any step is "fail" or "blocked"
  if (verdict === 'pass') {
    const failingSteps = step_results.filter(
      s => s.status === 'fail' || s.status === 'blocked'
    );
    if (failingSteps.length > 0) {
      const ids = failingSteps.map(s => s.step_id).join(', ');
      errors.push(
        `scenario verdict is "pass" but steps [${ids}] have status fail/blocked`
      );
    }
  }

  return errors;
}

/**
 * Validate step results against a scenario definition's required_steps.
 * Used when the scenario definition is available (policy evaluation phase).
 *
 * @param {object} scenarioResult - A single scenario_results[] item
 * @param {string[]} requiredSteps - Step IDs from scenario definition's success_criteria.required_steps
 * @returns {string[]} Array of error messages (empty if valid)
 */
export function validateRequiredSteps(scenarioResult, requiredSteps) {
  const errors = [];
  const { step_results, verdict } = scenarioResult;

  if (!step_results) return ['step_results missing'];

  const resultMap = new Map(step_results.map(s => [s.step_id, s]));

  // Every required step must have a matching step_result
  for (const stepId of requiredSteps) {
    const result = resultMap.get(stepId);
    if (!result) {
      errors.push(`required step "${stepId}" has no matching step_result`);
    }
  }

  // A scenario cannot be "pass" if any required step is fail/blocked
  if (verdict === 'pass') {
    for (const stepId of requiredSteps) {
      const result = resultMap.get(stepId);
      if (result && (result.status === 'fail' || result.status === 'blocked')) {
        errors.push(
          `scenario verdict is "pass" but required step "${stepId}" has status "${result.status}"`
        );
      }
    }
  }

  return errors;
}
