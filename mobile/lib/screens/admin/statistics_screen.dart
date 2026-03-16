import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../models/statistics_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  StatisticsModel? _statistics;
  bool _isLoading = true;
  String? _error;

  static const List<Color> chartColors = [
    Color(0xFF0D9488), Color(0xFF14B8A6), Color(0xFF2DD4BF),
    Color(0xFF3B82F6), Color(0xFF6366F1), Color(0xFF8B5CF6),
    Color(0xFFF59E0B), Color(0xFFEF4444),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _fetchStatistics();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Detailed Statistics', style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        flexibleSpace: ClipRect(
          child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10), child: Container(color: Colors.transparent)),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded, color: Color(AppConstants.tealPrimary)), onPressed: _fetchStatistics),
          IconButton(icon: const Icon(Icons.download_rounded, color: Color(AppConstants.tealPrimary)), onPressed: _exportStatistics),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(AppConstants.tealPrimary),
          unselectedLabelColor: Colors.blueGrey.shade200,
          indicatorColor: const Color(AppConstants.tealPrimary),
          indicatorWeight: 3,
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
          tabs: const [
            Tab(text: 'General'),
            Tab(text: 'Appts'),
            Tab(text: 'Doctors'),
            Tab(text: 'Growth'),
          ],
        ),
      ),
      body: Stack(
        children: [
          Positioned(top: -50, left: -100, child: _BlurredBlob(color: const Color(0xFF2DD4BF).withOpacity(0.1), size: 300)),
          Positioned(bottom: -150, right: -100, child: _BlurredBlob(color: const Color(0xFF0D9488).withOpacity(0.08), size: 400)),
          
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
              : _error != null ? _buildErrorState() : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildOverviewTab(),
                    _buildAppointmentsTab(),
                    _buildDoctorsTab(),
                    _buildGrowthTab(),
                  ],
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
            Icon(Icons.error_outline_rounded, size: 64, color: Colors.red.shade200),
            const SizedBox(height: 16),
            Text('Failed to load statistics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.blueGrey.shade700)),
            const SizedBox(height: 8),
            Text(_error ?? 'Unknown error', textAlign: TextAlign.center, style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w500)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchStatistics,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConstants.tealPrimary), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15))),
              child: const Text('Try Again', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewTab() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text('System Snapshot', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 20),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.1,
          children: [
            _buildSummaryCard('Users', '${_statistics!.totalUsers}', Icons.people_rounded, const Color(0xFF3B82F6), 'Active: ${_statistics!.activePatients}'),
            _buildSummaryCard('Doctors', '${_statistics!.totalDoctors}', Icons.medical_services_rounded, const Color(0xFF10B981), 'Verified'),
            _buildSummaryCard('Patients', '${_statistics!.totalPatients}', Icons.person_rounded, const Color(0xFFF59E0B), 'Active: ${_statistics!.activePatients}'),
            _buildSummaryCard('Hospitals', '${_statistics!.totalHospitals}', Icons.local_hospital_rounded, const Color(0xFF8B5CF6), 'Healthcare units'),
            _buildSummaryCard('Specialties', '${_statistics!.totalSpecialties}', Icons.category_rounded, const Color(0xFFEF4444), 'Medical branches'),
            _buildSummaryCard('Appointments', '${_statistics!.totalAppointments}', Icons.calendar_today_rounded, const Color(0xFF0D9488), 'Rate: ${_statistics!.completionRate.toStringAsFixed(1)}%'),
          ],
        ),
        const SizedBox(height: 32),
        const Text('Recent Highlights', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 16),
        _buildGrowthCards(),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon, Color color, String subtitle) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Icon(icon, color: color, size: 20),
                ),
                Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
              ],
            ),
            const SizedBox(height: 12),
            Text(title, style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(fontSize: 10, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Appointment Breakdown', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 24),
          _buildAppointmentStats(),
          const SizedBox(height: 32),
          _buildAppointmentChart(),
        ],
      ),
    );
  }

  Widget _buildAppointmentStats() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Status Distribution', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 24),
          Row(
            children: [
              SizedBox(
                width: 140,
                height: 140,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 4,
                    centerSpaceRadius: 35,
                    sections: _statistics!.appointmentsByStatus.asMap().entries.map((entry) {
                      return PieChartSectionData(
                        color: chartColors[entry.key % chartColors.length],
                        value: entry.value.count.toDouble(),
                        title: '${entry.value.percentage.toStringAsFixed(0)}%',
                        radius: 40,
                        titleStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                  children: _statistics!.appointmentsByStatus.asMap().entries.map((entry) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Container(width: 10, height: 10, decoration: BoxDecoration(color: chartColors[entry.key % chartColors.length], shape: BoxShape.circle)),
                          const SizedBox(width: 8),
                          Expanded(child: Text(entry.value.status, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.blueGrey.shade600))),
                          Text('${entry.value.count}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentChart() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Monthly Volume', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 24),
          SizedBox(height: 200, child: _buildSimpleChart()),
        ],
      ),
    );
  }

  Widget _buildSimpleChart() {
    final data = _statistics!.appointmentsByMonth;
    if (data.isEmpty) return const Center(child: Text('No volume data available'));

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (val, meta) => Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(data[val.toInt()].month, style: TextStyle(fontSize: 9, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w900)),
              ),
              reservedSize: 30,
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (val, meta) => Text(val.toInt().toString(), style: TextStyle(fontSize: 9, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w900)),
              reservedSize: 28,
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.count.toDouble())).toList(),
            isCurved: true,
            color: const Color(AppConstants.tealPrimary),
            barWidth: 4,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: true, gradient: LinearGradient(colors: [const Color(AppConstants.tealPrimary).withOpacity(0.2), const Color(AppConstants.tealPrimary).withOpacity(0.0)], begin: Alignment.topCenter, end: Alignment.bottomCenter)),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorsTab() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text('Provider Insights', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 24),
        _buildSpecialtyChart(),
        const SizedBox(height: 32),
        const Text('Top Performing Doctors', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 16),
        ..._statistics!.topDoctors.map((doctor) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))]),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              radius: 25,
              backgroundColor: const Color(AppConstants.tealBg),
              child: Text(doctor.name[0].toUpperCase(), style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900)),
            ),
            title: Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
            subtitle: Text(doctor.specialty, style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600, fontSize: 13)),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('${doctor.appointmentCount} Appts', style: const TextStyle(color: Color(AppConstants.tealPrimary), fontWeight: FontWeight.w900, fontSize: 12)),
                Row(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.star_rounded, size: 14, color: Colors.amber), const SizedBox(width: 4), Text(doctor.averageRating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11))]),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildSpecialtyChart() {
    final data = _statistics!.specialtiesBreakdown;
    if (data.isEmpty) return const Center(child: Text('No specialty metrics available'));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Specialists by Department', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: (data.map((e) => e.count).reduce((a, b) => a > b ? a : b) * 1.2).toDouble(),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, m) => Padding(padding: const EdgeInsets.only(top: 8), child: Text(data[v.toInt()].name.substring(0, data[v.toInt()].name.length > 5 ? 5 : data[v.toInt()].name.length), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.blueGrey.shade200))))),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28, getTitlesWidget: (v, m) => Text(v.toInt().toString(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.blueGrey.shade200)))),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: data.asMap().entries.map((entry) => BarChartGroupData(x: entry.key, barRods: [BarChartRodData(toY: entry.value.count.toDouble(), color: chartColors[entry.key % chartColors.length], width: 14, borderRadius: BorderRadius.circular(4))])).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGrowthTab() {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text('Growth Performance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 24),
        _buildGrowthChart(),
        const SizedBox(height: 32),
        const Text('Temporal Distribution', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        const SizedBox(height: 16),
        _buildGrowthCards(),
      ],
    );
  }

  Widget _buildGrowthChart() {
    final data = _statistics!.userGrowth;
    if (data.isEmpty) return const Center(child: Text('Growth trends unavailable'));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 10))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('User Adoption Trends', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, m) => Padding(padding: const EdgeInsets.only(top: 10), child: Text(data[v.toInt()].date, style: TextStyle(fontSize: 9, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w900))))),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.patients.toDouble())).toList(), isCurved: true, color: const Color(0xFF10B981), barWidth: 3, dotData: const FlDotData(show: false)),
                  LineChartBarData(spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.doctors.toDouble())).toList(), isCurved: true, color: const Color(0xFF3B82F6), barWidth: 3, dotData: const FlDotData(show: false)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem('Patients', const Color(0xFF10B981)),
              const SizedBox(width: 24),
              _buildLegendItem('Doctors', const Color(0xFF3B82F6)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(children: [Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)), const SizedBox(width: 6), Text(label, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700))]);
  }

  Widget _buildGrowthCards() {
    return Column(
      children: [
        _buildTrendCard("Today's Activity", _statistics!.todayAppointments, Icons.today_rounded, const Color(0xFF3B82F6)),
        const SizedBox(height: 12),
        _buildTrendCard("Weekly Progress", _statistics!.weeklyAppointments, Icons.date_range_rounded, const Color(0xFF10B981)),
        const SizedBox(height: 12),
        _buildTrendCard("Monthly Target", _statistics!.monthlyAppointments, Icons.calendar_month_rounded, const Color(0xFFF59E0B)),
      ],
    );
  }

  Widget _buildTrendCard(String title, int value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))]),
      child: Row(
        children: [
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)), child: Icon(icon, color: color, size: 22)),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w700)),
                Text('$value Appointments', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _exportStatistics() {
    showDialog(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Export Data', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Select export format:', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _exportButton(Icons.picture_as_pdf_rounded, 'PDF', () => Navigator.pop(context)),
                  _exportButton(Icons.table_chart_rounded, 'Excel', () => Navigator.pop(context)),
                ],
              ),
            ],
          ),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.w900)))],
        ),
      ),
    );
  }

  Widget _exportButton(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(AppConstants.tealBg), borderRadius: BorderRadius.circular(16)), child: Icon(icon, color: const Color(AppConstants.tealPrimary))),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
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
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: ImageFiltered(imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90), child: Container(color: Colors.transparent)),
    );
  }
}
