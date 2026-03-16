import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/appointment_model.dart';
import '../shared/search_doctors_screen.dart';
import '../shared/my_appointments_screen.dart';
import '../shared/profile_screen.dart';

class PatientHomeScreen extends StatefulWidget {
  const PatientHomeScreen({super.key});

  @override
  State<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends State<PatientHomeScreen> {
  int _currentIndex = 0;
  List<AppointmentModel> _upcomingAppointments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await ApiService.get('/appointments/my?limit=3&upcoming=true');
      setState(() {
        _upcomingAppointments = (data['appointments'] as List? ?? [])
            .map((e) => AppointmentModel.fromJson(e))
            .toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pages = [
      _buildHome(auth),
      const SearchDoctorsScreen(),
      const MyAppointmentsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(AppConstants.tealBg),
      body: pages[_currentIndex],
      bottomNavigationBar: _buildNavBar(),
      floatingActionButton: _currentIndex == 0 ? FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/emergency'),
        backgroundColor: const Color(0xFFEF4444),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.sos_rounded, size: 28),
        label: const Text('SOS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        elevation: 8,
      ) : null,
    );
  }

  Widget _buildHome(AuthProvider auth) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Decorative blurred backgrounds (Web-inspired)
          Positioned(
            top: -50,
            left: -100,
            child: _BlurredBlob(
              color: const Color(0xFF2DD4BF).withOpacity(0.2), // teal-400
              size: 300,
            ),
          ),
          Positioned(
            top: 200,
            right: -100,
            child: _BlurredBlob(
              color: const Color(0xFF14B8A6).withOpacity(0.15), // teal-500
              size: 250,
            ),
          ),

          SafeArea(
            child: RefreshIndicator(
              color: const Color(AppConstants.tealPrimary),
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Premium Header
                    _buildHeader(auth),
                    const SizedBox(height: 24),
                    _buildBanner(),
                    const SizedBox(height: 32),

                    // Quick Actions
                    const Text('Quick Actions', style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                    const SizedBox(height: 16),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.3,
                      children: [
                        _quickAction('🔍 Doctors', 'Find a specialist', const Color(0xFF0D9488), () => setState(() => _currentIndex = 1)),
                        _quickAction('🏥 Hospitals', 'Find facilities', const Color(0xFF0F766E), () => Navigator.pushNamed(context, '/hospitals')),
                        _quickAction('🧠 AI Triage', 'Symptom analysis', const Color(0xFF0D9488), () => Navigator.pushNamed(context, '/triage')),
                        _quickAction('💊 Prescriptions', 'View history', const Color(0xFF0B9488), () => Navigator.pushNamed(context, '/prescriptions')),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Upcoming Appointments Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Next Appointments', style: TextStyle(
                          fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                        TextButton(
                          onPressed: () => setState(() => _currentIndex = 2),
                          child: const Text('See All', style: TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (_loading)
                      const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
                    else if (_upcomingAppointments.isEmpty)
                      _emptyState('No upcoming appointments', Icons.calendar_today_outlined)
                    else
                      ..._upcomingAppointments.map(_buildAppointmentCard),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(AuthProvider auth) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Hello 👋', style: TextStyle(fontSize: 16, color: Colors.blueGrey, fontWeight: FontWeight.w500)),
              Text(
                auth.user?.name ?? 'Patient',
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark), height: 1.1),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
          ),
          child: CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white,
            backgroundImage: auth.user?.profilePicture != null && auth.user!.profilePicture!.isNotEmpty
                ? NetworkImage(AppConstants.baseUrl.replaceAll('/api', '') + auth.user!.profilePicture!)
                : null,
            child: auth.user?.profilePicture == null || auth.user!.profilePicture!.isEmpty
                ? (auth.user?.name != null
                    ? Text(auth.user!.name[0].toUpperCase(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(AppConstants.tealPrimary)))
                    : const Icon(Icons.person, color: Color(AppConstants.tealPrimary), size: 30))
                : null,
          ),
        ),
      ],
    );
  }

  Widget _buildBanner() {
    return Container(
      width: double.infinity,
      height: 140,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
        boxShadow: [
          BoxShadow(color: Color(0xFF0D9488).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -20,
            child: Opacity(
              opacity: 0.9,
              child: Image.asset(
                'assets/images/patient_dashboard_illustration.png',
                height: 160,
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const SizedBox(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Your Health,\nOur Priority', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                  child: const Text('Book now', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickAction(String title, String subtitle, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.12),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(AppConstants.tealDark))),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(AppointmentModel appt) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF2DD4BF).withOpacity(0.2), const Color(0xFF0D9488).withOpacity(0.1)],
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.medical_services_rounded, color: Color(AppConstants.tealPrimary), size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dr. ${appt.doctorName ?? 'Doctor'}',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(AppConstants.tealDark)),
                ),
                if (appt.specialty != null)
                  Text(appt.specialty!, style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w500)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.access_time_filled, size: 14, color: Color(0xFF14B8A6)),
                    const SizedBox(width: 4),
                    Text(
                      DateFormat('MMM dd • HH:mm').format(appt.dateTime),
                      style: const TextStyle(fontSize: 13, color: Color(0xFF14B8A6), fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ],
            ),
          ),
          _statusBadge(appt.statusLabel, appt.status),
        ],
      ),
    );
  }

  Widget _statusBadge(String label, String status) {
    final color = status == 'confirmed' ? Colors.teal :
                  status == 'pending' ? Colors.amber.shade700 :
                  status == 'completed' ? Colors.indigo : Colors.redAccent;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w900, letterSpacing: 0.5),
      ),
    );
  }

  Widget _emptyState(String msg, IconData icon) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.teal.shade50),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.teal.shade100),
          const SizedBox(height: 16),
          Text(msg, style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 15, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _avatar(String name) {
    return Container(
      width: 44, height: 44,
      decoration: BoxDecoration(
        color: const Color(AppConstants.tealPrimary),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Center(child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : 'P',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
      )),
    );
  }

  BottomNavigationBar _buildNavBar() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      onTap: (i) => setState(() => _currentIndex = i),
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
      selectedItemColor: const Color(AppConstants.tealPrimary),
      unselectedItemColor: Colors.blueGrey.shade200,
      showUnselectedLabels: true,
      selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12),
      unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
      elevation: 0,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), activeIcon: Icon(Icons.grid_view_sharp), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.search_rounded), activeIcon: Icon(Icons.search_sharp), label: 'Explore'),
        BottomNavigationBarItem(icon: Icon(Icons.event_note_rounded), activeIcon: Icon(Icons.event_note_sharp), label: 'Calendar'),
        BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded), activeIcon: Icon(Icons.person), label: 'Profile'),
      ],
    );
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
        imageFilter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
