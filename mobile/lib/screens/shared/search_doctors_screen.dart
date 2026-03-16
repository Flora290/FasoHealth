import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../models/doctor_model.dart';
import 'book_appointment_screen.dart';

class SearchDoctorsScreen extends StatefulWidget {
  const SearchDoctorsScreen({super.key});

  @override
  State<SearchDoctorsScreen> createState() => _SearchDoctorsScreenState();
}

class _SearchDoctorsScreenState extends State<SearchDoctorsScreen> {
  List<DoctorModel> _doctors = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadDoctors([String query = '']) async {
    setState(() => _loading = true);
    try {
      final path = query.isNotEmpty ? '/search/doctors?q=$query' : '/search/doctors';
      final data = await ApiService.get(path);
      setState(() {
        _doctors = ((data is List ? data : data['doctors']) as List? ?? [])
            .map((e) => DoctorModel.fromJson(e as Map<String, dynamic>))
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
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned(
            top: -100,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.15), size: 300),
          ),
          Positioned(
            bottom: 100,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.1), size: 250),
          ),
          
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Find a Specialist',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Color(AppConstants.tealDark),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0D9488).withOpacity(0.08),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: TextField(
                          controller: _searchCtrl,
                          onSubmitted: _loadDoctors,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          decoration: InputDecoration(
                            hintText: 'Search by name or specialty...',
                            hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontWeight: FontWeight.w500),
                            prefixIcon: const Icon(Icons.search_rounded, color: Color(AppConstants.tealPrimary)),
                            suffixIcon: _searchCtrl.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 20),
                                    onPressed: () {
                                      _searchCtrl.clear();
                                      _loadDoctors();
                                    },
                                  )
                                : null,
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(vertical: 20),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _loading
                      ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
                      : _doctors.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.person_search_rounded, size: 80, color: Colors.teal.shade50),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No specialists found',
                                    style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 16, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              itemCount: _doctors.length,
                              itemBuilder: (_, i) => _DoctorCard(doctor: _doctors[i]),
                            ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DoctorCard extends StatelessWidget {
  final DoctorModel doctor;
  const _DoctorCard({required this.doctor});

  @override
  Widget build(BuildContext context) {
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
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Stack(
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
                      doctor.initials,
                      style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900, fontSize: 18),
                    ),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dr. ${doctor.name}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(AppConstants.tealDark)),
                  ),
                  if (doctor.specialty != null)
                    Text(
                      doctor.specialty!,
                      style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600),
                    ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (doctor.rating > 0) ...[
                        const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          doctor.rating.toStringAsFixed(1),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${doctor.totalReviews})',
                          style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w500),
                        ),
                      ] else ...[
                        Text(
                          'New Specialist',
                          style: TextStyle(fontSize: 12, color: Colors.teal.shade400, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Column(
              children: [
                ElevatedButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookAppointmentScreen(doctor: doctor),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(AppConstants.tealPrimary),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  child: const Text('Book', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
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
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
