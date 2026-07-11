class AuditLog {
  final String id;
  final String action;
  final String? performedByName;
  final String? performedByEmail;
  final String? performedByRole;
  final String targetType;
  final String targetId;
  final Map<String, dynamic> details;
  final DateTime createdAt;

  AuditLog({
    required this.id,
    required this.action,
    this.performedByName,
    this.performedByEmail,
    this.performedByRole,
    required this.targetType,
    required this.targetId,
    this.details = const {},
    required this.createdAt,
  });

  factory AuditLog.fromJson(Map<String, dynamic> json) {
    String? performedByName;
    String? performedByEmail;
    String? performedByRole;
    if (json['performedBy'] is Map) {
      performedByName = json['performedBy']['name'];
      performedByEmail = json['performedBy']['email'];
      performedByRole = json['performedBy']['role'];
    }

    return AuditLog(
      id: json['_id'] ?? '',
      action: json['action'] ?? '',
      performedByName: performedByName,
      performedByEmail: performedByEmail,
      performedByRole: performedByRole,
      targetType: json['targetType'] ?? '',
      targetId: json['targetId'] ?? '',
      details: json['details'] is Map<String, dynamic>
          ? json['details']
          : {},
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  String get actionDisplay {
    const labels = {
      'USER_CREATED': 'User Created',
      'USER_UPDATED': 'User Updated',
      'USER_DELETED': 'User Deleted',
      'ROLE_CHANGED': 'Role Changed',
      'PASSWORD_RESET': 'Password Reset',
      'REQUEST_CREATED': 'Request Created',
      'REQUEST_APPROVED': 'Request Approved',
      'REQUEST_REJECTED': 'Request Rejected',
      'LOGIN': 'Login',
    };
    return labels[action] ?? action;
  }
}
