import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../models/identity_request.dart';
import '../../services/identity_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/image_viewer.dart';

class RequestDetailScreen extends StatefulWidget {
  final String requestId;

  const RequestDetailScreen({super.key, required this.requestId});

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  final _identityService = IdentityService();
  IdentityRequest? _request;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchRequest();
  }

  Future<void> _fetchRequest() async {
    try {
      final data = await _identityService.getRequestById(widget.requestId);
      setState(() => _request = IdentityRequest.fromJson(data['request']));
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5), letterSpacing: 0.5)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildDocImage(String label, String? url) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: url != null ? () => ImageViewer.show(context, url, title: label) : null,
          child: Container(
            height: 140,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Theme.of(context).dividerColor),
            ),
            child: url != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(imageUrl: url, fit: BoxFit.cover, placeholder: (_, __) => const Center(child: CircularProgressIndicator()), errorWidget: (_, __, ___) => const Center(child: Icon(Icons.broken_image, size: 40))),
                  )
                : Center(child: Text('Not uploaded', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3)))),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: LoadingIndicator());
    if (_request == null) return const Scaffold(body: Center(child: Text('Request not found')));

    final r = _request!;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Details'),
        actions: [StatusBadge(status: r.status), const SizedBox(width: 16)],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status timeline
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Status Timeline', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  _buildTimelineStep('Submitted', DateFormat('dd MMM yyyy, hh:mm a').format(r.createdAt), true),
                  if (r.isVerified || r.isRejected) ...[
                    _buildTimelineStep(
                      r.isVerified ? 'Verified' : 'Rejected',
                      r.verifiedAt != null ? DateFormat('dd MMM yyyy, hh:mm a').format(r.verifiedAt!) : '',
                      true,
                      isLast: true,
                      color: r.isVerified ? AppColors.success : AppColors.danger,
                    ),
                  ] else
                    _buildTimelineStep('Pending Review', 'Awaiting checker review', false, isLast: true),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Personal Info
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(children: [Icon(Icons.person_outline, size: 20), SizedBox(width: 8), Text('Personal Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))]),
                  const SizedBox(height: 12),
                  _buildInfoRow('NAME', r.fullName),
                  _buildInfoRow('AGE', '${r.age}'),
                  _buildInfoRow('GENDER', r.genderDisplay),
                  _buildInfoRow('MOBILE', r.mobile),
                  _buildInfoRow('EMAIL', r.email),
                  _buildInfoRow('ADDRESS', r.address),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Documents
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(children: [Icon(Icons.photo_library_outlined, size: 20), SizedBox(width: 8), Text('Documents', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))]),
                  const SizedBox(height: 16),
                  _buildDocImage('Aadhaar Front', r.aadhaarFrontUrl),
                  const SizedBox(height: 12),
                  _buildDocImage('Aadhaar Back', r.aadhaarBackUrl),
                  const SizedBox(height: 12),
                  _buildDocImage('Passport', r.passportUrl),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Verification Details
          if (!r.isPending)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Verification Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    _buildInfoRow('VERIFIED BY', r.verifiedByName ?? '—'),
                    _buildInfoRow('VERIFIED AT', r.verifiedAt != null ? DateFormat('dd MMM yyyy, hh:mm a').format(r.verifiedAt!) : '—'),
                    if (r.remarks.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text('REMARKS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                      const SizedBox(height: 4),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: Theme.of(context).inputDecorationTheme.fillColor, borderRadius: BorderRadius.circular(8)),
                        child: Text(r.remarks, style: const TextStyle(fontSize: 14)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildTimelineStep(String title, String subtitle, bool completed, {bool isLast = false, Color? color}) {
    final c = color ?? (completed ? AppColors.primary : AppColors.textSecondary);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: completed ? c : Colors.transparent,
                border: Border.all(color: c, width: 2),
                shape: BoxShape.circle,
              ),
              child: completed ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
            ),
            if (!isLast) Container(width: 2, height: 32, color: c.withValues(alpha: 0.3)),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: c)),
              if (subtitle.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(subtitle, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5))),
                ),
              if (!isLast) const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }
}
