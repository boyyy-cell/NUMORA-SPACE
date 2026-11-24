/**
 * NUMORA Space — Researcher Login & Frontend Integration Verification
 */
import assert from 'assert';
import { apiService } from '../frontend/src/services/api.js';

console.log('--- Starting Researcher Frontend Integration Test ---');

// 1. Verify apiService methods
assert.strictEqual(typeof apiService.loginResearcher, 'function', 'loginResearcher must be defined in apiService');
assert.strictEqual(typeof apiService.getPublicUsersSummary, 'function', 'getPublicUsersSummary must be defined in apiService');
assert.strictEqual(typeof apiService.getUserDossier, 'function', 'getUserDossier must be defined in apiService');
assert.strictEqual(typeof apiService.getAllActivities, 'function', 'getAllActivities must be defined in apiService');
assert.strictEqual(typeof apiService.exportResearchJson, 'function', 'exportResearchJson must be defined in apiService');
assert.strictEqual(typeof apiService.exportResearchCsv, 'function', 'exportResearchCsv must be defined in apiService');
assert.strictEqual(typeof apiService.deleteMyData, 'function', 'deleteMyData must be defined in apiService');

console.log('✓ Test 1: All research & privacy API helper methods verified.');

console.log('--- ALL RESEARCH FRONTEND TESTS PASSED ---');
