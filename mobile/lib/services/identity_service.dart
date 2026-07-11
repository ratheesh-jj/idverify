import 'package:dio/dio.dart';
import 'api_service.dart';

/// Identity (Maker) API calls
class IdentityService {
  final _api = ApiService.instance;

  /// Create a new identity request with file uploads
  Future<Map<String, dynamic>> createRequest({
    required String fullName,
    required int age,
    required String gender,
    required String mobile,
    required String email,
    required String address,
    required String aadhaarFrontPath,
    String? aadhaarBackPath,
    String? passportPath,
  }) async {
    final formData = FormData.fromMap({
      'fullName': fullName,
      'age': age,
      'gender': gender,
      'mobile': mobile,
      'email': email,
      'address': address,
      'aadhaarFront': await MultipartFile.fromFile(
        aadhaarFrontPath,
        filename: 'aadhaar_front.jpg',
      ),
      if (aadhaarBackPath != null)
        'aadhaarBack': await MultipartFile.fromFile(
          aadhaarBackPath,
          filename: 'aadhaar_back.jpg',
        ),
      if (passportPath != null)
        'passport': await MultipartFile.fromFile(
          passportPath,
          filename: 'passport.jpg',
        ),
    });

    final response = await _api.postMultipart('/identity/create', formData: formData);
    return response.data;
  }

  /// Get current maker's requests
  Future<Map<String, dynamic>> getMyRequests({
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

    final response = await _api.get('/identity/my', queryParameters: params);
    return response.data;
  }

  /// Get single request by ID
  Future<Map<String, dynamic>> getRequestById(String id) async {
    final response = await _api.get('/identity/$id');
    return response.data;
  }
}
