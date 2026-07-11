class IdentityRequest {
  final String id;
  final String? makerId;
  final String? makerName;
  final String? makerEmail;
  final String fullName;
  final int age;
  final String gender;
  final String mobile;
  final String email;
  final String address;
  final String aadhaarFrontUrl;
  final String? aadhaarBackUrl;
  final String? passportUrl;
  final String status;
  final String remarks;
  final String? verifiedById;
  final String? verifiedByName;
  final DateTime? verifiedAt;
  final DateTime createdAt;

  IdentityRequest({
    required this.id,
    this.makerId,
    this.makerName,
    this.makerEmail,
    required this.fullName,
    required this.age,
    required this.gender,
    required this.mobile,
    required this.email,
    required this.address,
    required this.aadhaarFrontUrl,
    this.aadhaarBackUrl,
    this.passportUrl,
    required this.status,
    this.remarks = '',
    this.verifiedById,
    this.verifiedByName,
    this.verifiedAt,
    required this.createdAt,
  });

  factory IdentityRequest.fromJson(Map<String, dynamic> json) {
    // Handle populated makerId (can be string or object)
    String? makerId;
    String? makerName;
    String? makerEmail;
    if (json['makerId'] is Map) {
      makerId = json['makerId']['_id'];
      makerName = json['makerId']['name'];
      makerEmail = json['makerId']['email'];
    } else {
      makerId = json['makerId'];
    }

    // Handle populated verifiedBy
    String? verifiedById;
    String? verifiedByName;
    if (json['verifiedBy'] is Map) {
      verifiedById = json['verifiedBy']['_id'];
      verifiedByName = json['verifiedBy']['name'];
    } else {
      verifiedById = json['verifiedBy'];
    }

    return IdentityRequest(
      id: json['_id'] ?? '',
      makerId: makerId,
      makerName: makerName,
      makerEmail: makerEmail,
      fullName: json['fullName'] ?? '',
      age: json['age'] ?? 0,
      gender: json['gender'] ?? 'other',
      mobile: json['mobile'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? '',
      aadhaarFrontUrl: json['aadhaarFrontUrl'] ?? '',
      aadhaarBackUrl: json['aadhaarBackUrl'],
      passportUrl: json['passportUrl'],
      status: json['status'] ?? 'pending',
      remarks: json['remarks'] ?? '',
      verifiedById: verifiedById,
      verifiedByName: verifiedByName,
      verifiedAt: json['verifiedAt'] != null
          ? DateTime.tryParse(json['verifiedAt'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  bool get isPending => status == 'pending';
  bool get isVerified => status == 'verified';
  bool get isRejected => status == 'rejected';

  String get genderDisplay =>
      gender.isNotEmpty ? gender[0].toUpperCase() + gender.substring(1) : 'N/A';

  String get statusDisplay =>
      status[0].toUpperCase() + status.substring(1);
}
