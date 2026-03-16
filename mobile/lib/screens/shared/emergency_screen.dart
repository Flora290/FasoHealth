import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class EmergencyScreen extends StatefulWidget {
  const EmergencyScreen({super.key});

  @override
  State<EmergencyScreen> createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  List<dynamic> _emergencyNumbers = [];
  List<dynamic> _hospitals = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final data = await ApiService.get('/emergency');
      setState(() {
        _emergencyNumbers = data['emergencyNumbers'];
        _hospitals = data['hospitals'];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _callNumber(String number) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: number.replaceAll(' ', ''),
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppConstants.tealBg),
      appBar: AppBar(
        title: const Text('Emergency Services', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(AppConstants.tealDark),
        elevation: 0,
      ),
      body: _loading 
        ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
        : ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const Text(
                'Instant SOS',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tap to call an emergency service immediately.',
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 24),

              // Emergency Numbers Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.3,
                ),
                itemCount: _emergencyNumbers.length,
                itemBuilder: (context, index) {
                  final item = _emergencyNumbers[index];
                  return _buildEmergencyCard(item);
                },
              ),

              const SizedBox(height: 40),
              
              const Text(
                'Nearby Facilities',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(AppConstants.tealDark)),
              ),
              const SizedBox(height: 16),

              ..._hospitals.map((h) => _buildHospitalCard(h)),
            ],
          ),
    );
  }

  Widget _buildEmergencyCard(dynamic item) {
    final isPriority = ['18', '15'].contains(item['number']);
    
    return InkWell(
      onTap: () => _callNumber(item['number']),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isPriority ? const Color(0xFFEF4444).withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isPriority ? const Color(0xFFEF4444).withOpacity(0.2) : Colors.white,
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: isPriority ? Colors.red.withOpacity(0.1) : Colors.black.withOpacity(0.04),
              blurRadius: 10, offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              item['number'],
              style: TextStyle(
                fontSize: 24, 
                fontWeight: FontWeight.w900, 
                color: isPriority ? const Color(0xFFEF4444) : const Color(AppConstants.tealDark)
              ),
            ),
            const SizedBox(height: 4),
            Text(
              item['name'],
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHospitalCard(dynamic h) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(AppConstants.tealBg), borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.location_on, color: Color(AppConstants.tealPrimary)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(h['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(h['city'] ?? 'Burkina Faso', style: const TextStyle(color: Colors.grey, fontSize: 13)),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _callNumber(h['number']),
            icon: const Icon(Icons.phone_in_talk_rounded, color: Colors.green),
            style: IconButton.styleFrom(backgroundColor: Colors.green.withOpacity(0.1)),
          ),
        ],
      ),
    );
  }
}
