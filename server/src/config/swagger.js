const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Identity Verification System API',
    version: '1.0.0',
    description:
      'REST API for the Identity Verification Management System. Supports role-based access for Maker, Checker, and Admin users.',
    contact: {
      name: 'IDVerify',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['maker', 'checker', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      IdentityRequest: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          makerId: { type: 'string' },
          fullName: { type: 'string' },
          age: { type: 'integer' },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          mobile: { type: 'string' },
          email: { type: 'string', format: 'email' },
          address: { type: 'string' },
          aadhaarFrontUrl: { type: 'string' },
          aadhaarBackUrl: { type: 'string', nullable: true },
          passportUrl: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
          remarks: { type: 'string' },
          verifiedBy: { type: 'string', nullable: true },
          verifiedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuditLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          action: { type: 'string' },
          performedBy: { type: 'string' },
          targetType: { type: 'string' },
          targetId: { type: 'string' },
          details: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user with the Maker role by default.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 2 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful — returns JWT token and user' },
          400: { description: 'Validation error or email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login',
        description: 'Authenticates a user and returns a JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful — returns JWT token and user' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile' },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/identity/create': {
      post: {
        tags: ['Identity (Maker)'],
        summary: 'Create identity verification request',
        security: [{ bearerAuth: [] }],
        description: 'Submit a new identity verification request with document uploads. Requires Maker or Admin role.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['fullName', 'age', 'gender', 'mobile', 'email', 'address', 'aadhaarFront'],
                properties: {
                  fullName: { type: 'string' },
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['male', 'female', 'other'] },
                  mobile: { type: 'string', pattern: '^[0-9]{10}$' },
                  email: { type: 'string', format: 'email' },
                  address: { type: 'string' },
                  aadhaarFront: { type: 'string', format: 'binary' },
                  aadhaarBack: { type: 'string', format: 'binary' },
                  passport: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Request created successfully' },
          400: { description: 'Validation error or missing Aadhaar image' },
          403: { description: 'Unauthorized role' },
        },
      },
    },
    '/identity/my': {
      get: {
        tags: ['Identity (Maker)'],
        summary: 'Get my requests',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'verified', 'rejected'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest'] } },
        ],
        responses: {
          200: { description: 'Paginated list of maker requests' },
        },
      },
    },
    '/identity/{id}': {
      get: {
        tags: ['Identity (Maker)'],
        summary: 'Get request by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Request details' },
          404: { description: 'Request not found' },
        },
      },
    },
    '/checker/pending': {
      get: {
        tags: ['Checker'],
        summary: 'Get requests by status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'verified', 'rejected'], default: 'pending' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest'] } },
        ],
        responses: {
          200: { description: 'Paginated list of requests' },
          403: { description: 'Unauthorized role' },
        },
      },
    },
    '/checker/request/{id}': {
      get: {
        tags: ['Checker'],
        summary: 'Get request for verification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Request details for verification' },
          404: { description: 'Request not found' },
        },
      },
    },
    '/checker/approve/{id}': {
      put: {
        tags: ['Checker'],
        summary: 'Approve a request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  remarks: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request approved' },
          400: { description: 'Request already processed' },
          404: { description: 'Request not found' },
        },
      },
    },
    '/checker/reject/{id}': {
      put: {
        tags: ['Checker'],
        summary: 'Reject a request',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['remarks'],
                properties: {
                  remarks: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request rejected' },
          400: { description: 'Remarks required or request already processed' },
          404: { description: 'Request not found' },
        },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard statistics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard stats and recent activity' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['maker', 'checker', 'admin'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated list of users' },
        },
      },
    },
    '/admin/user': {
      post: {
        tags: ['Admin'],
        summary: 'Create a new user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  role: { type: 'string', enum: ['maker', 'checker', 'admin'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Email already registered' },
        },
      },
    },
    '/admin/user/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Update a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['maker', 'checker', 'admin'] },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated' },
          404: { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User deleted' },
          400: { description: 'Cannot delete self' },
          404: { description: 'User not found' },
        },
      },
    },
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Get audit logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated audit logs' },
        },
      },
    },
    '/admin/requests': {
      get: {
        tags: ['Admin'],
        summary: 'Get all identity requests',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'verified', 'rejected'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest'] } },
        ],
        responses: {
          200: { description: 'Paginated list of all requests' },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
