/**
 * Schema validator — validates submissions against dogfood-record-submission.schema.json
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = resolve(__dirname, '../../../schemas');

let _validator = null;

function getValidator() {
  if (_validator) return _validator;

  try {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);

    const schemaPath = resolve(SCHEMA_DIR, 'dogfood-record-submission.schema.json');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

    _validator = ajv.compile(schema);
    return _validator;
  } catch (e) {
    return { __loadError: 'Schema loading failed: ' + e.message };
  }
}

/**
 * Validate a submission payload against the submission JSON Schema.
 *
 * @param {object} submission
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSubmissionSchema(submission) {
  const validate = getValidator();
  if (validate.__loadError) {
    return { valid: false, errors: [validate.__loadError] };
  }
  const valid = validate(submission);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map(err => {
    const path = err.instancePath || '/';
    return `${path} ${err.message}`;
  });

  return { valid: false, errors };
}
