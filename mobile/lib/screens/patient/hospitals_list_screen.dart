import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/gradient_button.dart';

class HospitalsListScreen extends StatefulWidget {
  const HospitalsListScreen({super.key});

  @override
  State<HospitalsListScreen> createState() => _HospitalsListScreenState();
}

class _HospitalsListScreenState extends State<HospitalsListScreen> {
  List<dynamic> _hospitals = [];
  bool _loading = true;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchHospitals();
  }

  Future<void> _fetchHospitals() async {
    try {
      final data = await ApiService.get('/hospitals');
      setState(() {
        _hospitals = data as List? ?? [];
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<dynamic> _getFilteredHospitals() {
    final query = _searchCtrl.text.toLowerCase();
    if (query.isEmpty) return _hospitals;
    return _hospitals.where((h) => 
      h['name'].toString().toLowerCase().contains(query) ||
      h['city'].toString().toLowerCase().contains(query)
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppDesign.bgLight,
      appBar: AppBar(
        title: const Text('Healthcare Facilities', style: TextStyle(fontWeight: FontWeight.w900, color: AppDesign.textDark, fontSize: 18)),
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
          Positioned(top: -50, right: -50, child: _BlurredBlob(color: AppDesign.accentBlue.withOpacity(0.05), size: 200)),
          Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                child: CustomCard(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  borderRadius: 20,
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Search city or hospital...',
                      prefixIcon: Icon(Icons.search_rounded, color: AppDesign.accentBlue),
                      filled: false,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: _loading
                    ? const Center(child: CircularProgressIndicator(color: AppDesign.primaryBlue))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                        itemCount: _getFilteredHospitals().length,
                        itemBuilder: (context, index) => _buildHospitalCard(_getFilteredHospitals()[index]),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHospitalCard(dynamic hospital) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: CustomCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppDesign.primaryBlue.withOpacity(0.1), 
                    borderRadius: BorderRadius.circular(16)
                  ),
                  child: const Icon(Icons.local_hospital_rounded, color: AppDesign.primaryBlue),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(hospital['name'], style: const TextStyle(fontWeight: FontWeight.w900, color: AppDesign.textDark, fontSize: 16)),
                      Text('${hospital['city']}, ${hospital['address']}', style: const TextStyle(color: AppDesign.textLight, fontSize: 13, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: AppDesign.lightBlue),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.phone_rounded, size: 14, color: AppDesign.textLight),
                const SizedBox(width: 8),
                Text(hospital['phoneNumber'] ?? 'No contact', style: const TextStyle(fontSize: 12, color: AppDesign.textMedium, fontWeight: FontWeight.bold)),
                const Spacer(),
                TextButton(
                  onPressed: () {}, 
                  child: const Text('View Details', style: TextStyle(color: AppDesign.accentBlue, fontWeight: FontWeight.bold)),
                ),
              ],
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
      width: size, height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: ImageFiltered(imageFilter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
    );
  }
}
