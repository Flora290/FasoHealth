# 🐛 ERREUR LOCALE DATA - SOLUTION FLUTTER

## ❌ **ERREUR CONSTATÉE**
```
LocaleDataException: Locale data has not been initialized, call initializeDateFormatting(<locale>)
```

Cette erreur se produit lorsque votre application Flutter essaie d'utiliser des fonctions de formatage de dates/nombres sans avoir initialisé les données de locale.

## 🔧 **SOLUTION COMPLÈTE**

### 1. **Ajouter les dépendances**

Dans `pubspec.yaml` :
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.0
```

### 2. **Configurer les localisations**

Dans `main.dart` :
```dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialiser la locale par défaut
  Intl.defaultLocale = 'fr_FR';
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FasoHealth',
      
      // Configuration des localisations
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      
      supportedLocales: [
        const Locale('fr', 'FR'), // Français (Burkina Faso)
        const Locale('en', 'US'), // Anglais
      ],
      
      locale: const Locale('fr', 'FR'),
      
      home: LoginPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
```

### 3. **Initialiser dans la page de connexion**

Dans votre page de connexion :
```dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:convert';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // S'assurer que la locale est initialisée
    initializeDateFormatting('fr_FR', null).then((_) {
      setState(() {});
    });
  }

  Future<void> _login() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Veuillez remplir tous les champs')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://192.168.1.100:5000/api/auth/login'), // IP de votre PC
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': _emailController.text,
          'password': _passwordController.text,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        // Sauvegarder le token et rediriger
        await _saveUserData(data);
        _navigateToDashboard(data['role']);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? 'Erreur de connexion')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur réseau: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveUserData(dynamic data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', data['token']);
    await prefs.setString('user', json.encode(data));
  }

  void _navigateToDashboard(String role) {
    switch (role) {
      case 'doctor':
        Navigator.pushReplacementNamed(context, '/doctor/dashboard');
        break;
      case 'patient':
        Navigator.pushReplacementNamed(context, '/patient/dashboard');
        break;
      case 'admin':
        Navigator.pushReplacementNamed(context, '/admin/dashboard');
        break;
      default:
        Navigator.pushReplacementNamed(context, '/patient/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.teal,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    'FH',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              
              SizedBox(height: 32),
              
              Text(
                'FasoHealth',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal[800],
                ),
              ),
              
              SizedBox(height: 8),
              
              Text(
                'Connexion Médecin',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              
              SizedBox(height: 48),
              
              // Champ email
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              
              SizedBox(height: 16),
              
              // Champ mot de passe
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Mot de passe',
                  prefixIcon: Icon(Icons.lock),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                obscureText: true,
              ),
              
              SizedBox(height: 24),
              
              // Bouton de connexion
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    padding: EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text(
                          'Se connecter',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 4. **Vérifier la connexion backend**

Assurez-vous que votre backend SmartCare est démarré :
```bash
cd backend
npm run dev
```

### 5. **URL de l'API**

Remplacez `http://192.168.1.100:5000` par l'IP de votre PC où tourne le backend SmartCare.

## 🔍 **IDENTIFIANTS DE TEST MÉDECIN**

Utilisez ces identifiants pour tester :
- **Email** : dr.traore@smartcare.bf
- **Mot de passe** : doctor123

## 🚀 **ÉTAPES SUIVANTES**

1. Ajoutez les dépendances dans `pubspec.yaml`
2. Configurez les localisations dans `main.dart`
3. Initialisez la locale dans votre page de connexion
4. Testez avec les identifiants médecin ci-dessus
5. Vérifiez que le backend est accessible depuis votre mobile

**Cette solution corrigera définitivement l'erreur LocaleDataException !** ✨
