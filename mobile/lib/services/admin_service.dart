import 'api_service.dart';

/// Admin API calls
class AdminService {
  final _api = ApiService.instance;

  /// Get dashboard statistics
  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _api.get('/admin/dashboard');
    return response.data;
  }

  /// Get all users
  Future<Map<String, dynamic>> getUsers({
    int page = 1,
    int limit = 10,
    String? role,
    String? search,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (role != null) params['role'] = role;
    if (search != null && search.isNotEmpty) params['search'] = search;

    final response = await _api.get('/admin/users', queryParameters: params);
    return response.data;
  }

  /// Create a new user
  Future<Map<String, dynamic>> createUser({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await _api.post('/admin/user', data: {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    });
    return response.data;
  }

  /// Update a user
  Future<Map<String, dynamic>> updateUser(
    String id, {
    String? name,
    String? email,
    String? role,
    String? password,
  }) async {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (email != null) data['email'] = email;
    if (role != null) data['role'] = role;
    if (password != null) data['password'] = password;

    final response = await _api.put('/admin/user/$id', data: data);
    return response.data;
  }

  /// Delete a user
  Future<Map<String, dynamic>> deleteUser(String id) async {
    final response = await _api.delete('/admin/user/$id');
    return response.data;
  }

  /// Get audit logs
  Future<Map<String, dynamic>> getAuditLogs({
    int page = 1,
    int limit = 20,
    String? action,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (action != null) params['action'] = action;

    final response = await _api.get('/admin/audit-logs', queryParameters: params);
    return response.data;
  }

  /// Get all requests (admin view)
  Future<Map<String, dynamic>> getRequests({
    int page = 1,
    int limit = 10,
    String? status,
    String? search,
    String sort = 'newest',
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'sort': sort,
    };
    if (status != null) params['status'] = status;
    if (search != null && search.isNotEmpty) params['search'] = search;

    final response = await _api.get('/admin/requests', queryParameters: params);
    return response.data;
  }
}
