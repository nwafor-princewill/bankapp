import { Router } from 'express';
import auth from '../middleware/auth';
import ServiceRequest from '../models/ServiceRequest';

const router = Router();

// Submit service request
router.post('/', auth, async (req, res) => {
  try {
    const { requestType, details } = req.body;
    
    const request = new ServiceRequest({
      userId: req.user?.id,
      requestType,
      details,
      status: 'open'
    });

    await request.save();
    
    res.status(201).json({
      success: true,
      request,
      message: 'Request submitted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit request'
    });
  }
});

// Get user's requests
router.get('/', auth, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch requests'
    });
  }
});

export default router;