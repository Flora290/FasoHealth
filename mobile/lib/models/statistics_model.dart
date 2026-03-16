class StatisticsModel {
  final int totalUsers;
  final int totalDoctors;
  final int totalPatients;
  final int totalHospitals;
  final int totalSpecialties;
  final int totalAppointments;
  final int activePatients;
  final int todayAppointments;
  final int weeklyAppointments;
  final int monthlyAppointments;
  final double completionRate;
  final List<TopDoctorModel> topDoctors;
  final List<AppointmentByStatus> appointmentsByStatus;
  final List<AppointmentByMonth> appointmentsByMonth;
  final List<UserGrowthModel> userGrowth;
  final List<SpecialtyBreakdown> specialtiesBreakdown;

  StatisticsModel({
    required this.totalUsers,
    required this.totalDoctors,
    required this.totalPatients,
    required this.totalHospitals,
    required this.totalSpecialties,
    required this.totalAppointments,
    required this.activePatients,
    required this.todayAppointments,
    required this.weeklyAppointments,
    required this.monthlyAppointments,
    required this.completionRate,
    this.topDoctors = const [],
    this.appointmentsByStatus = const [],
    this.appointmentsByMonth = const [],
    this.userGrowth = const [],
    this.specialtiesBreakdown = const [],
  });

  factory StatisticsModel.fromJson(Map<String, dynamic> json) {
    return StatisticsModel(
      totalUsers: json['totalUsers'] ?? 0,
      totalDoctors: json['totalDoctors'] ?? 0,
      totalPatients: json['totalPatients'] ?? 0,
      totalHospitals: json['totalHospitals'] ?? 0,
      totalSpecialties: json['totalSpecialties'] ?? 0,
      totalAppointments: json['totalAppointments'] ?? 0,
      activePatients: json['activePatients'] ?? 0,
      todayAppointments: json['todayAppointments'] ?? 0,
      weeklyAppointments: json['weeklyAppointments'] ?? 0,
      monthlyAppointments: json['monthlyAppointments'] ?? 0,
      completionRate: (json['completionRate'] ?? 0.0).toDouble(),
      topDoctors: json['topDoctors'] == null
          ? <TopDoctorModel>[]
          : (json['topDoctors'] as List)
              .map<TopDoctorModel>((doc) => TopDoctorModel.fromJson(doc))
              .toList(),
      appointmentsByStatus: json['appointmentsByStatus'] == null
          ? <AppointmentByStatus>[]
          : (json['appointmentsByStatus'] as List)
              .map<AppointmentByStatus>((stat) => AppointmentByStatus.fromJson(stat))
              .toList(),
      appointmentsByMonth: json['appointmentsByMonth'] == null
          ? <AppointmentByMonth>[]
          : (json['appointmentsByMonth'] as List)
              .map<AppointmentByMonth>((stat) => AppointmentByMonth.fromJson(stat))
              .toList(),
      userGrowth: json['userGrowth'] == null
          ? <UserGrowthModel>[]
          : (json['userGrowth'] as List)
              .map<UserGrowthModel>((stat) => UserGrowthModel.fromJson(stat))
              .toList(),
      specialtiesBreakdown: json['specialtiesBreakdown'] == null
          ? <SpecialtyBreakdown>[]
          : (json['specialtiesBreakdown'] as List)
              .map<SpecialtyBreakdown>((stat) => SpecialtyBreakdown.fromJson(stat))
              .toList(),
    );
  }
}

class TopDoctorModel {
  final String id;
  final String name;
  final String specialty;
  final int appointmentCount;
  final double averageRating;

  TopDoctorModel({
    required this.id,
    required this.name,
    required this.specialty,
    required this.appointmentCount,
    required this.averageRating,
  });

  factory TopDoctorModel.fromJson(Map<String, dynamic> json) {
    return TopDoctorModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      specialty: json['specialty'] ?? '',
      appointmentCount: json['appointmentCount'] ?? 0,
      averageRating: (json['averageRating'] ?? 0.0).toDouble(),
    );
  }
}

class AppointmentByStatus {
  final String status;
  final int count;
  final double percentage;

  AppointmentByStatus({
    required this.status,
    required this.count,
    required this.percentage,
  });

  factory AppointmentByStatus.fromJson(Map<String, dynamic> json) {
    return AppointmentByStatus(
      status: json['status'] ?? '',
      count: json['count'] ?? 0,
      percentage: (json['percentage'] ?? 0.0).toDouble(),
    );
  }
}

class AppointmentByMonth {
  final String month;
  final int count;

  AppointmentByMonth({
    required this.month,
    required this.count,
  });

  factory AppointmentByMonth.fromJson(Map<String, dynamic> json) {
    return AppointmentByMonth(
      month: json['month'] ?? '',
      count: json['count'] ?? 0,
    );
  }
}

class UserGrowthModel {
  final String date;
  final int patients;
  final int doctors;

  UserGrowthModel({
    required this.date,
    required this.patients,
    required this.doctors,
  });

  factory UserGrowthModel.fromJson(Map<String, dynamic> json) {
    return UserGrowthModel(
      date: json['date'] ?? '',
      patients: json['patients'] ?? 0,
      doctors: json['doctors'] ?? 0,
    );
  }
}

class SpecialtyBreakdown {
  final String name;
  final int count;

  SpecialtyBreakdown({
    required this.name,
    required this.count,
  });

  factory SpecialtyBreakdown.fromJson(Map<String, dynamic> json) {
    return SpecialtyBreakdown(
      name: json['name'] ?? '',
      count: json['count'] ?? 0,
    );
  }
}
