import 'package:flutter/material.dart';
import '../services/storage_service.dart';

/// Manages dark/light theme toggle with persistence
class ThemeProvider extends ChangeNotifier {
  StorageService? _storage;
  bool _isDarkMode = false;

  bool get isDarkMode => _isDarkMode;
  ThemeMode get themeMode => _isDarkMode ? ThemeMode.dark : ThemeMode.light;

  ThemeProvider() {
    _init();
  }

  Future<void> _init() async {
    _storage = await StorageService.getInstance();
    _isDarkMode = _storage!.getDarkMode();
    notifyListeners();
  }

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _storage?.saveDarkMode(_isDarkMode);
    notifyListeners();
  }
}
