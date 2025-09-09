import express from 'express';

const router = express.Router();

// Mock data for study partners
const mockPartners = [
  {
    id: 'user1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    modules: ['COMS3011', 'COMS3028', 'MATH2001'],
    year: 3,
    major: 'Computer Science',
    studyPreferences: ['group', 'online', 'library'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    rating: 4.8,
    totalStudyHours: 120
  },
  {
    id: 'user2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    modules: ['COMS3011', 'COMS3029'],
    year: 2,
    major: 'Software Engineering',
    studyPreferences: ['group', 'cafe'],
    availability: ['Tuesday', 'Thursday'],
    rating: 4.5,
    totalStudyHours: 85
  },
  {
    id: 'user3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    modules: ['MATH2001', 'COMS3028'],
    year: 3,
    major: 'Computer Science',
    studyPreferences: ['individual', 'library'],
    availability: ['Monday', 'Wednesday', 'Saturday'],
    rating: 4.9,
    totalStudyHours: 150
  }
];

/**
 * @route   GET /api/partners
 * @desc    Search for study partners
 * @access  Private
 */
router.get('/', (req, res) => {
  try {
    const { module, notModule, modules, modulesAll, page = 1, limit = 10 } = req.query;

    let filteredPartners = mockPartners.filter(partner => partner.id !== req.user.uid);

    // Filter by module
    if (module) {
      const moduleList = module.split(',').map(m => m.trim().toUpperCase());
      filteredPartners = filteredPartners.filter(partner =>
        partner.modules.some(m => moduleList.includes(m))
      );
    }

    // Anti-search: exclude users with specific modules
    if (notModule) {
      const excludeModules = notModule.split(',').map(m => m.trim().toUpperCase());
      filteredPartners = filteredPartners.filter(partner =>
        !partner.modules.some(m => excludeModules.includes(m))
      );
    }

    // Filter by multiple modules (any match)
    if (modules) {
      const moduleList = modules.split(',').map(m => m.trim().toUpperCase());
      filteredPartners = filteredPartners.filter(partner =>
        partner.modules.some(m => moduleList.includes(m))
      );
    }

    // Filter by multiple modules (all must match)
    if (modulesAll) {
      const moduleList = modulesAll.split(',').map(m => m.trim().toUpperCase());
      filteredPartners = filteredPartners.filter(partner =>
        moduleList.every(m => partner.modules.includes(m))
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        results: paginatedPartners,
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredPartners.length,
        totalPages: Math.ceil(filteredPartners.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching partners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search study partners',
      message: error.message
    });
  }
});

export default router;
