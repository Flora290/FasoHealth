class PrescriptionModel {
  final String id;
  final String appointmentId;
  final String patientId;
  final String doctorId;
  final List<MedicationModel> medications;
  final String? generalInstructions;
  final String status;
  final DateTime createdAt;

  PrescriptionModel({
    required this.id,
    required this.appointmentId,
    required this.patientId,
    required this.doctorId,
    required this.medications,
    this.generalInstructions,
    this.status = 'active',
    required this.createdAt,
  });

  factory PrescriptionModel.fromJson(Map<String, dynamic> json) {
    return PrescriptionModel(
      id: json['_id'] ?? '',
      appointmentId: json['appointment'] is Map ? json['appointment']['_id'] : json['appointment'] ?? '',
      patientId: json['patient'] is Map ? json['patient']['_id'] : json['patient'] ?? '',
      doctorId: json['doctor'] is Map ? json['doctor']['_id'] : json['doctor'] ?? '',
      medications: (json['medications'] as List? ?? [])
          .map((m) => MedicationModel.fromJson(m))
          .toList(),
      generalInstructions: json['generalInstructions'],
      status: json['status'] ?? 'active',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class MedicationModel {
  final String name;
  final String dosage;
  final String frequency;
  final String duration;
  final String? instructions;

  MedicationModel({
    required this.name,
    required this.dosage,
    required this.frequency,
    required this.duration,
    this.instructions,
  });

  factory MedicationModel.fromJson(Map<String, dynamic> json) {
    return MedicationModel(
      name: json['name'] ?? '',
      dosage: json['dosage'] ?? '',
      frequency: json['frequency'] ?? '',
      duration: json['duration'] ?? '',
      instructions: json['instructions'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'dosage': dosage,
      'frequency': frequency,
      'duration': duration,
      'instructions': instructions,
    };
  }
}
