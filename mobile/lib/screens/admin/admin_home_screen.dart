import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/statistics_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import 'user_management_screen.dart';
import 'hospital_management_screen.dart';
import 'specialty_management_screen.dart';
import 'statistics_screen.dart';
import 'cashier_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  StatisticsModel? _statistics;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchStatistics();
  }

  Future<void> _fetchStatistics() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.get('/admin/mobile-statistics');
      setState(() {
        _statistics = StatisticsModel.fromJson(data);
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

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Admin Dashboard',
          style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        centerTitle: true,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(AppConstants.tealPrimary)),
            onPressed: _fetchStatistics,
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded, color: Color(AppConstants.tealPrimary)),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            onSelected: (value) {
              if (value == 'logout') auth.logout();
            },
            itemBuilder: (BuildContext context) => [
              PopupMenuItem<String>(
                value: 'logout',
                child: Row(
                  children: [
                    const Icon(Icons.logout_rounded, size: 20, color: Colors.redAccent),
                    const SizedBox(width: 12),
                    const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            right: -100,
            child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.12), size: 400),
          ),
          Positioned(
            bottom: -150,
            left: -100,
            child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.08), size: 500),
          ),
          
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
              : _error != null
                  ? _buildErrorState()
                  : RefreshIndicator(
                      onRefresh: _fetchStatistics,
                      color: const Color(AppConstants.tealPrimary),
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Welcome Section
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF14B8A6), Color(0xFF0D9488)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF0D9488).withOpacity(0.3),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Welcome, Admin 👋',
                                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Manage and monitor your healthcare platform performance.',
                                    style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.9), fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 32),

                            // Statistics Grid
                            _buildStatisticsGrid(),
                            const SizedBox(height: 32),

                            // Quick Actions
                            _buildQuickActions(),
                            const SizedBox(height: 32),

                            // Top Doctors Section
                            if (_statistics != null && _statistics!.topDoctors.isNotEmpty)
                              _buildTopDoctors(),
                            const SizedBox(height: 40),
                          ],
                        ),
                      ),
                    ),
        ],
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
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle),
              child: Icon(Icons.error_outline_rounded, size: 50, color: Colors.red.shade300),
            ),
            const SizedBox(height: 24),
            const Text(
              'Failed to load insights',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
            ),
            const SizedBox(height: 12),
            Text(
              _error ?? 'An unexpected error occurred.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _fetchStatistics,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConstants.tealPrimary),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              child: const Text('Try Again', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatisticsGrid() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Platform Insights',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.2,
          children: [
            _buildStatCard('Total Users', '${_statistics!.totalUsers}', Icons.group_rounded, Colors.blueAccent),
            _buildStatCard('Doctors', '${_statistics!.totalDoctors}', Icons.medical_services_rounded, Colors.teal),
            _buildStatCard('Patients', '${_statistics!.totalPatients}', Icons.person_rounded, Colors.orangeAccent),
            _buildStatCard('Hospitals', '${_statistics!.totalHospitals}', Icons.local_hospital_rounded, Colors.purpleAccent),
            _buildStatCard('Specialties', '${_statistics!.totalSpecialties}', Icons.category_rounded, Colors.redAccent),
            _buildStatCard('Appointments', '${_statistics!.totalAppointments}', Icons.calendar_today_rounded, Colors.indigoAccent),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, color: color, size: 18),
                ),
                const Spacer(),
                Text(
                  value,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                ),
              ],
            ),
            const Spacer(),
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.1,
          children: [
            _buildActionCard(
              'Users',
              'Manage all accounts',
              Icons.manage_accounts_rounded,
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UserManagementScreen())),
            ),
            _buildActionCard(
              'Hospitals',
              'Healthcare centers',
              Icons.business_rounded,
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HospitalManagementScreen())),
            ),
            _buildActionCard(
              'Specialties',
              'Medical categories',
              Icons.auto_awesome_motion_rounded,
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SpecialtyManagementScreen())),
            ),
            _buildActionCard(
              'Analytics',
              'Detailed reports',
              Icons.bar_chart_rounded,
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StatisticsScreen())),
            ),
            _buildActionCard(
              'SMS Management',
              'Notifications & history',
              Icons.sms_rounded,
              () => Navigator.pushNamed(context, '/sms'),
            ),
            _buildActionCard(
              'Cashier',
              'Payment transactions',
              Icons.payments_rounded,
              () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CashierScreen())),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(String title, String description, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(AppConstants.tealPrimary).withOpacity(0.1)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5)),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, color: const Color(AppConstants.tealPrimary), size: 24),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopDoctors() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Top Consulted Doctors',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 8)),
            ],
          ),
          child: Column(
            children: _statistics!.topDoctors.take(5).map((doctor) {
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                leading: Container(
                  padding: const EdgeInsets.all(1.5),
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(colors: [Color(0xFF2DD4BF), Color(0xFF0D9488)]),
                  ),
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Text(
                      doctor.name[0].toUpperCase(),
                      style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
                title: Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(AppConstants.tealDark))),
                subtitle: Text(doctor.specialty, style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600, fontSize: 12)),
                trailing: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${doctor.appointmentCount} appts',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(AppConstants.tealPrimary)),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          doctor.averageRating.toStringAsFixed(1),
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
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
