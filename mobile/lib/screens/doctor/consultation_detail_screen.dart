import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/appointment_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../shared/chat_screen.dart';
import 'create_prescription_screen.dart';

class ConsultationDetailScreen extends StatefulWidget {
  final AppointmentModel appointment;

  const ConsultationDetailScreen({super.key, required this.appointment});

  @override
  State<ConsultationDetailScreen> createState() => _ConsultationDetailScreenState();
}

class _ConsultationDetailScreenState extends State<ConsultationDetailScreen> {
  late TextEditingController _symptomsController;
  late TextEditingController _diagnosisController;
  late TextEditingController _notesController;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _symptomsController = TextEditingController(text: widget.appointment.symptoms);
    _diagnosisController = TextEditingController(text: widget.appointment.diagnosis);
    _notesController = TextEditingController(text: widget.appointment.notes);
  }

  @override
  void dispose() {
    _symptomsController.dispose();
    _diagnosisController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await ApiService.put('/appointments/${widget.appointment.id}', {
        'symptoms': _symptomsController.text,
        'diagnosis': _diagnosisController.text,
        'notes': _notesController.text,
        if (widget.appointment.status == 'confirmed') 'status': 'completed',
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consultation saved successfully'), backgroundColor: Color(AppConstants.tealPrimary)));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Consultation Details', style: TextStyle(color: Color(AppConstants.tealDark), fontWeight: FontWeight.w900)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_saving)
            const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(AppConstants.tealPrimary))))
          else
            Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: IconButton(onPressed: _save, icon: const Icon(Icons.check_circle_rounded, color: Color(AppConstants.tealPrimary), size: 28)),
            ),
        ],
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.12), size: 300),
          ),
          Positioned(
            bottom: -150,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.08), size: 400),
          ),
          
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Patient info card
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
                          radius: 28,
                          backgroundColor: Colors.white,
                          child: Text(
                            widget.appointment.patientName?[0].toUpperCase() ?? 'P',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 22, color: Color(AppConstants.tealPrimary)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.appointment.patientName ?? 'Standard Patient',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(AppConstants.tealDark)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Appointment on ${DateFormat('MMM dd, yyyy at HH:mm').format(widget.appointment.dateTime)}',
                              style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(
                            recipientId: widget.appointment.patientId ?? '',
                            recipientName: widget.appointment.patientName ?? 'Patient',
                            appointmentId: widget.appointment.id,
                          )));
                        },
                        icon: const Icon(Icons.forum_rounded, color: Color(AppConstants.tealPrimary), size: 28),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                const Text('Medical History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    children: [
                      const Icon(Icons.history_rounded, color: Colors.blueGrey),
                      const SizedBox(width: 12),
                      Text('No previous history found for this patient.', style: TextStyle(color: Colors.blueGrey.shade400, fontSize: 13)),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                _buildField('Symptoms', _symptomsController, Icons.sick_rounded, 'Describe the patient\'s reported symptoms...'),
                const SizedBox(height: 24),
                _buildField('Diagnosis', _diagnosisController, Icons.medical_services_rounded, 'Enter your definitive diagnosis...'),
                const SizedBox(height: 24),
                _buildField('Medical Notes', _notesController, Icons.event_note_rounded, 'Add any additional clinical observations...', maxLines: 5),
                
                const SizedBox(height: 48),
                
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
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => CreatePrescriptionScreen(appointment: widget.appointment)));
                    },
                    icon: const Icon(Icons.description_rounded, size: 20),
                    label: const Text('Create Prescription', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(AppConstants.tealDark),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: _saving
                        ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)
                        : const Text('Complete Consultation', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon, String hint, {int maxLines = 3}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: const Color(AppConstants.tealPrimary)),
            const SizedBox(width: 10),
            Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(AppConstants.tealDark)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
            ],
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontSize: 14, fontWeight: FontWeight.w500),
              fillColor: Colors.white,
              filled: true,
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
              contentPadding: const EdgeInsets.all(20),
            ),
          ),
        ),
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
        imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
