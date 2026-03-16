import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/constants.dart';

class SMSManagementScreen extends StatefulWidget {
  const SMSManagementScreen({super.key});

  @override
  State<SMSManagementScreen> createState() => _SMSManagementScreenState();
}

class _SMSManagementScreenState extends State<SMSManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loading = false;
  
  // Mock Data (matching web mocks for parity)
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': '1',
      'type': 'appointment',
      'title': 'Appointment Reminder',
      'message': 'Reminder: Your appointment with Dr. Kabore is tomorrow at 2:00 PM.',
      'phoneNumber': '+226 70 10 20 30',
      'status': 'delivered',
      'sentAt': '2024-03-14 10:00',
    },
    {
      'id': '2',
      'type': 'urgent',
      'title': 'Urgent Change',
      'message': 'URGENT: Your 3:00 PM appointment is rescheduled to 4:30 PM.',
      'phoneNumber': '+226 70 15 25 35',
      'status': 'sent',
      'sentAt': '2024-03-14 09:30',
    },
     {
      'id': '3',
      'type': 'failed',
      'title': 'Payment Failed',
      'message': 'Payment of 15,000 FCFA failed. Please try again.',
      'phoneNumber': '+226 70 25 35 45',
      'status': 'failed',
    }
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('SMS Management', style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(AppConstants.tealDark), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(AppConstants.tealPrimary),
          indicatorColor: const Color(AppConstants.tealPrimary),
          tabs: const [
            Tab(text: 'History'),
            Tab(text: 'Templates'),
            Tab(text: 'Settings'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildHistoryTab(),
          _buildTemplatesTab(),
          _buildSettingsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showSendSMSDialog,
        backgroundColor: const Color(AppConstants.tealPrimary),
        icon: const Icon(Icons.sms_rounded, color: Colors.white),
        label: const Text('Send SMS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildHistoryTab() {
    return Column(
      children: [
        _buildStatsBar(),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(24),
            itemCount: _notifications.length,
            itemBuilder: (context, index) => _buildSMSCard(_notifications[index]),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      color: Colors.grey.shade50,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _statItem('Total', '42', Colors.blue),
          _statItem('Delivered', '38', Colors.green),
          _statItem('Failed', '4', Colors.red),
        ],
      ),
    );
  }

  Widget _statItem(String label, String val, Color color) {
    return Column(
      children: [
        Text(val, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        Text(label, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade400, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildSMSCard(Map<String, dynamic> sms) {
    final statusColor = sms['status'] == 'delivered' ? Colors.green : sms['status'] == 'sent' ? Colors.blue : Colors.red;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(sms['title'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(AppConstants.tealDark))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Text(sms['status'].toUpperCase(), style: TextStyle(fontSize: 10, color: statusColor, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(sms['message'], style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade600)),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.phone_iphone_rounded, size: 14, color: Colors.grey.shade400),
              const SizedBox(width: 4),
              Text(sms['phoneNumber'], style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
              const Spacer(),
              if (sms['sentAt'] != null)
                Text(sms['sentAt'], style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTemplatesTab() {
    return const Center(child: Text('SMS Templates (Feature Ported From Web)'));
  }

  Widget _buildSettingsTab() {
    return const Center(child: Text('SMS Provider Settings'));
  }

  void _showSendSMSDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Send Individual SMS', style: TextStyle(fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(decoration: InputDecoration(hintText: 'Phone Number (+226...)', filled: true, fillColor: Colors.grey.shade50, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
            const SizedBox(height: 12),
            TextField(maxLines: 3, decoration: InputDecoration(hintText: 'Message', filled: true, fillColor: Colors.grey.shade50, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context), style: ElevatedButton.styleFrom(backgroundColor: const Color(AppConstants.tealPrimary)), child: const Text('Send')),
        ],
      ),
    );
  }
}
