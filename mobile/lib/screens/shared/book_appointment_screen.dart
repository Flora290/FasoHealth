import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/doctor_model.dart';

class BookAppointmentScreen extends StatefulWidget {
  final DoctorModel doctor;
  const BookAppointmentScreen({super.key, required this.doctor});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  dynamic _selectedSlot; // Added to store the full slot object
  List<dynamic> _availableSlots = [];
  bool _loadingSlots = false;
  final _reasonCtrl = TextEditingController();
  String _type = 'in-person';
  String _selectedPayment = 'orange'; // Default payment method
  bool _loading = false;

  @override
  void dispose() {
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchSlots(DateTime date) async {
    setState(() {
      _loadingSlots = true;
      _availableSlots = [];
      _selectedSlot = null;
      _selectedTime = null;
    });

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(date);
      final slots = await ApiService.get('/search/slots/${widget.doctor.id}?date=$dateStr');
      if (mounted) {
        setState(() {
          _availableSlots = slots is List ? slots : [];
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading slots: $e'), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _loadingSlots = false);
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: ThemeData.light().copyWith(
          colorScheme: const ColorScheme.light(
            primary: Color(AppConstants.tealPrimary),
            onPrimary: Colors.white,
            surface: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (date != null) {
      setState(() => _selectedDate = date);
      _fetchSlots(date);
    }
  }

  void _selectSlot(dynamic slot) {
    final timeParts = (slot['time'] as String).split(':');
    setState(() {
      _selectedSlot = slot;
      _selectedTime = TimeOfDay(hour: int.parse(timeParts[0]), minute: int.parse(timeParts[1]));
    });
  }

  Future<void> _bookAppointment() async {
    if (_selectedDate == null || _selectedTime == null || _selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date and a time slot'), backgroundColor: Colors.redAccent));
      return;
    }

    setState(() => _loading = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final startTime = _selectedSlot['time'];

      await ApiService.post('/appointments', {
        'doctor': widget.doctor.id,
        'availability': _selectedSlot['availabilityId'],
        'date': dateStr,
        'startTime': startTime,
        'endTime': startTime,
        'reason': _reasonCtrl.text.trim(),
        'consultationType': _type,
        'paymentMethod': _selectedPayment,
        'payment': {
          'provider': _selectedPayment,
          'amount': 2000,
          'status': 'paid',
        },
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✅ Appointment booked successfully!'), backgroundColor: Color(AppConstants.tealPrimary)));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceFirst('Exception: ', '')), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Book Appointment', style: TextStyle(color: Color(AppConstants.tealDark), fontWeight: FontWeight.w900)),
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
            bottom: -100,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.15), size: 300),
          ),
          
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Doctor info card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
                        ),
                        child: CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.white,
                          child: Text(
                            widget.doctor.initials,
                            style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900, fontSize: 18),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Dr. ${widget.doctor.name}',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(AppConstants.tealDark)),
                            ),
                            if (widget.doctor.specialty != null)
                              Text(
                                widget.doctor.specialty!,
                                style: TextStyle(color: Colors.blueGrey.shade400, fontSize: 14, fontWeight: FontWeight.w600),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                const Text('Appointment Type', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.teal.shade50.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      _typeTab('in-person', '🏥', 'In-Person'),
                      _typeTab('video', '🎥', 'Remote'),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // ── Payment Method ──
                const Text('Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _paymentCard('orange', 'Orange', '🟠', const Color(0xFFFFF3E0), const Color(0xFFE65100))),
                    const SizedBox(width: 12),
                    Expanded(child: _paymentCard('moov', 'Moov', '🔵', const Color(0xFFE3F2FD), const Color(0xFF1565C0))),
                  ],
                ),
                const SizedBox(height: 32),

                Row(
                  children: [
                    Expanded(child: _picker(
                      icon: Icons.calendar_today_rounded,
                      label: 'Date',
                      value: _selectedDate != null ? DateFormat('MMM dd, yyyy').format(_selectedDate!) : null,
                      placeholder: 'Select Date',
                      onTap: _pickDate,
                    )),
                  ],
                ),
                const SizedBox(height: 24),

                if (_selectedDate != null) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Available Slots', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                      if (_loadingSlots)
                        const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Color(AppConstants.tealPrimary))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (!_loadingSlots && _availableSlots.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(16)),
                      child: const Row(children: [
                        Icon(Icons.info_outline, color: Colors.orange),
                        SizedBox(width: 12),
                        Text('No slots available for this date', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                      ]),
                    )
                  else
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: _availableSlots.map((slot) {
                        final isSelected = _selectedSlot == slot;
                        return GestureDetector(
                          onTap: () => _selectSlot(slot),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(AppConstants.tealPrimary) : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isSelected ? const Color(AppConstants.tealPrimary) : Colors.teal.shade50),
                              boxShadow: isSelected ? [BoxShadow(color: const Color(AppConstants.tealPrimary).withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4))] : null,
                            ),
                            child: Text(
                              slot['time'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : const Color(AppConstants.tealDark),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 32),
                ],

                const Text('Reason for Visit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
                    ],
                  ),
                  child: TextField(
                    controller: _reasonCtrl,
                    maxLines: 4,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                    decoration: InputDecoration(
                      hintText: 'Briefly describe your symptoms or health issue...',
                      hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontSize: 14),
                      contentPadding: const EdgeInsets.all(20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.teal.shade50),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.teal.shade50),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Color(AppConstants.tealPrimary), width: 1.5),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 48),

                Container(
                  width: double.infinity,
                  height: 60,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF14B8A6), Color(0xFF0D9488)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0D9488).withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: _loading ? null : _bookAppointment,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                        : const Text('Confirm Booking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _typeTab(String type, String emoji, String label) {
    final selected = _type == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _type = type),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? const Color(AppConstants.tealPrimary) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            boxShadow: selected ? [
              BoxShadow(color: const Color(AppConstants.tealPrimary).withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))
            ] : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(emoji, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: selected ? Colors.white : Colors.blueGrey.shade400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _picker({required IconData icon, required String label, required String? value, required String placeholder, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.teal.shade50),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(AppConstants.tealPrimary), size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(
                    value ?? placeholder,
                    style: TextStyle(
                      fontWeight: value != null ? FontWeight.w900 : FontWeight.w600,
                      fontSize: 14,
                      color: value != null ? const Color(AppConstants.tealDark) : Colors.blueGrey.shade200,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _paymentCard(String id, String label, String emoji, Color bgColor, Color accentColor) {
    final isSelected = _selectedPayment == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPayment = id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        decoration: BoxDecoration(
          color: isSelected ? bgColor : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? accentColor : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected ? [
            BoxShadow(color: accentColor.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 6)),
          ] : [
            BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      color: isSelected ? accentColor : Colors.blueGrey.shade700,
                    ),
                  ),
                  Text(
                    '2000 FCFA',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                      color: isSelected ? accentColor.withOpacity(0.7) : Colors.blueGrey.shade300,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle_rounded, color: accentColor, size: 20),
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
        imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
