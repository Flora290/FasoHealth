import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

class LocaleService {
  static bool _initialized = false;
  
  static Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      // Initialiser avec la locale française pour le Burkina Faso
      // Dans intl 0.20+, initializeDateFormatting n'est plus nécessaire
      Intl.defaultLocale = 'fr_FR';
      _initialized = true;
      print('✅ Locale initialized successfully');
    } catch (e) {
      print('❌ Error initializing locale: $e');
      // Fallback vers l'anglais si le français échoue
      try {
        Intl.defaultLocale = 'en_US';
        _initialized = true;
        print('✅ Fallback to English locale');
      } catch (e2) {
        print('❌ Critical: Cannot initialize any locale');
      }
    }
  }
  
  static bool get isInitialized => _initialized;
}
