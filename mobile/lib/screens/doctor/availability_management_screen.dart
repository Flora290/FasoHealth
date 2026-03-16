import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class AvailabilityManagementScreen extends StatefulWidget {
  const AvailabilityManagementScreen({super.key});

  @override
  State<AvailabilityManagementScreen> createState() => _AvailabilityManagementScreenState();
}

class _AvailabilityManagementScreenState extends State<AvailabilityManagementScreen> {
  List<dynamic> _availabilities = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAvailabilities();
  }

  Future<void> _loadAvailabilities() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.get('/doctor/availability-overview');
      setState(() {
        _availabilities = data['availabilities'] as List? ?? [];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _addAvailability() async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: ThemeData.light().copyWith(
          colorScheme: const ColorScheme.light(primary: Color(AppConstants.tealPrimary)),
        ),
        child: child!,
      ),
    );

    if (pickedDate == null) return;

    final TimeOfDay? start = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 9, minute: 0),
      helpText: 'Start Time',
    );
    if (start == null) return;

    final TimeOfDay? end = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 17, minute: 0),
      helpText: 'End Time',
    );
    if (end == null) return;

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(pickedDate);
      final startStr = '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}';
      final endStr = '${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}';

      await ApiService.post('/availability', {
        'date': dateStr,
        'startTime': startStr,
        'endTime': endStr,
        'maxAppointments': 5,
        'consultationType': 'in-person',
      });
      _loadAvailabilities();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent));
      }
    }
  }

  Future<void> _deleteAvailability(String id) async {
    try {
      await ApiService.delete('/availability/$id');
      _loadAvailabilities();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Manage Availability', style: TextStyle(color: Color(AppConstants.tealDark), fontWeight: FontWeight.w900)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.12), size: 300),
          ),
          Positioned(
            bottom: -150,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.08), size: 400),
          ),
          
          _loading
              ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
              : _availabilities.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadAvailabilities,
                      color: const Color(AppConstants.tealPrimary),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(24),
                        itemCount: _availabilities.length,
                        itemBuilder: (ctx, i) => _buildAvailabilityCard(_availabilities[i]),
                      ),
                    ),
        ],
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(color: const Color(AppConstants.tealPrimary).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
          ],
        ),
        child: FloatingActionButton(
          onPressed: _addAvailability,
          backgroundColor: const Color(AppConstants.tealPrimary),
          elevation: 0,
          child: const Icon(Icons.add_rounded, color: Colors.white, size: 32),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(color: Colors.teal.shade50.withOpacity(0.3), shape: BoxShape.circle),
              child: Icon(Icons.calendar_month_rounded, size: 80, color: Colors.teal.shade100),
            ),
            const SizedBox(height: 32),
            const Text(
              'No availability slots defined',
              style: TextStyle(color: Color(AppConstants.tealDark), fontSize: 20, fontWeight: FontWeight.w900),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Add your working hours to allow patients to book appointments with you.',
              style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 14, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _addAvailability,
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text('Add Your First Slot', style: TextStyle(fontWeight: FontWeight.w900)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConstants.tealPrimary),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailabilityCard(Map<String, dynamic> avail) {
    final date = DateTime.parse(avail['date']);
    final isFullyBooked = avail['isFullyBooked'] ?? false;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 6)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Text(
                    DateFormat('dd').format(date),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.white),
                  ),
                  Text(
                    DateFormat('MMM').format(date).toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withOpacity(0.9)),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${avail['startTime']} - ${avail['endTime']}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(AppConstants.tealDark)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.people_alt_rounded, size: 14, color: Colors.blueGrey.shade300),
                      const SizedBox(width: 6),
                      Text(
                        '${avail['bookedSlots']}/${avail['maxAppointments']} slots',
                        style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w700),
                      ),
                      if (isFullyBooked) ...[
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(4)),
                          child: const Text('FULL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.redAccent)),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: () => _deleteAvailability(avail['_id']),
              icon: Icon(Icons.delete_outline_rounded, color: Colors.red.shade200, size: 22),
            ),
          ],
        ),
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
