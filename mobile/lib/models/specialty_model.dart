class SpecialtyModel {
  final String id;
  final String name;
  final String description;
  final String icon;
  final String color;
  final int totalDoctors;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  SpecialtyModel({
    required this.id,
    required this.name,
    required this.description,
    this.icon = 'medical_services',
    this.color = '#0D9488',
    this.totalDoctors = 0,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SpecialtyModel.fromJson(Map<String, dynamic> json) {
    return SpecialtyModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? 'medical_services',
      color: json['color'] ?? '#0D9488',
      totalDoctors: json['totalDoctors'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'color': color,
      'totalDoctors': totalDoctors,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
