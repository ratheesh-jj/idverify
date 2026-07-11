import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import 'dart:convert';

/// Handles JWT and user data persistence using SharedPreferences
class StorageService {
  static StorageService? _instance;
  static SharedPreferences? _prefs;

  StorageService._();

  static Future<StorageService> getInstance() async {
    _instance ??= StorageService._();
    _prefs ??= await SharedPreferences.getInstance();
    return _instance!;
  }

  // Token
  Future<void> saveToken(String token) async {
    await _prefs!.setString(tokenKey, token);
  }

  String? getToken() {
    return _prefs!.getString(tokenKey);
  }

  Future<void> removeToken() async {
    await _prefs!.remove(tokenKey);
  }

  // User
  Future<void> saveUser(Map<String, dynamic> user) async {
    await _prefs!.setString(userKey, jsonEncode(user));
  }

  Map<String, dynamic>? getUser() {
    final data = _prefs!.getString(userKey);
    if (data == null) return null;
    return jsonDecode(data);
  }

  Future<void> removeUser() async {
    await _prefs!.remove(userKey);
  }

  // Dark mode
  Future<void> saveDarkMode(bool value) async {
    await _prefs!.setBool(darkModeKey, value);
  }

  bool getDarkMode() {
    return _prefs!.getBool(darkModeKey) ?? false;
  }

  // Clear all
  Future<void> clearAll() async {
    await _prefs!.remove(tokenKey);
    await _prefs!.remove(userKey);
  }
}
