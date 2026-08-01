const { getHospitalById, listHospitals } = require('../services/hospitalService');

const getHospital = async (req, res) => {
  try {
    const id = req.params.id;
    const hospital = await getHospitalById(id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    return res.json(hospital);
  } catch (error) {
    console.error('Get hospital error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch hospital' });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await listHospitals();
    return res.json({ hospitals });
  } catch (error) {
    console.error('List hospitals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list hospitals' });
  }
};

module.exports = { getHospital, getAllHospitals };
