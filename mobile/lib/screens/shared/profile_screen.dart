import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../providers/auth_provider.dart';
import 'package:image_picker/image_picker.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _saving = false;
  String? _success;
  String? _error;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _nameCtrl.text = user?.name ?? '';
    _emailCtrl.text = user?.email ?? '';
    _phoneCtrl.text = user?.phoneNumber ?? '';
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose();
    _phoneCtrl.dispose(); _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() { _saving = true; _success = null; _error = null; });
    try {
      final body = {
        'name': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'phoneNumber': _phoneCtrl.text.trim(),
        if (_passwordCtrl.text.isNotEmpty) 'password': _passwordCtrl.text,
      };
      await ApiService.put('/auth/profile', body);
      setState(() { _success = 'Profile updated successfully!'; _saving = false; });
      _passwordCtrl.clear();
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _saving = false; });
    }
  }

  Future<void> _uploadProfilePicture() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: ImageSource.gallery, maxWidth: 800, maxHeight: 800);
      if (pickedFile == null) return;
      
      setState(() { _saving = true; _success = null; _error = null; });
      await ApiService.multipart('/users/profile-picture', pickedFile.path);
      await context.read<AuthProvider>().init(); // Refresh user data
      setState(() { _success = 'Profile picture updated successfully!'; _saving = false; });
    } catch (e) {
      setState(() { _error = 'Failed to upload picture: $e'; _saving = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final roleLabel = user?.isAdmin == true ? 'Administrator' : user?.isDoctor == true ? 'Doctor' : 'Patient';

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.15), size: 300),
          ),
          Positioned(
            bottom: -150,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.1), size: 400),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                children: [
                  // Profile Header
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'My Profile',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                color: Color(AppConstants.tealDark),
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(AppConstants.tealPrimary).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                roleLabel.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: Color(AppConstants.tealPrimary),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: _uploadProfilePicture,
                        child: Stack(
                          alignment: Alignment.bottomRight,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
                              ),
                              child: CircleAvatar(
                                radius: 35,
                                backgroundColor: Colors.white,
                                backgroundImage: user?.profilePicture != null && user!.profilePicture!.isNotEmpty
                                    ? NetworkImage(AppConstants.baseUrl.replaceAll('/api', '') + user.profilePicture!)
                                    : null,
                                child: user?.profilePicture == null || user!.profilePicture!.isEmpty 
                                    ? Text(
                                        user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?',
                                        style: const TextStyle(
                                          color: Color(AppConstants.tealPrimary),
                                          fontWeight: FontWeight.w900,
                                          fontSize: 28,
                                        ),
                                      )
                                    : null,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Color(AppConstants.tealPrimary),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.camera_alt_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Personal Info Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 25, offset: const Offset(0, 10)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Personal Information',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                        ),
                        const SizedBox(height: 24),

                        if (_error != null) _alert(_error!, Colors.redAccent),
                        if (_success != null) _alert(_success!, Colors.teal),

                        _field('Full Name', _nameCtrl, Icons.person_rounded),
                        const SizedBox(height: 20),
                        _field('Email Address', _emailCtrl, Icons.email_rounded, type: TextInputType.emailAddress),
                        const SizedBox(height: 20),
                        _field('Phone Number', _phoneCtrl, Icons.phone_android_rounded, type: TextInputType.phone),
                        const SizedBox(height: 20),
                        _field('New Password', _passwordCtrl, Icons.lock_rounded, obscure: true, hint: 'Leave empty to keep current'),
                        const SizedBox(height: 32),

                        Container(
                          width: double.infinity,
                          height: 54,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(18),
                            gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF0D9488)]),
                            boxShadow: [
                              BoxShadow(color: const Color(0xFF0D9488).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _saving ? null : _save,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                            ),
                            child: _saving
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Logout button
                  InkWell(
                    onTap: () async {
                      await auth.logout();
                      if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
                    },
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.red.shade100),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
                          const SizedBox(width: 12),
                          const Text(
                            'Sign Out',
                            style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _alert(String msg, Color color) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Icon(color == Colors.teal ? Icons.check_circle_rounded : Icons.error_rounded, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text(msg, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl, IconData icon, {
    bool obscure = false, String? hint, TextInputType? type,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(AppConstants.tealDark))),
      const SizedBox(height: 8),
      TextField(
        controller: ctrl,
        obscureText: obscure,
        keyboardType: type,
        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontSize: 13, fontWeight: FontWeight.w500),
          prefixIcon: Icon(icon, color: const Color(AppConstants.tealPrimary), size: 20),
          filled: true,
          fillColor: Colors.teal.shade50.withOpacity(0.2),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(AppConstants.tealPrimary), width: 1.5),
          ),
        ),
      ),
    ]);
  }
}

class _BlurredBlob extends StatelessWidget {
  final Color color;
  final double size;

  const _BlurredBlob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
