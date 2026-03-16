import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../providers/auth_provider.dart';
import '../../core/constants.dart';
import '../../services/locale_service.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  bool _obscurePassword = true;
  bool _localeInitialized = false;
  bool _showOtp = false;
  bool _rememberMe = false;

  @override
  void initState() {
    super.initState();
    _initializeAsync();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final savedEmail = prefs.getString('remembered_email');
    final savedPassword = prefs.getString('remembered_password');
    final rememberMe = prefs.getBool('remember_me') ?? false;

    if (mounted && rememberMe) {
      setState(() {
        _rememberMe = true;
        if (savedEmail != null) _emailController.text = savedEmail;
        if (savedPassword != null) _passwordController.text = savedPassword;
      });
    }
  }

  Future<void> _handleSavedCredentialsResponse(bool success) async {
    if (!success) return;
    
    final prefs = await SharedPreferences.getInstance();
    if (_rememberMe) {
      await prefs.setString('remembered_email', _emailController.text.trim());
      await prefs.setString('remembered_password', _passwordController.text);
      await prefs.setBool('remember_me', true);
    } else {
      await prefs.remove('remembered_email');
      await prefs.remove('remembered_password');
      await prefs.setBool('remember_me', false);
    }
  }

  Future<void> _initializeAsync() async {
    // S'assurer que la locale est initialisée
    if (!LocaleService.isInitialized) {
      await LocaleService.initialize();
    }
    
    if (mounted) {
      setState(() {
        _localeInitialized = true;
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final auth = context.read<AuthProvider>();
    final result = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    
    if (result['otpRequired'] == true) {
      setState(() => _showOtp = true);
      return;
    }

    if (result['success'] == true && mounted) {
      await _handleSavedCredentialsResponse(true);
      final role = auth.user!.role;
      if (role == 'doctor') {
        Navigator.pushReplacementNamed(context, '/doctor');
      } else if (role == 'admin') {
        Navigator.pushReplacementNamed(context, '/admin');
      } else {
        Navigator.pushReplacementNamed(context, '/patient');
      }
    }
  }

  Future<void> _verifyOtp() async {
    final auth = context.read<AuthProvider>();
    final success = await auth.verifyOTP(
      _emailController.text.trim(),
      _otpController.text.trim(),
    );

    if (success && mounted) {
      await _handleSavedCredentialsResponse(true);
      final role = auth.user!.role;
      if (role == 'doctor') {
        Navigator.pushReplacementNamed(context, '/doctor');
      } else if (role == 'admin') {
        Navigator.pushReplacementNamed(context, '/admin');
      } else {
        Navigator.pushReplacementNamed(context, '/patient');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    // Attendre l'initialisation de la locale
    if (!_localeInitialized) {
      return Scaffold(
        backgroundColor: const Color(AppConstants.tealBg),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 60, height: 60,
                decoration: BoxDecoration(
                  color: const Color(AppConstants.tealPrimary),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.local_hospital, size: 32, color: Colors.white),
              ),
              const SizedBox(height: 16),
              const Text('FasoHealth', style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold,
                color: Color(AppConstants.tealDark),
              )),
              const SizedBox(height: 8),
              const CircularProgressIndicator(color: Color(AppConstants.tealPrimary), strokeWidth: 2),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(AppConstants.tealBg),
      body: Stack(
        children: [
          // Background blobs decoratifs
          Positioned(
            top: -80, left: -60,
            child: Container(
              width: 260, height: 260,
              decoration: BoxDecoration(
                color: const Color(AppConstants.tealLight).withOpacity(0.5),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -120, right: -80,
            child: Container(
              width: 350, height: 350,
              decoration: BoxDecoration(
                color: const Color(AppConstants.tealPrimary).withOpacity(0.25),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          Positioned(
            top: 40,
            left: 16,
            child: Material(
              color: Colors.white.withOpacity(0.5),
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => Navigator.pushReplacementNamed(context, '/welcome'),
                child: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.arrow_back_ios_new, size: 20, color: Color(AppConstants.tealDark)),
                ),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  children: [
                    // Logo
                    Container(
                      width: 100, height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [BoxShadow(
                          color: const Color(AppConstants.tealPrimary).withOpacity(0.3),
                          blurRadius: 20, offset: const Offset(0, 8),
                        )],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Image.asset('assets/images/logo.png', fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: const Color(AppConstants.tealPrimary),
                            child: const Icon(Icons.local_hospital, size: 48, color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('FasoHealth', style: TextStyle(
                      fontSize: 28, fontWeight: FontWeight.w900,
                      color: Color(AppConstants.tealDark),
                    )),
                    const SizedBox(height: 6),
                    const Text('Your health, our priority', style: TextStyle(
                      fontSize: 14, color: Colors.grey,
                    )),
                    const SizedBox(height: 36),

                    // Card de connexion
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white, width: 1.5),
                        boxShadow: [BoxShadow(
                          color: const Color(AppConstants.tealPrimary).withOpacity(0.1),
                          blurRadius: 30, offset: const Offset(0, 10),
                        )],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_showOtp ? 'Verification' : 'Sign In', style: const TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold,
                            color: Color(AppConstants.tealDark),
                          )),
                          const SizedBox(height: 20),

                          // Error message
                          if (auth.error != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(children: [
                                const Icon(Icons.error_outline, color: Colors.red, size: 18),
                                const SizedBox(width: 8),
                                Expanded(child: Text(auth.error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                              ]),
                            ),

                          if (!_showOtp) ...[
                            _buildLabel('Email Address'),
                            const SizedBox(height: 8),
                            _buildInput(
                              controller: _emailController,
                              hint: 'your@email.com',
                              icon: Icons.email_outlined,
                            ),
                            const SizedBox(height: 16),

                            _buildLabel('Password'),
                            const SizedBox(height: 8),
                            _buildInput(
                              controller: _passwordController,
                              hint: '••••••••',
                              icon: Icons.lock_outline,
                              obscure: _obscurePassword,
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility,
                                  color: Colors.grey, size: 20),
                                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                            const SizedBox(height: 12),
                            
                            // Remember Me
                            Row(
                              children: [
                                SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: Checkbox(
                                    value: _rememberMe,
                                    activeColor: const Color(AppConstants.tealPrimary),
                                    onChanged: (val) => setState(() => _rememberMe = val ?? false),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () => setState(() => _rememberMe = !_rememberMe),
                                  child: const Text('Remember me', style: TextStyle(
                                    fontSize: 14, color: Color(AppConstants.tealDark),
                                    fontWeight: FontWeight.w500,
                                  )),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: auth.isLoading ? null : _login,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(AppConstants.tealPrimary),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  elevation: 4,
                                  shadowColor: const Color(AppConstants.tealPrimary).withOpacity(0.4),
                                ),
                                child: auth.isLoading
                                  ? const SizedBox(width: 22, height: 22,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                  : const Text('Login', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                              ),
                            ),
                          ] else ...[
                            const Center(
                              child: Text(
                                "Enter the 6-digit code sent to your email.",
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 13, color: Colors.grey, fontStyle: FontStyle.italic),
                              ),
                            ),
                            const SizedBox(height: 20),
                            _buildLabel('Verification Code'),
                            const SizedBox(height: 8),
                            _buildInput(
                              controller: _otpController,
                              hint: '000000',
                              icon: Icons.security_rounded,
                            ),
                            const SizedBox(height: 28),

                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: auth.isLoading ? null : _verifyOtp,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(AppConstants.tealPrimary),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  elevation: 4,
                                  shadowColor: const Color(AppConstants.tealPrimary).withOpacity(0.4),
                                ),
                                child: auth.isLoading
                                  ? const SizedBox(width: 22, height: 22,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                  : const Text('Verify & Login', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Center(
                              child: TextButton(
                                onPressed: () => setState(() => _showOtp = false),
                                child: const Text('Back to Login', style: TextStyle(color: Colors.grey)),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Don't have an account? ", style: TextStyle(color: Colors.grey)),
                        GestureDetector(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                          child: const Text("Sign Up", style: TextStyle(
                            color: Color(AppConstants.tealPrimary),
                            fontWeight: FontWeight.bold,
                          )),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(text, style: const TextStyle(
      fontWeight: FontWeight.w600, fontSize: 13,
      color: Color(AppConstants.tealDark),
    ));
  }

  Widget _buildInput({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
        prefixIcon: Icon(icon, color: const Color(AppConstants.tealPrimary), size: 20),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealLight))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealLight))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealPrimary), width: 2)),
      ),
    );
  }
}
