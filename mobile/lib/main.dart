import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'providers/auth_provider.dart';
import 'services/locale_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/patient/patient_home_screen.dart';
import 'screens/doctor/doctor_home_screen.dart';
import 'screens/admin/admin_home_screen.dart';
import 'screens/onboarding/welcome_screen.dart';
import 'screens/patient/prescriptions_screen.dart';
import 'screens/patient/triage_screen.dart';
import 'screens/shared/conversations_screen.dart';
import 'screens/patient/hospitals_list_screen.dart';
import 'screens/admin/sms_management_screen.dart';
import 'screens/shared/emergency_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser la locale AVANT tout le reste
  await LocaleService.initialize();
  
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const FasoHealthApp(),
    ),
  );
}

class FasoHealthApp extends StatelessWidget {
  const FasoHealthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FasoHealth',
      debugShowCheckedModeBanner: false,
      
      // Configuration locale robuste
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      
      supportedLocales: const [
        Locale('en', 'US'), // English (priority)
        Locale('fr', 'FR'), // French
      ],
      
      locale: const Locale('en', 'US'),
      
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0D9488)),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0D9488),
            foregroundColor: Colors.white,
          ),
        ),
      ),
      routes: {
        '/': (_) => const AuthGuard(),
        '/welcome': (_) => const WelcomeScreen(),
        '/login': (_) => const LoginScreen(),
        '/patient': (_) => const PatientHomeScreen(),
        '/doctor': (_) => const DoctorHomeScreen(),
        '/admin': (_) => const AdminHomeScreen(),
        '/prescriptions': (_) => const PrescriptionsScreen(),
        '/triage': (_) => const TriageScreen(),
        '/conversations': (_) => const ConversationsScreen(),
        '/hospitals': (_) => const HospitalsListScreen(),
        '/sms': (_) => const SMSManagementScreen(),
        '/emergency': (_) => EmergencyScreen(),
      },
    );
  }
}

/// Checks stored auth state and routes accordingly
class AuthGuard extends StatefulWidget {
  const AuthGuard({super.key});

  @override
  State<AuthGuard> createState() => _AuthGuardState();
}

class _AuthGuardState extends State<AuthGuard> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await context.read<AuthProvider>().init();
    setState(() => _initialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 60, height: 60,
                child: CircularProgressIndicator(
                  color: Color(0xFF0D9488),
                  strokeWidth: 3,
                ),
              ),
              SizedBox(height: 16),
              Text('FasoHealth', style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold,
                color: Color(0xFF0D9488),
              )),
            ],
          ),
        ),
      );
    }

    final auth = context.watch<AuthProvider>();
    if (!auth.isAuthenticated) return const WelcomeScreen();

    final role = auth.user!.role;
    if (role == 'doctor') return const DoctorHomeScreen();
    if (role == 'admin') return const AdminHomeScreen();
    return const PatientHomeScreen(); // patient + admin defaulted to patient view
  }
}
