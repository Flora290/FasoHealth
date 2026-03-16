import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class CashierScreen extends StatefulWidget {
  const CashierScreen({super.key});

  @override
  State<CashierScreen> createState() => _CashierScreenState();
}

class _CashierScreenState extends State<CashierScreen> {
  List<dynamic> _payments = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchPayments();
  }

  Future<void> _fetchPayments() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final data = await ApiService.get('/payments');
      setState(() {
        _payments = data is List ? data : [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  double get _totalConfirmed => _payments
      .where((p) => p['status'] == 'completed')
      .fold(0.0, (sum, p) => sum + ((p['amount'] ?? 0) as num).toDouble());

  double get _totalPending => _payments
      .where((p) => p['status'] == 'pending')
      .fold(0.0, (sum, p) => sum + ((p['amount'] ?? 0) as num).toDouble());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Cashier',
          style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        backgroundColor: Colors.white.withOpacity(0.9),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(AppConstants.tealPrimary)),
            onPressed: _fetchPayments,
          ),
        ],
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: -80,
            right: -80,
            child: _Blob(color: const Color(0xFF4ADE80).withOpacity(0.10), size: 300),
          ),
          Positioned(
            bottom: -100,
            left: -80,
            child: _Blob(color: const Color(0xFF14B8A6).withOpacity(0.08), size: 350),
          ),
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
              : _error != null
                  ? _buildError()
                  : RefreshIndicator(
                      onRefresh: _fetchPayments,
                      color: const Color(AppConstants.tealPrimary),
                      child: ListView(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                        children: [
                          // Stats Cards
                          Row(
                            children: [
                              Expanded(child: _statCard(
                                'Confirmed',
                                '${_totalConfirmed.toStringAsFixed(0)} F',
                                Icons.check_circle_rounded,
                                const Color(0xFF16A34A),
                                const Color(0xFFDCFCE7),
                              )),
                              const SizedBox(width: 12),
                              Expanded(child: _statCard(
                                'Pending',
                                '${_totalPending.toStringAsFixed(0)} F',
                                Icons.hourglass_top_rounded,
                                const Color(0xFFD97706),
                                const Color(0xFFFEF3C7),
                              )),
                            ],
                          ),
                          const SizedBox(height: 12),
                          _statCard(
                            'Total Transactions',
                            '${_payments.length}',
                            Icons.receipt_long_rounded,
                            const Color(AppConstants.tealPrimary),
                            const Color(0xFFCCFBF1),
                          ),
                          const SizedBox(height: 28),

                          // Transactions List
                          Row(
                            children: [
                              const Text(
                                'Transactions',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                              ),
                              const Spacer(),
                              Text(
                                '${_payments.length} records',
                                style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          if (_payments.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(40),
                              alignment: Alignment.center,
                              child: Column(
                                children: [
                                  Icon(Icons.receipt_long_rounded, size: 60, color: Colors.blueGrey.shade100),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No transactions yet',
                                    style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                ],
                              ),
                            )
                          else
                            ..._payments.map((p) => _buildPaymentTile(p)),
                        ],
                      ),
                    ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.15), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color.withOpacity(0.7))),
                Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentTile(dynamic p) {
    final status = p['status'] ?? 'pending';
    final isConfirmed = status == 'completed';
    final provider = (p['provider'] ?? 'Unknown').toString().toUpperCase();
    final amount = p['amount'] ?? 0;
    final patientName = p['user']?['name'] ?? 'Unknown Patient';
    final doctorName = p['appointment']?['doctor']?['name'] ?? 'N/A';
    final date = p['createdAt'] != null
        ? DateTime.tryParse(p['createdAt'])?.toLocal()
        : null;
    final dateStr = date != null
        ? '${date.day}/${date.month}/${date.year}'
        : '—';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isConfirmed ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isConfirmed ? Icons.check_circle_rounded : Icons.hourglass_top_rounded,
              color: isConfirmed ? const Color(0xFF16A34A) : const Color(0xFFD97706),
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(patientName, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(AppConstants.tealDark))),
                const SizedBox(height: 2),
                Text('Dr. $doctorName', style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blueGrey.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(provider, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.blueGrey.shade500, letterSpacing: 0.5)),
                    ),
                    const SizedBox(width: 6),
                    Text(dateStr, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$amount F',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                  color: isConfirmed ? const Color(0xFF16A34A) : const Color(AppConstants.tealDark),
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isConfirmed ? const Color(0xFFDCFCE7) : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isConfirmed ? 'PAID' : 'PENDING',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    color: isConfirmed ? const Color(0xFF16A34A) : const Color(0xFFD97706),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded, size: 64, color: Colors.red.shade200),
            const SizedBox(height: 16),
            Text(_error ?? 'Error loading payments',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchPayments,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(AppConstants.tealPrimary),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text('Retry', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  final Color color;
  final double size;
  const _Blob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
