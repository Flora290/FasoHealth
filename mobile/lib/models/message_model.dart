class MessageModel {
  final String id;
  final String content;
  final String senderId;
  final String recipientId;
  final DateTime createdAt;
  final String? appointmentId;

  MessageModel({
    required this.id,
    required this.content,
    required this.senderId,
    required this.recipientId,
    required this.createdAt,
    this.appointmentId,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['_id'],
      content: json['content'],
      senderId: json['sender'] is Map ? json['sender']['_id'] : json['sender'],
      recipientId: json['recipient'] is Map ? json['recipient']['_id'] : json['recipient'],
      createdAt: DateTime.parse(json['createdAt']),
      appointmentId: json['appointment'],
    );
  }
}
