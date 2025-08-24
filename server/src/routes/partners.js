import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validatePartnersQuery } from '../middleware/validation.js';
import { searchPartners, getSearchSummary } from '../utils/search.js';

const router = express.Router();

// Mock data for study partners
const mockPartners = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    modules: ['COMS3011', 'MATH2001', 'PHYS1001'],
    studyPreferences: ['Group study', 'Online', 'Library'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    rating: 4.8,
    totalStudySessions: 15
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@student.edu',
    modules: ['COMS3011', 'COMS2001', 'STAT1001'],
    studyPreferences: ['One-on-one', 'Cafe', 'Study rooms'],
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    rating: 4.6,
    totalStudySessions: 12
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@student.edu',
    modules: ['COMS3011', 'MATH2001', 'CHEM1001'],
    studyPreferences: ['Group study', 'Quiet environment', 'Online'],
    availability: ['Monday', 'Tuesday', 'Thursday'],
    rating: 4.9,
    totalStudySessions: 20
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@student.edu',
    modules: ['COMS3011', 'PHYS1001', 'ENG1001'],
    studyPreferences: ['Study groups', 'Library', 'Evening sessions'],
    availability: ['Wednesday', 'Friday', 'Sunday'],
    rating: 4.7,
    totalStudySessions: 18
  },
  {
    id: '5',
    name: 'Eve Brown',
    email: 'eve.brown@student.edu',
    modules: ['MATH2001', 'STAT1001', 'COMS2001'],
    studyPreferences: ['Online study', 'Weekend sessions', 'Quiet environment'],
    availability: ['Saturday', 'Sunday'],
    rating: 4.5,
    totalStudySessions: 10
  },
  {
    id: '6',
    name: 'Frank Miller',
    email: 'frank.miller@student.edu',
    modules: ['PHYS1001', 'CHEM1001', 'MATH2001'],
    studyPreferences: ['Lab work', 'Practical sessions', 'Group projects'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    rating: 4.3,
    totalStudySessions: 8
  }
];

/**
 * @route   GET /api/partners
 * @desc    Get study partners with advanced filtering and pagination
 * @access  Private
 *
 * Query Parameters:
 * - module: Single module filter (e.g., ?module=COMS3011)
 * - notModule: Anti-search - exclude partners taking this module (e.g., ?notModule=COMS3011)
 * - modules: Multiple modules, any match (e.g., ?modules=COMS3011,MATH2001)
 * - modulesAll: Multiple modules, must match all (e.g., ?modulesAll=COMS3011,MATH2001)
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 */
router.get('/', verifyToken, validatePartnersQuery, (req, res) => {
  try {
    const filters = req.query;

    // Use the search utility to filter and paginate
    const searchResult = searchPartners(mockPartners, filters);

    // Get search summary for debugging/logging
    const searchSummary = getSearchSummary(filters, searchResult.pagination);

    res.json({
      success: true,
      data: searchResult.results,
      pagination: searchResult.pagination,
      searchSummary,
      message: `Found ${searchResult.results.length} partners matching criteria`
    });
  } catch (error) {
    console.error('Error searching partners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search partners',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/partners/:id
 * @desc    Get a specific study partner by ID
 * @access  Private
 */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const partner = mockPartners.find(p => p.id === id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partner',
      message: error.message
    });
  }
});

export default router;
