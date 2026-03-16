import 'dart:ui';
import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../core/api_service.dart';
import '../../core/constants.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<UserModel> _patients = [];
  List<UserModel> _doctors = [];
  List<UserModel> _allUsers = [];
  bool _isLoading = true;
  String? _error;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchUsers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchUsers() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.get('/admin/users');
      setState(() {
        _allUsers = (data['users'] as List<dynamic>)
            .map((user) => UserModel.fromJson(user))
            .toList();
        _patients = _allUsers.where((user) => user.isPatient).toList();
        _doctors = _allUsers.where((user) => user.isDoctor).toList();
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

  Future<void> _toggleUserStatus(UserModel user) async {
    try {
      await ApiService.put('/admin/users/${user.id}', {
        'isActive': !user.isActive,
      });
      _fetchUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(user.isActive ? 'User deactivated' : 'User activated'),
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

  Future<void> _addUser(Map<String, dynamic> userData) async {
    try {
      await ApiService.post('/admin/users', userData);
      _fetchUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('User created successfully'),
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

  Future<void> _updateUser(String userId, Map<String, dynamic> userData) async {
    try {
      await ApiService.put('/admin/users/$userId', userData);
      _fetchUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('User updated successfully'),
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

  Future<void> _updateUserRole(UserModel user, String newRole) async {
    try {
      await ApiService.put('/admin/users/${user.id}', {
        'role': newRole,
      });
      _fetchUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Role updated to $newRole'),
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

  Future<void> _deleteUser(UserModel user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          title: const Text('Confirm Delete', style: TextStyle(fontWeight: FontWeight.w900)),
          content: Text('Are you sure you want to delete ${user.name}? This action cannot be undone.', 
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
        await ApiService.delete('/admin/users/${user.id}');
        _fetchUsers();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('User deleted successfully'),
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

  List<UserModel> _getFilteredUsers(String role) {
    final searchQuery = _searchController.text.toLowerCase();
    List<UserModel> users;
    
    if (role == 'patient') {
      users = _patients;
    } else if (role == 'doctor') {
      users = _doctors;
    } else {
      users = _allUsers;
    }

    if (searchQuery.isEmpty) return users;

    return users.where((user) =>
        user.name.toLowerCase().contains(searchQuery) ||
        user.email.toLowerCase().contains(searchQuery)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'User Management',
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
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(AppConstants.tealPrimary),
          unselectedLabelColor: Colors.blueGrey.shade200,
          indicatorColor: const Color(AppConstants.tealPrimary),
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
          indicatorSize: TabBarIndicatorSize.label,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Patients'),
            Tab(text: 'Doctors'),
          ],
        ),
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
                      hintText: 'Search users...',
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
              
              // Users List
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.tealPrimary)))
                    : _error != null
                        ? _buildErrorState()
                        : TabBarView(
                            controller: _tabController,
                            children: [
                              _buildUsersList(_getFilteredUsers('all')),
                              _buildUsersList(_getFilteredUsers('patient')),
                              _buildUsersList(_getFilteredUsers('doctor')),
                            ],
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
          onPressed: () => _showAddUserDialog(),
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
            Icon(Icons.error_outline_rounded, size: 64, color: Colors.red.shade200),
            const SizedBox(height: 16),
            Text(
              _error ?? 'An error occurred',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _fetchUsers,
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

  Widget _buildUsersList(List<UserModel> users) {
    if (users.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.manage_accounts_rounded, size: 80, color: Colors.blueGrey.shade50),
            const SizedBox(height: 16),
            Text(
              'No users found',
              style: TextStyle(fontSize: 16, color: Colors.blueGrey.shade200, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchUsers,
      color: const Color(AppConstants.tealPrimary),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
        itemCount: users.length,
        itemBuilder: (context, index) {
          return _buildUserCard(users[index]);
        },
      ),
    );
  }

  Widget _buildUserCard(UserModel user) {
    Color roleColor = user.isDoctor ? Colors.teal : user.isPatient ? Colors.blue : Colors.purple;
    
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
                  padding: const EdgeInsets.all(1.5),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(colors: [roleColor.withOpacity(0.4), roleColor]),
                  ),
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Text(
                      user.name[0].toUpperCase(),
                      style: TextStyle(color: roleColor, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark)),
                      ),
                      Text(
                        user.email,
                        style: TextStyle(fontSize: 13, color: Colors.blueGrey.shade300, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: roleColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    user.role.toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: roleColor, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              children: [
                if (user.phoneNumber != null) ...[
                  Icon(Icons.phone_rounded, size: 14, color: Colors.blueGrey.shade200),
                  const SizedBox(width: 6),
                  Text(user.phoneNumber!, style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w600)),
                ],
                const Spacer(),
                if (!user.isActive && user.isDoctor)
                  ElevatedButton(
                    onPressed: () => _toggleUserStatus(user),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(AppConstants.tealPrimary),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                      minimumSize: const Size(0, 32),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                    ),
                    child: const Text('Approve', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3)),
                  )
                else ...[
                  Text(
                    user.isActive ? 'Active' : 'Inactive',
                    style: TextStyle(
                      fontSize: 12, 
                      fontWeight: FontWeight.w800, 
                      color: user.isActive ? const Color(AppConstants.tealPrimary) : Colors.redAccent.withOpacity(0.5)
                    ),
                  ),
                  const SizedBox(width: 4),
                  Transform.scale(
                    scale: 0.7,
                    child: Switch(
                      value: user.isActive,
                      onChanged: (value) => _toggleUserStatus(user),
                      activeColor: const Color(AppConstants.tealPrimary),
                      activeTrackColor: const Color(AppConstants.tealPrimary).withOpacity(0.2),
                      inactiveThumbColor: Colors.blueGrey.shade100,
                      inactiveTrackColor: Colors.blueGrey.shade50,
                    ),
                  ),
                ],
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert_rounded, color: Colors.blueGrey.shade200, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onSelected: (value) {
                    if (value == 'delete') {
                      _deleteUser(user);
                    } else if (value == 'edit') {
                      _showEditUserDialog(user);
                    } else if (value == 'view') {
                      _showUserDetailsSheet(user);
                    } else {
                      _updateUserRole(user, value);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'view',
                      child: Row(
                        children: [
                          Icon(Icons.visibility_rounded, size: 18, color: Color(AppConstants.tealPrimary)),
                          SizedBox(width: 8),
                          Text('View Details'),
                        ],
                      ),
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit_rounded, size: 18, color: Color(AppConstants.tealPrimary)),
                          SizedBox(width: 8),
                          Text('Edit Profile'),
                        ],
                      ),
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem(value: 'patient', child: Text('Set as Patient')),
                    const PopupMenuItem(value: 'doctor', child: Text('Set as Doctor')),
                    const PopupMenuDivider(),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, size: 18, color: Colors.redAccent),
                          SizedBox(width: 8),
                          Text('Delete User', style: TextStyle(color: Colors.redAccent)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showUserDetailsSheet(UserModel user) {
    final roleColor = user.isDoctor ? Colors.teal : user.isPatient ? Colors.blue : Colors.purple;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40, height: 4,
                  margin: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(color: Colors.blueGrey.shade100, borderRadius: BorderRadius.circular(4)),
                ),
              ),
              // Header Avatar
              Center(
                child: Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(colors: [roleColor.withOpacity(0.4), roleColor]),
                  ),
                  child: CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.white,
                    child: Text(
                      user.name[0].toUpperCase(),
                      style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: roleColor),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(user.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(AppConstants.tealDark))),
              ),
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: roleColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    user.role.toUpperCase(),
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: roleColor, letterSpacing: 1),
                  ),
                ),
              ),
              const SizedBox(height: 28),
              // Detail Rows
              _detailRow(Icons.email_rounded, 'Email', user.email),
              _detailRow(Icons.phone_rounded, 'Phone', user.phoneNumber ?? 'Not provided'),
              if (user.isDoctor)
                _detailRow(Icons.medical_services_rounded, 'Specialty', user.specialty ?? '—'),
              _detailRow(
                user.isActive ? Icons.check_circle_rounded : Icons.cancel_rounded,
                'Account Status',
                user.isActive ? 'Active' : 'Inactive',
                valueColor: user.isActive ? Colors.green : Colors.redAccent,
              ),
              _detailRow(
                Icons.shield_rounded,
                'KYC Status',
                'Pending',
              ),
              _detailRow(Icons.calendar_today_rounded, 'User ID', user.id),
              const SizedBox(height: 24),
              // Close Button
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(AppConstants.tealPrimary),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  elevation: 0,
                ),
                child: const Text('Close', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(AppConstants.tealPrimary).withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: const Color(AppConstants.tealPrimary)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: valueColor ?? const Color(AppConstants.tealDark),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showEditUserDialog(UserModel user) {
    final nameCtrl = TextEditingController(text: user.name);
    final emailCtrl = TextEditingController(text: user.email);
    final phoneCtrl = TextEditingController(text: user.phoneNumber ?? '');
    final specialtyCtrl = TextEditingController(text: user.specialty ?? '');
    String selectedRole = user.role;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            title: const Text('Edit User Profile', style: TextStyle(fontWeight: FontWeight.w900)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _dialogField(nameCtrl, 'Full Name', Icons.person_rounded),
                  const SizedBox(height: 12),
                  _dialogField(emailCtrl, 'Email', Icons.email_rounded, keyboardType: TextInputType.emailAddress),
                  const SizedBox(height: 12),
                  _dialogField(phoneCtrl, 'Phone (Optional)', Icons.phone_rounded, keyboardType: TextInputType.phone),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedRole,
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down_rounded),
                        onChanged: (val) => setModalState(() => selectedRole = val!),
                        items: const [
                          DropdownMenuItem(value: 'patient', child: Text('Patient')),
                          DropdownMenuItem(value: 'doctor', child: Text('Doctor')),
                        ],
                      ),
                    ),
                  ),
                  if (selectedRole == 'doctor') ...[
                    const SizedBox(height: 12),
                    _dialogField(specialtyCtrl, 'Specialty', Icons.medical_services_rounded),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    'Note: Changing roles may affect user permissions.',
                    style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade300, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancel', style: TextStyle(color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
              ),
              ElevatedButton(
                onPressed: () {
                  final data = {
                    'name': nameCtrl.text.trim(),
                    'email': emailCtrl.text.trim(),
                    'phoneNumber': phoneCtrl.text.trim(),
                    'role': selectedRole,
                  };
                  if (selectedRole == 'doctor') {
                    data['specialty'] = specialtyCtrl.text.trim();
                  }
                  _updateUser(user.id, data);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(AppConstants.tealPrimary),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAddUserDialog() {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final specialtyCtrl = TextEditingController();
    String selectedRole = 'patient';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            title: const Text('Add New User', style: TextStyle(fontWeight: FontWeight.w900)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _dialogField(nameCtrl, 'Full Name', Icons.person_rounded),
                  const SizedBox(height: 12),
                  _dialogField(emailCtrl, 'Email', Icons.email_rounded, keyboardType: TextInputType.emailAddress),
                  const SizedBox(height: 12),
                  _dialogField(passwordCtrl, 'Password', Icons.lock_rounded, obscureText: true),
                  const SizedBox(height: 12),
                  _dialogField(phoneCtrl, 'Phone (Optional)', Icons.phone_rounded, keyboardType: TextInputType.phone),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedRole,
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down_rounded),
                        onChanged: (val) => setModalState(() => selectedRole = val!),
                        items: const [
                          DropdownMenuItem(value: 'patient', child: Text('Patient')),
                          DropdownMenuItem(value: 'doctor', child: Text('Doctor')),
                        ],
                      ),
                    ),
                  ),
                  if (selectedRole == 'doctor') ...[
                    const SizedBox(height: 12),
                    _dialogField(specialtyCtrl, 'Specialty', Icons.medical_services_rounded),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancel', style: TextStyle(color: Colors.blueGrey.shade400, fontWeight: FontWeight.w700)),
              ),
              ElevatedButton(
                onPressed: () {
                  final data = {
                    'name': nameCtrl.text.trim(),
                    'email': emailCtrl.text.trim(),
                    'password': passwordCtrl.text.trim(),
                    'role': selectedRole,
                    'phoneNumber': phoneCtrl.text.trim(),
                  };
                  if (selectedRole == 'doctor') {
                    data['specialty'] = specialtyCtrl.text.trim();
                  }
                  _addUser(data);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(AppConstants.tealPrimary),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Create', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dialogField(TextEditingController ctrl, String hint, IconData icon, {bool obscureText = false, TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.blueGrey.shade200, fontSize: 13),
        prefixIcon: Icon(icon, color: const Color(AppConstants.tealPrimary), size: 18),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(AppConstants.tealPrimary))),
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
