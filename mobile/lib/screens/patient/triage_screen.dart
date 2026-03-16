import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/constants.dart';

class TriageScreen extends StatefulWidget {
  const TriageScreen({super.key});

  @override
  State<TriageScreen> createState() => _TriageScreenState();
}

class _TriageScreenState extends State<TriageScreen> {
  final TextEditingController _symptomsCtrl = TextEditingController();
  bool _isAnalyzing = false;
  Map<String, dynamic>? _result;
  final List<Map<String, dynamic>> _history = [];

  @override
  void dispose() {
    _symptomsCtrl.dispose();
    super.dispose();
  }

  void _handleAnalyze() async {
    final text = _symptomsCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _isAnalyzing = true;
      _result = null;
    });

    // Ported Logic from Web (keyword analysis)
    await Future.delayed(const Duration(seconds: 2));

    final lower = text.toLowerCase();
    
    // Urgency
    String urgency = 'medium';
    if (lower.contains('emergency') || lower.contains('urgent') || lower.contains('severe') || lower.contains('heart') || lower.contains('chest')) {
      urgency = 'high';
    } else if (lower.contains('light') || lower.contains('mild')) {
      urgency = 'low';
    }

    // Specialty
    String specialty = 'General Medicine';
    if (lower.contains('heart') || lower.contains('chest') || lower.contains('palpitation')) {
      specialty = 'Cardiology';
    } else if (lower.contains('child') || lower.contains('baby') || lower.contains('pediatrics')) {
      specialty = 'Pediatrics';
    } else if (lower.contains('woman') || lower.contains('pregnancy') || lower.contains('gynecology')) {
      specialty = 'Gynecology';
    } else if (lower.contains('head') || lower.contains('migraine') || lower.contains('neuro')) {
      specialty = 'Neurology';
    } else if (lower.contains('skin') || lower.contains('dermatology')) {
      specialty = 'Dermatology';
    }

    // Recommended Action
    String action = 'Make an appointment with a specialist';
    if (urgency == 'high') {
      action = 'Consult the emergency room immediately';
    } else if (lower.contains('pain')) {
      action = 'Make an appointment within 24 hours';
    }

    // Extract Symptoms
    final common = ['fever', 'pain', 'fatigue', 'headache', 'cough', 'nausea', 'dizziness', 'shortness of breath'];
    final found = common.where((s) => lower.contains(s)).toList();
    if (found.isEmpty) found.add('general symptoms');

    final result = {
      'urgency': urgency,
      'specialty': specialty,
      'recommendedAction': action,
      'symptoms': found,
      'confidence': 80 + (text.length % 19),
      'date': DateTime.now(),
    };

    if (mounted) {
      setState(() {
        _isAnalyzing = false;
        _result = result;
        _history.insert(0, result);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('AI Medical Triage', style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
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
          // Background blobs
          Positioned(top: -100, left: -100, child: _BlurredBlob(color: Colors.blue.withOpacity(0.05), size: 300)),
          Positioned(bottom: -100, right: -100, child: _BlurredBlob(color: Colors.teal.withOpacity(0.05), size: 300)),
          
          SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInputSection(),
                if (_result != null) ...[
                  const SizedBox(height: 32),
                  _buildResultSection(),
                ],
                if (_history.isNotEmpty) ...[
                  const SizedBox(height: 32),
                  _buildHistorySection(),
                ],
                const SizedBox(height: 32),
                _buildEmergencyCard(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8))],
        border: Border.all(color: Colors.teal.shade50),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Describe your symptoms', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 8),
          const Text('Be as precise as possible for a better analysis.', style: TextStyle(fontSize: 14, color: Colors.blueGrey, fontWeight: FontWeight.w500)),
          const SizedBox(height: 20),
          TextField(
            controller: _symptomsCtrl,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'e.g. I have a headache since this morning, with fever...',
              hintStyle: TextStyle(color: Colors.blueGrey.shade200),
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.teal.shade50)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.teal.shade50)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: Color(AppConstants.tealPrimary))),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: _isAnalyzing ? null : _handleAnalyze,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConstants.tealPrimary),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: _isAnalyzing 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                : const Text('Analyze my symptoms', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultSection() {
    final res = _result!;
    final color = res['urgency'] == 'high' ? Colors.red : res['urgency'] == 'medium' ? Colors.orange : Colors.green;
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8))],
        border: Border.all(color: color.withOpacity(0.2), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                res['urgency'] == 'high' ? '🚨 Emergency' : res['urgency'] == 'medium' ? '⚠️ Medium Risk' : '✅ Low Risk',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: Text('${res['confidence']}% Conf.', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _resultItem('Recommended Specialty', res['specialty'], Icons.medical_services_rounded, Colors.blue),
          const SizedBox(height: 16),
          _resultItem('Recommended Action', res['recommendedAction'], Icons.info_rounded, Colors.teal),
          const SizedBox(height: 20),
          const Text('Detected Symptoms', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: (res['symptoms'] as List).map((s) => Chip(
              label: Text(s.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              backgroundColor: Colors.teal.shade50,
              side: BorderSide.none,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _resultItem(String title, String val, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.bold)),
              Text(val, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(AppConstants.tealDark))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recent Analyses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 16),
        ..._history.skip(_result == null ? 0 : 1).take(3).map((item) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              Text(item['urgency'] == 'high' ? '🚨' : '📋', style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['specialty'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(AppConstants.tealDark))),
                    Text((item['symptoms'] as List).join(', '), style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Colors.blueGrey),
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildEmergencyCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Colors.red.shade600, Colors.red.shade800]),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.red.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.white, size: 28),
              SizedBox(width: 12),
              Text('In Case of Emergency', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
            ],
          ),
          SizedBox(height: 16),
          Text('If you are experiencing severe symptoms, dial the emergency number immediately.', 
            style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
          SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _emergencyButton('15', 'Ambulance'),
              _emergencyButton('17', 'Police'),
              _emergencyButton('18', 'Fire'),
            ],
          ),
        ],
      ),
    );
  }

  static Widget _emergencyButton(String num, String label) {
    return Column(
      children: [
        Text(num, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
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
      width: size, height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: ImageFiltered(imageFilter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
    );
  }
}
