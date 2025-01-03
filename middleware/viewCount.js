const Form = require('../model/formModel');

const updateViewCount = async (req, res, next) => {
  if (req.viewCountUpdated) {
    console.log("View count already updated for this request.");
    return next();
  }

  const { uniqueUrl } = req.params;

  console.log('updateViewCount middleware called for:', uniqueUrl);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);

  try {
    const form = await Form.findOne({ uniqueUrl });

    if (form) {
      form.views += 1;
      await form.save();
      console.log(`Form views updated to: ${form.views}`);
      req.viewCountUpdated = true; // Set the flag
    }

    next();
  } catch (error) {
    console.error('Error updating view count', error);
    next(error);
  }
};

module.exports = updateViewCount;