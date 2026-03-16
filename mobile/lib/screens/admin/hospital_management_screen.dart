import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/hospital_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class HospitalManagementScreen extends StatefulWidget {
  const HospitalManagementScreen({super.key});

  @override
  State<HospitalManagementScreen> createState() => _HospitalManagementScreenState();
}

class _HospitalManagementScreenState extends State<HospitalManagementScreen> {
  List<HospitalModel> _hospitals = [];
  bool _isLoading = true;
  String? _error;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchHospitals();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchHospitals() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.get('/admin/hospitals');
      setState(() {
        _hospitals = (data as List<dynamic>)
            .map((hospital) => HospitalModel.fromJson(hospital))
            .toList();
        _isLoading = false;
        _error = null;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleHospitalStatus(HospitalModel hospital) async {
    try {
      await ApiService.put('/admin/hospitals/${hospital.id}', {
        'isActive': !hospital.isActive,
      });
      _fetchHospitals();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(hospital.isActive ? 'Hospital deactivated' : 'Hospital activated'),
          backgroundColor: const Color(AppConstants.tealPrimary),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Future<void> _deleteHospital(HospitalModel hospital) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Confirm Delete', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Text('Are you sure you want to delete ${hospital.name}? All associated data may be lost.', 
            style: const TextStyle(fontWeight: FontWeight.w500)),
          actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text('Cancel', style: TextStyle(color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
    );

    if (confirmed == true) {
      try {
        await ApiService.delete('/admin/hospitals/${hospital.id}');
        _fetchHospitals();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Hospital deleted successfully'),
            backgroundColor: Color(AppConstants.tealPrimary),
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  List<HospitalModel> _getFilteredHospitals() {
    final searchQuery = _searchController.text.toLowerCase();
    if (searchQuery.isEmpty) return _hospitals;

    return _hospitals.where((hospital) =>
        hospital.name.toLowerCase().contains(searchQuery) ||
        hospital.city.toLowerCase().contains(searchQuery) ||
        hospital.address.toLowerCase().contains(searchQuery)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Hospital Management',
          style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(AppConstants.tealPrimary)),
            onPressed: _fetchHospitals,
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
          
          Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 12),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
                    ],
                  ),
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    decoration: InputDecoration(
                      hintText: 'Search hospitals...',
                      hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontWeight: FontWeight.w600),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(AppConstants.tealPrimary), size: 22),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.teal.shade50)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.teal.shade50)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Color(AppConstants.tealPrimary), width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                    onChanged: (value) => setState(() {}),
                  ),
                ),
              ),
              
              // Hospitals List
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
                    : _error != null
                        ? _buildErrorState()
                        : RefreshIndicator(
                            onRefresh: _fetchHospitals,
                            color: const Color(AppConstants.tealPrimary),
                            child: ListView.builder(
                              padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                              itemCount: _getFilteredHospitals().length,
                              itemBuilder: (context, index) {
                                return _buildHospitalCard(_getFilteredHospitals()[index]);
                              },
                            ),
                          ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: Container(
        height: 60,
        width: 60,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF0D9488)]),
          boxShadow: [
            BoxShadow(color: const Color(0xFF0D9488).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8)),
          ],
        ),
        child: FloatingActionButton(
          onPressed: () => _showAddHospitalDialog(),
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: const Icon(Icons.add_rounded, color: Colors.white, size: 30),
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_hospital_rounded, size: 64, color: Colors.blueGrey.shade100),
            const SizedBox(height: 16),
            Text(
              _error ?? 'An expected error occurred.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchHospitals,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConstants.tealPrimary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              child: const Text('Try Again', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHospitalCard(HospitalModel hospital) {
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: const Color(AppConstants.tealPrimary).withOpacity(0.05),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.teal.shade50),
                  ),
                  child: hospital.imageUrl.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: Image.network(
                            hospital.imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => 
                              const Icon(Icons.local_hospital_rounded, color: Color(AppConstants.tealPrimary), size: 32),
                          ),
                        )
                      : const Icon(Icons.local_hospital_rounded, color: Color(AppConstants.tealPrimary), size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hospital.name,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        hospital.address,
                        style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${hospital.city}, ${hospital.postalCode}',
                        style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: hospital.isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        hospital.isActive ? 'ACTIVE' : 'INACTIVE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: hospital.isActive ? Colors.green : Colors.red,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Transform.scale(
                      scale: 0.75,
                      child: Switch(
                        value: hospital.isActive,
                        onChanged: (value) => _toggleHospitalStatus(hospital),
                        activeColor: const Color(AppConstants.tealPrimary),
                        activeTrackColor: const Color(AppConstants.tealPrimary).withOpacity(0.2),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (hospital.description.isNotEmpty) ...[
              Text(
                hospital.description,
                style: TextStyle(fontSize: 14, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w500),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 16),
            ],
            if (hospital.specialties.isNotEmpty) ...[
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: hospital.specialties.take(3).map((specialty) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(AppConstants.tealPrimary).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      specialty,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(AppConstants.tealPrimary)),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.people_alt_rounded, size: 16, color: Colors.blueGrey.shade200),
                    const SizedBox(width: 6),
                    Text(
                      '${hospital.totalDoctors} doctors',
                      style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                Text(
                  'Created: ${DateFormat('MMM d, yyyy').format(hospital.createdAt)}',
                  style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w600),
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline_rounded, color: Colors.red.shade200, size: 20),
                  onPressed: () => _deleteHospital(hospital),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddHospitalDialog() {
    showDialog(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Add Hospital', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Healthcare center creation is coming soon to mobile.', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              Text('Please use the central administration web dashboard for adding new facilities.', 
                style: TextStyle(color: Colors.blueGrey.shade300, fontSize: 13, fontWeight: FontWeight.w500)),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close', style: TextStyle(fontWeight: FontWeight.w900)),
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
