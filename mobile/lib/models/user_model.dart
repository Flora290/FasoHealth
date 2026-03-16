class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? phoneNumber;
  final String? specialty;
  final String? profilePicture;
  final bool isActive;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phoneNumber,
    this.specialty,
    this.profilePicture,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'patient',
      phoneNumber: json['phoneNumber'],
      specialty: json['specialty'] is Map ? json['specialty']['name'] : json['specialty'],
      profilePicture: json['profilePicture'],
      isActive: json['isActive'] ?? true,
    );
  }

  bool get isPatient => role == 'patient';
  bool get isDoctor => role == 'doctor';
  bool get isAdmin => role == 'admin';
}
