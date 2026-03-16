class AppointmentModel {
  final String id;
  final String? patientName;
  final String? patientId;
  final String? doctorName;
  final String? doctorId;
  final String? specialty;
  final DateTime dateTime;
  final String status;
  final String? reason;
  final String type;
  final String? diagnosis;
  final String? notes;
  final String? symptoms;

  AppointmentModel({
    required this.id,
    this.patientName,
    this.patientId,
    this.doctorName,
    this.doctorId,
    this.specialty,
    required this.dateTime,
    required this.status,
    this.reason,
    this.type = 'consultation',
    this.diagnosis,
    this.notes,
    this.symptoms,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    // Patient & doctor can be populated objects or just IDs
    final patient = json['patient'];
    final doctor = json['doctor'];

    return AppointmentModel(
      id: json['_id'] ?? '',
      patientName: patient is Map ? patient['name'] : null,
      patientId: patient is Map ? patient['_id'] : patient?.toString(),
      doctorName: doctor is Map ? doctor['name'] : null,
      doctorId: doctor is Map ? doctor['_id'] : doctor?.toString(),
      specialty: json['specialty'] is Map
          ? json['specialty']['name']
          : json['specialty']?.toString(),
      dateTime: DateTime.parse(json['dateTime'] ?? json['date'] ?? DateTime.now().toIso8601String()),
      status: json['status'] ?? 'pending',
      reason: json['reason'],
      type: json['type'] ?? 'consultation',
      diagnosis: json['diagnosis'],
      notes: json['notes'],
      symptoms: json['symptoms'],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }
}
