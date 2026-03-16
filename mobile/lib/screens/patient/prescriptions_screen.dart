import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/prescription_model.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/gradient_button.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  List<PrescriptionModel> _prescriptions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final data = await ApiService.get('/prescriptions/my');
      setState(() {
        _prescriptions = ((data['prescriptions'] ?? []) as List)
            .map((e) => PrescriptionModel.fromJson(e))
            .toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppDesign.bgLight,
      appBar: AppBar(
        title: const Text('My Prescriptions', style: TextStyle(color: AppDesign.textDark, fontWeight: FontWeight.w900, fontSize: 18)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppDesign.textDark, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -100,
            child: _BlurredBlob(color: AppDesign.accentBlue.withOpacity(0.05), size: 300),
          ),
          
          _loading
              ? const Center(child: CircularProgressIndicator(color: AppDesign.primaryBlue))
              : _prescriptions.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadData,
                      color: AppDesign.primaryBlue,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                        itemCount: _prescriptions.length,
                        itemBuilder: (ctx, i) => _buildPrescriptionCard(_prescriptions[i]),
                      ),
                    ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CustomCard(
            borderRadius: 100,
            padding: const EdgeInsets.all(32),
            color: AppDesign.white,
            child: Icon(Icons.medication_rounded, size: 80, color: AppDesign.accentBlue.withOpacity(0.3)),
          ),
          const SizedBox(height: 32),
          const Text(
            'No prescriptions found',
            style: TextStyle(color: AppDesign.textDark, fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          Text(
            'Your medical prescriptions will appear here.',
            style: TextStyle(color: AppDesign.textLight, fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 24),
          GradientButton(
            width: 200,
            text: 'Go Home',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildPrescriptionCard(PrescriptionModel pres) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: CustomCard(
        padding: EdgeInsets.zero,
        child: Theme(
          data: ThemeData().copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            leading: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppDesign.primaryBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.description_rounded, color: AppDesign.primaryBlue, size: 24),
            ),
            title: Text(
              'Prescription #${pres.id.substring(pres.id.length - 6).toUpperCase()}',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppDesign.textDark),
            ),
            subtitle: Text(
              'Issued on ${DateFormat('MMM dd, yyyy').format(pres.createdAt)}',
              style: const TextStyle(fontSize: 13, color: AppDesign.textLight, fontWeight: FontWeight.w600),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Divider(height: 32, color: AppDesign.lightBlue),
                    const Text(
                      'Medications',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppDesign.textDark),
                    ),
                    const SizedBox(height: 12),
                    ...pres.medications.map((m) => _buildMedItem(m)),
                    if (pres.generalInstructions?.isNotEmpty == true) ...[
                      const SizedBox(height: 20),
                      const Text(
                        'Instructions',
                        style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppDesign.textDark),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppDesign.bgLight,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          pres.generalInstructions!,
                          style: const TextStyle(fontSize: 13, color: AppDesign.textMedium, fontWeight: FontWeight.w500, height: 1.5),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMedItem(MedicationModel med) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 4),
            width: 8, height: 8,
            decoration: const BoxDecoration(color: AppDesign.accentBlue, shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(med.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppDesign.textDark)),
                Text(
                  '${med.dosage} • ${med.frequency} • ${med.duration}',
                  style: const TextStyle(fontSize: 12, color: AppDesign.textMedium, fontWeight: FontWeight.w600),
                ),
                if (med.instructions?.isNotEmpty == true)
                  Text(
                    'Note: ${med.instructions}',
                    style: const TextStyle(fontSize: 11, color: AppDesign.textLight, fontStyle: FontStyle.italic),
                  ),
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
        imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
