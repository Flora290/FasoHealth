class DoctorModel {
  final String id;
  final String name;
  final String email;
  final String? specialty;
  final String? specialtyId;
  final String? phoneNumber;
  final double rating;
  final int totalReviews;
  final bool isAvailable;

  DoctorModel({
    required this.id,
    required this.name,
    required this.email,
    this.specialty,
    this.specialtyId,
    this.phoneNumber,
    this.rating = 0,
    this.totalReviews = 0,
    this.isAvailable = true,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    final spec = json['specialty'];
    return DoctorModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      specialty: spec is Map ? spec['name'] : spec?.toString(),
      specialtyId: spec is Map ? spec['_id'] : null,
      phoneNumber: json['phoneNumber'],
      rating: (json['averageRating'] ?? 0).toDouble(),
      totalReviews: json['totalReviews'] ?? 0,
      isAvailable: json['isAvailable'] ?? true,
    );
  }

  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}
