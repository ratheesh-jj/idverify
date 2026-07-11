import 'api_service.dart';

/// Checker API calls
class CheckerService {
  final _api = ApiService.instance;

  /// Get requests by status (for checker view)
  Future<Map<String, dynamic>> getRequests({
    int page = 1,
    int limit = 10,
    String status = 'pending',
    String? search,
    String sort = 'newest',
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'status': status,
      'sort': sort,
    };
    if (search != null && search.isNotEmpty) params['search'] = search;

    final response = await _api.get('/checker/pending', queryParameters: params);
    return response.data;
  }

  /// Get single request for verification
  Future<Map<String, dynamic>> getRequest(String id) async {
    final response = await _api.get('/checker/request/$id');
    return response.data;
  }

  /// Approve a request
  Future<Map<String, dynamic>> approve(String id, {String remarks = ''}) async {
    final response = await _api.put('/checker/approve/$id', data: {
      'remarks': remarks,
    });
    return response.data;
  }

  /// Reject a request
  Future<Map<String, dynamic>> reject(String id, {required String remarks}) async {
    final response = await _api.put('/checker/reject/$id', data: {
      'remarks': remarks,
    });
    return response.data;
  }
}
