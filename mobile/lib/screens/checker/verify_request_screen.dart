import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../models/identity_request.dart';
import '../../services/checker_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/image_viewer.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class VerifyRequestScreen extends StatefulWidget {
  final String requestId;

  const VerifyRequestScreen({super.key, required this.requestId});

  @override
  State<VerifyRequestScreen> createState() => _VerifyRequestScreenState();
}

class _VerifyRequestScreenState extends State<VerifyRequestScreen> {
  final _checkerService = CheckerService();
  final _remarksCtrl = TextEditingController();
  IdentityRequest? _request;
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _fetchRequest();
  }

  @override
  void dispose() {
    _remarksCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchRequest() async {
    try {
      final data = await _checkerService.getRequest(widget.requestId);
      setState(() => _request = IdentityRequest.fromJson(data['request']));
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAction(String action) async {
    if (action == 'reject' && _remarksCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Remarks are required when rejecting'), backgroundColor: AppColors.danger),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${action == 'approve' ? 'Approve' : 'Reject'} Request'),
        content: Text('Are you sure you want to ${action} this verification request?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: action == 'approve' ? AppColors.success : AppColors.danger),
            child: Text(action == 'approve' ? 'Approve' : 'Reject'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _submitting = true);
    try {
      if (action == 'approve') {
        await _checkerService.approve(widget.requestId, remarks: _remarksCtrl.text.trim());
      } else {
        await _checkerService.reject(widget.requestId, remarks: _remarksCtrl.text.trim());
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request ${action == 'approve' ? 'approved' : 'rejected'} successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Action failed: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
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
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: Theme.of(context).dividerColor)),
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
        title: const Text('Verification Review'),
        actions: [StatusBadge(status: r.status), const SizedBox(width: 16)],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Applicant Info
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(children: [Icon(Icons.person_outline, size: 20), SizedBox(width: 8), Text('Applicant Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700))]),
                  const SizedBox(height: 12),
                  ...[
                    ['NAME', r.fullName],
                    ['AGE', '${r.age}'],
                    ['GENDER', r.genderDisplay],
                    ['MOBILE', r.mobile],
                    ['EMAIL', r.email],
                    ['ADDRESS', r.address],
                    ['SUBMITTED BY', r.makerName ?? '—'],
                    ['SUBMITTED ON', DateFormat('dd MMM yyyy, hh:mm a').format(r.createdAt)],
                  ].map((e) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(width: 110, child: Text(e[0], style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5), letterSpacing: 0.5))),
                        Expanded(child: Text(e[1], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600))),
                      ],
                    ),
                  )),
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
                  const Text('Tap to zoom', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
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

          // Action
          if (r.isPending || context.read<AuthProvider>().user?.role == 'admin') ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Verification Action', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _remarksCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Add verification remarks (required for rejection)...',
                        labelText: 'Remarks',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _submitting ? null : () => _handleAction('approve'),
                            icon: const Icon(Icons.check_circle_outline),
                            label: const Text('Approve'),
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, padding: const EdgeInsets.symmetric(vertical: 14)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _submitting ? null : () => _handleAction('reject'),
                            icon: const Icon(Icons.cancel_outlined),
                            label: const Text('Reject'),
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, padding: const EdgeInsets.symmetric(vertical: 14)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ] else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Verification Result', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Status'), StatusBadge(status: r.status)]),
                    const SizedBox(height: 8),
                    Text('Verified By: ${r.verifiedByName ?? "—"}'),
                    if (r.verifiedAt != null) Text('Verified At: ${DateFormat('dd MMM yyyy').format(r.verifiedAt!)}'),
                    if (r.remarks.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: Theme.of(context).inputDecorationTheme.fillColor, borderRadius: BorderRadius.circular(8)),
                        child: Text(r.remarks),
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
}
