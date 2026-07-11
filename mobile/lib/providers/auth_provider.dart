import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

/// Manages authentication state with auto-login support
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  StorageService? _storage;

  User? _user;
  bool _loading = true;
  String? _error;

  User? get user => _user;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;
  String? get error => _error;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    _storage = await StorageService.getInstance();
    final userData = _storage!.getUser();
    final token = _storage!.getToken();
    if (userData != null && token != null) {
      _user = User.fromJson(userData);
    }
    _loading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _error = null;
    _loading = true;
    notifyListeners();

    try {
      final data = await _authService.login(email: email, password: password);
      await _storage!.saveToken(data['token']);
      await _storage!.saveUser(data['user']);
      _user = User.fromJson(data['user']);
      _loading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        _error = e.response?.data['message']?.toString() ?? 'Login failed';
      } else if (e.response?.data is String) {
        _error = e.response?.data as String;
      } else {
        _error = e.message ?? 'Login failed';
      }
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _error = null;
    _loading = true;
    notifyListeners();

    try {
      final data = await _authService.register(
        name: name,
        email: email,
        password: password,
      );
      await _storage!.saveToken(data['token']);
      await _storage!.saveUser(data['user']);
      _user = User.fromJson(data['user']);
      _loading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        _error = e.response?.data['message']?.toString() ?? 'Registration failed';
      } else if (e.response?.data is String) {
        _error = e.response?.data as String;
      } else {
        _error = e.message ?? 'Registration failed';
      }
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _storage?.clearAll();
    _user = null;
    _error = null;
    notifyListeners();
  }
}
