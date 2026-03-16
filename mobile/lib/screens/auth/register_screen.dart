import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/constants.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  String _selectedRole = 'patient';
  bool _obscurePassword = true;
  bool _showOtp = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    final auth = context.read<AuthProvider>();
    final result = await auth.register(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _passwordController.text,
      _selectedRole,
      phoneNumber: _phoneController.text.trim(),
    );

    if (result['otpRequired'] == true) {
      setState(() => _showOtp = true);
      return;
    }

    if (result['success'] == true && mounted) {
      _navigateToDashboard(auth.user!.role);
    }
  }

  Future<void> _verifyOtp() async {
    final auth = context.read<AuthProvider>();
    final success = await auth.verifyOTP(_emailController.text.trim(), _otpController.text.trim());
    if (success && mounted) {
      if (auth.user == null) {
        // Likely a doctor waiting for approval
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Email vérifié !'),
            content: const Text("Votre email a été vérifié. Votre compte est maintenant en attente d'approbation par un administrateur."),
            actions: [
              TextButton(onPressed: () => Navigator.pushReplacementNamed(context, '/login'), child: const Text('OK'))
            ],
          ),
        );
      } else {
        _navigateToDashboard(auth.user!.role);
      }
    }
  }

  void _navigateToDashboard(String role) {
    if (role == 'doctor') {
      Navigator.pushReplacementNamed(context, '/doctor');
    } else {
      Navigator.pushReplacementNamed(context, '/patient');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(AppConstants.tealBg),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Create Account', style: TextStyle(color: Color(AppConstants.tealDark), fontWeight: FontWeight.bold)),
      ),
      body: Stack(
        children: [
          Positioned(
            top: 10,
            left: 20,
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
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8),
            child: Column(
              children: [
                if (!_showOtp) ...[
                  // Role selector
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                    ),
                    child: Row(children: [
                      _roleTab('patient', '🤒', 'Patient'),
                      _roleTab('doctor', '👨‍⚕️', 'Doctor'),
                    ]),
                  ),
                  const SizedBox(height: 20),

                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white, width: 1.5),
                      boxShadow: [BoxShadow(
                        color: const Color(AppConstants.tealPrimary).withOpacity(0.08),
                        blurRadius: 20, offset: const Offset(0, 8),
                      )],
                    ), // Closing BoxDecoration
                    child: Column( // This Column is the child of the Container
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (auth.error != null)
                          Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                            child: Row(children: [
                              const Icon(Icons.error_outline, color: Colors.red, size: 18),
                              const SizedBox(width: 8),
                              Expanded(child: Text(auth.error!, style: const TextStyle(color: Colors.red, fontSize: 13))),
                            ]),
                          ),

                        _formField('Full Name', _nameController, Icons.person_outline, 'John Doe'),
                        const SizedBox(height: 16),
                        _formField('Email', _emailController, Icons.email_outlined, 'example@email.com', keyboardType: TextInputType.emailAddress),
                        const SizedBox(height: 16),
                        _formField('Phone Number', _phoneController, Icons.phone_outlined, '+226 XX XX XX XX', keyboardType: TextInputType.phone),
                        const SizedBox(height: 16),
                        _formField('Password', _passwordController, Icons.lock_outline, '••••••••',
                          obscure: _obscurePassword,
                          suffixIcon: IconButton(
                            icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 20),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                        const SizedBox(height: 28),

                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: auth.isLoading ? null : _register,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(AppConstants.tealPrimary),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                              shadowColor: const Color(AppConstants.tealPrimary).withOpacity(0.4),
                            ),
                            child: auth.isLoading
                              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : const Text("Sign Up", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
             // Verification View
             Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.85),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white, width: 1.5),
              ),
              child: Column(
                children: [
                  const Text('Vérification', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(AppConstants.tealDark))),
                  const SizedBox(height: 12),
                  const Text(
                    "Entrez le code envoyé à votre adresse email pour activer votre compte.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 24),
                  if (auth.error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Text(auth.error!, style: const TextStyle(color: Colors.red, fontSize: 13)),
                    ),
                  _formField('Code de vérification', _otpController, Icons.security, '000000', keyboardType: TextInputType.number),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: auth.isLoading ? null : _verifyOtp,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(AppConstants.tealPrimary),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: auth.isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Vérifier & Activer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => setState(() => _showOtp = false),
                    child: const Text('Retour', style: TextStyle(color: Colors.grey)),
                  ),
                ],
              ),
            ),
          ],
        ], // Closing for the Column children list
        ), // Closing for the Column
      ), // Closing for the SingleChildScrollView
    ], // Closing for the Stack children list
      ), // Closing for the Stack
    ); // Closing for the Scaffold
  }

  Widget _roleTab(String role, String emoji, String label) {
    final selected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? const Color(AppConstants.tealPrimary) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text(emoji, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(
              fontWeight: FontWeight.bold,
              color: selected ? Colors.white : Colors.grey.shade600,
            )),
          ]),
        ),
      ),
    );
  }

  Widget _formField(String label, TextEditingController ctrl, IconData icon, String hint, {
    bool obscure = false, Widget? suffixIcon, TextInputType? keyboardType,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppConstants.tealDark))),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        obscureText: obscure,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
          prefixIcon: Icon(icon, color: const Color(AppConstants.tealPrimary), size: 20),
          suffixIcon: suffixIcon,
          filled: true, fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealLight))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealLight))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(AppConstants.tealPrimary), width: 2)),
        ),
      ),
    ]);
  }
}
