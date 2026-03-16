import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/appointment_model.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loading = true;
  List<AppointmentModel> _all = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAppointments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAppointments() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.get('/appointments/my?limit=50');
      setState(() {
        _all = ((data['appointments'] ?? data) as List)
            .map((e) => AppointmentModel.fromJson(e))
            .toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(String id, String newStatus) async {
    try {
      await ApiService.put('/appointments/$id/status', {'status': newStatus});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Appointment $newStatus')));
      }
      _loadAppointments();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e', style: const TextStyle(color: Colors.white)), backgroundColor: Colors.redAccent));
      }
    }
  }

  List<AppointmentModel> _filtered(String status) {
    if (status == 'all') return _all;
    return _all.where((a) => a.status == status).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -50,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.15), size: 300),
          ),
          Positioned(
            bottom: 100,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.1), size: 250),
          ),
          
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: const Text(
                    'My Appointments',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(AppConstants.tealDark),
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    height: 54,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.teal.shade50.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        color: const Color(AppConstants.tealPrimary),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(color: const Color(AppConstants.tealPrimary).withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4))
                        ],
                      ),
                      labelColor: Colors.white,
                      unselectedLabelColor: Colors.blueGrey.shade300,
                      labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                      unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                      indicatorSize: TabBarIndicatorSize.tab,
                      dividerColor: Colors.transparent,
                      tabs: const [
                        Tab(text: 'All'),
                        Tab(text: 'Pending'),
                        Tab(text: 'Confirmed'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
                      : TabBarView(
                          controller: _tabController,
                          children: [
                            _list(_filtered('all')),
                            _list(_filtered('pending')),
                            _list(_filtered('confirmed')),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _list(List<AppointmentModel> items) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.event_busy_rounded, size: 80, color: Colors.teal.shade50),
            const SizedBox(height: 16),
            Text(
              'No appointments yet',
              style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      color: const Color(AppConstants.tealPrimary),
      onRefresh: _loadAppointments,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        itemCount: items.length,
        itemBuilder: (_, i) {
          final isDoctor = context.read<AuthProvider>().user?.role == 'doctor';
          return _ApptCard(
            appointment: items[i],
            isDoctor: isDoctor,
            onUpdateStatus: _updateStatus,
          );
        },
      ),
    );
  }
}

class _ApptCard extends StatelessWidget {
  final AppointmentModel appointment;
  final bool isDoctor;
  final Future<void> Function(String, String)? onUpdateStatus;

  const _ApptCard({required this.appointment, this.isDoctor = false, this.onUpdateStatus});

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
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        isDoctor ? 'Patient: ${appointment.patientName ?? 'Unknown'}' : 'Dr. ${appointment.doctorName ?? 'Specialist'}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(AppConstants.tealDark)),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                      child: Text(
                        appointment.statusLabel.toUpperCase(),
                        style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
                if (appointment.specialty != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    appointment.specialty!,
                    style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600),
                  ),
                ],
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.teal.shade50.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time_filled_rounded, size: 18, color: Color(AppConstants.tealPrimary)),
                      const SizedBox(width: 8),
                      Text(
                        DateFormat('MMM dd, yyyy').format(appointment.dateTime),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(AppConstants.tealDark)),
                      ),
                      const Spacer(),
                      Text(
                        DateFormat('HH:mm').format(appointment.dateTime),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(AppConstants.tealPrimary)),
                      ),
                    ],
                  ),
                ),
                if (appointment.reason != null && appointment.reason!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    'Reason: ${appointment.reason}',
                    style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w500),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                if (isDoctor && appointment.status == 'pending') ...[
                  const SizedBox(height: 16),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => onUpdateStatus?.call(appointment.id, 'cancelled'),
                        child: const Text('Reject', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => onUpdateStatus?.call(appointment.id, 'confirmed'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(AppConstants.tealPrimary),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Confirm', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
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
        imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
