import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/appointment_model.dart';
import '../shared/my_appointments_screen.dart';
import '../shared/profile_screen.dart';
import 'consultation_detail_screen.dart';
import 'availability_management_screen.dart';
import '../shared/chat_screen.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/gradient_button.dart';

class DoctorHomeScreen extends StatefulWidget {
  const DoctorHomeScreen({super.key});

  @override
  State<DoctorHomeScreen> createState() => _DoctorHomeScreenState();
}

class _DoctorHomeScreenState extends State<DoctorHomeScreen> {
  int _currentIndex = 0;
  List<AppointmentModel> _todayAppointments = [];
  Map<String, dynamic> _stats = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final apptsData = await ApiService.get('/appointments/my?limit=50');
      final statsData = await ApiService.get('/doctor/stats');
      
      final all = ((apptsData['appointments'] ?? apptsData) as List)
          .map((e) => AppointmentModel.fromJson(e))
          .toList();

      final overall = statsData['overall'] ?? {};

      setState(() {
        _todayAppointments = all.where((a) {
          final d = a.dateTime;
          return d.year == DateTime.now().year &&
                 d.month == DateTime.now().month &&
                 d.day == DateTime.now().day;
        }).toList();
        _stats = {
          'today': _todayAppointments.length,
          'pending': all.where((a) => a.status == 'pending').length,
          'total': all.length,
          'patients': overall['totalPatients'] ?? 0,
        };
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await ApiService.put('/appointments/$id/status', {'status': status});
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString().replaceFirst('Exception: ', '')}'), backgroundColor: Colors.redAccent));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pages = [
      _buildHome(auth),
      const MyAppointmentsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      body: pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5)),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: Colors.white,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppDesign.primaryBlue,
          unselectedItemColor: AppDesign.textLight,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded, size: 22), activeIcon: Icon(Icons.grid_view_rounded, size: 24), label: 'Dashboard'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_today_rounded, size: 22), activeIcon: Icon(Icons.calendar_today_rounded, size: 24), label: 'Appointments'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline_rounded, size: 22), activeIcon: Icon(Icons.person_rounded, size: 24), label: 'Profile'),
          ],
        ),
      ),
    );
  }

  Widget _buildHome(AuthProvider auth) {
    return Stack(
      children: [
        Positioned(
          top: -50,
          right: -50,
          child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.12), size: 250),
        ),
        Positioned(
          bottom: 100,
          left: -100,
          child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.08), size: 300),
        ),
        
        SafeArea(
          child: RefreshIndicator(
            color: AppDesign.primaryBlue,
            onRefresh: _loadData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back,',
                              style: TextStyle(fontSize: 14, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              'Dr. ${auth.user?.name ?? 'Consultant'} 👨‍⚕️',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppDesign.textDark, letterSpacing: -0.5),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
                        ),
                        child: CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.white,
                          backgroundImage: auth.user?.profilePicture != null && auth.user!.profilePicture!.isNotEmpty
                              ? NetworkImage(AppConstants.baseUrl.replaceAll('/api', '') + auth.user!.profilePicture!)
                              : null,
                          child: auth.user?.profilePicture == null || auth.user!.profilePicture!.isEmpty
                              ? Text(
                                  auth.user?.name.isNotEmpty == true ? auth.user!.name[0].toUpperCase() : 'D',
                                  style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900, fontSize: 18),
                                )
                              : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () => Navigator.pushNamed(context, '/conversations'),
                        icon: const Icon(Icons.forum_rounded, color: AppDesign.accentBlue, size: 28),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildBanner(),
                  const SizedBox(height: 32),

                  // Stats Grid
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    clipBehavior: Clip.none,
                    child: Row(
                      children: [
                        _statCard('Today', '${_stats['today'] ?? 0}', Icons.today_rounded, const Color(0xFF14B8A6)),
                        const SizedBox(width: 16),
                        _statCard('Patients', '${_stats['patients'] ?? 0}', Icons.group_rounded, Colors.indigoAccent),
                        const SizedBox(width: 16),
                        _statCard('Pending', '${_stats['pending'] ?? 0}', Icons.pending_actions_rounded, Colors.orangeAccent),
                        const SizedBox(width: 16),
                        _statCard('Total', '${_stats['total'] ?? 0}', Icons.event_note_rounded, Colors.blueAccent),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Quick Actions
                  const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppDesign.textDark)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _actionCard('My Schedule', Icons.calendar_month_rounded, Colors.teal, () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const AvailabilityManagementScreen()));
                      }),
                      const SizedBox(width: 16),
                      _actionCard('All Records', Icons.history_rounded, Colors.blueGrey, () {
                        setState(() => _currentIndex = 1);
                      }),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Today's Appointments Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Today's Appointments",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppDesign.textDark),
                      ),
                      if (_todayAppointments.isNotEmpty)
                        Text(
                          '${_todayAppointments.length} pending',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.blueGrey.shade300),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  if (_loading)
                    const Center(child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(color: AppDesign.primaryBlue),
                    ))
                  else if (_todayAppointments.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                      decoration: BoxDecoration(
                        color: Colors.teal.shade50.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.teal.shade50),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.event_available_rounded, size: 60, color: Colors.teal.shade100),
                          const SizedBox(height: 16),
                          Text(
                            "No appointments scheduled for today",
                            style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    )
                  else
                    ..._todayAppointments.map((appt) => _DoctorApptCard(appointment: appt, onAction: _updateStatus)),
                  const SizedBox(height: 20),
                ],
              ),
            ),
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
        gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF0F766E)]),
        boxShadow: [
          BoxShadow(color: Color(0xFF0F766E).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -10,
            child: Opacity(
              opacity: 0.9,
              child: Image.asset(
                'assets/images/doctor_dashboard_illustration.png',
                height: 150,
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
                const Text('Manage your\npatients easily', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                  child: const Text('View Schedule', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return CustomCard(
      padding: const EdgeInsets.all(16),
      borderRadius: 24,
      child: SizedBox(
        width: 80,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppDesign.textLight), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  Widget _actionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: CustomCard(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          color: color.withOpacity(0.08),
          borderRadius: 24,
          boxShadow: const [],
          border: Border.all(color: color.withOpacity(0.1)),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DoctorApptCard extends StatelessWidget {
  final AppointmentModel appointment;
  final Function(String, String) onAction;

  const _DoctorApptCard({required this.appointment, required this.onAction});

  @override
  Widget build(BuildContext context) {
    final statusColors = {
      'pending': Colors.amber.shade700,
      'confirmed': Colors.teal,
      'completed': Colors.indigo,
      'cancelled': Colors.redAccent,
    };
    final color = statusColors[appointment.status] ?? Colors.blueGrey;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 6)),
        ],
      ),
      child: InkWell(
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ConsultationDetailScreen(appointment: appointment)),
          );
          if (result == true) {
            onAction(appointment.id, appointment.status);
          }
        },
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(1),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(AppConstants.tealPrimary).withOpacity(0.2), width: 1.5),
                    ),
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(AppConstants.tealPrimary).withOpacity(0.05),
                      child: Text(
                        appointment.patientName?.isNotEmpty == true ? appointment.patientName![0].toUpperCase() : 'P',
                        style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900, fontSize: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          appointment.patientName ?? 'Standard Patient',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppDesign.textDark),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.access_time_filled_rounded, size: 12, color: AppDesign.textLight),
                            const SizedBox(width: 4),
                            Text(
                              DateFormat('HH:mm').format(appointment.dateTime),
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppDesign.textLight),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  _statusBadge(appointment.statusLabel, color),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(
                        recipientId: appointment.patientId ?? '',
                        recipientName: appointment.patientName ?? 'Patient',
                        appointmentId: appointment.id,
                      )));
                    },
                    icon: const Icon(Icons.forum_rounded, color: AppDesign.accentBlue, size: 20),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              if (appointment.reason != null && appointment.reason!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.blueGrey.shade50.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Reason: ${appointment.reason}',
                    style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              if (appointment.status == 'pending') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => onAction(appointment.id, 'cancelled'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Color(0xFFFFC1C7)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GradientButton(
                        onPressed: () => onAction(appointment.id, 'confirmed'),
                        text: 'Confirm',
                      ),
                    ),
                  ],
                ),
              ],
              if (appointment.status == 'confirmed') ...[
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.touch_app_rounded, size: 14, color: Color(AppConstants.tealPrimary)),
                    const SizedBox(width: 8),
                    Text(
                      'Tap to start consultation',
                      style: TextStyle(color: Colors.teal.shade800, fontSize: 11, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(fontSize: 9, color: color, fontWeight: FontWeight.w900, letterSpacing: 0.5),
      ),
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
        imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
