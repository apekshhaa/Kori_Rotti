function getPublicAppUrl() {
  return (process.env.PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
}

function generateCaregiverUrl(patientToken) {
  const baseUrl = getPublicAppUrl();
  if (!baseUrl) {
    return '';
  }

  return `${baseUrl}/caregiver/${encodeURIComponent(patientToken)}`;
}

module.exports = {
  getPublicAppUrl,
  generateCaregiverUrl,
};
