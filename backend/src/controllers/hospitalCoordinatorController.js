const { monitorReferral } = require('../services/hospitalCoordinator');

const runCoordinator = async (req, res) => {
  try {
    const referral = req.body;
    const result = await monitorReferral(referral);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('Coordinator error:', error);
    return res.status(500).json({ success: false, message: 'Coordinator failed' });
  }
};

module.exports = { runCoordinator };