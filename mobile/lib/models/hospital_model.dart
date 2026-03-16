class HospitalModel {
  final String id;
  final String name;
  final String address;
  final String city;
  final String postalCode;
  final String phone;
  final String email;
  final String website;
  final String description;
  final String imageUrl;
  final int totalDoctors;
  final List<String> specialties;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  HospitalModel({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.postalCode,
    required this.phone,
    required this.email,
    this.website = '',
    this.description = '',
    this.imageUrl = '',
    this.totalDoctors = 0,
    this.specialties = const [],
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HospitalModel.fromJson(Map<String, dynamic> json) {
    return HospitalModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      postalCode: json['postalCode'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      website: json['website'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      totalDoctors: json['totalDoctors'] ?? 0,
      specialties: List<String>.from(json['specialties'] ?? []),
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'address': address,
      'city': city,
      'postalCode': postalCode,
      'phone': phone,
      'email': email,
      'website': website,
      'description': description,
      'imageUrl': imageUrl,
      'totalDoctors': totalDoctors,
      'specialties': specialties,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
