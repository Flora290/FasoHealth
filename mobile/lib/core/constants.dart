import 'package:flutter/material.dart';

// Configuration globale de l'API FasoHealth
// Modifiez BASE_URL selon votre configuration réseau

class AppConstants {
  // URL du backend FasoHealth
  // Pour les émulateurs Android, remplacez par 10.0.2.2:5000
  // Pour un vrai appareil sur le même réseau Wi-Fi, utilisez l'IP de la machine
  static const String baseUrl = 'https://fasohealth-backend.onrender.com/api';

  // Palette de couleurs enrichie (Ancienne)
  static const int tealPrimary = 0xFF0D9488;
  static const int tealDark = 0xFF134E4A;
  static const int tealLight = 0xFF99F6E4;
  static const int tealBg = 0xFFF0FDFA;
}

class AppDesign {
  // Palette Inspirée de l'image (Nouveau design)
  static const Color primaryBlue = Color(0xFF1E3A8A);
  static const Color accentBlue = Color(0xFF3B82F6);
  static const Color lightBlue = Color(0xFFEFF6FF);
  static const Color bgLight = Color(0xFFF8FAFC);
  
  static const Color textDark = Color(0xFF0F172A);
  static const Color textMedium = Color(0xFF475569);
  static const Color textLight = Color(0xFF94A3B8);
  
  static const Color white = Colors.white;
  static const Color glassWhite = Color(0xCCFFFFFF);
  
  // Design Tokens
  static const double borderRadius = 32.0;
  static const double cardPadding = 20.0;
  
  // Shadows
  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 20,
      offset: const Offset(0, 10),
    ),
  ];
}
