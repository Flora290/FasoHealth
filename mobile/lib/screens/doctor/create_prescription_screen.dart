import 'dart:ui';
import 'package:flutter/material.dart';
import '../../models/appointment_model.dart';
import '../../models/prescription_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class CreatePrescriptionScreen extends StatefulWidget {
  final AppointmentModel appointment;

  const CreatePrescriptionScreen({super.key, required this.appointment});

  @override
  State<CreatePrescriptionScreen> createState() => _CreatePrescriptionScreenState();
}

class _CreatePrescriptionScreenState extends State<CreatePrescriptionScreen> {
  final List<MedicationModel> _medications = [];
  final TextEditingController _instructionsController = TextEditingController();
  bool _saving = false;

  void _addMedication() {
    showDialog(
      context: context,
      builder: (ctx) => _AddMedicationDialog(onAdd: (m) => setState(() => _medications.add(m))),
    );
  }

  Future<void> _submit() async {
    if (_medications.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one medication'), backgroundColor: Colors.orangeAccent));
      return;
    }

    setState(() => _saving = true);
    try {
      await ApiService.post('/prescriptions', {
        'appointmentId': widget.appointment.id,
        'medications': _medications.map((m) => m.toJson()).toList(),
        'generalInstructions': _instructionsController.text,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prescription created successfully'), backgroundColor: Color(AppConstants.tealPrimary)));
        Navigator.pop(context);
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
        title: const Text('Create Prescription', style: TextStyle(color: Color(AppConstants.tealDark), fontWeight: FontWeight.w900)),
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
          
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Medications',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(AppConstants.tealDark)),
                ),
                const SizedBox(height: 16),
                
                if (_medications.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                    decoration: BoxDecoration(
                      color: Colors.blueGrey.shade50.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.blueGrey.shade50),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.medication_liquid_rounded, size: 48, color: Colors.blueGrey.shade100),
                        const SizedBox(height: 12),
                        Text(
                          'No medications added yet',
                          style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  )
                else
                  ..._medications.asMap().entries.map((entry) => _buildMedCard(entry.value, entry.key)),
                
                const SizedBox(height: 20),
                
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _addMedication,
                    icon: const Icon(Icons.add_rounded, size: 20),
                    label: const Text('Add Medication', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(AppConstants.tealPrimary),
                      side: const BorderSide(color: Color(0xFFCCF2ED), width: 1.5),
                      padding: const EdgeInsets.all(16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      backgroundColor: const Color(AppConstants.tealPrimary).withOpacity(0.02),
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
                const Text(
                  'General Instructions',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(AppConstants.tealDark)),
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
                    controller: _instructionsController,
                    maxLines: 4,
                    style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                    decoration: InputDecoration(
                      hintText: 'Additional advice or notes...',
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
                  child: ElevatedButton(
                    onPressed: _saving ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: _saving 
                        ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5) 
                        : const Text('Save Prescription', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
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

  Widget _buildMedCard(MedicationModel med, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 6)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(AppConstants.tealPrimary).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.medication_rounded, color: Color(AppConstants.tealPrimary), size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    med.name,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(AppConstants.tealDark)),
                  ),
                ),
                IconButton(
                  onPressed: () => setState(() => _medications.removeAt(index)),
                  icon: Icon(Icons.remove_circle_outline_rounded, color: Colors.red.shade200, size: 22),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 16),
            Row(
              children: [
                _medInfoChip(Icons.numbers_rounded, 'Dosage: ${med.dosage}'),
                const SizedBox(width: 12),
                _medInfoChip(Icons.update_rounded, 'Duration: ${med.duration}'),
              ],
            ),
            const SizedBox(height: 8),
            _medInfoChip(Icons.repeat_rounded, 'Frequency: ${med.frequency}'),
            if (med.instructions?.isNotEmpty == true) ...[
              const SizedBox(height: 12),
              Text(
                'Details: ${med.instructions}',
                style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w500, fontStyle: FontStyle.italic),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _medInfoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.blueGrey.shade300),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _AddMedicationDialog extends StatefulWidget {
  final Function(MedicationModel) onAdd;
  const _AddMedicationDialog({required this.onAdd});

  @override
  State<_AddMedicationDialog> createState() => _AddMedicationDialogState();
}

class _AddMedicationDialogState extends State<_AddMedicationDialog> {
  final _name = TextEditingController();
  final _dosage = TextEditingController();
  final _frequency = TextEditingController();
  final _duration = TextEditingController();
  final _details = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
      child: AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: const Text(
          'New Medication',
          style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _dialogField(_name, 'Medication Name', Icons.drive_file_rename_outline_rounded),
              _dialogField(_dosage, 'Dosage (e.g. 500mg)', Icons.numbers_rounded),
              _dialogField(_frequency, 'Frequency (e.g. 2 times/day)', Icons.repeat_rounded),
              _dialogField(_duration, 'Duration (e.g. 7 days)', Icons.update_rounded),
              _dialogField(_details, 'Detailed Instructions', Icons.notes_rounded, maxLines: 2),
            ],
          ),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: TextStyle(color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
          ),
          ElevatedButton(
            onPressed: () {
              if (_name.text.isEmpty) return;
              widget.onAdd(MedicationModel(
                name: _name.text,
                dosage: _dosage.text,
                frequency: _frequency.text,
                duration: _duration.text,
                instructions: _details.text,
              ));
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(AppConstants.tealPrimary),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            child: const Text('Add', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _dialogField(TextEditingController controller, String label, IconData icon, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.blueGrey.shade300, fontSize: 13, fontWeight: FontWeight.w600),
          prefixIcon: Icon(icon, size: 18, color: const Color(AppConstants.tealPrimary).withOpacity(0.5)),
          border: UnderlineInputBorder(borderSide: BorderSide(color: Colors.blueGrey.shade100)),
          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.blueGrey.shade100)),
          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(AppConstants.tealPrimary), width: 1.5)),
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
