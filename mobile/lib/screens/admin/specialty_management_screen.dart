import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/specialty_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class SpecialtyManagementScreen extends StatefulWidget {
  const SpecialtyManagementScreen({super.key});

  @override
  State<SpecialtyManagementScreen> createState() => _SpecialtyManagementScreenState();
}

class _SpecialtyManagementScreenState extends State<SpecialtyManagementScreen> {
  List<SpecialtyModel> _specialties = [];
  bool _isLoading = true;
  String? _error;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchSpecialties();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchSpecialties() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.get('/specialties');
      setState(() {
        _specialties = (data['specialties'] as List<dynamic>)
            .map((specialty) => SpecialtyModel.fromJson(specialty))
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

  Future<void> _toggleSpecialtyStatus(SpecialtyModel specialty) async {
    try {
      await ApiService.put('/specialties/${specialty.id}/toggle-active', {});
      _fetchSpecialties();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(specialty.isActive ? 'Specialty deactivated' : 'Specialty activated'),
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

  Future<void> _deleteSpecialty(SpecialtyModel specialty) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Confirm Delete', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Text('Are you sure you want to delete the ${specialty.name} specialty?', 
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
        await ApiService.delete('/specialties/${specialty.id}');
        _fetchSpecialties();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Specialty deleted successfully'),
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

  List<SpecialtyModel> _getFilteredSpecialties() {
    final searchQuery = _searchController.text.toLowerCase();
    if (searchQuery.isEmpty) return _specialties;

    return _specialties.where((specialty) =>
        specialty.name.toLowerCase().contains(searchQuery) ||
        specialty.description.toLowerCase().contains(searchQuery)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Specialty Management',
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
            onPressed: _fetchSpecialties,
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned(
            top: -50,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.1), size: 300),
          ),
          Positioned(
            bottom: -150,
            right: -100,
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
                      hintText: 'Search specialties...',
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
              
              // Specialties List
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
                    : _error != null
                        ? _buildErrorState()
                        : RefreshIndicator(
                            onRefresh: _fetchSpecialties,
                            color: const Color(AppConstants.tealPrimary),
                            child: ListView.builder(
                              padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                              itemCount: _getFilteredSpecialties().length,
                              itemBuilder: (context, index) {
                                return _buildSpecialtyCard(_getFilteredSpecialties()[index]);
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
          onPressed: () => _showAddSpecialtyDialog(),
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
            Icon(Icons.category_rounded, size: 64, color: Colors.blueGrey.shade100),
            const SizedBox(height: 16),
            Text(
              _error ?? 'An expected error occurred.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchSpecialties,
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

  Widget _buildSpecialtyCard(SpecialtyModel specialty) {
    Color specialtyColor = Color(int.parse(specialty.color.replaceAll('#', '0xFF')));
    
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
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: specialtyColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: specialtyColor.withOpacity(0.1)),
                  ),
                  child: Icon(
                    _getIconData(specialty.icon),
                    color: specialtyColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        specialty.name,
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                      ),
                      if (specialty.description.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          specialty.description,
                          style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w500),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: specialty.isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        specialty.isActive ? 'ACTIVE' : 'INACTIVE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: specialty.isActive ? Colors.green : Colors.red,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Transform.scale(
                      scale: 0.75,
                      child: Switch(
                        value: specialty.isActive,
                        onChanged: (value) => _toggleSpecialtyStatus(specialty),
                        activeColor: const Color(AppConstants.tealPrimary),
                        activeTrackColor: const Color(AppConstants.tealPrimary).withOpacity(0.2),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.medical_services_rounded, size: 16, color: Colors.blueGrey.shade200),
                    const SizedBox(width: 6),
                    Text(
                      '${specialty.totalDoctors} doctors',
                      style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                Text(
                  'Updated: ${DateFormat('MMM d').format(specialty.updatedAt)}',
                  style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w600),
                ),
                IconButton(
                  icon: Icon(Icons.delete_outline_rounded, color: Colors.red.shade200, size: 20),
                  onPressed: () => _deleteSpecialty(specialty),
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

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'medical_services':
        return Icons.medical_services_rounded;
      case 'favorite':
        return Icons.favorite_rounded;
      case 'healing':
        return Icons.healing_rounded;
      case 'health_and_safety':
        return Icons.health_and_safety_rounded;
      case 'monitor_heart':
        return Icons.monitor_heart_rounded;
      case 'psychology':
        return Icons.psychology_rounded;
      case 'pregnant_woman':
        return Icons.pregnant_woman_rounded;
      case 'child_care':
        return Icons.child_care_rounded;
      case 'elderly':
        return Icons.elderly_rounded;
      case 'accessibility':
        return Icons.accessibility_rounded;
      default:
        return Icons.medical_services_rounded;
    }
  }

  void _showAddSpecialtyDialog() {
    showDialog(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Add Specialty', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Coming soon to mobile.', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              Text('Please use the web platform to manage healthcare specialties.', 
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
