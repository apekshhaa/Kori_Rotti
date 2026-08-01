const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluateReferralDecision, matchResourceToItem, sanitizeReferralPayload } = require('../src/services/hospitalCoordinator');

test('acknowledges when checklist is fully complete before deadline', async () => {
  const referral = {
    id: 'ref-1',
    hospitalId: 'dist-hospital-1',
    referralStatus: 'sent',
    acknowledgementDeadline: Date.now() + 10 * 60 * 1000,
    checklistItems: ['ICU bed', 'Oxygen', 'Blood'],
    completedChecklist: ['ICU bed', 'Oxygen', 'Blood'],
  };

  const result = await evaluateReferralDecision(referral);

  assert.equal(result.decision, 'acknowledge');
  assert.equal(result.status, 'ready');
});

test('reroutes when the deadline passes without complete readiness', async () => {
  const referral = {
    id: 'ref-2',
    hospitalId: 'dist-hospital-1',
    referralStatus: 'sent',
    acknowledgementDeadline: Date.now() - 60 * 1000,
    checklistItems: ['ICU bed', 'Oxygen', 'Blood'],
    completedChecklist: ['ICU bed'],
  };

  const result = await evaluateReferralDecision(referral);

  assert.equal(result.decision, 'reroute');
  assert.ok(result.newHospital);
  assert.match(result.reason, /timeout/i);
});

test('marks emergency doctor items as available when doctor availability is reported at the hospital level', () => {
  const hospital = {
    resources: {
      icuBeds: 2,
    },
    doctorAvailable: true,
  };

  assert.equal(matchResourceToItem('Emergency Doctor Assigned', hospital), true);
});

test('drops undefined fields before Firestore writes', () => {
  const payload = sanitizeReferralPayload({
    referralStatus: 'sent',
    hospitalId: 'dist-hospital-1',
    reroutedToHospitalName: undefined,
    aiReason: 'test',
  });

  assert.deepEqual(payload, {
    referralStatus: 'sent',
    hospitalId: 'dist-hospital-1',
    aiReason: 'test',
  });
});
