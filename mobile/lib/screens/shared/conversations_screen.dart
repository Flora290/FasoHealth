import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';
import '../../providers/auth_provider.dart';
import 'chat_screen.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  List<dynamic> _conversations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    try {
      // Use confirmed appointments as basis for conversations, same as web
      final data = await ApiService.get('/appointments/my?status=confirmed&limit=20');
      setState(() {
        _conversations = (data['appointments'] as List? ?? []).map((apt) => {
          'id': apt['_id'],
          'doctor': apt['doctor'],
          'specialty': apt['specialty'],
          'lastMessage': null, // Fetching last message could be a future enhancement
        }).toList();
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
          : _conversations.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  itemCount: _conversations.length,
                  itemBuilder: (context, index) => _buildConversationCard(_conversations[index]),
                ),
    );
  }

  Widget _buildConversationCard(dynamic conv) {
    final doctor = conv['doctor'];
    final specialty = conv['specialty']?['name'] ?? 'Doctor';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 6))],
        border: Border.all(color: Colors.teal.shade50),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(color: const Color(AppConstants.tealPrimary).withOpacity(0.1), shape: BoxShape.circle),
          child: const Center(child: Text('🩺', style: TextStyle(fontSize: 24))),
        ),
        title: Text(
          doctor['name'] ?? 'Doctor',
          style: const TextStyle(fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
        ),
        subtitle: Text(
          specialty,
          style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600, fontSize: 13),
        ),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatScreen(
              recipientId: doctor['_id'],
              recipientName: doctor['name'],
              appointmentId: conv['id'],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('💬', style: TextStyle(fontSize: 64)),
          const SizedBox(height: 16),
          const Text('No conversations yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
          const SizedBox(height: 8),
          const Text('Your confirmed doctors will appear here', style: TextStyle(color: Colors.blueGrey, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
